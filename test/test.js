'use strict';

const assert = require('power-assert');
const nock = require('nock');
const rewire = require('rewire');

const fakeAPI = require('./nock-mediawikiapi.js');
const main = rewire('../main.js');

describe('normalizeForDefaultSort', () => {
  const normalizeForDefaultSort = main.__get__('normalizeForDefaultSort');
  it('convert 濁音 to 清音', () => {
    assert(normalizeForDefaultSort('ゔがぎぐげござじずぜぞだぢづでどばびぶべぼ') === 'うかきくけこさしすせそたちつてとはひふへほ');
  });
  it('convert 半濁音 to 清音', () => {
    assert(normalizeForDefaultSort('ぱぴぷぺぽ') === 'はひふへほ');
  });
  it('convert 拗音 to 直音', () => {
    assert(normalizeForDefaultSort('きゃきゅきょ') === 'きやきゆきよ');
  });
  it('convert 促音 to 直音', () => {
    assert(normalizeForDefaultSort('きっとかっと') === 'きつとかつと');
  });
  it('convert 長音 to 母音', () => {
    assert(normalizeForDefaultSort('あーきーすーつーのー') === 'ああきいすうつうのお');
  });
  it('do nothing hyphen not for 長音', () => {
    assert(normalizeForDefaultSort('0-a-$-0ー') === '0-a-$-0ー');
  });
  it('do nothing against not ひらがな character', () => {
    assert(normalizeForDefaultSort('Abc123"#$') === 'Abc123"#$');
  });
});

describe('defaultSortBot', function() {
  this.timeout(10000);
  afterEach(() => {
    delete require.cache[require.resolve('../main.js')];
    nock.cleanAll();
  });
  it('find page without sort key and add proper sort key', (done) => {
    nock(fakeAPI.server).persist()
      .post(fakeAPI.path, fakeAPI.login.request).reply(200, fakeAPI.login.reply)
      .get(fakeAPI.path).query(fakeAPI.query.request).reply(200, fakeAPI.query.reply);
    const edit = nock(fakeAPI.server)
      .post(fakeAPI.path, fakeAPI.edit.request).times(4).reply(200, fakeAPI.edit.reply);

    main.__get__('main')();
    const interval = setInterval(() => {
      if(edit.isDone() === true) {
        edit.done(); // nock assertion
        done();
        clearInterval(interval);
      }
    }, 100);
  });
  it('if there is error, abort and display it', (done) => {
    const login = nock(fakeAPI.server)
      .post(fakeAPI.path, fakeAPI.loginfail.request).reply(200, fakeAPI.loginfail.reply);
    const edit = nock(fakeAPI.server)
      .post(fakeAPI.path, fakeAPI.edit.request).times(4).reply(200, fakeAPI.edit.reply);

    main.__get__('main')();
    const interval = setInterval(() => {
      if(login.isDone() === true) {
        assert(edit.isDone() === false);
        done();
        clearInterval(interval);
      }
    }, 100);
  });
});

