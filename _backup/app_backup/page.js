'use client';

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PresentationForm from './components/PresentationForm';
import PresentationViewer from './components/PresentationViewer';
import Loading from './components/Loading';
import ErrorDisplay from './components/ErrorDisplay';

export default function Home() {
  const [presentation, setPresentation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState({
    openai: '',
    gemini: ''
  });

  const handleGenerate = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);

      // APIキーが必要な場合は、APIキーを設定
      if (formData.model === 'openai' && !apiKey.openai) {
        const key = prompt('OpenAI APIキーを入力してください:');
        if (!key) {
          setIsLoading(false);
          return;
        }
        await setApiKeyRequest('openai', key);
      } else if (formData.model === 'gemini' && !apiKey.gemini) {
        const key = prompt('Gemini APIキーを入力してください:');
        if (!key) {
          setIsLoading(false);
          return;
        }
        await setApiKeyRequest('gemini', key);
      }

      // プレゼンテーション生成リクエスト
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'プレゼンテーション生成に失敗しました');
      }

      const data = await response.json();
      setPresentation(data.data);
    } catch (err) {
      console.error('エラー:', err);
      setError({
        message: err.message || 'プレゼンテーション生成中にエラーが発生しました',
        details: err.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setApiKeyRequest = async (provider, key) => {
    try {
      const response = await fetch('/api/set-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, apiKey: key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${provider === 'openai' ? 'OpenAI' : 'Gemini'} APIキーの設定に失敗しました`);
      }

      setApiKey(prev => ({
        ...prev,
        [provider]: key
      }));

      return true;
    } catch (err) {
      console.error('APIキー設定エラー:', err);
      alert(`APIキー設定エラー: ${err.message}`);
      return false;
    }
  };

  const handleBack = () => {
    setPresentation(null);
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="app-main">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorDisplay 
            message={error.message} 
            details={error.details}
            onRetry={handleRetry}
          />
        ) : presentation ? (
          <PresentationViewer 
            presentation={presentation} 
            onBack={handleBack} 
          />
        ) : (
          <PresentationForm 
            onGenerate={handleGenerate} 
            isLoading={isLoading} 
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
} 