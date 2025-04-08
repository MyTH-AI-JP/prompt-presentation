/**
 * GoogleSlideButton.js
 * Googleスライド変換ボタンコンポーネント
 */
import React from 'react';
import styles from '../../styles/GoogleSlideButton.module.css';

/**
 * Googleスライド変換ボタンコンポーネント
 * @param {Object} props コンポーネントプロパティ
 * @param {Function} props.onClick クリックハンドラ
 * @param {boolean} props.isGenerating 生成中フラグ
 * @param {number} props.progress 進捗率（0-100）
 * @param {string} props.url 生成されたGoogleスライドのURL
 * @param {string} props.error エラーメッセージ
 */
const GoogleSlideButton = ({
  onClick,
  isGenerating = false,
  progress = 0,
  url = '',
  error = null
}) => {
  return (
    <div className={styles.googleSlideButtonContainer}>
      {/* メインボタン */}
      <button
        className={`btn ${isGenerating ? 'btn-secondary' : 'btn-primary'} ${styles.googleSlideButton}`}
        onClick={onClick}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span>
            <span className={styles.loadingIcon}>
              <span className={styles.spinner}></span>
            </span>
            Googleスライド作成中... {progress > 0 ? `${progress}%` : ''}
          </span>
        ) : (
          <span>
            <span className={styles.googleIcon}></span>
            Googleスライドで作成
          </span>
        )}
      </button>

      {/* 進捗バー */}
      {isGenerating && progress > 0 && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* 成功時のリンク表示 */}
      {url && !isGenerating && (
        <div className={styles.googleSlideLink}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.googleSlideLinkButton}
          >
            <span className={styles.googleIcon}></span>
            Googleスライドを開く
          </a>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && !isGenerating && (
        <div className={styles.errorMessage}>
          <p>エラー: {error}</p>
          <button
            className="btn btn-sm btn-secondary"
            onClick={onClick}
          >
            再試行
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleSlideButton; 