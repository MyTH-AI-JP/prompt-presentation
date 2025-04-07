import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="container">
      <Head>
        <title>使い方 | プレゼンAIジェネレーター</title>
        <meta name="description" content="プレゼンAIジェネレーターの使い方ガイド" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header />
      
      <main className="main" style={{ alignItems: 'flex-start', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <h1>プレゼンAIジェネレーターの使い方</h1>
          
          <section style={{ margin: '2rem 0' }}>
            <h2>概要</h2>
            <p>
              プレゼンAIジェネレーターは、AIを使ってプレゼンテーションスライドを簡単に作成できるツールです。
              OpenAI GPT-4o、Google Gemini 2.0 Flash、または Anthropic Claude 3.7 Sonnetを利用して、入力したテーマに基づいたスライドを自動生成します。
            </p>
          </section>
          
          <section style={{ margin: '2rem 0' }}>
            <h2>必要なもの</h2>
            <ul>
              <li>OpenAI APIキー（GPT-4oを使用する場合）</li>
              <li>Google Gemini APIキー（Gemini 2.0 Flashを使用する場合）</li>
              <li>Anthropic Claude APIキー（Claude 3.7 Sonnetを使用する場合）</li>
            </ul>
            <p>
              ※APIキーはそれぞれのサービスから取得してください：
              <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px' }}>
                OpenAI Platform
              </a>、
              <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px' }}>
                Google AI Studio
              </a>、
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px' }}>
                Anthropic Console
              </a>
            </p>
          </section>
          
          <section style={{ margin: '2rem 0' }}>
            <h2>使用方法</h2>
            <ol>
              <li>ホーム画面でプレゼンテーションのテーマを入力します。</li>
              <li>使用するAPIキーを入力します。</li>
              <li>AIプロバイダー（gpt-4o、Gemini 2.0 Flash、Claude 3.7 Sonnet）を選択します。</li>
              <li>生成するスライド数を選択します（3枚、5枚、7枚、10枚、15枚）。</li>
              <li>デザインテーマを選択します。</li>
              <li>「プレゼンテーションを生成」ボタンをクリックします。</li>
              <li>AIがスライドを生成するのを待ちます。</li>
              <li>生成されたスライドを閲覧・利用します。</li>
              <li>必要に応じてHTMLまたはPDFでダウンロードします。</li>
            </ol>
          </section>
          
          <section style={{ margin: '2rem 0' }}>
            <h2>注意事項</h2>
            <ul>
              <li>入力したAPIキーはブラウザのローカルストレージに一時的に保存されます。サーバーには送信されません。</li>
              <li>生成されたコンテンツはAIによるものであり、内容の正確性は保証されません。</li>
              <li>プレゼンテーションの内容は適宜確認し、必要に応じて修正してください。</li>
              <li>インターネット接続が必要です。</li>
              <li>PDF出力はスライドを16:9比率で最適化しています。</li>
            </ul>
          </section>
          
          <section style={{ margin: '2rem 0' }}>
            <h2>最新アップデート（2024年11月）</h2>
            <ul>
              <li><strong>Claude 3.7 Sonnet対応</strong>: Anthropic Claude 3.7 Sonnetモデルをサポート</li>
              <li><strong>UI/UXの改善</strong>: モデル名表示を「gpt-4o」「Gemini 2.0 Flash」「Claude 3.7 Sonnet」に統一</li>
              <li><strong>スライド数オプションの拡張</strong>: 15枚までのスライド生成をサポート</li>
              <li><strong>PDF生成機能の最適化</strong>: スライドサイズを16:9比率に最適化し、PDFで美しく表示</li>
            </ul>
          </section>
          
          <div style={{ margin: '2rem 0' }}>
            <Link href="/" className="btn btn-primary">
              ホームに戻る
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About; 