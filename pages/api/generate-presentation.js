import { generateWithOpenAI, generateWithGemini } from '../../lib/utils/presentation-generator';

export default async function handler(req, res) {
  // CORSヘッダー追加
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONSリクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST以外は受け付けない
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    const { prompt, apiKey, provider = 'openai', numSlides = 5, theme = 'modern' } = req.body;

    // 必須パラメータの検証
    if (!prompt || !apiKey) {
      return res.status(400).json({ error: 'プロンプトとAPIキーは必須です' });
    }

    let generatedPresentation;
    
    if (provider === 'openai') {
      generatedPresentation = await generateWithOpenAI(prompt, apiKey, numSlides, theme);
    } else if (provider === 'gemini') {
      generatedPresentation = await generateWithGemini(prompt, apiKey, numSlides, theme);
    } else {
      return res.status(400).json({ error: '無効なプロバイダー。"openai"または"gemini"を指定してください' });
    }

    return res.status(200).json(generatedPresentation);
  } catch (error) {
    console.error('プレゼンテーション生成エラー:', error);
    return res.status(500).json({ 
      error: 'プレゼンテーションの生成中にエラーが発生しました', 
      details: error.message 
    });
  }
} 