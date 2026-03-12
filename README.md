# htmx getting started with

[htmx](https://gihyo.jp/article/2026/02/htmx-introduction)に触ってみるためにこのプロジェクトを作った。

TypeScript言語を使うことにした。Nodeではなくbunを使うことにした。npmではなくHonoを使うことにした。フロントエンドを実装するのにReactではなくサーバサイドのJSXを主として使いたいと思った。Formを使った操作系UIを実装するのにReactを使うしかないのかなと思っていた。

たまたまhtmxを知った。Formをhtmxで実装できるかな？何はともあれhtmxを学習してみよう。


```
$ cd html-getting-started-with
$ bun create hono@latest
...
$ ls
my-app
```

## Playwrightを使ってみる

### playwright-chromiumつまりブラウザの役を果たすJavaScriptライブラリを単体で使うやり方

https://stephenhaney.com/2024/playwright-on-fly-io-with-bun/

tests/main.ts をbun runコマンドで直接実行する。playwright-chromiumのブラウザがちゃんと使える。


### playwrightをプロジェクトにインストールして動かすやり方

```
$ npx playwright@latest install
```

playwright.config.ts ファイルを書く。

Playwrightによるテストを実行する
```
# npx playwright test 
```

