/**
 * GoogleSlideConverter.js
 * Google Slides APIを使用してHTMLスライドをGoogleスライドに変換するクラス
 */
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * HTML要素からプレーンテキストを抽出するヘルパー関数
 * @param {string} html HTML文字列
 * @return {string} プレーンテキスト
 */
const htmlToPlainText = (html) => {
  return html
    .replace(/<\/?[^>]+(>|$)/g, '') // HTMLタグを削除
    .replace(/&nbsp;/g, ' ')        // &nbsp;を空白に変換
    .replace(/&amp;/g, '&')         // 特殊文字を変換
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Google Slideコンバータークラス
 */
class GoogleSlideConverter {
  /**
   * コンストラクタ
   * @param {Object} credentials OAuth認証情報
   */
  constructor(credentials) {
    this.auth = new OAuth2Client(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );
    
    if (credentials.token) {
      this.auth.setCredentials(credentials.token);
    }
    
    this.slides = google.slides({ version: 'v1', auth: this.auth });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * 認証を設定
   * @param {Object} token OAuthトークン
   */
  async authenticate(token) {
    this.auth.setCredentials(token);
  }

  /**
   * 新しいプレゼンテーションを作成
   * @param {string} title プレゼンテーションのタイトル
   * @return {string} プレゼンテーションID
   */
  async createPresentation(title) {
    try {
      const response = await this.slides.presentations.create({
        requestBody: {
          title: title || 'プレゼンテーション'
        }
      });
      return response.data.presentationId;
    } catch (error) {
      console.error('プレゼンテーション作成エラー:', error);
      throw new Error(`プレゼンテーションの作成に失敗しました: ${error.message}`);
    }
  }

  /**
   * テーマを適用
   * @param {string} presentationId プレゼンテーションID
   * @param {string} themeName テーマ名（modern, dark, gradient, minimal）
   */
  async applyTheme(presentationId, themeName) {
    try {
      const theme = this.getThemeProperties(themeName);
      
      // ページサイズを設定（16:9比率）
      const requests = [
        {
          updatePageProperties: {
            objectId: 'p',
            pageProperties: {
              pageSize: {
                width: { magnitude: 960, unit: 'PT' },
                height: { magnitude: 540, unit: 'PT' }
              }
            },
            fields: 'pageSize'
          }
        }
      ];
      
      // テーマの背景色を設定
      if (theme.background) {
        requests.push({
          updatePageProperties: {
            objectId: 'p',
            pageProperties: {
              colorScheme: {
                background: theme.background
              }
            },
            fields: 'colorScheme.background'
          }
        });
      }
      
      await this.slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests }
      });
      
    } catch (error) {
      console.error('テーマ適用エラー:', error);
      throw new Error(`テーマの適用に失敗しました: ${error.message}`);
    }
  }

  /**
   * スライドを追加
   * @param {string} presentationId プレゼンテーションID
   * @param {Object} slideData スライドデータ
   * @param {number} index スライドのインデックス
   */
  async addSlide(presentationId, slideData, index) {
    try {
      const slideType = slideData.type || 'content';
      
      // スライドのレイアウトを決定
      const predefinedLayout = slideType === 'title' 
        ? 'TITLE'
        : slideType === 'summary'
          ? 'SECTION_HEADER'
          : 'TITLE_AND_BODY';
      
      // スライド作成リクエスト
      const createSlideRequest = {
        createSlide: {
          objectId: `slide_${index}`,
          insertionIndex: index,
          slideLayoutReference: {
            predefinedLayout
          }
        }
      };
      
      // スライドを作成
      await this.slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests: [createSlideRequest] }
      });
      
      // スライド内容の追加リクエスト
      const contentRequests = [];
      
      // スライド内のプレースホルダを取得
      const slideResponse = await this.slides.presentations.get({
        presentationId,
        fields: 'slides'
      });
      
      const slide = slideResponse.data.slides[index];
      if (!slide) {
        throw new Error(`スライド ${index} が見つかりません`);
      }
      
      // プレースホルダ要素を探す
      const titlePlaceholder = slide.pageElements?.find(element => 
        element.shape?.placeholder?.type === 'TITLE' ||
        element.shape?.placeholder?.index === 0
      );
      
      const bodyPlaceholder = slide.pageElements?.find(element => 
        element.shape?.placeholder?.type === 'BODY' ||
        element.shape?.placeholder?.index === 1
      );
      
      // タイトルテキストの追加
      if (titlePlaceholder && slideData.title) {
        contentRequests.push({
          insertText: {
            objectId: titlePlaceholder.objectId,
            text: slideData.title
          }
        });
      }
      
      // 本文テキストの追加
      if (bodyPlaceholder && slideData.content) {
        const plainText = htmlToPlainText(slideData.content);
        contentRequests.push({
          insertText: {
            objectId: bodyPlaceholder.objectId,
            text: plainText
          }
        });
      }
      
      // フッターの追加（テキストボックスとして）
      if (slideData.footer) {
        contentRequests.push({
          createShape: {
            objectId: `footer_${index}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: `slide_${index}`,
              size: {
                width: { magnitude: 720, unit: 'PT' },
                height: { magnitude: 24, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 120,
                translateY: 500,
                unit: 'PT'
              }
            }
          }
        });
        
        contentRequests.push({
          insertText: {
            objectId: `footer_${index}`,
            text: slideData.footer
          }
        });
        
        // フッターのスタイル設定
        contentRequests.push({
          updateTextStyle: {
            objectId: `footer_${index}`,
            textRange: {
              type: 'ALL'
            },
            style: {
              fontSize: {
                magnitude: 10,
                unit: 'PT'
              },
              foregroundColor: {
                opaqueColor: {
                  rgbColor: {
                    red: 0.4,
                    green: 0.4,
                    blue: 0.4
                  }
                }
              }
            },
            fields: 'fontSize,foregroundColor'
          }
        });
      }
      
      // スライド番号の追加
      contentRequests.push({
        createShape: {
          objectId: `slideNumber_${index}`,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: `slide_${index}`,
            size: {
              width: { magnitude: 100, unit: 'PT' },
              height: { magnitude: 20, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 850,
              translateY: 510,
              unit: 'PT'
            }
          }
        }
      });
      
      contentRequests.push({
        insertText: {
          objectId: `slideNumber_${index}`,
          text: `${index + 1} / ${slideResponse.data.slides.length}`
        }
      });
      
      // スライド番号のスタイル設定
      contentRequests.push({
        updateTextStyle: {
          objectId: `slideNumber_${index}`,
          textRange: {
            type: 'ALL'
          },
          style: {
            fontSize: {
              magnitude: 10,
              unit: 'PT'
            },
            foregroundColor: {
              opaqueColor: {
                rgbColor: {
                  red: 0.4,
                  green: 0.4,
                  blue: 0.4
                }
              }
            }
          },
          fields: 'fontSize,foregroundColor'
        }
      });
      
      // バッチ更新でコンテンツを適用
      if (contentRequests.length > 0) {
        await this.slides.presentations.batchUpdate({
          presentationId,
          requestBody: { requests: contentRequests }
        });
      }
      
    } catch (error) {
      console.error(`スライド ${index} の追加エラー:`, error);
      throw new Error(`スライド ${index} の追加に失敗しました: ${error.message}`);
    }
  }

  /**
   * プレゼンテーションの共有設定
   * @param {string} presentationId プレゼンテーションID
   * @param {string} email 共有先のメールアドレス
   * @param {string} role 権限（reader, commenter, writer, owner）
   */
  async sharePresentation(presentationId, email, role = 'writer') {
    try {
      await this.drive.permissions.create({
        fileId: presentationId,
        sendNotificationEmail: true,
        requestBody: {
          type: 'user',
          role: role,
          emailAddress: email
        }
      });
    } catch (error) {
      console.error('共有設定エラー:', error);
      throw new Error(`プレゼンテーションの共有設定に失敗しました: ${error.message}`);
    }
  }

  /**
   * プレゼンテーションリンクの取得
   * @param {string} presentationId プレゼンテーションID
   * @return {string} プレゼンテーションURL
   */
  async getPresentationLink(presentationId) {
    try {
      const response = await this.drive.files.get({
        fileId: presentationId,
        fields: 'webViewLink'
      });
      return response.data.webViewLink;
    } catch (error) {
      console.error('リンク取得エラー:', error);
      // フォールバックとして標準URLを返す
      return `https://docs.google.com/presentation/d/${presentationId}/edit`;
    }
  }

  /**
   * テーマのプロパティを取得
   * @param {string} themeName テーマ名
   * @return {Object} テーマのプロパティ
   */
  getThemeProperties(themeName) {
    const themes = {
      modern: {
        background: {
          opaqueColor: {
            rgbColor: { red: 1, green: 1, blue: 1 }
          }
        },
        fontColor: { red: 0.2, green: 0.2, blue: 0.2 },
        fontFamily: 'Arial'
      },
      dark: {
        background: {
          opaqueColor: {
            rgbColor: { red: 0.18, green: 0.18, blue: 0.18 }
          }
        },
        fontColor: { red: 1, green: 1, blue: 1 },
        fontFamily: 'Roboto'
      },
      gradient: {
        background: {
          opaqueColor: {
            rgbColor: { red: 0.43, green: 0.58, blue: 0.98 }
          }
        },
        fontColor: { red: 1, green: 1, blue: 1 },
        fontFamily: 'Montserrat'
      },
      minimal: {
        background: {
          opaqueColor: {
            rgbColor: { red: 0.97, green: 0.97, blue: 0.98 }
          }
        },
        fontColor: { red: 0.2, green: 0.23, blue: 0.25 },
        fontFamily: 'Open Sans'
      }
    };
    
    return themes[themeName] || themes.modern;
  }
}

export default GoogleSlideConverter; 