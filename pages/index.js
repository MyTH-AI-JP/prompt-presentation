import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PresentationForm from '../components/PresentationForm';
import PresentationViewer from '../components/PresentationViewer';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [presentation, setPresentation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");

  const generatePresentation = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const prompt = event.target.prompt.value;
    const provider = event.target.provider.value;
    const numSlides = parseInt(event.target.numSlides.value);
    const theme = event.target.theme.value;
    
    try {
      const res = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey,
          provider,
          numSlides,
          theme
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'エラーが発生しました');
      }
      
      const data = await res.json();
      setPresentation(data);
    } catch (err) {
      console.error('Error generating presentation:', err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    setPresentation(null);
  };
  
  const handleRetry = () => {
    setError(null);
  };
  
  if (presentation) {
    return <PresentationViewer presentation={presentation} onBack={handleBack} />;
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>プレゼンAIジェネレーター</title>
        <meta name="description" content="AIを使ってプレゼンテーションスライドを作成" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header />
      
      <main className={styles.main}>
        <h1>AIでプレゼンテーションを生成</h1>
        <p>プレゼンテーションのテーマを入力して、AIにスライドを作成させましょう。</p>
        
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={handleRetry} />
        ) : (
          <form onSubmit={generatePresentation} className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="prompt" className={styles.formLabel}>プレゼンテーションのテーマ</label>
              <textarea 
                id="prompt" 
                name="prompt" 
                required 
                placeholder="例： クラウドコンピューティングの基礎と応用" 
                className={styles.formTextarea}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="apiKey" className={styles.formLabel}>API キー</label>
              <input 
                type="password" 
                id="apiKey" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                required 
                placeholder="OpenAI APIキー" 
                className={styles.formInput}
              />
              <small>※このキーはサーバーに保存されません</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="provider" className={styles.formLabel}>AIプロバイダー</label>
              <select id="provider" name="provider" className={styles.formSelect}>
                <option value="openai">gpt-4o</option>
                <option value="gemini">Gemini 2.0 Flash</option>
                <option value="claude">Claude 3.7 Sonnet</option>
              </select>
            </div>
            
            <div className={styles.formGroup} style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="numSlides" className={styles.formLabel}>スライド数</label>
                <select id="numSlides" name="numSlides" className={styles.formSelect}>
                  <option value="3">3枚</option>
                  <option value="5" selected>5枚</option>
                  <option value="7">7枚</option>
                  <option value="10">10枚</option>
                  <option value="15">15枚</option>
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label htmlFor="theme" className={styles.formLabel}>テーマ</label>
                <select id="theme" name="theme" className={styles.formSelect}>
                  <option value="modern">モダン</option>
                  <option value="dark">ダーク</option>
                  <option value="gradient">グラデーション</option>
                  <option value="minimal">ミニマル</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              プレゼンテーションを生成
            </button>
          </form>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 