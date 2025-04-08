# Google Slides API統合仕様書

## 1. 概要
### 1.1 目的
- 現在のHTMLベースのスライドをGoogle Slides形式に変換
- Google Slides APIを使用した自動スライド生成
- 既存のデザインとレイアウトの維持
- ユーザーによるスライドの再編集を容易にする

### 1.2 対象ユーザー
- プロンプトからスライドを生成するユーザー
- Google Workspaceユーザー
- スライドの共有・編集が必要なユーザー

## 2. 技術仕様
### 2.1 必要なAPIとサービス
- Google Slides API v1
- Google Drive API v3
- Google OAuth 2.0

### 2.2 必要なパッケージ
```json
{
  "dependencies": {
    "googleapis": "^128.0.0",
    "google-auth-library": "^9.0.0"
  }
}
```

### 2.3 認証フロー
1. OAuth 2.0クライアントIDの設定
   - Google Cloud Consoleでプロジェクト構成
   - 承認済みのリダイレクトURIの設定
   - 必要なスコープの有効化

2. スコープの設定
   - `https://www.googleapis.com/auth/presentations` - Googleスライドへのフルアクセス
   - `https://www.googleapis.com/auth/drive.file` - アプリで作成されたファイルへのアクセス

3. アクセストークンの取得と管理
   - 認証コードの取得
   - アクセストークンへの交換
   - リフレッシュトークンの保存
   - トークンの自動更新メカニズム

## 3. 機能仕様
### 3.1 スライド変換機能
#### 3.1.1 基本レイアウト
- スライドサイズ: 16:9 (1920x1080)
- マージン: 上下左右5%
- フォントファミリー: 
  - タイトル: Arial
  - 本文: Roboto
  - フッター: Roboto Light

#### 3.1.2 スライド要素の変換
1. タイトルスライド
   - タイトル: 48pt
   - サブタイトル: 28pt
   - 配置: 中央揃え
   - 背景: グラデーションまたは単色（テーマに依存）

2. コンテンツスライド
   - タイトル: 36pt
   - 本文: 20pt
   - 箇条書き: 18pt 
   - フッター: 12pt
   - スライド番号: 10pt

3. 要約スライド
   - タイトル: 40pt
   - 本文: 24pt
   - 背景: 半透明のアクセントカラー

#### 3.1.3 スタイル変換マッピング
```javascript
const styleMapping = {
  modern: {
    background: {
      type: 'GRADIENT',
      gradientStops: [
        { color: { rgbColor: { red: 1, green: 1, blue: 1 } }, position: 0 },
        { color: { rgbColor: { red: 0.96, green: 0.96, blue: 0.96 } }, position: 1 }
      ]
    },
    fontColor: { rgbColor: { red: 0.2, green: 0.2, blue: 0.2 } },
    fontFamily: 'Arial'
  },
  dark: {
    background: {
      type: 'SOLID',
      solidFill: { color: { rgbColor: { red: 0.18, green: 0.18, blue: 0.18 } } }
    },
    fontColor: { rgbColor: { red: 1, green: 1, blue: 1 } },
    fontFamily: 'Roboto'
  },
  gradient: {
    background: {
      type: 'GRADIENT',
      gradientStops: [
        { color: { rgbColor: { red: 0.43, green: 0.58, blue: 0.98 } }, position: 0 },
        { color: { rgbColor: { red: 0.65, green: 0.47, blue: 0.89 } }, position: 1 }
      ]
    },
    fontColor: { rgbColor: { red: 1, green: 1, blue: 1 } },
    fontFamily: 'Montserrat'
  },
  minimal: {
    background: {
      type: 'SOLID',
      solidFill: { color: { rgbColor: { red: 0.97, green: 0.97, blue: 0.98 } } }
    },
    fontColor: { rgbColor: { red: 0.2, green: 0.23, blue: 0.25 } },
    fontFamily: 'Open Sans'
  }
};
```

### 3.2 UI/UX仕様
#### 3.2.1 ボタン配置
```jsx
<button
  onClick={createGoogleSlide}
  className="btn btn-primary"
  disabled={isGeneratingGoogleSlide}
>
  {isGeneratingGoogleSlide
    ? `Googleスライド作成中... ${googleSlideProgress}%`
    : 'Googleスライドで作成'}
</button>
```

