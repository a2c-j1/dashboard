# AGENTS.md

## プロジェクト

- npm workspaces を使う React/Vite フロントエンドと Hono API のダッシュボード。
- Node.js 24 と npm を前提とする。依存関係の管理は `package-lock.json` を正とする。
- ローカル開発は `npm run dev`。Web は `http://localhost:5173`、API は `http://localhost:8787`。

## 構成

- `apps/web/`: React、TypeScript、StyleX の UI。
- `apps/api/`: Hono、Prisma、SQLite の API。
- `packages/schemas/`: Zod と JSON Schema の共有スキーマ。
- `e2e/`: Playwright のブラウザ E2E テスト。

## 実装方針

- API 入出力は Zod で検証し、公開 API は `@hono/zod-openapi` の OpenAPI 契約へ登録する。仕様は `/api/doc` で確認できる状態を保つ。
- フロントエンドのサーバー状態は TanStack Query で扱う。API 呼び出しは `apps/web/src/api.ts` にまとめ、コンポーネント内に直接 `fetch` を増やさない。
- StyleX を UI の標準スタイリング手段とする。コンパイルが必要なため、`stylex.create` を通常のランタイム CSS-in-JS としては扱わない。
- スキーマを変更したら、API 実装・OpenAPI 契約・ユニットテストを同時に更新する。
- DB スキーマを変更したら Prisma migration を追加し、既存 migration を書き換えない。

## ペアプログラミング方針

- 新規実装は原則として `.codex/agents/pair-programming-driver.toml` の Luna ドライバーに依頼する。
- ナビゲーターは要件の分解、実装方針の提示、受け入れ条件の定義、ドライバー成果物の確認を担う。
- 依頼者が成果物をレビューする。レビューで指摘が出た場合、修正はドライバーではなくナビゲーターが担当する。
- ナビゲーターは修正後に、指摘事項への対応内容と実行した検証結果を依頼者へ報告する。

## 品質基準

変更後は影響範囲に応じて次を実行する。

```sh
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
```

- UI の重要な利用フローは Playwright で検証する。
- API 契約やビジネスロジックは Vitest で検証する。
- セキュリティ上の変更を含む場合は `npm run semgrep` も実行する。
- `testcontainers` を使う統合テストは Docker が利用可能な環境で実行する。

## 編集上の注意

- 既存のユーザー変更や `package-lock.json` を無関係に巻き戻さない。
- `.env` をコミットしない。必要な環境変数は `.env.example` に追加する。
- 新しい外部依存を追加する場合は、目的・利用箇所・代替しない理由を明確にする。
