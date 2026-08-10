<!-- translation-meta
source: docs/scenarios/automate-manual-testing/templates/work-report.md
sourceHash: sha256:01848d116e858c5f5b68466490d12c8729d8b8cc0aec43dce8d7e6b27d3fd36d
canonicalLanguage: en
-->

# 作業レポート: playwright.dev 手動テスト自動化

> すべての `{{FILL_ME}}` プレースホルダーを確認した値に置き換えてください。
> 期待結果を変更したり、チェックを追加したりしないでください。

## 実行メタデータ

| 項目 | 値 |
| --- | --- |
| 開始日時（タイムゾーンを含む） | {{FILL_ME}} |
| 終了日時（タイムゾーンを含む） | {{FILL_ME}} |
| 実行者 | {{FILL_ME}} |
| 対象 URL | {{FILL_ME}} |
| ブラウザー | {{FILL_ME}} |
| Playwright CLI バージョン | {{FILL_ME}} |
| セッション名 | {{FILL_ME}} |
| 作業手順 | {{FILL_ME}} |

## 全体結果

| 項目 | 値 |
| --- | --- |
| ステータス（`PASS`、`FAIL`、または `BLOCKED`） | {{FILL_ME}} |
| 合格 | {{FILL_ME}} |
| 失敗 | {{FILL_ME}} |
| ブロック | {{FILL_ME}} |
| 合計 | 5 |

## 結果概要

| ID | チェック | ステータス | 簡潔なエビデンス |
| --- | --- | --- | --- |
| MT-01 | ホームページの識別情報 | {{FILL_ME}} | {{FILL_ME}} |
| MT-02 | 製品ラインアップ | {{FILL_ME}} | {{FILL_ME}} |
| MT-03 | Get started のナビゲーション | {{FILL_ME}} | {{FILL_ME}} |
| MT-04 | pnpm のインストール手順 | {{FILL_ME}} | {{FILL_ME}} |
| MT-05 | 次のドキュメントページ | {{FILL_ME}} | {{FILL_ME}} |

## 詳細結果

### MT-01: ホームページの識別情報

- **期待結果:** 正規化された URL が `https://playwright.dev/` であり、タイトルに
  `Playwright` が含まれ、レベル1の見出しが
  `Playwright enables reliable web automation` で始まります。
- **ステータス:** {{FILL_ME}}
- **実際の結果:** {{FILL_ME}}
- **エビデンス:** {{FILL_ME}}

### MT-02: 製品ラインアップ

- **期待結果:** `Playwright Test`、`Playwright CLI`、`Playwright MCP` がすべて
  製品見出しとして表示されます。
- **ステータス:** {{FILL_ME}}
- **実際の結果:** {{FILL_ME}}
- **エビデンス:** {{FILL_ME}}

### MT-03: Get started のナビゲーション

- **期待結果:** `Get started` を操作すると、レベル1の見出しが
  `Installation` の `https://playwright.dev/docs/intro` が開きます。
- **ステータス:** {{FILL_ME}}
- **実際の結果:** {{FILL_ME}}
- **エビデンス:** {{FILL_ME}}

### MT-04: pnpm のインストール手順

- **期待結果:** `Installing Playwright` セクションの `pnpm` タブが選択され、
  表示されるインストールコマンドが `pnpm create playwright` で始まります。
- **ステータス:** {{FILL_ME}}
- **実際の結果:** {{FILL_ME}}
- **エビデンス:** {{FILL_ME}}

### MT-05: 次のドキュメントページ

- **期待結果:** 次ページへのリンクを操作すると、レベル1の見出しが
  `Writing tests` の `https://playwright.dev/docs/writing-tests` が開き、
  アクションの実行と期待値に対する状態のアサートについての導入文が表示されます。
- **ステータス:** {{FILL_ME}}
- **実際の結果:** {{FILL_ME}}
- **エビデンス:** {{FILL_ME}}

## 所見

{{FILL_ME}}

## クリーンアップ

| 項目 | 値 |
| --- | --- |
| セッション終了ステータス | {{FILL_ME}} |
| 残っているブラウザーセッション | {{FILL_ME}} |
| 備考 | {{FILL_ME}} |
