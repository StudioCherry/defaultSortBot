# defaultSortBot [![Build Status](https://travis-ci.org/kn1cht/defaultSortBot.svg?branch=master)](https://travis-ci.org/kn1cht/defaultSortBot) [![Coverage Status](https://coveralls.io/repos/github/kn1cht/defaultSortBot/badge.svg?branch=master)](https://coveralls.io/github/kn1cht/defaultSortBot?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/kn1cht/defaultSortBot.svg)](https://greenkeeper.io/)

Add **Japanese**
[sort key](https://ja.wikipedia.org/wiki/Help:%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA#.E3.82.BD.E3.83.BC.E3.83.88.E3.82.AD.E3.83.BC)
to mediawiki pages automatically.

```
{{DEFAULTSORT: そおときい}}
```

## Usage

```bash
git clone https://github.com/kn1cht/defaultSortBot.git
cd defaultSortBot
npm install
cp config/example.yaml config/default.yaml
vi config/default.yaml
node main.js
```

## default.yaml

Set your config in default.yaml before run defaultSortBot.

- server: your mediawiki server domain.
- path: relative path for the directory contains `api.php`.
- username: username for mediawiki bot account.
- password: password for mediawiki bot account.
- namespaces : [namespace](https://www.mediawiki.org/wiki/Manual:Namespace/ja) to process.
  * id: namespace id number(get list from `api.php?action=query&meta=siteinfo&siprop=namespaces`).
  * prefix: namespace prefix(e.g. `"Category"`) to exclude from DEFAULTSORT
  
**Warning:** DO NOT set default sort key to the pages which are included in another page, such as Template pages.

## Run as scheduled task

```bash
vi schedule.js
npm i -g forever
forever start schedule.js
```

Used [merencia/node-cron](https://github.com/merencia/node-cron) to generate scheduled job.
Please modify setting in schedule.js as you like.
