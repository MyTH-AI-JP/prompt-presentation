"use strict";(()=>{var e={};e.id=801,e.ids=[801],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3023:e=>{e.exports=import("@google/generative-ai")},2079:e=>{e.exports=import("openai")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},8573:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.r(t),r.d(t,{config:()=>u,default:()=>l,routeModule:()=>p});var o=r(1802),a=r(7153),s=r(6249),i=r(5672),c=e([i]);i=(c.then?(await c)():c)[0];let l=(0,s.l)(i,"default"),u=(0,s.l)(i,"config"),p=new o.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/generate-presentation",pathname:"/api/generate-presentation",bundlePath:"",filename:""},userland:i});n()}catch(e){n(e)}})},2091:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.d(t,{V:()=>i,w:()=>c});var o=r(2079),a=r(3023),s=e([o,a]);[o,a]=s.then?(await s)():s;let i=async(e,t,r=5,n="modern")=>{try{let a=new o.default({apiKey:t,dangerouslyAllowBrowser:!0}),s=`あなたはプレゼンテーションスライドを作成するエキスパートです。
以下のテーマに基づいて、${r}枚のスライドからなるプレゼンテーションを作成してください。
スライドには、タイトルスライド、内容スライド、まとめスライドを含めてください。
出力はJSONフォーマットで、以下の構造に従ってください:

{
  "title": "プレゼンテーションのタイトル",
  "theme": "${n}",
  "slides": [
    {
      "title": "スライド1のタイトル",
      "content": "スライド1の内容（HTMLタグ使用可）",
      "type": "title" または "content" または "summary"
    },
    // 他のスライド...
  ]
}

スライドの内容では、箇条書きやシンプルな説明を心がけ、1枚のスライドに詰め込みすぎないようにしてください。`,i=(await a.chat.completions.create({model:"gpt-4-turbo-preview",messages:[{role:"system",content:s},{role:"user",content:e}],temperature:.7,max_tokens:2500,response_format:{type:"json_object"}})).choices[0].message.content;return JSON.parse(i)}catch(e){throw console.error("OpenAI API error:",e),Error(`OpenAIでの生成に失敗しました: ${e.message}`)}},c=async(e,t,r=5,n="modern")=>{try{let o=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${t}`,a=`あなたはプレゼンテーションスライドを作成するエキスパートです。
以下のテーマに基づいて、${r}枚のスライドからなるプレゼンテーションを作成してください。
スライドには、タイトルスライド、内容スライド、まとめスライドを含めてください。
出力はJSONフォーマットで、以下の構造に従ってください:

{
  "title": "プレゼンテーションのタイトル",
  "theme": "${n}",
  "slides": [
    {
      "title": "スライド1のタイトル",
      "content": "スライド1の内容（HTMLタグ使用可）",
      "type": "title" または "content" または "summary"
    },
    // 他のスライド...
  ]
}

スライドの内容では、箇条書きやシンプルな説明を心がけ、1枚のスライドに詰め込みすぎないようにしてください。`,s={contents:[{parts:[{text:`${a}

ユーザーのリクエスト: ${e}`}]}]},i=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(!i.ok){let e=await i.json();throw Error(`API error: ${JSON.stringify(e)}`)}let c=(await i.json()).candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);if(!c)throw Error("有効なJSONが返されませんでした");return JSON.parse(c[0])}catch(e){throw console.error("Gemini API error:",e),Error(`Geminiでの生成に失敗しました: ${e.message}`)}};n()}catch(e){n(e)}})},5672:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.r(t),r.d(t,{default:()=>s});var o=r(2091),a=e([o]);async function s(e,t){if(t.setHeader("Access-Control-Allow-Credentials",!0),t.setHeader("Access-Control-Allow-Origin","*"),t.setHeader("Access-Control-Allow-Methods","GET,OPTIONS,PATCH,DELETE,POST,PUT"),t.setHeader("Access-Control-Allow-Headers","X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"),"OPTIONS"===e.method){t.status(200).end();return}if("POST"!==e.method)return t.status(405).json({error:"メソッドが許可されていません"});try{let r;let{prompt:n,apiKey:a,provider:s="openai",numSlides:i=5,theme:c="modern"}=e.body;if(!n||!a)return t.status(400).json({error:"プロンプトとAPIキーは必須です"});if("openai"===s)r=await (0,o.V)(n,a,i,c);else{if("gemini"!==s)return t.status(400).json({error:'無効なプロバイダー。"openai"または"gemini"を指定してください'});r=await (0,o.w)(n,a,i,c)}return t.status(200).json(r)}catch(e){return console.error("プレゼンテーション生成エラー:",e),t.status(500).json({error:"プレゼンテーションの生成中にエラーが発生しました",details:e.message})}}o=(a.then?(await a)():a)[0],n()}catch(e){n(e)}})},7153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},1802:(e,t,r)=>{e.exports=r(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var r=t(t.s=8573);module.exports=r})();