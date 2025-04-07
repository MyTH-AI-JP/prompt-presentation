import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link href="/" className="logo-text">
          プレゼンAIジェネレーター
        </Link>
      </div>
      <nav>
        <ul style={{ display: 'flex', listStyle: 'none', gap: '20px' }}>
          <li>
            <Link href="/" className="nav-link">
              ホーム
            </Link>
          </li>
          <li>
            <Link href="/about" className="nav-link">
              使い方
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 