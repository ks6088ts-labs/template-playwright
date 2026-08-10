<!-- translation-meta
source: docs/scenarios/first-local-chrome-automation/README.md
sourceHash: sha256:40ddb45c0f0a53a3776dc27ad52110f539ae5ab2ae9ecf6170729d0295a1f4db
canonicalLanguage: en
-->

# クイックデモ: 初めてのローカル Chrome 自動操作

## 目的

この初心者向けシナリオでは、Playwright CLI を使用して Google Chrome を起動し、
自己完結型のページを表示して内容を確認し、1つのチェックボックスを操作してから
ブラウザーを閉じます。各コマンドを個別に実行し、次に進む前に結果を確認してください。

ページは `open` コマンドに直接含まれています。Web サイト、アカウント、ネットワーク接続、
ヘルパースクリプト、構成ファイルは必要ありません。このシナリオでは、既存の Chrome
プロファイルやそのサインイン状態を再利用しません。

## 始める前に

- このコンピューターに Google Chrome をインストールします。
- リポジトリのルートでターミナルを開きます。
- 以前の実行で残っている `local-chrome` という名前の Playwright CLI セッションを閉じます。

## ステップ 1: CLI が使用できることを確認する

```sh
pnpm exec playwright-cli --version
```

このコマンドを実行すると、バージョン番号が表示されます。エラーが報告された場合は、
ここで停止し、プロジェクトの依存関係がインストールされていることを確認してから
続行してください。

## ステップ 2: Chrome を起動する

```sh
pnpm exec playwright-cli -s=local-chrome open \
  'data:text/html,<title>Playwright CLI Demo</title><main><h1>Playwright CLI Demo</h1><label><input type="checkbox"> Automation works</label></main>' \
  --browser=chrome
```

このコマンドは、次の3つの処理を行います。

1. `-s=local-chrome` でブラウザーセッションに名前を付けます。
2. `open` でブラウザーを起動し、指定したページを開きます。
3. `--browser=chrome` でローカルにインストールされた Google Chrome を選択します。

Chrome ウィンドウが開き、見出し **Playwright CLI Demo** と、未選択の
**Automation works** チェックボックスが表示されます。ターミナルと Chrome は
開いたままにしてください。

## ステップ 3: ページを調べる

```sh
pnpm exec playwright-cli -s=local-chrome snapshot
```

スナップショットは、表示されているページをテキストで表現したものです。出力に
`Playwright CLI Demo` と `Automation works` の両方が含まれていることを確認してください。
インタラクティブな要素には `e2` などの一時的な参照が付く場合もあります。これらの参照は、
新しいスナップショットを取得するたびに変わる可能性があります。

## ステップ 4: チェックボックスを操作する

```sh
pnpm exec playwright-cli -s=local-chrome click \
  "getByRole('checkbox', { name: 'Automation works' })"
```

ロケーターは、ロールと表示ラベルを使用してチェックボックスを特定します。
Chrome でチェックボックスが選択されたことを確認してください。

## ステップ 5: 変更後の状態を確認する

```sh
pnpm exec playwright-cli -s=local-chrome snapshot
```

`Automation works` をもう一度探します。スナップショットのエントリに `checked` が
含まれていれば、コマンドによって Chrome のページが変更されたことを確認できます。

## ステップ 6: Chrome を閉じる

```sh
pnpm exec playwright-cli -s=local-chrome close
```

このシナリオで開いた Chrome ウィンドウが閉じます。これで CLI セッションは終了です。
これらのコマンドは、スクリーンショットや名前付きシナリオの出力を保存しません。
Playwright CLI は引き続き `.playwright-cli/` に一時的なスナップショットを書き込みますが、
このプロジェクトでは Git の追跡対象から除外されます。

## 成功条件

- Google Chrome で自己完結型のデモページが開きます。
- 最初のスナップショットに、見出しと未選択のチェックボックスが表示されます。
- `click` コマンドでチェックボックスが選択されます。
- 2回目のスナップショットで、チェックボックスが選択済みと報告されます。
- `close` コマンドで Chrome が閉じ、名前付きセッションが終了します。

## トラブルシューティング

### ブラウザーが開かない

デスクトップ版の Google Chrome がインストールされ、ステップ 1 で CLI のバージョンが
表示されることを確認してください。その後、ステップ 2 をもう一度実行します。

### `Browser local-chrome is already open`

以前の実行で名前付きセッションが開いたままになっています。セッションを閉じてから、
ステップ 2 を繰り返してください。

```sh
pnpm exec playwright-cli -s=local-chrome close
```

### `The browser 'local-chrome' is not open`

セッションが開始されていないか、すでに閉じられています。続行する前にステップ 2 を実行し、
以降のすべてのコマンドに `-s=local-chrome` を含めてください。

### チェックボックスが見つからない

ステップ 3 をもう一度実行し、スナップショットに `Automation works` が表示されることを
確認してください。表示されない場合は、セッションを閉じてステップ 2 からやり直します。
