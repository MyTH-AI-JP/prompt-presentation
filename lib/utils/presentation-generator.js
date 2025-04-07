import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// OpenAIを使用したプレゼンテーション生成
export const generateWithOpenAI = async (prompt, apiKey, numSlides = 5, theme = 'modern') => {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // クライアントサイドでも実行可能にする
    });

    const systemPrompt = `あなたはプレゼンテーションスライドを作成するエキスパートです。
以下のテーマに基づいて、${numSlides}枚のスライドからなるプレゼンテーションを作成してください。
スライドには、タイトルスライド、内容スライド、まとめスライドを含めてください。
出力はJSONフォーマットで、以下の構造に従ってください:

{
  "title": "プレゼンテーションのタイトル",
  "theme": "${theme}",
  "slides": [
    {
      "title": "スライド1のタイトル",
      "content": "スライド1の内容（HTMLタグ使用可）",
      "type": "title" または "content" または "summary"
    },
    // 他のスライド...
  ]
}

スライドの内容では、箇条書きやシンプルな説明を心がけ、1枚のスライドに詰め込みすぎないようにしてください。`;

    const response = await openai.chat.completions.create({
      model: 'o3-mini-2025-01-31',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_completion_tokens: 2500,
      response_format: { type: 'json_object' }
    });

    const generatedContent = response.choices[0].message.content;
    return JSON.parse(generatedContent);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAIでの生成に失敗しました: ${error.message}`);
  }
};

// Google Geminiを使用したプレゼンテーション生成
export const generateWithGemini = async (prompt, apiKey, numSlides = 5, theme = 'modern') => {
  try {
    // 直接fetchを使用してGemini APIを呼び出す
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `あなたはプレゼンテーションスライドを作成するエキスパートです。
以下のテーマに基づいて、${numSlides}枚のスライドからなるプレゼンテーションを作成してください。
スライドには、タイトルスライド、内容スライド、まとめスライドを含めてください。
出力はJSONフォーマットで、以下の構造に従ってください:

{
  "title": "プレゼンテーションのタイトル",
  "theme": "${theme}",
  "slides": [
    {
      "title": "スライド1のタイトル",
      "content": "スライド1の内容（HTMLタグ使用可）",
      "type": "title" または "content" または "summary"
    },
    // 他のスライド...
  ]
}

スライドの内容では、箇条書きやシンプルな説明を心がけ、1枚のスライドに詰め込みすぎないようにしてください。`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nユーザーのリクエスト: ${prompt}`
        }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // レスポンスからテキストを取得
    const responseText = data.candidates[0].content.parts[0].text;
    
    // JSONを抽出
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('有効なJSONが返されませんでした');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Geminiでの生成に失敗しました: ${error.message}`);
  }
}; 