#### 3.2.2 進捗表示
- プログレスバー表示
- パーセンテージ表示（0-100%）
- 各スライド処理ステータスの表示
- エラー時のフィードバック

#### 3.2.3 成功時の表示
- 成功メッセージ
- Google Slideへの直接リンク
- 編集・共有オプション
- ドライブでの保存場所情報

### 3.3 エラーハンドリング
1. API制限エラー
   - リクエスト制限の管理（1分あたり300リクエスト）
   - 429エラー時のリトライロジック（指数バックオフ）
   - ユーザーへの適切なメッセージ

2. 認証エラー
   - トークン期限切れの検出と処理
   - 再認証フローの実装
   - セッション管理とエラーリカバリー

3. 変換エラー
   - 部分的な変換失敗の管理
   - フォールバックオプションの提供
   - 詳細なエラーログの記録と分析

## 4. 実装仕様
### 4.1 コンポーネント構造
```javascript
// components/GoogleSlideConverter.js
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

class GoogleSlideConverter {
  constructor(credentials) {
    this.auth = new OAuth2Client(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );
    this.slides = google.slides({ version: 'v1', auth: this.auth });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async authenticate(token) {
    this.auth.setCredentials(token);
  }

  async createPresentation(title) {
    const response = await this.slides.presentations.create({
      requestBody: {
        title: title
      }
    });
    return response.data.presentationId;
  }

  async addSlide(presentationId, slideData, index) {
    // スライド追加ロジック
    // タイプに応じたレイアウト適用
    // コンテンツの配置
  }

  async applyTheme(presentationId, theme) {
    // テーマ設定の適用
    // 背景、色、フォントなどの一括更新
  }

  async sharePresentation(presentationId, email) {
    // 特定ユーザーとの共有設定
    // 権限レベルの設定
  }

  async getPresentationLink(presentationId) {
    // 表示/編集用リンクの生成
    return `https://docs.google.com/presentation/d/${presentationId}/edit`;
  }
}
```

### 4.2 API呼び出しフロー
1. プレゼンテーション作成
```javascript
const createPresentation = async (title) => {
  try {
    const presentation = await slides.presentations.create({
      requestBody: {
        title: title
      }
    });
    return presentation.data.presentationId;
  } catch (error) {
    console.error('プレゼンテーション作成エラー:', error);
    throw new Error('Google Slideの作成に失敗しました');
  }
};
```

2. スライド追加（バッチ処理）
```javascript
const addSlides = async (presentationId, slidesData) => {
  try {
    const requests = slidesData.map((slide, index) => {
      return {
        createSlide: {
          objectId: `slide_${index}`,
          insertionIndex: index,
          slideLayoutReference: {
            predefinedLayout: slide.type === 'title' 
              ? 'TITLE' 
              : slide.type === 'summary' 
                ? 'SECTION_HEADER' 
                : 'TITLE_AND_BODY'
          },
          placeholderIdMappings: [
            {
              layoutPlaceholder: {
                type: 'TITLE',
                index: 0
              },
              objectId: `title_${index}`
            },
            {
              layoutPlaceholder: {
                type: 'BODY',
                index: 0
              },
              objectId: `body_${index}`
            }
          ]
        }
      };
    });
    
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests }
    });

    return await addSlideContents(presentationId, slidesData);
  } catch (error) {
    console.error('スライド追加エラー:', error);
    throw new Error('スライドの追加に失敗しました');
  }
};
```

3. スライドコンテンツの追加
```javascript
const addSlideContents = async (presentationId, slidesData) => {
  try {
    const contentRequests = [];
    
    slidesData.forEach((slide, index) => {
      // タイトルテキスト追加
      contentRequests.push({
        insertText: {
          objectId: `title_${index}`,
          text: slide.title
        }
      });
      
      // 本文テキスト追加（HTMLからプレーンテキストに変換）
      if (slide.content) {
        const plainText = convertHtmlToPlainText(slide.content);
        contentRequests.push({
          insertText: {
            objectId: `body_${index}`,
            text: plainText
          }
        });
      }
      
      // フッター追加（必要に応じて）
      if (slide.footer) {
        contentRequests.push({
          createShape: {
            objectId: `footer_${index}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: `slide_${index}`,
              size: {
                width: { magnitude: 720, unit: 'PT' },
                height: { magnitude: 30, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 36,
                translateY: 500,
                unit: 'PT'
              }
            }
          }
        });
        
        contentRequests.push({
          insertText: {
            objectId: `footer_${index}`,
            text: slide.footer
          }
        });
      }
    });
    
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: { requests: contentRequests }
    });
    
    return presentationId;
  } catch (error) {
    console.error('コンテンツ追加エラー:', error);
    throw new Error('スライドコンテンツの追加に失敗しました');
  }
};
```

### 4.3 状態管理
```javascript
// components/PresentationViewer.js内

// Google Slide生成用の状態
const [isGeneratingGoogleSlide, setIsGeneratingGoogleSlide] = useState(false);
const [googleSlideProgress, setGoogleSlideProgress] = useState(0);
const [googleSlideUrl, setGoogleSlideUrl] = useState('');
const [googleSlideError, setGoogleSlideError] = useState(null);

// Google Slide生成処理
const createGoogleSlide = async () => {
  if (isGeneratingGoogleSlide) return;
  
  try {
    setIsGeneratingGoogleSlide(true);
    setGoogleSlideProgress(0);
    setGoogleSlideError(null);
    
    // 認証確認
    await ensureAuthenticated();
    
    // Googleスライドインスタンスの作成
    const converter = new GoogleSlideConverter(googleCredentials);
    
    // プレゼンテーション作成
    setGoogleSlideProgress(10);
    const presentationId = await converter.createPresentation(
      presentation.title || 'プレゼンテーション'
    );
    
    // テーマ適用
    setGoogleSlideProgress(20);
    await converter.applyTheme(presentationId, presentation.theme || 'modern');
    
    // 各スライドの追加
    const slideCount = presentation.slides.length;
    for (let i = 0; i < slideCount; i++) {
      const slide = presentation.slides[i];
      await converter.addSlide(presentationId, slide, i);
      
      // 進捗更新
      setGoogleSlideProgress(20 + Math.round((i + 1) / slideCount * 70));
    }
    
    // 最終調整
    setGoogleSlideProgress(90);
    
    // プレゼンテーションリンクの取得
    const slideUrl = await converter.getPresentationLink(presentationId);
    setGoogleSlideUrl(slideUrl);
    setGoogleSlideProgress(100);
    
    // 成功メッセージとリンク
    alert(`Google Slideが正常に作成されました！\n${slideUrl}`);
    
  } catch (error) {
    console.error('Google Slide生成エラー:', error);
    setGoogleSlideError(error.message);
    alert(`Google Slideの生成中にエラーが発生しました: ${error.message}`);
  } finally {
    setIsGeneratingGoogleSlide(false);
  }
};
```

## 5. セキュリティ仕様
### 5.1 認証情報の管理
- 環境変数での管理（.envファイル）
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

- クライアントシークレットの保護
  - 環境変数のみを使用
  - コード内に直接記述しない
  - ソース管理から除外

- トークンの安全な保存
  - HTTPOnlyクッキーに保存
  - セッションストレージでの一時保存
  - 自動エクスパイア機能

### 5.2 アクセス制御
- 最小権限の原則に基づくスコープ設定
- ユーザー認証の必須化
- セッション管理とCSRF対策
- 不正アクセス検出メカニズム

## 6. テスト仕様
### 6.1 単体テスト
- API呼び出しのモック化
  - `jest.mock('googleapis')`
  - レスポンスデータの模倣
  - エラーケースのシミュレーション

- エラーハンドリングのテスト
  - API制限エラー
  - 認証エラー
  - パラメータエラー

- スタイル変換テスト
  - 各テーマの正確な変換確認
  - HTMLからGoogleスライド形式への変換精度

### 6.2 統合テスト
- エンドツーエンドのフロー確認
  - 認証→スライド作成→スタイル適用→完了
  - 実際のAPIとの連携確認

- パフォーマンステスト
  - 複数スライド（15枚以上）の処理時間
  - メモリ消費量
  - 並列処理効率

- エラー回復テスト
  - 接続エラーからの回復
  - 部分的な失敗からの続行
  - クリーンアップ処理の確認

## 7. デプロイメント仕様
### 7.1 環境設定
```
# .env.local (開発環境)
NEXT_PUBLIC_ENABLE_GOOGLE_SLIDES=true
GOOGLE_CLIENT_ID=your-development-client-id
GOOGLE_CLIENT_SECRET=your-development-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# .env.production (本番環境)
NEXT_PUBLIC_ENABLE_GOOGLE_SLIDES=true
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/callback/google
```

### 7.2 ビルド設定
```json
{
  "scripts": {
    "build": "next build",
    "test": "jest",
    "lint": "eslint .",
    "dev": "next dev"
  }
}
```

### 7.3 CI/CD設定
- GitHub Actionsでの自動テスト
- 本番環境へのデプロイ前確認
- Google Cloud環境向け最適化

## 8. 今後の拡張性
### 8.1 予定される機能
- カスタムテンプレート対応
  - ユーザー定義テンプレート
  - 企業ブランディングテンプレート

- リアルタイムコラボレーション
  - 複数ユーザーの編集権限管理
  - 変更通知システム

- スライドの自動更新
  - 既存プレゼンテーションの更新
  - 差分更新の最適化

### 8.2 パフォーマンス最適化
- バッチ処理の改善
  - リクエスト数の最小化
  - 効率的なAPI呼び出し

- キャッシュ戦略
  - テンプレートのキャッシュ
  - 頻繁に使用される要素のキャッシュ

- 並列処理の検討
  - スライド変換の並列化
  - バックグラウンド処理化

## 9. ファイル構成
```
/
├── components/
│   ├── PresentationViewer.js      # 既存ビューアーに機能追加
│   ├── GoogleSlideConverter.js    # 変換ロジックのクラス
│   └── GoogleSlideButton.js       # ボタンコンポーネント
│
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth].js   # 認証設定
│   │   │   └── callback/
│   │   │       └── google.js      # OAuthコールバック
│   │   │
│   │   └── googleslides/
│   │       ├── create.js          # スライド作成API
│   │       └── share.js           # 共有設定API
│   │
│   └── about.js                   # 機能説明ページ更新
│
├── lib/
│   ├── googleAuth.js              # 認証ヘルパー
│   ├── googleSlides.js            # API操作ヘルパー
│   └── htmlToPlainText.js         # 変換ユーティリティ
│
├── public/
│   └── images/
│       └── google-slides-icon.svg # アイコン
│
└── styles/
    └── GoogleSlideButton.module.css # ボタンスタイル
```

## 10. APIリファレンス
### 10.1 Google Slides API主要エンドポイント
- presentations.create
- presentations.batchUpdate
- presentations.pages.getThumbnail
- presentations.get

### 10.2 Google Drive API主要エンドポイント
- files.create
- permissions.create
- files.update
- files.get

### 10.3 リクエスト/レスポンス形式
- リクエスト例（プレゼンテーション作成）
- リクエスト例（スライド追加）
- リクエスト例（テキスト追加）
- レスポンス例（正常系）
- レスポンス例（エラー）

## 11. トラブルシューティング
### 11.1 一般的な問題
- 認証エラーの対処法
- API制限到達時の対応
- フォーマット変換の問題解決

### 11.2 デバッグ方法
- ログ出力の活用方法
- Google API Explorerの使用法
- テスト環境での検証方法

## 12. タイムライン
### 12.1 開発フェーズ
1. 基本設計と環境設定: 2日
2. 認証機能実装: 2日
3. 基本変換機能実装: 3日
4. UI/UX実装: 2日
5. テストとバグ修正: 3日
6. ドキュメント整備: 1日

### 12.2 リリースプラン
- テスト版リリース
- フィードバック収集
- 本番リリース
- 運用とメンテナンス 