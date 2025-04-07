import React, { useState } from 'react';

const PresentationForm = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [numSlides, setNumSlides] = useState(5);
  const [theme, setTheme] = useState('modern');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    onGenerate({
      prompt,
      apiKey,
      provider,
      numSlides: parseInt(numSlides),
      theme
    });
  };

  return (
    <div className="presentation-form">
      <h1>AIでプレゼンテーションを生成</h1>
      <p className="description">
        プレゼンテーションのテーマを入力して、AIにスライドを作成させましょう。
      </p>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="prompt" className="form-label">
            プレゼンテーションのテーマ *
          </label>
          <textarea
            id="prompt"
            className="form-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例: クラウドコンピューティングの基礎と応用"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="apiKey" className="form-label">
            API キー *
          </label>
          <input
            type="password"
            id="apiKey"
            className="form-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'openai' ? 'OpenAI APIキー' : 'Gemini APIキー'}
            required
          />
          <small>※このキーはサーバーに保存されません</small>
        </div>
        
        <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="provider" className="form-label">
              AIプロバイダー
            </label>
            <select
              id="provider"
              className="form-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="openai">gpt-4o</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="numSlides" className="form-label">
              スライド数
            </label>
            <select
              id="numSlides"
              className="form-select"
              value={numSlides}
              onChange={(e) => setNumSlides(e.target.value)}
            >
              <option value="3">3枚</option>
              <option value="5">5枚</option>
              <option value="7">7枚</option>
              <option value="10">10枚</option>
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="theme" className="form-label">
              テーマ
            </label>
            <select
              id="theme"
              className="form-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="modern">モダン</option>
              <option value="dark">ダーク</option>
              <option value="gradient">グラデーション</option>
              <option value="minimal">ミニマル</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !prompt.trim() || !apiKey.trim()}
          style={{ width: '100%', marginTop: '20px' }}
        >
          {isLoading ? '生成中...' : 'プレゼンテーションを生成'}
        </button>
      </form>
    </div>
  );
};

export default PresentationForm; 