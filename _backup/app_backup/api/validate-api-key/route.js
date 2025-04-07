import { NextResponse } from 'next/server';
import { validateApiKeyFormat } from '../../lib/utils/api-keys';

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider, apiKey } = body;
    
    if (!provider || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'プロバイダーとAPIキーが必要です'
      }, { status: 400 });
    }
    
    // APIキーの形式チェック
    const isValid = validateApiKeyFormat(provider, apiKey);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーの形式が正しくありません`
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'APIキーの形式が正しいです'
    });
  } catch (error) {
    console.error('APIキー検証エラー:', error);
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error.message
    }, { status: 500 });
  }
} 