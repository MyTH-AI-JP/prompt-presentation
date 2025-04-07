// ブラウザのローカルストレージを使用してAPIキーを一時的に保存
export const setOpenAIApiKey = (apiKey) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', apiKey);
  }
};

export const getOpenAIApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key') || '';
  }
  return '';
};

export const setGeminiApiKey = (apiKey) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', apiKey);
  }
};

export const getGeminiApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || '';
  }
  return '';
};

// APIキーのフォーマット検証（簡易チェック）
export const validateApiKeyFormat = (provider, apiKey) => {
  if (!apiKey) {
    return {
      isValid: false,
      message: 'APIキーが入力されていません。'
    };
  }

  if (provider === 'openai') {
    // OpenAIのAPIキーは通常sk-で始まり、一定の長さがある
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      return {
        isValid: false,
        message: 'OpenAI APIキーの形式が正しくありません。"sk-"で始まる有効なキーを入力してください。'
      };
    }
  } else if (provider === 'gemini') {
    // Geminiのキーは通常英数字で構成され、一定の長さがある
    if (apiKey.length < 20) {
      return {
        isValid: false,
        message: 'Gemini APIキーの形式が正しくないか、長さが足りません。'
      };
    }
  }

  return {
    isValid: true,
    message: 'APIキーの形式は有効です。'
  };
}; 