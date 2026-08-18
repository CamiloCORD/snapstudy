import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function generateFlashcards(file) {
  const base64Image = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });

  const prompt = `Analiza detenidamente este apunte de estudio y genera 5 tarjetas clave para estudiar (flashcards).
  Devuelve ÚNICAMENTE un arreglo en formato JSON estructurado así, sin bloques de código markdown ni texto adicional:
  [
    {"question": "Pregunta clara sobre el tema", "answer": "Respuesta directa y precisa"}
  ]`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
      prompt,
    ],
  });

  const cleanJsonText = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanJsonText);
}