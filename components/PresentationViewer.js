import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import styles from '../styles/PresentationViewer.module.css';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { getTheme } from '../utils/themes';
import { FaArrowLeft, FaArrowRight, FaDownload, FaExpand } from 'react-icons/fa';

const PresentationViewer = ({ presentation, onBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllSlides, setShowAllSlides] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isCreatingGoogleSlide, setIsCreatingGoogleSlide] = useState(false);
  const [googleSlideProgress, setGoogleSlideProgress] = useState(0);
  const [pptxGenerating, setPptxGenerating] = useState(false);
  const [pptxProgress, setPptxProgress] = useState(0);
  const slidesRef = useRef([]);
  const containerRef = useRef(null);
  const themeStyles = getTheme(presentation.theme || 'modern');
  
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
  const slideTypeStyles = getSlideTypeStyles(slideType);
  
  // Googleスライドとして作成
  const createGoogleSlide = async () => {
    if (isCreatingGoogleSlide) return;
    
    try {
      setIsCreatingGoogleSlide(true);
      setGoogleSlideProgress(10);
      
      // サーバーサイドのAPIを使用する代わりに、直接Google APIとクライアントサイドで連携
      // Google API Javascriptライブラリを動的に読み込み
      if (!window.gapi) {
        // スクリプトを読み込む
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      
      setGoogleSlideProgress(20);
      
      // APIをロード
      await new Promise((resolve) => {
        window.gapi.load('client:auth2', resolve);
      });
      
      // APIクライアントを初期化
      await window.gapi.client.init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive.file',
      });
      
      // ユーザー認証
      setGoogleSlideProgress(30);
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }
      
      // プレゼンテーションの作成
      setGoogleSlideProgress(40);
      
      // Slides APIをロード
      await window.gapi.client.load('slides', 'v1');
      
      // 新しいプレゼンテーションを作成
      const createResponse = await window.gapi.client.slides.presentations.create({
        title: presentation.title || 'プレゼンテーション'
      });
      
      const presentationId = createResponse.result.presentationId;
      setGoogleSlideProgress(50);
      
      // スライド作成用のリクエストを準備
      const requests = [];
      
      // デフォルトのスライドを削除するリクエスト
      requests.push({
        deleteObject: {
          objectId: 'p'
        }
      });
      
      // 新しいスライドを追加
      for (let i = 0; i < presentation.slides.length; i++) {
        const slide = presentation.slides[i];
        const slideObjectId = `slide_${i}`;
        
        // 進捗を更新
        setGoogleSlideProgress(50 + Math.round((i / presentation.slides.length) * 40));
        
        // スライドタイプに基づいてレイアウトを選択
        let layoutId;
        switch (slide.type) {
          case 'title':
            layoutId = 'TITLE';
            break;
          default:
            layoutId = 'TITLE_AND_BODY';
        }
        
        // スライドを追加
        requests.push({
          createSlide: {
            objectId: slideObjectId,
            slideLayoutReference: {
              predefinedLayout: layoutId
            }
          }
        });
        
        // タイトルを追加
        requests.push({
          createShape: {
            objectId: `title_${i}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideObjectId,
              size: {
                width: { magnitude: 600, unit: 'PT' },
                height: { magnitude: 50, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 30,
                unit: 'PT'
              }
            }
          }
        });
        
        requests.push({
          insertText: {
            objectId: `title_${i}`,
            text: slide.title
          }
        });
        
        // HTMLコンテンツからプレーンテキストを抽出
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = slide.content;
        const contentText = tempDiv.textContent || tempDiv.innerText || '';
        
        // コンテンツを追加
        if (contentText) {
          requests.push({
            createShape: {
              objectId: `content_${i}`,
              shapeType: 'TEXT_BOX',
              elementProperties: {
                pageObjectId: slideObjectId,
                size: {
                  width: { magnitude: 600, unit: 'PT' },
                  height: { magnitude: 300, unit: 'PT' }
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 50,
                  translateY: 100,
                  unit: 'PT'
                }
              }
            }
          });
          
          requests.push({
            insertText: {
              objectId: `content_${i}`,
              text: contentText
            }
          });
        }
        
        // フッターを追加（存在する場合）
        if (slide.footer) {
          requests.push({
            createShape: {
              objectId: `footer_${i}`,
              shapeType: 'TEXT_BOX',
              elementProperties: {
                pageObjectId: slideObjectId,
                size: {
                  width: { magnitude: 600, unit: 'PT' },
                  height: { magnitude: 30, unit: 'PT' }
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 50,
                  translateY: 400,
                  unit: 'PT'
                }
              }
            }
          });
          
          requests.push({
            insertText: {
              objectId: `footer_${i}`,
              text: slide.footer
            }
          });
          
          // フッターのテキストを右揃えに
          requests.push({
            updateParagraphStyle: {
              objectId: `footer_${i}`,
              style: {
                alignment: 'END'
              },
              fields: 'alignment'
            }
          });
        }
        
        // スライド番号を追加
        requests.push({
          createShape: {
            objectId: `slidenum_${i}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: slideObjectId,
              size: {
                width: { magnitude: 30, unit: 'PT' },
                height: { magnitude: 20, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 620,
                translateY: 400,
                unit: 'PT'
              }
            }
          }
        });
        
        requests.push({
          insertText: {
            objectId: `slidenum_${i}`,
            text: `${i + 1}`
          }
        });
      }
      
      // バッチ更新リクエストを実行
      if (requests.length > 0) {
        await window.gapi.client.slides.presentations.batchUpdate({
          presentationId: presentationId,
          requests: requests
        });
      }
      
      setGoogleSlideProgress(95);
      
      // プレゼンテーションのURLを取得
      const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
      
      // 新しいタブでプレゼンテーションを開く
      window.open(presentationUrl, '_blank');
      
      setGoogleSlideProgress(100);
      
    } catch (error) {
      console.error('Googleスライド作成エラー:', error);
      alert(`Googleスライドの作成中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsCreatingGoogleSlide(false);
      setGoogleSlideProgress(0);
    }
  };

  // PowerPointとしてダウンロード
  const downloadAsPPTX = async () => {
    if (pptxGenerating) return;
    
    try {
      setPptxGenerating(true);
      setPptxProgress(0);
      
      // 動的にpptxgenjsをインポート
      const pptxgen = (await import('pptxgenjs')).default;
      
      // 新しいプレゼンテーションを作成
      const pres = new pptxgen();
      
      // スライド要素の参照を収集
      const slideElements = slidesRef.current.filter(el => el !== null);
      
      // 各スライドをPowerPointに追加
      for (let i = 0; i < slideElements.length; i++) {
        const el = slideElements[i];
        const slideData = presentation.slides[i];
        
        // 進捗状況を更新
        setPptxProgress(Math.round((i / slideElements.length) * 100));
        
        // スライドを追加
        const slide = pres.addSlide();
        
        // タイトルを追加
        slide.addText(slideData.title || '', { 
          x: 0.5, 
          y: 0.5, 
          w: '90%', 
          fontSize: 24,
          bold: true,
          color: '363636'
        });
        
        // コンテンツを追加
        const content = slideData.content || [];
        let yPos = 1.5;
        
        content.forEach(item => {
          slide.addText(item, { 
            x: 0.5, 
            y: yPos, 
            w: '90%', 
            fontSize: 14,
            bullet: { type: 'bullet' }
          });
          yPos += 0.5;
        });
        
        // フッターとスライド番号を追加
        slide.addText(`スライド ${i + 1} / ${slideElements.length}`, { 
          x: 0.5, 
          y: 5, 
          fontSize: 10,
          color: '808080'
        });
      }
      
      // プレゼンテーションをダウンロード
      await pres.writeFile({ fileName: 'presentation.pptx' });
      
      setPptxProgress(100);
    } catch (error) {
      console.error('PowerPointのエクスポート中にエラーが発生しました:', error);
      alert('PowerPointの生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setTimeout(() => {
        setPptxGenerating(false);
        setPptxProgress(0);
      }, 1500);
    }
  };

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.toolbar}>
        <button className={styles.closeButton} onClick={onBack}>
          <i className="fas fa-times"></i>
        </button>
        <div className={styles.presentationTitle}>{presentation.title}</div>
        <div className={styles.toolbarActions}>
          <button
            className={styles.toolbarButton}
            onClick={toggleAllSlides}
            title={showAllSlides ? "1枚表示" : "全て表示"}
          >
            <i className={`fas ${showAllSlides ? "fa-file" : "fa-th-large"}`}></i>
          </button>
          <button
            className={styles.toolbarButton}
            onClick={downloadAsPDF}
            disabled={isGeneratingPDF}
            title="PDFでダウンロード"
          >
            {isGeneratingPDF ? (
              <><i className="fas fa-spinner fa-spin"></i> {pdfProgress}%</>
            ) : (
              <i className="fas fa-file-pdf"></i>
            )}
          </button>
          <button
            className={styles.toolbarButton}
            onClick={downloadAsHtml}
            disabled={isGeneratingPDF}
            title="HTMLでダウンロード"
          >
            {isGeneratingPDF ? (
              <><i className="fas fa-spinner fa-spin"></i></>
            ) : (
              <i className="fas fa-file-code"></i>
            )}
          </button>
          <button
            className={styles.toolbarButton}
            onClick={downloadAsPPTX}
            disabled={pptxGenerating}
            title="PowerPointでダウンロード"
          >
            {pptxGenerating ? (
              <><i className="fas fa-spinner fa-spin"></i> {pptxProgress}%</>
            ) : (
              <i className="fas fa-file-powerpoint"></i>
            )}
          </button>
          <button
            className={styles.toolbarButton}
            onClick={createGoogleSlide}
            disabled={isCreatingGoogleSlide}
            title="Googleスライドで開く"
          >
            <i className="fas fa-file-powerpoint"></i>
          </button>
        </div>
      </div>
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
                <button
                  onClick={downloadAsPPTX}
                  className="btn btn-secondary"
                  disabled={pptxGenerating}
                >
                  {pptxGenerating ? (
                    <><i className="fas fa-spinner fa-spin"></i> {pptxProgress}%</>
                  ) : (
                    <i className="fas fa-file-powerpoint"></i>
                  )}
                </button>
                <button
                  onClick={createGoogleSlide}
                  className="btn btn-secondary"
                  disabled={isCreatingGoogleSlide}
                >
                  {isCreatingGoogleSlide
                    ? googleSlideProgress > 0
                      ? `Googleスライド作成中... ${googleSlideProgress}%`
                      : 'Googleスライド作成中...'
                    : 'Googleスライドで開く'}
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
    </div>
  );
};

export default PresentationViewer; 