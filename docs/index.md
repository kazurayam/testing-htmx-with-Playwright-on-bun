# htmxで作られたWebページをPlaywrightでE2Eテストする方法(ただしnodeではなくbunの上で)

## 背景

わたしは静的HTMLだけでできた旧式なwebサイトの管理運用を職務上担当している。現代的なソフトウェア開発技法を用いてそのサイトを実装し直したいと企んでいる。

いくつか条件がある

1.  TypeScript言語を使う

2.  Node + npm + npxではなくbunを使う

3.  ExpressではなくHonoを使う

4.  クライアント・サイドをできるだけ軽量にしたい。そのためwebページを実装するのにReactではなくHonoのJSXを使ってサーバー・サイド・レンダリング(SSR)する

5.  お知らせ記事をブラウザから投稿してサイトのコンテンツとして追加したい。そのためのUIを実現したい。

記事投稿のUIをSSRだけで実現するのは無理だ。Reactを使うしかないのかなと思い、そのノウハウを教えてくれる本を読んで学んだ。しかしわたしはReactに気乗りがしなかった。わたしが目標とする小さなwebサイトにReactは適合的でないと思った。もっと軽い方法はないものか？と迷っていた。そうこうするうち２０２６年３月、Web記事 [gihyo.jp 「HTMLを拡張し⁠⁠、JSなしで動的UIを作るhtmx」, 嶌田喬行（しまだたかゆき）](https://gihyo.jp/article/2026/02/htmx-introduction) を読んだ。この記事の冒頭にhtmxを使ったwebページのサンプルが紹介されていた。

    <button hx-get="/hello" hx-target="#result">
      読み込み
    </button>
    <div id="result">ここに結果が表示されます</div>

この通りのHTTPサーバアプリをbunとHono JSXで作ってみた。`` my-app`ディレクトリにcdして`bun run dev `` したら `http://localhost:3000` がするりと動いてしまった。とてもいい感じだ。

<figure>
<img src="https://gihyo.jp/assets/images/article/2026/02/htmx-introduction/hello.gif" alt="hello" />
</figure>

よおし、htmxをもっと学ぼうとわたしの気分は高まったが、すぐ一つ課題があることに気づいた。ブラウザ画面上に表示されたボタンを人がマウスでクリックすると「こんにちは」と表示されるのだが、この動きテストしたい。そのテストをコード化して。コマンド一発で繰り返し実行できるようにしたい。だから **htmxで作ったHTTPサーバアプリケーションをPlaywrightを使ってE2Eテストしたい、ただしbunとHonoとJSXにhtmxを組み合わせるという条件のもとで。** こういう課題の解決方法を教えてくれるWeb記事を探したが見当たらなかった。しょうがない。動くコード一式を自作しよう。

## 解決すべき問題

Playwrightの入門記事を読むと例外なく、テストを起動するには `npx playwright test` コマンドを使えと書いてある。たとえば

- [Playwright, Getting Started, Running and debugging tests](https://playwright.dev/docs/running-tests)

しかしわたしは `node + npm + npx` ではなく `bun` を使いたいと思っている。もちろん自分のマシンに `node` も `npm` も `npx` もインスール済みで動くんだけど、しかし今はbunでPlaywrightテストを起動する方法すらわからない。初っ端からつまづいた。

"playwright bun"でググって情報を漁っているうちに「Playwrightはbunの上ではまともに動かない、PlaywrightはNodeのAPIに依存したところがあるから」とおっしゃる記事すら見かけた。

- [browserstack, How to Use Bun for Playwright Tests](https://www.browserstack.com/guide/bun-playwright)

> Playwright does not have full native support for Bun. It is built for Node.js and relies on Node-specific APIs to launch and control browser processes. Bun’s runtime is not fully compatible with these APIs, which can cause issues with browser launches and child process handling when running Playwright tests directly in Bun.

本当にそうなのか？ダメじゃん。困った。

## 解決方法

"bun playwright"をキーにググったら別のweb記事を見つけた。

- [Running playwright on fly.io with bun, Stephen Haney](https://stephenhaney.com/2024/playwright-on-fly-io-with-bun/)

この記事はテストを実行するのに `npx playwright test` コマンドを使わない。TypeScriptコード `src/main.ts` を書く。その `main.ts` は `playwright-chromium` というJavaScriptライブラリをimportする。そして\`bun run src/main.ts\` というコマンドで実行する。

Stephen HaneyはPlaywrightの正面玄関ではなく裏口を教えてくれている。`playwright-chromium` ライブラリはPlaywrightプロジェクトが開発したものだ。これを使えばJest流の単体テストがアダプタ層を介してChromiumブラウザを立ち上げ、ブラウザにURLをGETさせて、応答画面のDOMにアクセスできるようにしてくれる。

Browserstackの記事が言うようにPlaywrightプロジェクトがNode依存なところがあるという説はたぶん正しい。しかし `playwright-chromium` ライブラリはたぶんNode依存ではなくて、bunの上でもちゃんと動作するんじゃなかろうか。試してみる価値があると思う。

## 説明

### わたしの環境

- macOS Tahoe 26.3.1 with GNU bash 5.3.3

- [bun](https://bun.com/docs/installation) 1.3.6

- [Hono](https://hono.dev/docs/getting-started/basic) ^4.12.5

### サンプルコードのGit Hubレポジトリ

- <https://github.com/kazurayam/htmx-testing-with-Playwright-on-bun>

### src/index.tsx

HTTPサーバのアプリケーションのTypeScriptコードが下記の通り。

    // src/starter.tsx
    import { Hono } from 'hono'
    import type { FC } from 'hono/jsx'

    const app = new Hono()

    const Layout: FC = (props) => {
        return (
            <html>
                <head>
                    <title>htmx sample</title>
                    <script src="https://unpkg.com/htmx.org@2"></script>
                </head>
                <body>{props.children}</body>
            </html>
        )
    }

    const Top: FC<{ messages: string[] }> = (props: {
        messages: string[]
    }) => {
        return (
            <Layout>
                {
                    props.messages.map((message) => {
                        return <p>{message}</p>
                    })
                }
                <button hx-get="/hello" hx-target="#result">
                    読み込み
                </button>
                <div id="result">ここに結果が表示されます</div>
            </Layout>
        )
    }
    app.get('/', (c) => {
        const messages = ['Hello htmx!']
        return c.render(
            <Top messages={messages} />
        )
    })
    app.get('/hello', (c) => {
        return c.render(
            <p>こんにちは! <code><b>/hello</b></code></p>
        )
    })

    export default app

### src/index.e2e.ts

アプリケーションをテストするためのコードが下記の通り。

    // src/index.e2e.ts
    import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
    import { chromium } from 'playwright-chromium';

    describe('E2E testing using playwright-chromium', async () => {
        // Here I assume that the server at http://localhost:3000 is already up and running.
        let browser = null;
        beforeAll(async () => {
            // Launch the browser
            browser = await chromium.launch()
        })
        it("Click the button, then a text 'こんにちは!' should appear", async () => {
            // Create a new page and navigate to a URL
            const page = await browser.newPage();
            await page.goto('http://localhost:3000');
            // Select the button
            const button = page.getByText('読み込み');
            expect(await button.isVisible()).toBeTrue();
            // Click the button!
            await button.click();
            const p = page.getByText('こんにちは!');
            expect(await button.isVisible()).toBeTrue();
        });
        afterAll(async () => {
            // Clean up
            await browser.close();
        })
    })

### package.json

    {
      "name": "testing-htmx-with-Playwright-on-bun",
      "module": "src/index",
      "type": "module",
      "scripts": {
        "e2e": "bun run --hot src/index.tsx & bun test ./src/index.e2e.ts; kill $(ps aux | grep '[0-9] bun run --hot src/index.tsx' | awk '{print $2}')",
        "dev": "bun run src/main.ts"
      },
      "dependencies": {
        "hono": "^4.12.5",
        "playwright-chromium": "^1.58.2"
      },
      "devDependencies": {
        "@happy-dom/global-registrator": "^20.6.1",
        "@types/bun": "latest"
      },
      "peerDependencies": {
        "typescript": "^5"
      }
    }

### サンプルプロジェクトを動かす手順

bunがインストール済みであると仮定します。下記のような操作でサンプルコードを実行することができるはずです。

    $ cd ~/tmp

    $ git clone https://github.com/kazurayam/htmx-testing-with-Playwright-on-bun
    Cloning into 'htmx-testing-with-Playwright-on-bun'...
    remote: Enumerating objects: 102, done.
    remote: Counting objects: 100% (102/102), done.
    remote: Compressing objects: 100% (70/70), done.
    remote: Total 102 (delta 38), reused 81 (delta 24), pack-reused 0 (from 0)
    Receiving objects: 100% (102/102), 23.35 KiB | 3.33 MiB/s, done.
    Resolving deltas: 100% (38/38), done.

    $ cd htmx-testing-with-Playwright-on-bun
    $ cd my-app
    $ pwd
    ~/tmp/htmx-testing-with-Playwright-on-bun

    $ bun install
    bun install v1.3.6 (d530ed99)

    + @happy-dom/global-registrator@20.8.3
    + @types/bun@1.3.10
    + hono@4.12.5
    + playwright-chromium@1.58.2
    + typescript@5.9.3

    15 packages installed [647.00ms]

    $ bun run e2e
    bun test v1.3.6 (d530ed99)
    src/index.e2e.ts:
    Started development server: http://localhost:3000
    ✓ E2E testing using playwright-chromium > Click the button, then a text 'こんにちは!' should appear [639.77ms]

     1 pass
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [2.29s]

### 補足説明

#### テストを起動する方法

コマンドラインでプロジェクトのルートディレクトリにcdして `$ bun run e2e` と投入してテストを起動します。

`e2e` の具体的な内容は `package.json` で定義されています。

      "scripts": {
        "e2e": "bun run --hot src/index.tsx & bun test ./src/index.e2e.ts; kill $(ps aux | grep '[0-9] bun run --hot src/index.tsx' | awk '{print $2}')",

つまりshellのコマンドラインに下記の長い文字を手入力したのと同じです。

    $ bun run --hot src/index.tsx & bun test ./src/index.e2e.ts; kill $(ps aux | grep '[0-9] bun run --hot src/index.tsx' | awk '{print $2}')

このbashコマンドラインは三つのサブ・コマンドに分かれています。

1.  `bun run --hot src/index.tsx &`

2.  `bun test ./src/index.e2e.ts;`

3.  `kill $(ps aux | grep '[0-9] bun run --hot src/index.tsx' | awk '{print $2}')`

1のサブコマンドはプロセスをforkしてHTTPサーバを起動します。サーバのプロセスは自分からは停止しないので、通常はコマンドラインの会話がブロックします。しかしシェルコマンドが `&` で区切られている。だからプロセスをそのままにして、次のサブコマンドが実行されます。シェル・プログラミングの基本技の一つです。

2のサブコマンドは `./src/index.e2e.ts` ファイルを明示的に指定してbunのtestコマンドを実行します。`index.e2e.ts` はテストコードです。`playwright-chromium` ライブラリをimportして使います。テストはchromiumブラウザをheadlessモードで立ち上げ、`http://localhost:3000` というURLを指定してページを開き、DOMにアクセスして検証します。

3のサブコマンドはHTTPサーバのプロセスをkillします。psコマンドでプロセスの一覧を取得し、HTTPサーバのプロセスの行を探し出して、HTTPサーバのプロセスIDを見つけたら、killコマンドを実行します。

    `bun run e2e` コマンドを投入するだけで1と2と3のサブコマンドを繰り返し実行することができます。

#### テストコードに関する注意点

Playwrightのドキュメント [Getting started/Writing tests](https://playwright.dev/docs/writing-tests) から典型的なPlaywrightテストのサンプルを引用しよう。

    import { test, expect } from '@playwright/test';

    test('has title', async ({ page }) => {
      await page.goto('https://playwright.dev/');

      // Expect a title "to contain" a substring.
      await expect(page).toHaveTitle(/Playwright/);
    });

    test('get started link', async ({ page }) => {
      await page.goto('https://playwright.dev/');

      // Click the get started link.
      await page.getByRole('link', { name: 'Get started' }).click();

      // Expects page to have a heading with the name of Installation.
      await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
    });

一方、わたしはテスト `index.e2e.ts` を次のように書いた。

    // src/index.e2e.ts
    import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
    import { chromium } from 'playwright-chromium';

    describe('E2E testing using playwright-chromium', async () => {
        // Here I assume that the server at http://localhost:3000 is already up and running.
        let browser = null;
        beforeAll(async () => {
            // Launch the browser
            browser = await chromium.launch()
        })
        it("Click the button, then a text 'こんにちは!' should appear", async () => {
            // Create a new page and navigate to a URL
            const page = await browser.newPage();
            await page.goto('http://localhost:3000');
            // Select the button
            const button = page.getByText('読み込み');
            expect(await button.isVisible()).toBeTrue();
            // Click the button!
            await button.click();
            const p = page.getByText('こんにちは!');
            expect(await button.isVisible()).toBeTrue();
        });
        afterAll(async () => {
            // Clean up
            await browser.close();
        })
    })

冒頭のimport文に注意してほしい。

    import { describe, it, expect, ... } from 'bun:test';

`expect` 関数が `bun:test` モジュールからimportされていることに注意してほしい。その一方で典型的なPlaywrightテストは `test` を `@playwright/test` モジュールからimportする。`bun:test` モジュールの `expect` と `@playwright/test` モジュール の `expect` とは全く違う。二つの `expect` の詳細については公式ドキュメントを参照されたい。

- [bun:test Expect](https://bun.com/reference/bun/test/Expect)

- [playwright: Assertions](https://playwright.dev/docs/test-assertions)

わたしはNodeではなくbunを使いたかった。だから `npx playwright test` コマンドを使うことを避けなければならなかった。だから\`@playwright/test\` モジュールの `expect` を使うことができなかった。

わたしが `index.e2e.ts` のコードを書くのに最小限必要としたのは `playwright-chromium` モジュールが提供する `chorium` 関数であった。

    import { chromium } from 'playwright-chromium';

アサーションを実装するのには `bun:test` モジュールの `expect` 関数で用が足りる。たぶん `@playwright/test` モジュールの `expect` を使わなくても大丈夫だろうと思う。
