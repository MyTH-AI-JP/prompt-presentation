// APIキーを保存するための変数（サーバーサイドのみ）
// 注意: サーバーレス環境では各リクエスト間でこの値は保持されません
// 本番環境では環境変数やデータベースの利用を検討してください
import { cookies } from 'next/headers';

// クッキーの有効期限（1時間）
const COOKIE_MAX_AGE = 60 * 60;

// OpenAI APIキーを設定
export function setOpenAIApiKey(key) {
  if (!key) return false;
  if (!key.startsWith('sk-')) return false;
  
  try {
    // サーバーサイドでのみ実行される関数
    const cookieStore = cookies();
    cookieStore.set('openai-api-key', key, { 
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return true;
  } catch (error) {
    console.error('APIキー保存エラー:', error);
    return false;
  }
}

// Gemini APIキーを設定
export function setGeminiApiKey(key) {
  if (!key) return false;
  if (!key.startsWith('AIzaSy')) return false;
  
  try {
    // サーバーサイドでのみ実行される関数
    const cookieStore = cookies();
    cookieStore.set('gemini-api-key', key, { 
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return true;
  } catch (error) {
    console.error('APIキー保存エラー:', error);
    return false;
  }
}

// OpenAI APIキーを取得
export function getOpenAIApiKey() {
  try {
    // 環境変数を優先
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
    
    // Cookieから取得
    const cookieStore = cookies();
    const apiKey = cookieStore.get('openai-api-key')?.value;
    
    return apiKey || '';
  } catch (error) {
    console.error('APIキー取得エラー:', error);
    return '';
  }
}

// Gemini APIキーを取得
export function getGeminiApiKey() {
  try {
    // 環境変数を優先
    if (process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
    
    // Cookieから取得
    const cookieStore = cookies();
    const apiKey = cookieStore.get('gemini-api-key')?.value;
    
    return apiKey || '';
  } catch (error) {
    console.error('APIキー取得エラー:', error);
    return '';
  }
}

// APIキーの形式を検証
export function validateApiKeyFormat(provider, key) {
  if (!key) return false;
  
  if (provider === 'openai') {
    return key.startsWith('sk-');
  } else if (provider === 'gemini') {
    return key.startsWith('AIzaSy');
  }
  
  return false;
} 