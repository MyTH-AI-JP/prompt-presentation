import React from 'react';

const Loading = ({ message = 'スライドを生成中...' }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loading; 