import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: 'AIzaSyCgm8mz7vJlk-Z5_PYjp64F3lAmnCyyywk'
});

async function dan() {
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `presiden indonedia sekarang?`
  });
  console.dir(res, { depth: null, colors: true });
  const wildan = res.candidates[0].content.parts[0].text;
  console.log(wildan);
}
dan();
