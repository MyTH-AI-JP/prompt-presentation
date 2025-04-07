import { NextResponse } from 'next/server';
import { getOpenAIApiKey, getGeminiApiKey } from '../../lib/utils/api-keys';
import { generateWithOpenAI, generateWithGemini } from '../../lib/utils/presentation-generator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags, model } = body;
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        message: 'プロンプトが必要です'
      }, { status: 400 });
    }
    
    // モデルに応じたAPIキーチェック
    if (model === 'openai' && !getOpenAIApiKey()) {
      return NextResponse.json({
        success: false,
        message: 'OpenAI APIキーが設定されていません'
      }, { status: 400 });
    } else if (model === 'gemini' && !getGeminiApiKey()) {
      return NextResponse.json({
        success: false,
        message: 'Gemini APIキーが設定されていません'
      }, { status: 400 });
    }
    
    // プレゼンテーション生成
    let presentationData;
    if (model === 'openai') {
      presentationData = await generateWithOpenAI(prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags);
    } else if (model === 'gemini') {
      presentationData = await generateWithGemini(prompt, slideCount, theme, presentationStyle, contentDepth, languageStyle, slideStructure, tags);
    } else {
      return NextResponse.json({
        success: false,
        message: 'サポートされていないモデルです'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      data: presentationData
    });
  } catch (error) {
    console.error('プレゼンテーション生成エラー:', error);
    return NextResponse.json({
      success: false,
      message: 'プレゼンテーション生成中にエラーが発生しました',
      error: error.message
    }, { status: 500 });
  }
} 