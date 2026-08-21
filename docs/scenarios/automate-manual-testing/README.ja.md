<!-- translation-meta
source: docs/scenarios/automate-manual-testing/README.md
sourceHash: sha256:0211e6153d6aa6b3bd1b6f70c5373b263690fd7404c185af308fdd0097ce0c93
canonicalLanguage: en
-->

# Playwright CLI で手動テスト手順を自動化する

## 目的

この最小シナリオでは、コーディングエージェントが自然言語による手動テスト手順を表示可能なブラウザー操作に変換し、Playwright CLI を headed モードで使用して公開 Web サイトを検証し、構造化された Markdown 作業レポートを提出する方法を示します。

対象は [playwright.dev](https://playwright.dev/) です。このシナリオでは、ページの識別、表示コンテンツ、リンクナビゲーション、パッケージマネージャータブ、ドキュメントナビゲーションを確認する 5 つの読み取り専用チェックを使用します。Playwright Test の仕様やヘルパースクリプトは作成しません。Markdown の手順が正式なテスト契約です。

## シナリオファイル

| ファイル | 役割 |
| --- | --- |
| [作業手順](templates/work-instructions.ja.md) | エージェントにコンテキストとして渡す自然言語の手順です。 |
| [作業レポートテンプレート](templates/work-report.ja.md) | エージェントにコンテキストとして渡す変更不可の記入用形式です。 |
| [作業レポートのサンプル](sample-work-report.ja.md) | このデモを実際に実行して作成した記入済みレポートです。 |

実行中は、`templates/` 配下の両ファイルを変更しないでください。完了したレポートは、リクエストで指定された出力パスに書き込みます。Playwright CLI は `.playwright-cli/` 配下に一時的なアクセシビリティスナップショットを作成することがあります。この無視対象ディレクトリは提出レポートには含まれません。

## 前提条件

- Node.js 20 以降と pnpm。
- `https://playwright.dev/` へのネットワークアクセス。
- CLI が管理するブラウザーを表示したままにできるグラフィカルデスクトップセッション。
- ローカルの Agent Skills を使用し、ターミナルコマンドを実行できるコーディングエージェント。
- このリポジトリからインストールした依存関係と Playwright CLI 用ブラウザー。

すべてのコマンドはリポジトリルートから実行してください。

## 手順 1: プロジェクトローカルの CLI を準備する

リポジトリで固定されたバージョンと管理対象ブラウザーをインストールします。

```sh
pnpm install --frozen-lockfile
pnpm run pw:install-browser
```

CLI を確認し、環境にまだ用意されていない場合は、その Agent Skill をインストールします。

```sh
pnpm exec playwright-cli --version
pnpm run pw:install-skills
```

このシナリオは `pnpm exec playwright-cli` を使用するため、グローバルな CLI インストールには依存しません。

## 手順 2: 2 つのコンテキストファイルを確認する

デモを実行する前に、[作業手順](templates/work-instructions.ja.md) と[作業レポートテンプレート](templates/work-report.ja.md)を確認します。作業手順では、5 つのチェック、その期待結果、証跡要件、ステータス規則、クリーンアップ動作を厳密に定義しています。作業レポートテンプレートでは、提出物に必要な形式を定義しています。

## 手順 3: エージェントに手順の実行を依頼する

両方の Markdown ファイルをコンテキストとしてエージェントに渡します。次のリクエストはリポジトリルートからそのまま使用できます。

> Playwright CLI Agent Skill を使用して、
> docs/scenarios/automate-manual-testing/templates/work-instructions.md に記載された手順を
> 実行してください。
>
> CLI が管理する名前付きブラウザーを `--headed` で起動し、チェックを実行する前に
> `pnpm exec playwright-cli list` に `headed: true` と表示されることを確認してください。
> headless セッションのエビデンスは使用しないでください。
>
> docs/scenarios/automate-manual-testing/templates/work-report.md を変更不可のテンプレートとして
> 使用し、記入済みの結果を
> docs/scenarios/automate-manual-testing/sample-work-report.md に書き込んでください。すべての結果は
> 観測した Playwright CLI の証跡に基づけ、実際の失敗やブロッカーをそのまま残し、すべての
> プレースホルダーを埋め、完了時に指定されたブラウザーセッションを閉じてください。

エージェントはチェック中に CLI が管理するブラウザーを表示したままにし、observe-decide-act-report ループに従う必要があります。現在のアクセシビリティスナップショットを調べ、ユーザー向けのロケーターを選択し、1 つの操作を実行して、結果の状態を確認し、レポートには簡潔な証跡だけを残します。一時的な要素参照は、ナビゲーションまたはページ状態の実質的な変更後に再利用してはいけません。

## 手順 4: 提出されたレポートを確認する

完了したレポートが次を満たしていることを確認します。

1. `MT-01` から `MT-05` までの各チェックについて 1 件ずつ結果が含まれています。
2. 各ステータスに `PASS`、`FAIL`、`BLOCKED` のいずれかのみを使用しています。
3. 概要の件数合計が 5 で、詳細結果と一致しています。
4. 期待結果のコピーではなく、観測した証跡が含まれています。
5. `{{FILL_ME}}` プレースホルダーが残っていません。
6. `automate-manual-testing` セッションが正常に終了したことが記録されています。または、クリーンアップがブロックされた理由が説明されています。
7. ブラウザーが headed であることを示し、チェック開始前にセッションで `headed: true` が報告されたことを記録しています。

チェックイン済みの[作業レポートのサンプル](sample-work-report.ja.md)は、期待される詳細度を示します。これはある時点の証跡であり、稼働中の Web サイトについて恒久的に成り立つ主張ではありません。

## 成功条件

- エージェントが自然言語の手順からブラウザー操作を導出します。
- レポートで環境上のブロッカーが明確に示されている場合を除き、5 つのチェックすべてに、根拠となる証跡を伴う確定的なステータスが付与されます。
- CLI が管理するブラウザーを `--headed` で起動し、チェック中は表示したままにして、エビデンスを採用する前に `headed: true` が報告されます。
- 作業レポートテンプレートは変更されず、記入済みレポートは別の Markdown ファイルとして作成されます。
- 実行後に指定したブラウザーセッションが閉じられます。
- 未加工のスナップショット、スクリーンショット、トレース、ブラウザープロファイル、認証情報がシナリオディレクトリに追加されません。

## トラブルシューティング

### CLI またはブラウザーを利用できない

`pnpm install --frozen-lockfile` を実行してから、`pnpm run pw:install-browser` を実行します。チェックを開始する前に、`pnpm exec playwright-cli --version` が成功することを確認してください。

### 指定したセッションがすでに開いている

このシナリオで使用するセッションだけを閉じてから、手順を再開してください。

```sh
pnpm exec playwright-cli -s=automate-manual-testing close
```

### ブラウザーが headless モードで開く

セッションを閉じ、そのセッションのエビデンスを破棄して、チェックを開始する前に headed
モードを明示して開き直します。

```sh
pnpm exec playwright-cli -s=automate-manual-testing close
pnpm exec playwright-cli -s=automate-manual-testing open https://playwright.dev/ --headed
pnpm exec playwright-cli list
```

セッション一覧に `headed: true` と表示された場合のみ続行します。

### ロケーターが一致しなくなった

最新のアクセシビリティスナップショットを取得し、現在のロールとアクセシブル名からコントロールを特定します。DOM 位置に依存する CSS または XPath セレクターで置き換えないでください。ユーザーに見える動作が変わった場合は、実行中に期待結果を弱めるのではなく、観測結果を `FAIL` として記録します。

### 稼働中の Web サイトまたはネットワークを利用できない

個別に到達できるチェックは続行します。完了できないチェックは `BLOCKED` とし、環境に関する証跡を記録し、作業手順に従って全体ステータスを計算したうえで、セッションのクリーンアップも試みます。
