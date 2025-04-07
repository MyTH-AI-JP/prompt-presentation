import React, { useState, useRef } from 'react';

const PresentationViewer = ({ presentation, onBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllSlides, setShowAllSlides] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const slidesRef = useRef([]);
  
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
  
  // 参照配列を初期化
  if (slidesRef.current.length !== presentation.slides.length) {
    slidesRef.current = Array(presentation.slides.length).fill().map(() => React.createRef());
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

  // 全スライド表示モードに切り替え
  const toggleAllSlides = () => {
    setShowAllSlides(!showAllSlides);
  };

  // PDFとしてダウンロード
  const downloadAsPDF = async () => {
    if (isGeneratingPDF) return;
    
    try {
      setIsGeneratingPDF(true);
      setPdfProgress(0);
      
      // ブラウザ環境でのみライブラリをインポート
      const { default: jspdf } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // 現在のスライドを記憶
      const currentIndex = currentSlide;
      setShowAllSlides(true);
      
      // DOMが更新されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // スライド要素を取得
      const slideElements = document.querySelectorAll('.print-container .slide-container');
      if (!slideElements || slideElements.length === 0) {
        throw new Error('スライド要素が見つかりません');
      }
      
      // A4サイズのPDFを作成（横向き）
      const pdf = new jspdf({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4サイズ（横向き）のサイズ（mm）
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 余白を設定（mm）
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);
      
      // 各スライドを処理
      for (let i = 0; i < slideElements.length; i++) {
        // 進捗を更新
        setPdfProgress(Math.round((i / slideElements.length) * 100));
        
        try {
          // html2canvasでスライドをキャンバスに変換
          const canvas = await html2canvas(slideElements[i], {
            scale: 2, // 高解像度
            useCORS: true,
            backgroundColor: null,
            logging: false
          });
          
          // 最初のページ以外は新しいページを追加
          if (i > 0) {
            pdf.addPage();
          }
          
          // キャンバスの画像をPDFに追加
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          
          // スライドをページの中央に配置（アスペクト比を維持）
          const imgAspectRatio = canvas.width / canvas.height;
          let imgWidth = contentWidth;
          let imgHeight = imgWidth / imgAspectRatio;
          
          // ページからはみ出す場合は高さに合わせる
          if (imgHeight > contentHeight) {
            imgHeight = contentHeight;
            imgWidth = imgHeight * imgAspectRatio;
          }
          
          // 中央に配置するための座標を計算
          const xOffset = margin + (contentWidth - imgWidth) / 2;
          const yOffset = margin + (contentHeight - imgHeight) / 2;
          
          // 画像を追加
          pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
          
          // ページ番号を追加（任意）
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`${i + 1} / ${slideElements.length}`, pdfWidth - 20, pdfHeight - 5);
          
        } catch (err) {
          console.error(`スライド ${i + 1} の処理中にエラー:`, err);
          continue;
        }
      }
      
      // 完了
      setPdfProgress(100);
      
      // PDFをダウンロード
      pdf.save(`${presentation.title || 'プレゼンテーション'}.pdf`);
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert(`PDFの生成中にエラーが発生しました: ${error.message}`);
    } finally {
      // 元の表示に戻す
      setShowAllSlides(false);
      setCurrentSlide(currentIndex);
      setIsGeneratingPDF(false);
      setPdfProgress(0);
    }
  };

  // ブラウザの印刷機能を使用
  const printToPDF = () => {
    const currentIndex = currentSlide;
    setShowAllSlides(true);
    
    // DOMの更新を待つ
    setTimeout(() => {
      window.print();
      
      // 印刷ダイアログが閉じた後に元の表示に戻す
      setTimeout(() => {
        setShowAllSlides(false);
        setCurrentSlide(currentIndex);
      }, 1000);
    }, 500);
  };

  // テーマに応じた背景色とテキスト色を取得
  const getThemeStyles = (themeName) => {
    switch (themeName) {
      case 'dark':
        return {
          background: '#2d2d2d',
          color: '#ffffff',
          borderColor: '#444'
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
          color: '#ffffff',
          borderColor: 'transparent'
        };
      case 'minimal':
        return {
          background: '#f8f9fa',
          color: '#343a40',
          borderColor: '#dee2e6'
        };
      case 'modern':
      default:
        return {
          background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
          color: '#333',
          borderColor: '#ddd'
        };
    }
  };

  // スライドタイプに応じたスタイルを取得
  const getSlideTypeStyles = (slideType) => {
    switch (slideType) {
      case 'title':
        return {
          titleStyles: {
            fontSize: '2.5em',
            textAlign: 'center',
            marginBottom: '30px'
          },
          contentStyles: {
            textAlign: 'center',
            fontSize: '1.3em'
          }
        };
      case 'summary':
        return {
          titleStyles: {
            fontSize: '2em',
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: '10px',
            marginBottom: '20px'
          },
          contentStyles: {
            fontSize: '1.1em'
          }
        };
      case 'content':
      default:
        return {
          titleStyles: {
            fontSize: '2em',
            marginBottom: '20px'
          },
          contentStyles: {
            fontSize: '1.1em'
          }
        };
    }
  };

  // HTMLとしてダウンロード
  const downloadAsHtml = () => {
    // すべてのスライドを含むHTML文書を作成
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${presentation.title || 'プレゼンテーション'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .presentation-title { text-align: center; padding: 20px; }
          .slide-container { 
            width: 90%; 
            max-width: 900px; 
            margin: 20px auto; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
            page-break-after: always;
          }
          .slide-title { margin-top: 0; }
          .slide-content { margin: 20px 0; }
          
          /* テーマスタイル */
          .theme-modern { background: linear-gradient(to bottom, #ffffff, #f5f5f5); color: #333; }
          .theme-dark { background: #2d2d2d; color: #fff; }
          .theme-gradient { background: linear-gradient(135deg, #6e8efb, #a777e3); color: #fff; }
          .theme-minimal { background: #f8f9fa; color: #343a40; border: 1px solid #dee2e6; }
          
          /* スライドタイプ */
          .slide-type-title .slide-title { font-size: 2.5em; text-align: center; }
          .slide-type-summary .slide-title { font-size: 2em; background-color: rgba(0,0,0,0.1); padding: 10px; }
          .slide-type-content .slide-title { font-size: 2em; }
          
          @media print {
            .slide-container {
              page-break-after: always;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
          }
        </style>
      </head>
      <body>
        <h1 class="presentation-title">${presentation.title || 'プレゼンテーション'}</h1>
    `;
    
    // 各スライドをHTMLに追加
    presentation.slides.forEach((slide, index) => {
      const slideType = slide.type || 'content';
      const themeStyles = getThemeStyles(presentation.theme || 'modern');
      const slideTypeStyles = getSlideTypeStyles(slideType);
      
      htmlContent += `
        <div class="slide-container theme-${presentation.theme || 'modern'}" style="background: ${themeStyles.background}; color: ${themeStyles.color}; border-color: ${themeStyles.borderColor};">
          <div class="slide slide-type-${slideType}">
            <h2 class="slide-title" style="font-size: ${slideTypeStyles.titleStyles.fontSize}; text-align: ${slideTypeStyles.titleStyles.textAlign || 'left'};">
              ${slide.title}
            </h2>
            <div class="slide-content" style="font-size: ${slideTypeStyles.contentStyles.fontSize};">
              ${slide.content || ''}
            </div>
            ${slide.footer ? `<div class="slide-footer" style="font-size: 0.9em; text-align: right; margin-top: 20px;">${slide.footer}</div>` : ''}
          </div>
        </div>
      `;
    });
    
    htmlContent += `
      </body>
      </html>
    `;
    
    // HTMLをダウンロード
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title || 'presentation'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const slide = presentation.slides[currentSlide];
  const theme = presentation.theme || 'modern';
  const slideType = slide.type || 'content';
  const themeStyles = getThemeStyles(theme);
  const slideTypeStyles = getSlideTypeStyles(slideType);
  
  return (
    <div className="presentation-container">
      <div className={`no-print ${showAllSlides ? 'hidden' : ''}`}>
        <div className="presentation-header">
          <div className="presentation-title">
            <h2>{presentation.title}</h2>
          </div>
          <div className="presentation-actions">
            <button onClick={onBack} className="btn btn-outline">
              新しいプレゼンテーションを作成
            </button>
            <div className="download-buttons">
              <button onClick={downloadAsHtml} className="btn btn-secondary">
                HTMLでダウンロード
              </button>
              <button
                onClick={downloadAsPDF}
                className="btn btn-secondary"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF
                  ? pdfProgress > 0
                    ? `PDF作成中... ${pdfProgress}%`
                    : 'PDF作成中...'
                  : 'PDFでダウンロード'}
              </button>
              <button onClick={toggleAllSlides} className="btn btn-secondary">
                {showAllSlides ? '1枚表示に戻る' : '全スライド表示'}
              </button>
            </div>
          </div>
        </div>
        
        {!showAllSlides && (
          <>
            <div className={`slide-container theme-${theme}`} ref={slidesRef.current[currentSlide]}>
              <div className={`slide slide-type-${slideType}`}>
                <h1 className="slide-title" style={slideTypeStyles.titleStyles}>{slide.title}</h1>
                <div className="slide-content" style={slideTypeStyles.contentStyles}>
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
          </>
        )}
      </div>
      
      {/* 印刷・PDF用のスライド一覧表示 */}
      {showAllSlides && (
        <div className="print-container">
          <div className="all-slides-view">
            <div className="no-print all-slides-header">
              <h2>すべてのスライド</h2>
              <button onClick={toggleAllSlides} className="btn btn-primary">
                1枚表示に戻る
              </button>
            </div>
            
            {presentation.slides.map((slide, index) => {
              const slideType = slide.type || 'content';
              const theme = presentation.theme || 'modern';
              const themeStyles = getThemeStyles(theme);
              const slideTypeStyles = getSlideTypeStyles(slideType);
              
              return (
                <div
                  key={index}
                  className="slide-container"
                  style={{
                    background: themeStyles.background,
                    color: themeStyles.color,
                    borderColor: themeStyles.borderColor,
                    marginBottom: '30px',
                    position: 'relative',
                    height: '540px', // 16:9比率に最適化（960px × 540px = 16:9）
                    width: '960px', // 標準的なプレゼンテーションサイズ
                    padding: '0',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    margin: '0 auto 30px auto' // 中央揃え
                  }}
                >
                  <div 
                    className="print-slide"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      padding: '40px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <h1
                      className="slide-title"
                      style={{
                        ...slideTypeStyles.titleStyles,
                        margin: '0 0 20px 0',
                        padding: slideType === 'summary' ? '10px' : '0',
                        backgroundColor: slideType === 'summary' ? 'rgba(0,0,0,0.1)' : 'transparent'
                      }}
                    >
                      {slide.title}
                    </h1>
                    <div
                      className="slide-content"
                      style={{
                        ...slideTypeStyles.contentStyles,
                        flex: '1'
                      }}
                    >
                      {slide.content && (
                        <div dangerouslySetInnerHTML={{ __html: slide.content.replace(/\n/g, '<br>') }} />
                      )}
                    </div>
                    {slide.footer && (
                      <div
                        className="slide-footer"
                        style={{
                          fontSize: '0.9em',
                          textAlign: 'right',
                          marginTop: '20px'
                        }}
                      >
                        {slide.footer}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationViewer; 