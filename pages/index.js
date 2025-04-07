import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PresentationForm from '../components/PresentationForm';
import PresentationViewer from '../components/PresentationViewer';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Home() {
  const [presentation, setPresentation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '予期せぬエラーが発生しました');
      }
      
      setPresentation(data);
    } catch (err) {
      console.error('Generation error:', err);
      setError({
        message: err.message,
        details: err.stack
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    setPresentation(null);
    setError(null);
  };
  
  const handleRetry = () => {
    setError(null);
  };
  
  return (
    <div className="container">
      <Head>
        <title>プレゼンAIジェネレーター</title>
        <meta name="description" content="AIを使ってプレゼンテーションスライドを簡単に生成" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header />
      
      <main className="main">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorDisplay error={error} onRetry={handleRetry} />
        ) : presentation ? (
          <PresentationViewer presentation={presentation} onBack={handleBack} />
        ) : (
          <PresentationForm onGenerate={handleGenerate} isLoading={isLoading} />
        )}
      </main>
      
      <Footer />
    </div>
  );
} 