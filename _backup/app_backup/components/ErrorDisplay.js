'use client';

export default function ErrorDisplay({ message, details, onRetry }) {
  return (
    <div id="error-page" className="error-page">
      <div className="error-content">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>エラーが発生しました</h2>
        <p id="error-message">{message}</p>
        {details && (
          <div id="error-details" className="error-details">
            <pre>{details}</pre>
          </div>
        )}
        <button 
          id="retry-btn" 
          className="btn-primary"
          onClick={onRetry}
        >
          <i className="fas fa-redo"></i> 再試行
        </button>
      </div>
    </div>
  );
} 