import React from 'react';
import Link from 'next/link';

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">❌</div>
        <h1 className="error-title">エラーが発生しました</h1>
        <p className="error-message">
          {error?.message || 'プレゼンテーションの生成中に問題が発生しました。'}
        </p>
        {error?.details && (
          <div className="error-details">
            <pre>{error.details}</pre>
          </div>
        )}
        <div>
          <button onClick={onRetry} className="btn btn-primary">
            再試行
          </button>
          <Link href="/" className="btn btn-outline return-link">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 