import { validateApiKeyFormat } from '../../lib/utils/api-keys';

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
    const { provider, apiKey } = req.body;

    // 必須パラメータの検証
    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'プロバイダーとAPIキーは必須です' });
    }

    // APIキーのフォーマット検証
    const validation = validateApiKeyFormat(provider, apiKey);

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    return res.status(200).json({ message: 'APIキーのフォーマットは有効です' });
  } catch (error) {
    console.error('APIキー検証エラー:', error);
    return res.status(500).json({ error: 'APIキーの検証中にエラーが発生しました' });
  }
} 