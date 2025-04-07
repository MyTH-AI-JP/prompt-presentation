'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [step, setStep] = useState('準備中...');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const steps = [
      '準備中...',
      'APIに接続中...',
      'コンテンツ生成中...',
      'スライドをフォーマット中...',
      '最終調整中...'
    ];
    
    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
      currentStepIndex = (currentStepIndex + 1) % steps.length;
      setStep(steps[currentStepIndex]);
      
      // 徐々に進捗を進める（実際の進捗ではなく視覚的な演出）
      setProgress(prev => {
        const newProgress = prev + (Math.random() * 5);
        return newProgress > 95 ? 95 : newProgress; // 完全に100%にはならないように
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="loading-container" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000 }}>
      <div className="loading-content">
        <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div className="loading-step">{step}</div>
        <div className="loading-progress" style={{ width: '100%', backgroundColor: '#f3f3f3', borderRadius: '5px', marginTop: '20px' }}>
          <div 
            className="loading-progress-bar" 
            style={{ width: `${progress}%`, height: '10px', backgroundColor: '#3498db', borderRadius: '5px' }}
          ></div>
        </div>
      </div>
    </div>
  );
} 