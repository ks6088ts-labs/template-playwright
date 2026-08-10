<!-- translation-meta
source: docs/project-setup.md
sourceHash: sha256:6086b8d6057687d32fbc4f6edb1698bf6c01d16024308be0dfbe14548e037db5
canonicalLanguage: en
-->

# pnpm を使用した Node.js プロジェクトのセットアップ

このガイドでは、一般的な Playwright CLI ワークフローを文書化して試すために、
このリポジトリを Node.js プロジェクトとして初期化する方法を説明します。
Playwright CLI は、プロジェクトの開発依存関係として pnpm でインストールします。
このリポジトリでは、Playwright CLI のグローバルインストールは必要なく、推奨もしません。

## 前提条件

プロジェクトをセットアップする前に、次のツールをインストールしてください。

- [Node.js](https://nodejs.org/) 20 以降。これは Playwright CLI の公式な前提条件で
  定められている最低バージョンです。
- インストール済みの Node.js バージョンをサポートする、現行の安定版
  [pnpm](https://pnpm.io/installation)。
- Git。
- CLI をエージェント経由で使用する場合は、GitHub Copilot や Claude Code などの
  コーディングエージェント。

インストール済みのバージョンを確認します。

```sh
node --version
pnpm --version
git --version
```

Node.js のバージョンは `v20`、またはそれ以降のメジャーバージョンで始まる必要があります。
インストール済みのバージョンが古い場合は、Node.js バージョンマネージャーを使用できます。
`pnpm --version` が失敗する場合は、pnpm の公式インストールガイドに記載されている
いずれかの方法で pnpm をインストールしてください。

## リポジトリをクローンする

```sh
git clone https://github.com/ks6088ts-labs/template-playwright.git
cd template-playwright
```

以降のコマンドはすべてリポジトリのルートから実行してください。

## pnpm プロジェクトを初期化する

このセクションは、リポジトリの初期セットアップを行うメンテナー向けです。
`package.json` と `pnpm-lock.yaml` がすでにコミットされている場合は、
[既存のクローンをセットアップする](#set-up-an-existing-clone)に進んでください。

パッケージマニフェストを作成します。

```sh
pnpm init
```

このリポジトリには、パッケージレジストリに公開するパッケージではなく、サンプルと
ドキュメントが含まれています。このガイドの後半でスクリプトを追加するときに、
パッケージを private に設定してください。

## Playwright CLI をローカルにインストールする

最新の Playwright CLI を、バージョンを固定した開発依存関係としてインストールします。

```sh
pnpm add --save-dev --save-exact @playwright/cli@latest
```

このコマンドは、次の両方のファイルを作成または更新します。

- `package.json` の `devDependencies` に `@playwright/cli` が記録されます。
- `pnpm-lock.yaml` に依存関係ツリー全体が固定され、再現可能なインストールが可能になります。

両方のファイルをコミットしてください。`node_modules/` はコミットしないでください。
このリポジトリの `.gitignore` ですでに除外されています。

ここで `@latest` を使用するのは、初期セットアップまたは明示的なアップグレードに限られます。
通常のインストールでは、コミット済みのロックファイルを使用する必要があります。
`pnpm dlx` はプロジェクトの依存関係として記録せずに一時パッケージを実行するため、
このコマンドを `pnpm dlx` で置き換えないでください。

## pnpm スクリプトを追加する

`private` を `true` に設定し、`package.json` の `scripts` オブジェクトに
次のエントリを追加します。

```json
{
  "private": true,
  "scripts": {
    "pw": "playwright-cli",
    "pw:help": "playwright-cli --help",
    "pw:install-browser": "playwright-cli install-browser",
    "pw:install-skills": "playwright-cli install --skills=agents"
  }
}
```

`pnpm init` で生成されたフィールドと、`pnpm add` で生成された `devDependencies` は
そのまま残してください。上記のスニペットは、追加または更新が必要なフィールドのみを
示しています。

pnpm スクリプトは、自動的に `node_modules/.bin` を `PATH` に追加します。
そのため、次のコマンドではこのプロジェクトにインストールされたバージョンを使用します。

```sh
pnpm run pw:help
pnpm run pw -- <command> [options]
```

区切り文字 `--` は、後続のすべての引数を `playwright-cli` に渡します。
別の CLI コマンドへ直接アクセスする場合も、`pnpm exec` でローカルバイナリを解決できます。

```sh
pnpm exec playwright-cli --version
```

このリポジトリでは、次のいずれの形式も使用しないでください。

```sh
pnpm add --global @playwright/cli
playwright-cli --help
```

最初のコマンドは、管理されないグローバルインストールを作成します。2番目のコマンドを
シェルから直接実行すると、グローバルな `PATH` エントリに依存します。pnpm スクリプトまたは
`pnpm exec` を使用すると、CLI のバージョンを `pnpm-lock.yaml` に関連付けたままにできます。

## ブラウザーをインストールする

CLI は初回使用時にブラウザーを自動的にダウンロードします。セットアップ時に明示的に
インストールしておくと、サンプルを実行する前に環境を準備できます。

```sh
pnpm run pw:install-browser
```

これにより、デフォルトのブラウザーである Chromium がインストールされます。
その他に、次の形式もサポートされています。

```sh
# Install a specific browser.
pnpm run pw -- install-browser firefox

# Install Chromium and required system dependencies on Linux.
pnpm run pw -- install-browser --with-deps

# Preview browser installation without making changes.
pnpm run pw -- install-browser --dry-run

# List browsers available from installed Playwright packages.
pnpm run pw -- install-browser --list
```

`--with-deps` オプションは Linux 環境向けであり、オペレーティングシステムの
パッケージをインストールする権限が必要になる場合があります。

## コーディングエージェントのスキルをインストールする

Playwright CLI では、対応するコーディングエージェントにコマンドの詳しいコンテキストを
提供するスキルをインストールできます。

```sh
pnpm run pw:install-skills
```

使用するコーディングエージェントによって適切なスキルの配置場所が異なる場合があるため、
このコマンドで作成されたファイルはコミット前に確認してください。スキルのインストールは
任意です。必要に応じて、エージェントが `playwright-cli --help` を調べることもできます。

## セットアップを確認する

pnpm がプロジェクトローカルの依存関係を解決し、CLI が起動することを確認します。

```sh
pnpm list @playwright/cli --depth 0
pnpm run pw:help
```

最初のコマンドでは、このリポジトリの配下に `@playwright/cli` が表示される必要があります。
2番目のコマンドでは、`command not found` エラーが発生せずに CLI のヘルプが表示される
必要があります。

コミットされるファイルを確認します。

```sh
git status --short
```

初回の Node.js セットアップには、少なくとも `package.json` と `pnpm-lock.yaml` が
含まれている必要があります。

<a id="set-up-an-existing-clone"></a>

## 既存のクローンをセットアップする

パッケージファイルがコミットされた後は、コントリビューターが初期化手順を
繰り返す必要はありません。ロックファイルを使用して、リポジトリで選択された
依存関係のバージョンを正確にインストールします。

```sh
git clone https://github.com/ks6088ts-labs/template-playwright.git
cd template-playwright
pnpm install --frozen-lockfile
pnpm run pw:install-browser
pnpm run pw:help
```

ローカルのクリーンなセットアップと継続的インテグレーションでは、
`pnpm install --frozen-lockfile` を使用してください。このコマンドはロックファイルを
更新せずに `pnpm-lock.yaml` からインストールし、`package.json` と `pnpm-lock.yaml` が
一致しない場合は失敗するため、意図しない依存関係のずれを防げます。pnpm は、ロックファイルが
存在する認識済みの CI 環境では、デフォルトで frozen lockfile の動作を有効にしますが、
オプションを明示することで、ローカルと CI の手順を統一できます。

## Playwright CLI をアップグレードする

アップグレードは、個別の変更として意図的に実施します。

```sh
pnpm add --save-dev --save-exact @playwright/cli@latest
pnpm run pw:help
```

アップグレードをコミットする前に、リリースノートと pnpm の両方のパッケージファイルへの
変更を確認してください。

## トラブルシューティング

### Node.js のバージョンがサポートされていない

Node.js 20 以降をインストールして、アクティブなバージョンを切り替え、
`pnpm install --frozen-lockfile` をもう一度実行してください。また、インストール済みの
pnpm バージョンが、選択した Node.js バージョンをサポートしていることも確認してください。

### CLI が見つからない

`pnpm install --frozen-lockfile` を実行してから、`pnpm run pw:help`、
`pnpm run pw -- <command>`、または `pnpm exec playwright-cli` で CLI を呼び出してください。
パッケージをグローバルにインストールして解決しないでください。

### ブラウザーの実行ファイルが見つからない

`pnpm run pw:install-browser` を実行してください。Linux ホストでシステムライブラリも
不足している場合は、その環境で必要な権限を使用して
`pnpm run pw -- install-browser --with-deps` を実行してください。

### frozen install でロックファイルの不一致が報告される

ロックファイルを削除しないでください。依存関係の変更が意図したものである場合は、
`pnpm install` を実行し、生成された `pnpm-lock.yaml` を確認して、`package.json` と
一緒にコミットしてください。それ以外の場合は、リポジトリからパッケージファイルを
復元し、`pnpm install --frozen-lockfile` を再試行してください。

## 参考資料

- [Playwright CLI のインストール](https://playwright.dev/agent-cli/installation)
- [Playwright CLI クイックスタート](https://playwright.dev/agent-cli/quick-start)
- [pnpm のインストール](https://pnpm.io/installation)
- [`pnpm add` ドキュメント](https://pnpm.io/cli/add)
- [`pnpm install` ドキュメント](https://pnpm.io/cli/install)
- [`pnpm run` ドキュメント](https://pnpm.io/cli/run)
