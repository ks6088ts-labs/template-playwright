<!-- translation-meta
source: docs/scenarios/create-screenshot-guide/sample-guide/petstore-swagger-ui-guide.md
sourceHash: sha256:d8dd42790ff69b4fcbe6baeaf64f54408956f537fa4e4315935c7dd0410a409f
canonicalLanguage: en
-->

# Swagger UI（Petstore）で API を試す: 初心者向けチュートリアル

このガイドでは、**Swagger UI** を使ってウェブブラウザーから実際の API を呼び出す方法を、
スクリーンショット付きで手順を追って説明します。プログラミング、ターミナル、アカウントは
不要で、ブラウザーさえあれば始められます。

ここでは公開デモの **Swagger Petstore**（[https://petstore.swagger.io/](https://petstore.swagger.io/)）を使用します。`GET /pet/findByStatus`
オペレーションに実際のリクエストを 1 回送信し、そのレスポンスを読み取ります。

> **スクリーンショットについて:** これらは Playwright CLI で実際のサイトを操作して撮影した
> ものです。Petstore は共有の公開サンドボックスであるため、実際のレスポンスに含まれる
> ペットは、ここに示した例とは異なります。

## Swagger UI とは？

Swagger UI は、ウェブ API のインタラクティブなドキュメントページです。ページ上の各行が
1 つの API **オペレーション**（API が実行できる操作）です。オペレーションを展開して内容を
読み、**Try it out** ボタンを使えば、実際のリクエストを送信してサーバーのレスポンスを
確認できます。すべてブラウザー内で完結します。

## これから行うこと

1. Petstore のページを開き、レイアウトに慣れる。
2. `GET /pet/findByStatus` オペレーションを見つけて展開する。
3. **Try it out** モードを有効にする。
4. `status` の値（`available`）を選ぶ。
5. **Execute** をクリックしてリクエストを送信する。
6. サーバーのレスポンスを読み取る。

## 始める前に

- ウェブブラウザー（Chrome、Edge、Firefox、Safari など）。
- インターネット接続。

## ステップ 1: ページを開いて全体を見渡す

ブラウザーで [https://petstore.swagger.io/](https://petstore.swagger.io/) を開きます。
Cookie の通知が表示された場合は、いずれかの選択肢（例: **Allow all cookies**）を選んで
閉じます。

![Swagger UI Petstore ページの全体像](images/01-overview.png)

注目すべき主な領域:

- **Title** — 「Swagger Petstore」、バージョン `1.0.7`、API 標準規格 `OAS 2.0`。
- **Base URL** — `petstore.swagger.io/v2`。すべてのリクエストの送信先アドレスです。
- **Authorize** — 認証が必要なオペレーションでサインインするために使います。この
  チュートリアルでは**不要**です。
- **Tag groups** — オペレーションは **pet**、**store**、**user** ごとにグループ化されて
  います。
- 色付きのバッジ（**GET**、**POST**、**PUT**、**DELETE**）は HTTP メソッド、つまり
  オペレーションが実行する操作の種類を表します。

## ステップ 2: 「GET /pet/findByStatus」を展開する

**pet** グループで、**GET** `/pet/findByStatus`（「Finds Pets by status」）の行をクリック
して展開します。

![展開された findByStatus オペレーション](images/02-expand-findbystatus.png)

これで詳細を読めるようになります:

- 短い説明: 「Multiple status values can be provided with comma separated strings」。
- `status` パラメーター（*required* と表示）を一覧する **Parameters** セクション。指定
  できる値は `available`、`pending`、`sold` です。
- 成功時（`200`）のレスポンス例を示す **Responses** セクション。

この時点では各フィールドは読み取り専用で、ドキュメントを読んでいるだけです。

## ステップ 3: 「Try it out」を有効にする

**Parameters** セクションの右側にある **Try it out** ボタンをクリックします。

![status フィールドが編集可能になり Execute ボタンが表示された Try it out モード](images/03-try-it-out.png)

`status` フィールドが編集可能になり、青い **Execute** ボタンが表示され、**Try it out**
ボタンが **Cancel** に変わります（**Cancel** をクリックすればいつでも読み取り専用モードに
戻れます）。

## ステップ 4: status の値を選ぶ

`status` の一覧で **available** を選びます。

![available に設定された status の値](images/04-set-status.png)

選択した値がハイライトされます。これは、状態が `available` のペットだけが欲しいと API に
伝えるものです。

## ステップ 5: 「Execute」でリクエストを送信する

青い **Execute** ボタンをクリックします。

![生成された curl コマンドとリクエスト URL が表示された Execute ボタン](images/05-execute.png)

Swagger UI が API にリクエストを送信し、送信した内容を正確に表示します:

- **Curl** — 同じリクエストをコマンドライン用の `curl` コマンドとして表したもの:
  `curl -X 'GET' 'https://petstore.swagger.io/v2/pet/findByStatus?status=available' -H 'accept: application/json'`
- **Request URL** — 実際に呼び出された正確なアドレス:
  `https://petstore.swagger.io/v2/pet/findByStatus?status=available`

選んだ `available` が、URL の末尾で `?status=available` になっている点に注目して
ください。

## ステップ 6: サーバーのレスポンスを読み取る

**Server response** セクションまでスクロールします。

![コード 200、レスポンスボディ、レスポンスヘッダーを示すサーバーのレスポンス](images/06-response.png)

- **Code** — `200` はリクエストが成功したことを意味します。
- **Response body** — API が返したデータで、ペットの一覧を JSON 形式で表したものです。
  各ペットには `id`、`name`、`status` などのフィールドがあります。（Petstore は共有の
  公開サンドボックスであるため、一覧の内容は人によって異なります。）
- **Response headers** — `content-type: application/json` など、レスポンスに関する補足
  情報です。

これで、実際の API を呼び出してそのレスポンスを読み取る操作を、すべてブラウザー内で
完了しました。

## 次のステップ

- ステップ 4 を `pending` や `sold` で繰り返し、もう一度 Execute して結果がどう変わるかを
  確認しましょう。
- **GET** `/pet/{petId}`（「Find pet by ID」）など別のオペレーションを展開し、レスポンス
  から取得したペットの `id` を使って試してみましょう。
- **Clear** をクリックするとレスポンスを消去でき、**Cancel** をクリックすると Try it out
  モードを終了できます。

---

*このチュートリアルは、2026-08-10 に Playwright CLI Agent Skill で実際のサイトを操作して
生成しました（Playwright CLI `0.1.17`）。Petstore は共有の公開デモであるため、
スクリーンショットに表示されているレスポンスデータはある時点のスナップショットであり、
実際に試すと異なります。*
