'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 初期テーマの設定
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="app-header">
      <div className="logo-container">
        <i className="fas fa-presentation"></i>
        <h1>プロンプトからPPT風資料生成</h1>
      </div>
      <div className="theme-toggle">
        <button id="theme-toggle-btn" aria-label="テーマ切替" onClick={toggleTheme}>
          <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
        </button>
      </div>
    </header>
  );
} 