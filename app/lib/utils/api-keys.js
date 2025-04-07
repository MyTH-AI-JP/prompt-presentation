// APIキーを保存するグローバル変数（サーバーサイドのみ）
let openaiApiKey = process.env.OPENAI_API_KEY || '';
let geminiApiKey = process.env.GEMINI_API_KEY || '';

// OpenAI APIキーを設定
export function setOpenAIApiKey(key) {
  if (!key) return false;
  if (!key.startsWith('sk-')) return false;
  
  openaiApiKey = key;
  return true;
}

// Gemini APIキーを設定
export function setGeminiApiKey(key) {
  if (!key) return false;
  if (!key.startsWith('AIzaSy')) return false;
  
  geminiApiKey = key;
  return true;
}

// OpenAI APIキーを取得
export function getOpenAIApiKey() {
  return openaiApiKey;
}

// Gemini APIキーを取得
export function getGeminiApiKey() {
  return geminiApiKey;
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