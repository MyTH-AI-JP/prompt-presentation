export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} プロンプトからPPT風資料生成</p>
        <p>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github"></i> GitHub
          </a>
        </p>
      </div>
    </footer>
  );
} 