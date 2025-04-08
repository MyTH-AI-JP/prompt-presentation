# Prompt Presentation

プロンプトからプレゼンテーションスライドを生成するウェブアプリケーション

![デモイメージ](https://placehold.jp/150x150.png)

## 機能概要

Prompt Presentation は、自然言語のプロンプトを入力するだけで、構造化されたプレゼンテーションスライドを自動生成するツールです。OpenAI API、Google Gemini API、または Anthropic Claude API を利用して、高品質なプレゼン資料を短時間で作成できます。

主な機能:
- テキストプロンプトからプレゼンテーションスライドを自動生成
- OpenAI GPT-4o、Gemini 2.0 Flash、または Claude 3.7 Sonnet を選択可能
- 様々なテーマとスタイルをカスタマイズ
- スライド数のカスタマイズ（3枚〜15枚）
- プレゼンテーションのHTML、PDF、PowerPointでのダウンロード
- Googleスライドとの連携機能
- 生成されたスライドのプレビューと閲覧

## 最新アップデート情報（2024年11月）

### 2024年11月26日更新

- **Claude 3.7 Sonnet対応**: Anthropic Claude 3.7 Sonnetモデルをサポート
- **UI/UXの改善**: モデル名表示を「gpt-4o」「Gemini 2.0 Flash」「Claude 3.7 Sonnet」に統一
- **スライド数オプションの拡張**: 15枚までのスライド生成をサポート
- **PDF生成機能の最適化**: スライドサイズを16:9比率に最適化し、PDFで美しく表示
- **PowerPointダウンロード機能**: 生成したスライドをPowerPoint (.pptx) 形式でダウンロード可能に
- **Googleスライド連携機能**: 生成したスライドをGoogleスライドで直接開いて編集可能に
- **不要機能の削除**: 印刷プレビュー機能を削除しシンプル化

## 技術スタック

- **フロントエンド**: Next.js (App Router), React
- **バックエンド**: Next.js API Routes
- **デザイン**: CSS Modules, レスポンシブデザイン
- **AI API**: OpenAI API, Google Gemini API, Anthropic Claude API
- **プレゼンテーション**: Google Slides API

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
2. OpenAI、Gemini、またはClaudeのAPI キーを設定
3. プレゼンテーションのテーマを入力
4. AIプロバイダー、スライド数、テーマを選択
5. 「プレゼンテーションを生成」ボタンをクリック
6. 生成されたスライドを表示・閲覧
7. 必要に応じてHTML、PDF、PowerPointでダウンロードするか、Googleスライドとして開く

## 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定してください:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
```

### Google API設定

Googleスライド機能を使用するには、Google Cloud ConsoleでAPI認証情報を設定する必要があります：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Google Slides APIとGoogle Drive APIを有効化
4. OAuth同意画面を設定
5. OAuthクライアントIDとAPIキーを作成
6. 取得した認証情報を環境変数に設定

## Vercelデプロイ設定

このアプリケーションはVercelにデプロイされており、以下のURLでアクセスできます：

- 公開URL: [https://prompt-presentation-nu.vercel.app/](https://prompt-presentation-nu.vercel.app/)

### タイムアウト設定

Vercelのサーバーレス関数は、デフォルトでは短いタイムアウト制限があります。AI生成のような時間のかかる処理では、以下のようにタイムアウト設定を調整する必要があります：

1. Vercelダッシュボードの「Settings」→「Functions」で「Function Execution Timeout」を55秒に設定
2. または、`vercel.json`ファイルで以下のように設定：

```json
{
  "functions": {
    "api/generate-presentation.js": {
      "maxDuration": 55
    }
  }
}
```

**注意**: タイムアウト設定はVercelのプランによって制限があります（無料プラン: 10秒、Pro/Teamプラン: 60秒、Enterpriseプラン: 900秒）。

## APIテスト結果

公開環境でのCurl APIテストの結果概要です。

### APIエンドポイント

```
POST https://prompt-presentation-nu.vercel.app/api/generate-presentation
```

### リクエスト形式

```json
{
  "prompt": "生成するスライドのテーマ",
  "apiKey": "YOUR_API_KEY",
  "provider": "openai|gemini|claude",
  "numSlides": 数値（3-15）,
  "theme": "modern|dark|gradient|minimal"
}
```

### テスト結果

#### Gemini APIテスト

**リクエスト例**:
```bash
curl -X POST https://prompt-presentation-nu.vercel.app/api/generate-presentation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "AIの未来について3枚のスライドを作成",
    "apiKey": "YOUR_GEMINI_API_KEY",
    "provider": "gemini",
    "numSlides": 3,
    "theme": "modern"
  }'
