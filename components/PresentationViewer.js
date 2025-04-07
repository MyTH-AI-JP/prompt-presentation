import React, { useState } from 'react';

const PresentationViewer = ({ presentation, onBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className="error-container">
        <p>スライドが見つかりません。</p>
        <button onClick={onBack} className="btn btn-primary">
          戻る
        </button>
      </div>
    );
  }
  
  const slideCount = presentation.slides.length;
  
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
  
  const slide = presentation.slides[currentSlide];
  const theme = presentation.theme || 'modern';
  const slideType = slide.type || 'content';
  
  return (
    <div className="presentation-container">
      <div className="presentation-header">
        <h2>{presentation.title}</h2>
        <button onClick={onBack} className="btn btn-outline">
          新しいプレゼンテーションを作成
        </button>
      </div>
      
      <div className={`slide-container theme-${theme}`}>
        <div className={`slide slide-type-${slideType}`}>
          <h1 className="slide-title">{slide.title}</h1>
          <div className="slide-content">
            {slide.content && (
              <div dangerouslySetInnerHTML={{ __html: slide.content.replace(/\n/g, '<br>') }} />
            )}
          </div>
          {slide.footer && <div className="slide-footer">{slide.footer}</div>}
        </div>
      </div>
      
      <div className="slide-controls">
        <button
          onClick={goToPrevSlide}
          className="btn btn-primary"
          disabled={currentSlide === 0}
        >
          前へ
        </button>
        <div className="slide-counter">
          {currentSlide + 1} / {slideCount}
        </div>
        <button
          onClick={goToNextSlide}
          className="btn btn-primary"
          disabled={currentSlide === slideCount - 1}
        >
          次へ
        </button>
      </div>
    </div>
  );
};

export default PresentationViewer; 