# defaultSortBot
Add **Japanese**
[sort key](https://ja.wikipedia.org/wiki/Help:%E3%82%AB%E3%83%86%E3%82%B4%E3%83%AA#.E3.82.BD.E3.83.BC.E3.83.88.E3.82.AD.E3.83.BC)
automatically to mediawiki articles as DEFAULTSORT.

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
