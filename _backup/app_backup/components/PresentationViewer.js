'use client';

import { useState, useEffect } from 'react';

export default function PresentationViewer({ presentation, onBack }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slideCount = presentation?.slides?.length || 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slideCount, isFullscreen]);

  const goToNextSlide = () => {
    if (currentSlide < slideCount - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // デバッグ用
  console.log('Presentation:', presentation);
  console.log('Current Slide:', currentSlide);
  console.log('Slide Count:', slideCount);

  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className="error-page">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>プレゼンテーションデータがありません</h2>
          <button 
            className="btn-primary"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> 戻る
          </button>
        </div>
      </div>
    );
  }

  const currentSlideData = presentation.slides[currentSlide];

  return (
    <div className="presentation-container">
      <div className="presentation-header">
        <div className="slide-controls">
          <button 
            id="prev-slide" 
            className="control-btn" 
            onClick={goToPrevSlide} 
            disabled={currentSlide === 0}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="slide-number">{currentSlide + 1} / {slideCount}</span>
          <button 
            id="next-slide" 
            className="control-btn" 
            onClick={goToNextSlide} 
            disabled={currentSlide === slideCount - 1}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <div className="presentation-actions">
          <button 
            id="back-btn" 
            className="btn-secondary" 
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i> 戻る
          </button>
          <button 
            id="fullscreen-btn" 
            className="btn-secondary" 
            onClick={toggleFullscreen}
          >
            <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i> 
            {isFullscreen ? '通常表示' : 'フルスクリーン'}
          </button>
        </div>
      </div>
      <div className={`slides-container theme-${presentation.theme || 'modern'}`}>
        <div 
          className={`slide slide-${currentSlideData.type || 'content'}`} 
          dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
        />
      </div>
    </div>
  );
} 