```

**応答例**:
```json
{
  "title": "AIの未来：可能性と課題",
  "theme": "modern",
  "slides": [
    {
      "title": "AIの未来：可能性と課題",
      "content": "<div><p>AIは私たちの生活、仕事、社会を大きく変えようとしています。</p><p>このプレゼンテーションでは、AIの未来について、その可能性と課題を探ります。</p></div>",
      "type": "title"
    },
    {
      "title": "AIがもたらす未来",
      "content": "<div><ul><li><b>自動化の進化：</b> 反復作業からの解放、生産性の向上</li><li><b>医療の革新：</b> 診断精度向上、個別化医療の実現</li><li><b>持続可能な社会：</b> エネルギー効率の最適化、環境問題の解決</li><li><b>新たな産業の創出：</b> AIを活用した新サービス、新ビジネスモデル</li></ul></div>",
      "type": "content"
    },
    {
      "title": "AIの課題と向き合う",
      "content": "<div><ul><li><b>倫理的な問題：</b> AIの意思決定、バイアスの排除</li><li><b>雇用の変化：</b> スキルシフト、新たな雇用の創出</li><li><b>セキュリティリスク：</b> AIの悪用、プライバシー侵害</li><li><b>技術的な限界：</b> まだ発展途上の技術、予測不可能性</li><li><b>まとめ：</b> AIの未来は、私たちがどのように向き合うかにかかっています。可能性を最大限に活かし、課題を克服することで、より良い未来を創造できます。</li></ul></div>",
      "type": "summary"
    }
  ]
}
```

#### OpenAI APIテスト

**リクエスト例**:
```bash
curl -X POST https://prompt-presentation-nu.vercel.app/api/generate-presentation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "AI技術入門",
    "apiKey": "YOUR_OPENAI_API_KEY",
    "provider": "openai",
    "numSlides": 3,
    "theme": "modern"
  }'
```

**実行結果**:
タイムアウト設定変更前は `FUNCTION_INVOCATION_TIMEOUT` エラーが発生することがありましたが、タイムアウト設定を55秒に変更後は正常に動作するようになりました。

#### Claude APIテスト

**リクエスト例**:
```bash
curl -X POST https://prompt-presentation-nu.vercel.app/api/generate-presentation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "宇宙探査の歴史と未来",
    "apiKey": "YOUR_CLAUDE_API_KEY",
    "provider": "claude",
    "numSlides": 5,
    "theme": "gradient"
  }'
```

**実行結果**:
Claude 3.7 Sonnetモデルを使用した高品質なプレゼンテーションが生成されます。

### 実行時間目安

- Gemini API: 約2〜5秒
- OpenAI API: 約5〜15秒
- Claude API: 約5〜15秒

**注意**: 実行時間はプロンプトの複雑さ、スライド数、APIの応答時間によって変動します。

## 注意事項

- このアプリケーションはOpenAI GPT-4、Google Gemini、Anthropic Claude APIを使用しています。これらのAPIには利用料金が発生します。
- Googleスライドとの連携にはGoogleアカウントへのログインが必要です。
- PDF出力は現状、基本的なスタイルのみ対応しています。
- PowerPointダウンロードでは、複雑なレイアウトや詳細なスタイルが簡略化される場合があります。
- APIの利用にはそれぞれのサービスの利用規約が適用されます。

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