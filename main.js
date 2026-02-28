// utf-8
'use strict';

const config = require('config');
const japanese = require('japanese');
const nodemw = require('nodemw');
const tokenize = require('kuromojin').tokenize;
const unorm = require('unorm');

/*** mediawiki API bot ***/
const bot = new nodemw({
  protocol : config.protocol,
  server   : config.server,
  path     : config.path,
});

module.exports = main;
/* istanbul ignore if */
if (require.main === module) { main(); }

function getPagesInNs(bot, nsId) {
  const params = {
    action      : 'query',
    list        : 'allpages',
    apnamespace : nsId,
    aplimit     : 'max'
  };
  return new Promise((resolve) => {
    bot.api.call(params, (info) => {
      resolve(info && info.allpages ? info.allpages : []);
    }, 'GET');
  });
}

function main() {
  return (async() => {
    await new Promise((resolve, reject) => {
      bot.api.call({ action : 'login', lgname : config.username, lgpassword : config.password }, (info) => {
        if (!info) { return reject(new Error('Login failed: empty response')); }
        if (info.result === 'Success') { return resolve(info); }
        if (info.result !== 'NeedToken') { return reject(new Error('Login failed: ' + info.result)); }

        bot.api.call({ action : 'login', lgname : config.username, lgpassword : config.password, lgtoken : info.token }, (info2) => {
          if (info2 && info2.result === 'Success') { resolve(info2); }
          else { reject(new Error('Login failed: ' + (info2 ? info2.result : 'unknown'))); }
        }, 'POST');
      }, 'POST');
    });
    for (const ns of config.namespaces) {
      const allpage = await getPagesInNs(bot, ns.id);
      for (const page of allpage) {
        let pageData = await new Promise((resolve) => bot.getArticle(page.title, resolve));
        const pageTitle = (page.title.indexOf(ns.prefix + ':') >= 0) ? page.title.substr(ns.prefix.length + 1) : page.title;
        let editSummary = 'Bot: Add DEFAULTSORT ';

        if (/\{\{DEFAULTSORT:.*\}\}/.test(pageData)) { continue; } // skip if page already have DEFAULTSORT
        const title = unorm.nfkc(pageTitle); // unicode normalization
        const tokens = await tokenize(title);
        let reading = tokens.reduce((res, token) => {
          return (token.reading) ? (res + token.reading) : (res + token.surface_form);
        }, '');
        reading = japanese.hiraganize(reading);
        reading = normalizeForDefaultSort(reading);

        pageData += '\n{{DEFAULTSORT: ' + reading + '}}';
        editSummary += reading;
        await new Promise((resolve, reject) => {
          bot.edit(page.title, pageData, editSummary, (data) => {
            if (data && data.result === 'Success') { resolve(data); }
            else { reject(new Error('Edit failed')); }
          });
        });
        console.info('Edited ' + page.title + '/ ' + editSummary);
      }
    }
  })();
}

function normalizeForDefaultSort(str) {
  const defaultSortDictionary = {
    'ぁ' : 'あ', 'ぃ' : 'い', 'ぅ' : 'う', 'ぇ' : 'え', 'ぉ' : 'お',
    'が' : 'か', 'ぎ' : 'き', 'ぐ' : 'く', 'げ' : 'け', 'ご' : 'こ',
    'ざ' : 'さ', 'じ' : 'し', 'ず' : 'す', 'ぜ' : 'せ', 'ぞ' : 'そ',
    'だ' : 'た', 'ぢ' : 'ち', 'っ' : 'つ', 'づ' : 'つ', 'で' : 'て',
    'ど' : 'と', 'ば' : 'は', 'ぱ' : 'は', 'び' : 'ひ', 'ぴ' : 'ひ',
    'ぶ' : 'ふ', 'ぷ' : 'ふ', 'べ' : 'へ', 'ぺ' : 'へ', 'ぼ' : 'ほ',
    'ぽ' : 'ほ', 'ゃ' : 'や', 'ゅ' : 'ゆ', 'ょ' : 'よ', 'ゎ' : 'わ',
    'ゐ' : 'い', 'ゑ' : 'え', 'ゔ' : 'う'
  };

  const cyoonDictionary = {
    'あ' : ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
    'い' : ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'ゐ'],
    'う' : ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る'],
    'え' : ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ', 'ゑ'],
    'お' : ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を']
  };

  for (const [key, value] of Object.entries(defaultSortDictionary)) {
    str = str.replace(new RegExp(key, 'g'), value);
  }
  str = str.replace(/.[\u30FC\u2010-\u2015\u2212\uFF70-]/g, (match) => {
    const firstLetter = match.slice(0, 1);
    const result = Object.keys(cyoonDictionary).reduce((res, key) => {
      return (cyoonDictionary[key].indexOf(firstLetter) >= 0) ? key : res;
    }, null);
    return result ? (firstLetter + result) : match;
  });
  return str;
}

