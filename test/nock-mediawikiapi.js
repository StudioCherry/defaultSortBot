'use strict';

const assert = require('power-assert');
const config = require('config'); // NODE_ENV=test
const querystring = require('querystring');

const csrftoken = '00112233445566778899aabbccddeeff+\\';

const fakeAPI = {
  server : 'http://' + config.server,
  path: /\/wiki\/api\.php/
};

fakeAPI.title = {
  0 : {
    noDefaultSort          : 'デフォルトソートのないページ',
    noDefaultSortWithAscii : 'DEFAULTSORTのないページ',
    haveDefaultSort        : 'デフォルトソートのあるページ'
  },
  14 : {
    noDefaultSort          : 'カテゴリ:デフォルトソートのないページ',
    noDefaultSortWithAscii : 'カテゴリ:DEFAULTSORTのないページ',
    haveDefaultSort        : 'カテゴリ:デフォルトソートのあるページ'
  }
};

fakeAPI.ans = {
  noDefaultSort          : '\n{{DEFAULTSORT: てふおるとそおとのないへえし}}',
  noDefaultSortWithAscii : '\n{{DEFAULTSORT: DEFAULTSORTのないへえし}}'
};

fakeAPI.login = {
  request: (body) => {
    if (typeof body === 'string') { body = require('querystring').parse(body); }
    return body.action === 'login' &&
      body.lgname === config.username &&
      body.lgpassword === config.password;
  },
  reply: function (uri, requestBody) {
    const req = require('querystring').parse(requestBody);
    if (req.lgtoken) {
      return {
        login: {
          result: 'Success',
          lguserid: 12345,
          lgusername: config.username
        }
      };
    }
    return {
      login: {
        result: 'NeedToken',
        token: 'faketoken'
      }
    };
  }
};

fakeAPI.loginfail = {
  request: (body) => {
    if (typeof body === 'string') { body = require('querystring').parse(body); }
    return body.action === 'login' &&
      body.lgname === config.username &&
      body.lgpassword === config.password;
  },
  reply: function (uri, requestBody) {
    const req = require('querystring').parse(requestBody);
    if (req.lgtoken) {
      return { login: { result: 'WrongPass' } };
    }
    return { login: { result: 'NeedToken', token: 'faketoken' } };
  }
};

fakeAPI.edit = {
  request : (body) => (body.action === 'edit'),
  reply   : function(uri, requestBody) {
    const req = querystring.parse(requestBody);
    assert(req.title !== fakeAPI.title[0].haveDefaultSort, 'leaves page that already have sort key as it is');
    assert(req.title !== fakeAPI.title[14].haveDefaultSort, 'leaves page that already have sort key as it is');
    if(req.title === fakeAPI.title[0].noDefaultSort) {
      assert(req.text === fakeAPI.ans.noDefaultSort, 'generates proper sort key');
    }
    else if(req.title === fakeAPI.title[0].noDefaultSortWithAscii) {
      assert(req.text === fakeAPI.ans.noDefaultSortWithAscii, 'leaves non-Japanese character as it is');
    }
    else if(req.title === fakeAPI.title[14].noDefaultSort) {
      assert(req.text === fakeAPI.ans.noDefaultSort, 'removes namespace prefix');
    }
    else if(req.title === fakeAPI.title[14].noDefaultSortWithAscii) {
      assert(req.text === fakeAPI.ans.noDefaultSortWithAscii, 'removes namespace prefix');
    }
    return { edit : { result : 'Success' } };
  }
};

fakeAPI.query = {
  request : (query) => (query.action === 'query'),
  reply   : function() {
    const qs = this.req.path.includes('?') ? this.req.path.split('?')[1] : '';
    const query = querystring.parse(qs);
    if(query.list === 'allpages') {
      return fakeAPI.query.allpages(query);
    }
    else if(query.prop === 'revisions' && query.rvprop === 'content') {
      return fakeAPI.query.revisions(query);
    }
    else if(query.meta === 'siteinfo' && query.siprop === 'general') {
      return fakeAPI.query.siteinfo();
    }
    else if(query.meta === 'tokens' && query.type === 'csrf') {
      return fakeAPI.query.csrftokens();
    }
    else if (query.prop === 'info' && query.intoken === 'edit') {
      return fakeAPI.query.info(query);
    }
  },
  allpages : function(query) {
    return { batchcomplete : '', query : { allpages : [
      { title : fakeAPI.title[query.apnamespace].noDefaultSort },
      { title : fakeAPI.title[query.apnamespace].noDefaultSortWithAscii },
      { title : fakeAPI.title[query.apnamespace].haveDefaultSort }
    ]}};
  },
  revisions : function(query) {
    let content = '';
    if(query.titles === fakeAPI.title[0].haveDefaultSort || query.titles === fakeAPI.title[14].haveDefaultSort) {
      content = '{{DEFAULTSORT: てふおるとそおとのあるへえし}}';
    }
    return {
      batchcomplete : '', query : { pages : { 1 : {
        title     : query.titles,
        revisions : [
          {
            contentformat : 'text/x-wiki',
            contentmodel  : 'wikitext',
            '*'           : content
          }
        ]
      }}}
    };
  },
  siteinfo : function() {
    return { batchcomplete : '', query : { general : { generator : 'MediaWiki 1.27.0' }}};
  },
  csrftokens : function() {
    return  { batchcomplete : '', query : { tokens : { csrftoken : csrftoken }}};
  },
  info: function (query) {
    return {
      batchcomplete: '', query: {
        pages: {
          1: {
            title: query.titles,
            edittoken: csrftoken
          }
        }
      }
    };
  }
};

module.exports = fakeAPI;
