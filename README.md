# たびさき (tabisaki-demo)

Astro 5 (SSR) + React 19 (Islands Architecture) の実装デモ。

日本の都道府県を探すアプリを題材に、以下の技術要素を検証しています。

## 検証ポイント

* **Astro Islands** — ナビゲーションは純 HTML、検索・チャット等のインタラクティブ部分だけ React island として `client:load` で hydrate
* **MD3 ダイナミックテーマ** — `@material/material-color-utilities` で SSR 時に CSS 変数を生成・注入（FOUC なし）
* **Chrome built-in AI** — Prompt API によるブラウザ内 LLM チャット。非対応ブラウザではガイド付き発見フローにフォールバック
* **Cookie ベースのセッション** — ユーザー設定をクッキーに保存し、Middleware で SSR に反映
* **Zod バリデーション** — API ルートで共有定数から派生したスキーマによる入力検証

## 技術スタック

| カテゴリ          | 技術                                         |
| ------------- | ------------------------------------------ |
| フレームワーク       | Astro 5 (SSR) + React 19 (Islands)         |
| テーマ           | `@material/material-color-utilities` (MD3) |
| アニメーション       | motion                                     |
| バリデーション       | Zod                                        |
| lint / format | Biome 2.x                                  |
| テスト           | Vitest                                     |
| 言語            | TypeScript                                 |

## セットアップ

```bash
# Node.js 24 以上が必要（.node-version 参照）
npm install
npm run dev
```

## コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run preview    # ビルド結果のプレビュー
npm run check      # Biome lint チェック
npm run format     # Biome で自動フォーマット
npm test           # テスト実行
npm run test:watch # テスト（ウォッチモード）
```

## ライセンス

MIT
