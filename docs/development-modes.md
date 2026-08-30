# 開発モード

このリポジトリでは、依存サービスを使わずに画面と API を確認する
「最小構成」と、既存のローカル開発サービスを含む「フル構成」を選べます。

## 最小構成

```sh
npm install
npm run dev:minimal
```

Node.js 24 と npm だけで実行できます。Web は `http://localhost:5173`、API
は `http://localhost:8787` で起動します。このモードは次を起動・生成しません。

- Docker / Docker Compose
- SeaweedFS（オブジェクトストレージ）
- HTTPS 証明書

現在のダッシュボードの画面表示と API ヘルスチェックにはこれらが不要なため、
初回確認やフロントエンド開発には最小構成を使えます。既存の `npm run dev`
も最小構成の互換エイリアスです。

## フル構成

SeaweedFS を含めて既存のローカル開発環境を起動する場合:

```sh
npm run dev:full
```

HTTPS も必要な場合:

```sh
npm run dev:full:https
```

フル構成には Docker が必要です。HTTPS 版は `.certs/` にローカル証明書を
作成します。終了時は `npm run storage:down` を実行してください。Docker で
Web/API もコンテナ実行する従来の確認フローは、引き続き次で利用できます。

```sh
./scripts/compose-up.sh
./scripts/compose-up-https.sh
```

HTTP と HTTPS の Compose スタックを切り替える場合は、既存の
`compose-restart.sh` / `compose-restart-https.sh` を使ってください。

## モードの切り替え

最小構成からフル構成へ移るときは、実行中の `npm run dev:minimal` を停止して
`npm run dev:full`（または HTTPS 版）を起動します。逆に戻るときは、フル構成の
プロセスを停止し、必要なら `npm run storage:down` を実行してから
`npm run dev:minimal` を起動します。Named volume のデータは削除しないため、
後でフル構成に戻せます。

DB を使う開発では、モードに関係なく API ワークスペースの Prisma コマンドを
追加で実行します。DB の初期化はこの選択によって自動的に削除・変更されません。
