# Google Slides API 実装ガイド

## はじめに

このドキュメントでは、Google Slides APIを使用してHTMLスライドをGoogleスライドに変換する実装方法について説明します。この実装は、`googleapis`と`google-auth-library`パッケージを使用します。

## 前提条件

1. Node.js環境（v14以上推奨）
2. NPMまたはYarn
3. Google Cloud Platformのプロジェクト
4. 有効化されたGoogle Slides APIとGoogle Drive API
5. OAuth 2.0クライアントID

## 設定手順

### 1. Google Cloud Platformでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス > ライブラリ」から以下のAPIを有効化:
   - Google Slides API
   - Google Drive API
4. 「APIとサービス > 認証情報」から認証情報を作成:
   - OAuth 2.0クライアントIDを選択
   - アプリケーションタイプとして「ウェブアプリケーション」を選択
   - 認証済みのリダイレクトURIとして`http://localhost:3000/api/auth/callback/google`を追加
5. クライアントIDとクライアントシークレットをメモ

### 2. 環境変数の設定

開発環境と本番環境それぞれに適切な環境変数を設定します。

```env
# .env.local
NEXT_PUBLIC_ENABLE_GOOGLE_SLIDES=true
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 3. 必要なパッケージのインストール

```bash
npm install googleapis google-auth-library
# or
yarn add googleapis google-auth-library
```

## API利用時の注意点

### レート制限

Google Slides APIには以下のレート制限があります：

- ユーザーごとに1分間に300リクエスト
- プロジェクトごとに1分間に3,000リクエスト
- プロジェクトごとに1日あたり60,000リクエスト

### バッチ処理

APIコールを最適化するために、可能な限りバッチリクエストを使用します：

```javascript
// 複数のリクエストをバッチ処理
await slides.presentations.batchUpdate({
  presentationId,
  requestBody: {
    requests: [
      // 複数のリクエストをここに追加
    ]
  }
});
```

### エラーハンドリング

429エラー（Too Many Requests）への対応例：

```javascript
const makeRequestWithRetry = async (apiCall, maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.code === 429 && retries < maxRetries - 1) {
        // エクスポネンシャルバックオフ
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
};
```

## 主要なAPI操作

### 1. プレゼンテーションの作成

```javascript
const createPresentation = async (title) => {
  const response = await slides.presentations.create({
    requestBody: {
      title: title
    }
  });
  return response.data.presentationId;
};
```

### 2. スライドの追加

```javascript
const addSlide = async (presentationId, layoutType = 'TITLE_AND_BODY') => {
  const response = await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [
        {
          createSlide: {
            slideLayoutReference: {
              predefinedLayout: layoutType
            }
          }
        }
      ]
    }
  });
  
  return response.data.replies[0].createSlide.objectId;
};
```

### 3. テキストの追加

```javascript
const addText = async (presentationId, slideId, text, placeholderType = 'TITLE') => {
  // スライド内のプレースホルダを取得
  const slide = await slides.presentations.get({
    presentationId,
    fields: `slides(slideProperties/objectId,pageElements(objectId,shape/placeholder))`
  });
  
  // プレースホルダIDを見つける
  const placeholder = slide.data.slides.find(s => s.slideProperties.objectId === slideId)
    .pageElements.find(el => el.shape?.placeholder?.type === placeholderType);
  
  if (!placeholder) {
    throw new Error(`プレースホルダタイプ ${placeholderType} が見つかりません`);
  }
  
  // テキストを挿入
  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [
        {
          insertText: {
            objectId: placeholder.objectId,
            text: text
          }
        }
      ]
    }
  });
};
```

### 4. 背景色の設定

```javascript
const setSlideBackground = async (presentationId, slideId, color) => {
  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [
        {
          updatePageProperties: {
            objectId: slideId,
            pageProperties: {
              pageBackgroundFill: {
                solidFill: {
                  color: {
                    rgbColor: color
                  }
                }
              }
            },
            fields: 'pageBackgroundFill.solidFill.color'
          }
        }
      ]
    }
  });
};
```

### 5. フッターの追加

```javascript
const addFooter = async (presentationId, slideId, text, x, y, width, height) => {
  // テキストボックスを作成
  const createTextBoxResponse = await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [
        {
          createShape: {
            objectId: `footer_${Date.now()}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideId,
              size: {
                width: { magnitude: width, unit: 'PT' },
                height: { magnitude: height, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: x,
                translateY: y,
                unit: 'PT'
              }
            }
          }
        }
      ]
    }
  });
  
  const textBoxId = createTextBoxResponse.data.replies[0].createShape.objectId;
  
  // テキストを挿入
  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests: [
        {
          insertText: {
            objectId: textBoxId,
            text: text
          }
        }
      ]
    }
  });
  
  return textBoxId;
};
```

## コード例: Google Slideの作成

```javascript
// app/api/googleslides/create.js
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // セッションからトークンを取得
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { title, slides } = req.body;
    
    // Google APIクライアントを設定
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials(session.token);
    
    const slidesAPI = google.slides({ version: 'v1', auth: oauth2Client });
    
    // 新しいプレゼンテーションを作成
    const presentation = await slidesAPI.presentations.create({
      requestBody: {
        title: title || 'プレゼンテーション'
      }
    });
    
    const presentationId = presentation.data.presentationId;
    
    // 各スライドを追加
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideType = slide.type || 'content';
      
      // レイアウトを決定
      const layout = slideType === 'title' 
        ? 'TITLE' 
        : slideType === 'summary'
          ? 'SECTION_HEADER'
          : 'TITLE_AND_BODY';
      
      // スライドを作成
      const createSlideRequest = {
        createSlide: {
          objectId: `slide_${i}`,
          insertionIndex: i,
          slideLayoutReference: {
            predefinedLayout: layout
          }
        }
      };
      
      await slidesAPI.presentations.batchUpdate({
        presentationId,
        requestBody: { requests: [createSlideRequest] }
      });
      
      // スライドの内容を追加
      // (実際のコードでは、このロジックをさらに詳細に実装)
    }
    
    // プレゼンテーションリンクを返す
    return res.status(200).json({
      success: true,
      presentationId,
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`
    });
    
  } catch (error) {
    console.error('Google Slideの作成エラー:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
```

## トラブルシューティング

### 一般的な問題と解決策

1. **認証エラー**
   - クライアントIDとシークレットが正しいか確認
   - リダイレクトURIが正しく設定されているか確認
   - スコープが適切に設定されているか確認

2. **APIの制限に達した場合**
   - リクエスト数を減らすためにバッチ処理を使用
   - エクスポネンシャルバックオフを実装
   - 複数のプロジェクトに分割

3. **プレースホルダが見つからない**
   - スライドのレイアウトタイプを確認
   - スライドの構造を詳細に調査
   - カスタムテキストボックスの使用を検討

## 参考リソース

- [Google Slides API公式ドキュメント](https://developers.google.com/slides/api/reference/rest)
- [Google Drive API公式ドキュメント](https://developers.google.com/drive/api/reference/rest/v3)
- [OAuth 2.0 for Google APIs](https://developers.google.com/identity/protocols/oauth2)
- [googleapis npm パッケージ](https://www.npmjs.com/package/googleapis)
- [Google Cloud ドキュメント](https://cloud.google.com/docs) 