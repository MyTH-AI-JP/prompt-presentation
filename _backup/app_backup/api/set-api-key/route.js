import { NextResponse } from 'next/server';
import { setOpenAIApiKey, setGeminiApiKey } from '../../lib/utils/api-keys';

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
    
    // APIキーの形式チェックと設定
    let isValid = false;
    if (provider === 'openai') {
      isValid = setOpenAIApiKey(apiKey);
    } else if (provider === 'gemini') {
      isValid = setGeminiApiKey(apiKey);
    } else {
      return NextResponse.json({
        success: false,
        message: 'サポートされていないプロバイダーです'
      }, { status: 400 });
    }
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーの形式が正しくありません`
      }, { status: 400 });
    }
    
    // APIキーの検証（実際のAPIコールは行わない）
    return NextResponse.json({
      success: true,
      message: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーが設定されました`
    });
  } catch (error) {
    console.error('APIキー設定エラー:', error);
    return NextResponse.json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error.message
    }, { status: 500 });
  }
} 