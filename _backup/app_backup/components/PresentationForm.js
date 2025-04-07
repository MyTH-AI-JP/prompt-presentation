'use client';

import { useState } from 'react';

export default function PresentationForm({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState('10');
  const [theme, setTheme] = useState('modern');
  const [presentationStyle, setPresentationStyle] = useState('professional');
  const [contentDepth, setContentDepth] = useState('balanced');
  const [languageStyle, setLanguageStyle] = useState('standard');
  const [slideStructure, setSlideStructure] = useState('auto');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeModel, setActiveModel] = useState('openai');
  const [promptError, setPromptError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setPromptError(true);
      return;
    }
    
    setPromptError(false);
    
    const formData = {
      prompt,
      slideCount,
      theme,
      presentationStyle,
      contentDepth,
      languageStyle,
      slideStructure,
      tags,
      model: activeModel
    };
    
    onGenerate(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form id="presentation-form" className="presentation-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>プレゼンテーション設定</h2>
        <div className="model-tabs">
          <button 
            type="button" 
            className={`model-tab ${activeModel === 'openai' ? 'active' : ''}`} 
            onClick={() => setActiveModel('openai')}
          >
            <i className="fas fa-robot"></i> OpenAI
          </button>
          <button 
            type="button" 
            className={`model-tab ${activeModel === 'gemini' ? 'active' : ''}`}
            onClick={() => setActiveModel('gemini')}
          >
            <i className="fas fa-atom"></i> Gemini
          </button>
        </div>
      </div>

      <div className="form-body">
        <div className="form-group">
          <label htmlFor="prompt">プロンプト <span className="required">*</span></label>
          <textarea 
            id="prompt" 
            name="prompt" 
            rows="5" 
            placeholder="例: AIの歴史と未来について10枚のスライドを作成" 
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={promptError ? 'error' : ''}
          ></textarea>
          {promptError && <div id="prompt-error" className="error-message">プロンプトを入力してください</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="slide-count">スライド枚数</label>
            <select 
              id="slide-count" 
              name="slide-count"
              value={slideCount}
              onChange={(e) => setSlideCount(e.target.value)}
            >
              <option value="5">5枚</option>
              <option value="10">10枚</option>
              <option value="15">15枚</option>
              <option value="20">20枚</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="theme">デザインテーマ</label>
            <select 
              id="theme" 
              name="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="modern">モダン</option>
              <option value="corporate">コーポレート</option>
              <option value="creative">クリエイティブ</option>
              <option value="minimal">ミニマル</option>
            </select>
          </div>
        </div>

        <div className="advanced-options-container">
          <button 
            type="button" 
            id="toggle-advanced" 
            className="toggle-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i> 詳細オプション
          </button>
          
          {showAdvanced && (
            <div className="advanced-options">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="presentation-style">プレゼンテーションスタイル</label>
                  <select 
                    id="presentation-style" 
                    name="presentation-style"
                    value={presentationStyle}
                    onChange={(e) => setPresentationStyle(e.target.value)}
                  >
                    <option value="professional">プロフェッショナル</option>
                    <option value="academic">アカデミック</option>
                    <option value="creative">クリエイティブ</option>
                    <option value="casual">カジュアル</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="content-depth">内容の詳細度</label>
                  <select 
                    id="content-depth" 
                    name="content-depth"
                    value={contentDepth}
                    onChange={(e) => setContentDepth(e.target.value)}
                  >
                    <option value="concise">簡潔</option>
                    <option value="balanced">バランス</option>
                    <option value="detailed">詳細</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="language-style">言語スタイル</label>
                  <select 
                    id="language-style" 
                    name="language-style"
                    value={languageStyle}
                    onChange={(e) => setLanguageStyle(e.target.value)}
                  >
                    <option value="formal">フォーマル</option>
                    <option value="standard">標準</option>
                    <option value="casual">カジュアル</option>
                    <option value="technical">技術的</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="slide-structure">スライド構成</label>
                  <select 
                    id="slide-structure" 
                    name="slide-structure"
                    value={slideStructure}
                    onChange={(e) => setSlideStructure(e.target.value)}
                  >
                    <option value="auto">自動</option>
                    <option value="text-heavy">テキスト重視</option>
                    <option value="visual-heavy">ビジュアル重視</option>
                    <option value="balanced">バランス型</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tag-input">キーワード/タグ</label>
                <div className="tag-input-container">
                  <input 
                    type="text" 
                    id="tag-input" 
                    placeholder="タグを入力して Enter または追加ボタンをクリック"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <button 
                    type="button" 
                    id="add-tag" 
                    className="btn-secondary"
                    onClick={addTag}
                  >
                    <i className="fas fa-plus"></i> 追加
                  </button>
                </div>
                <div id="tags-container" className="tags-container">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button 
                        type="button" 
                        className="remove-tag" 
                        onClick={() => removeTag(tag)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            id="generate-btn" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 生成中...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i> 資料を生成
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
} 