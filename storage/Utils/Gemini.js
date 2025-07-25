import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentYear } from './timeTools.js';
import { wildanInfo } from '../config/me.js'; // Pastikan path ini benar
import { getChatHistory, getUserProfileData } from './dbTools.js';

const API_KEY_KAMU = 'AIzaSyCgm8mz7vJlk-Z5_PYjp64F3lAmnCyyywk'; // Ganti dengan API Key kamu yang asli ya!

const ai = new GoogleGenerativeAI(API_KEY_KAMU);

export async function p(pesanUser) {
  if (!pesanUser) {
    return 'Kasih pertanyaan yaa';
  }

  // Logika untuk "memaksa" tool call untuk pertanyaan spesifik tentang Wildan
  // Ini untuk memastikan data dari 'me.js' langsung keluar.
  if (
    pesanUser.toLowerCase().includes('siapa wildan') ||
    pesanUser.toLowerCase().includes('tentang wildan') ||
    pesanUser.toLowerCase().includes('profil wildan')
  ) {
    const wildanData = wildanInfo;
    return (
      `Halo, ini info tentang Wildan Hermawan:\n\n` +
      `* Nama:* ${wildanData.nama}\n` +
      `* Umur:* ${wildanData.umur}\n` +
      `* Passion:* ${wildanData.passion}\n` +
      `* Cita-cita:* ${wildanData.citaCita}\n` +
      `* Hobi Project:* ${wildanData.hobiProject}\n` +
      `* Gaya Belajar:* ${wildanData.gayaBelajar}\n` +
      `* Lahir:* ${wildanData.lahir}\n` +
      `* Kontak WA:* ${wildanData.kontakWA}`
    );
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Gunakan model ini ya

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'getCurrentYear',
            description: 'Mendapatkan tahun saat ini',
            parameters: { type: 'object', properties: {} }
          },
          {
            name: 'getWildanProfileData',
            description: 'Mendapatkan informasi dasar tentang Wildan Hermawan',
            parameters: { type: 'object', properties: {} }
          },
          {
            name: 'getChatHistory',
            description: 'Mendapatkan riwayat chat untuk ID chat tertentu',
            parameters: {
              type: 'object',
              properties: {
                chatId: { type: 'string', description: 'ID chat' }
              },
              required: ['chatId']
            }
          },
          {
            name: 'getUserProfileData',
            description: 'Mendapatkan data profil user dari database',
            parameters: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'ID user' }
              },
              required: ['userId']
            }
          }
        ]
      }
    ];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: pesanUser }] }],
      tools: tools
    });

    const response = await result.response;

    if (
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
    ) {
      const toolCalls = response.candidates[0].content.parts.filter(
        (part) => part.functionCall
      );

      if (toolCalls.length > 0) {
        let toolResponses = [];
        for (const toolCall of toolCalls) {
          const functionName = toolCall.functionCall.name;
          const functionArgs = toolCall.functionCall.args;

          let toolResult;

          if (functionName === 'getCurrentYear') {
            toolResult = getCurrentYear();
          } else if (functionName === 'getWildanProfileData') {
            toolResult = wildanInfo;
          } else if (functionName === 'getChatHistory') {
            const chatId = functionArgs.chatId;
            toolResult = getChatHistory(chatId);
          } else if (functionName === 'getUserProfileData') {
            const userId = functionArgs.userId;
            toolResult = getUserProfileData(userId);
          } else {
            toolResult = `Alat gak dikenal: ${functionName}`;
          }

          toolResponses.push({
            functionResponse: {
              name: functionName,
              response: {
                content: toolResult
              }
            }
          });
        }

        const secondResult = await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: pesanUser }] },
            { role: 'model', parts: response.candidates[0].content.parts },
            { role: 'tool', parts: toolResponses }
          ],
          tools: tools
        });

        const secondResponse = await secondResult.response;
        return secondResponse.text();
      } else {
        return response.text();
      }
    } else {
      console.error('Respon AI gak ada kandidat atau konten');
      return 'Duh, AI gak ngasih jawaban yang jelas';
    }
  } catch (err) {
    console.error('Error pas panggil Gemini API:', err);
    return 'Duh, ada masalah nih pas ngobrol sama AI. Coba lagi nanti ya';
  }
}

// Untuk tes, kamu bisa tambahkan kode ini di bagian paling bawah
// atau di file terpisah untuk menjalankan fungsi `p`
/*
// Contoh penggunaan:
async function testBot() {
    console.log("Pertanyaan: Siapa Wildan?");
    console.log("Jawaban:", await p("Siapa Wildan?"));
    console.log("---");
    console.log("Pertanyaan: Tahun berapa sekarang?");
    console.log("Jawaban:", await p("Tahun berapa sekarang?"));
    console.log("---");
    console.log("Pertanyaan: Presiden Indonesia sekarang?");
    console.log("Jawaban:", await p("Presiden Indonesia sekarang?"));
}

testBot();
*/
