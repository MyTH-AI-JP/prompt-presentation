import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from '../styles/About.module.css';
import Layout from "../components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="about-container">
        <h1>Prompt Presentationについて</h1>
        <p>
          Prompt Presentationは、プロンプトだけで美しいプレゼンテーションスライドを生成するWebアプリケーションです。
          OpenAI API、Google Gemini API、およびAnthropic Claude APIを使用して、テキストプロンプトからスライドを自動生成します。
        </p>

        <h2>機能</h2>
        <ul>
          <li>テキストプロンプトからスライドを自動生成</li>
          <li>選択可能なAIモデル：GPT-4o、Gemini 2.0 Flash、Claude 3.7 Sonnet</li>
          <li>10種類以上のテーマから選択可能</li>
          <li>スライドの数を3〜15枚の間で指定可能</li>
          <li>スライドのHTMLファイル、PDF、PowerPointとしてダウンロード可能</li>
          <li>Google Slidesへの直接エクスポート</li>
        </ul>

        <h2>使用方法</h2>
        <ol>
          <li>トップページでプレゼンテーションのトピックを入力します</li>
          <li>AIモデル、テーマ、スライド数を選択します</li>
          <li>「スライドを生成」ボタンをクリックします</li>
          <li>生成されたスライドを確認し、必要に応じてHTML、PDF、またはPowerPoint形式でダウンロードできます</li>
          <li>Google Slidesに直接エクスポートすることもできます</li>
        </ol>

        <h2>注意事項</h2>
        <ul>
          <li>APIキーは自分で提供する必要があります（OpenAI、Google、またはAnthropic）</li>
          <li>生成されるコンテンツの品質はAIモデルに依存します</li>
          <li>複雑なチャートや表の生成は限定的です</li>
          <li>PowerPoint形式でダウンロードする場合、レイアウトが簡素化される場合があります</li>
        </ul>

        <h2>最新アップデート情報（2024年11月）</h2>
        <ul>
          <li>2024年11月26日：Anthropic Claude 3.7 Sonnetモデルに対応しました</li>
          <li>2024年11月25日：モデル名の表示を「gpt-4o」「Gemini 2.0 Flash」「Claude 3.7 Sonnet」に統一しました</li>
          <li>2024年11月24日：スライド生成数を3〜15枚に拡張しました</li>
          <li>2024年11月22日：PDF生成機能を16:9比率に最適化しました</li>
          <li>2024年11月20日：PowerPoint形式（.pptx）でのダウンロードに対応しました</li>
          <li>2024年11月18日：プリントプレビュー機能を簡素化のため削除しました</li>
        </ul>

        <h2>APIリクエスト形式</h2>
        <pre>
{`{
  "prompt": "プレゼンテーションのトピック",
  "provider": "openai" | "google" | "claude",
  "model": "gpt-4o" | "gemini-1.5-flash" | "claude-3-5-sonnet", 
  "theme": "default" | "business" | "modern" | "colorful" | ... 
  "slideCount": 3-15
}`}
        </pre>

        <h2>テスト用API例</h2>
        <p>
          以下は、Claude APIを使ってプレゼンテーションを生成するテスト用APIリクエストの例です：
        </p>
        <pre>
{`// Claude 3.7 Sonnetを使用した高品質プレゼンテーション生成
fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: "AIの倫理的課題について説明するプレゼンテーション",
    provider: "claude",
    model: "claude-3-5-sonnet",
    theme: "modern",
    slideCount: 8
  }),
})
.then(response => response.json())
.then(data => console.log(data));`}
        </pre>

        <h2>お問い合わせ</h2>
        <p>
          質問やフィードバックがある場合は、
          <a href="mailto:contact@example.com">contact@example.com</a>
          までご連絡ください。
        </p>
      </div>
    </Layout>
  );
};

export default About; 