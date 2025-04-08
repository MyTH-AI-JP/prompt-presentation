/**
 * GoogleSlideAuth.js
 * Google OAuth認証のヘルパー関数
 */
import { OAuth2Client } from 'google-auth-library';

/**
 * 認証クライアントの作成
 * @param {Object} credentials クライアント認証情報
 * @return {OAuth2Client} 認証クライアント
 */
export const createAuthClient = (credentials) => {
  return new OAuth2Client(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri
  );
};

/**
 * 認証URLの生成
 * @param {OAuth2Client} client 認証クライアント
 * @param {string[]} scopes 要求するスコープ
 * @return {string} 認証URL
 */
export const generateAuthUrl = (client, scopes = []) => {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes.length > 0 ? scopes : [
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/drive.file'
    ],
    prompt: 'consent'
  });
};

/**
 * 認証コードからトークンを取得
 * @param {OAuth2Client} client 認証クライアント
 * @param {string} code 認証コード
 * @return {Promise<Object>} トークン
 */
export const getTokenFromCode = async (client, code) => {
  try {
    const { tokens } = await client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('認証コードからのトークン取得エラー:', error);
    throw new Error(`認証に失敗しました: ${error.message}`);
  }
};

/**
 * トークンのリフレッシュ
 * @param {OAuth2Client} client 認証クライアント
 * @param {Object} refreshToken リフレッシュトークン
 * @return {Promise<Object>} 新しいトークン
 */
export const refreshAccessToken = async (client, refreshToken) => {
  try {
    client.setCredentials({
      refresh_token: refreshToken
    });
    const { credentials } = await client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('トークンリフレッシュエラー:', error);
    throw new Error(`アクセストークンの更新に失敗しました: ${error.message}`);
  }
};

/**
 * トークンが有効かどうかを確認
 * @param {Object} token アクセストークン
 * @return {boolean} 有効かどうか
 */
export const isTokenValid = (token) => {
  if (!token || !token.access_token) {
    return false;
  }

  // 有効期限が存在し、現在時刻より後の場合は有効
  if (token.expiry_date) {
    return token.expiry_date > Date.now();
  }

  return false;
};

/**
 * トークンの保存（ローカルストレージに保存）
 * @param {Object} token トークン
 */
export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('google_auth_token', JSON.stringify(token));
  }
};

/**
 * 保存されたトークンの取得
 * @return {Object|null} トークン
 */
export const getSavedToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('google_auth_token');
    if (token) {
      try {
        return JSON.parse(token);
      } catch (e) {
        console.error('トークンのパースエラー:', e);
      }
    }
  }
  return null;
};

/**
 * トークンの削除
 */
export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('google_auth_token');
  }
};

/**
 * 認証状態の確認と必要に応じたリフレッシュ
 * @param {OAuth2Client} client 認証クライアント
 * @return {Promise<Object|null>} 有効なトークン
 */
export const ensureAuthenticated = async (client) => {
  const token = getSavedToken();
  
  if (!token) {
    return null;
  }
  
  // トークンが有効な場合はそのまま返す
  if (isTokenValid(token)) {
    return token;
  }
  
  // リフレッシュトークンがある場合は更新を試みる
  if (token.refresh_token) {
    try {
      const newToken = await refreshAccessToken(client, token.refresh_token);
      // 新しいトークンにリフレッシュトークンを保持
      newToken.refresh_token = token.refresh_token;
      saveToken(newToken);
      return newToken;
    } catch (error) {
      console.error('トークン更新エラー:', error);
      clearToken();
      return null;
    }
  }
  
  // リフレッシュもできなければnullを返す
  clearToken();
  return null;
}; 