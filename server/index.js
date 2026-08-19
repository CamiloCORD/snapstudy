import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Database from 'better-sqlite3';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const db = new Database(path.join(__dirname, 'database.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());

app.post('/api/generate', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const prompt = `Analiza detenidamente este apunte de estudio y genera 5 tarjetas clave para estudiar (flashcards).
    Devuelve ÚNICAMENTE un arreglo en formato JSON estructurado así, sin texto adicional:
    [
      {"question": "Pregunta clara sobre el tema", "answer": "Respuesta directa y precisa"}
    ]`;

    // Se actualiza el modelo a gemini-3.6-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64Image,
          },
        },
        prompt,
      ],
    });

    const rawText = response.text || '';
    const jsonMatch = rawText.match(/\[\s*\{.*\}\s*\]/s);

    if (!jsonMatch) {
      console.error('Respuesta recibida no contiene JSON válido:', rawText);
      return res.status(500).json({ error: 'La IA no devolvió un formato válido.' });
    }

    const flashcards = JSON.parse(jsonMatch[0]);

    const insertStmt = db.prepare('INSERT INTO flashcards (question, answer) VALUES (?, ?)');
    const insertMany = db.transaction((cards) => {
      for (const card of cards) {
        insertStmt.run(card.question, card.answer);
      }
    });

    insertMany(flashcards);

    res.json({ success: true, flashcards });
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    res.status(500).json({ error: 'Error al procesar o guardar las tarjetas' });
  }
});

app.get('/api/flashcards', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM flashcards ORDER BY created_at DESC');
    const cards = stmt.all();
    res.json({ success: true, flashcards: cards });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las flashcards' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor e DB corriendo en http://localhost:${PORT}`);
});