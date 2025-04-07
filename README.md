# Prompt Presentation

プロンプトからプレゼンテーションスライドを生成するウェブアプリケーション

![デモイメージ](https://placehold.jp/150x150.png)

## 機能概要

Prompt Presentation は、自然言語のプロンプトを入力するだけで、構造化されたプレゼンテーションスライドを自動生成するツールです。OpenAI API または Google Gemini API を利用して、高品質なプレゼン資料を短時間で作成できます。

主な機能:
- テキストプロンプトからプレゼンテーションスライドを自動生成
- OpenAI API または Google Gemini API を選択可能
- 様々なテーマとスタイルをカスタマイズ
- プレゼンテーションのタイトル、説明、キーワードの設定
- 生成されたスライドのプレビューと閲覧

## 技術スタック

- **フロントエンド**: Next.js (App Router), React
- **バックエンド**: Next.js API Routes
- **デザイン**: CSS Modules, レスポンシブデザイン
- **AI API**: OpenAI API, Google Gemini API

## インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/MyTH-AI-JP/prompt-presentation.git
cd prompt-presentation

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 使用方法

1. アプリにアクセス (デフォルトでは http://localhost:3000)
2. OpenAI または Gemini の API キーを設定
3. プレゼンテーションのタイトル、説明、キーワードを入力
4. 生成したいスライドの内容を自然言語で記述
5. 「生成」ボタンをクリック
6. 生成されたスライドを表示・閲覧

## 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定してください:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## ライセンス

[MIT License](LICENSE)

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 開発者

MyTH-AI-JP チーム

---

*このプロジェクトは開発中です。フィードバックや貢献を歓迎します！* 