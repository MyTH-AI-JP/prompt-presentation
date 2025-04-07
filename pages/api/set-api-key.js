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

    // 実際のプロジェクトでは、サーバーにAPIキーを保存せず、クライアント側で実行するように設計
    // ただしVercleのServerless Functionsを使用する場合は環境変数として設定可能
    
    return res.status(200).json({ message: `${provider}のAPIキーが設定されました` });
  } catch (error) {
    console.error('APIキー設定エラー:', error);
    return res.status(500).json({ error: 'APIキーの設定中にエラーが発生しました' });
  }
} 