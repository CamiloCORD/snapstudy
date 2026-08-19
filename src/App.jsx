import { useState, useEffect } from 'react';
import Flashcard from './components/Flashcard';

export default function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar las flashcards guardadas en SQLite al cargar la app
  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/flashcards');
      const data = await res.json();
      if (data.success) {
        setFlashcards(data.flashcards);
      }
    } catch (error) {
      console.error('Error al obtener flashcards:', error);
    }
  };

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);

    // Preparar la imagen para enviarla mediante FormData al servidor
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Recargar la lista completa desde la base de datos
        fetchFlashcards();
      } else {
        alert(data.error || 'Error al procesar la imagen.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col items-center">
      <header className="max-w-2xl w-full text-center my-8">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">SnapStudy 📚</h1>
        <p className="text-slate-600">Sube fotos de tus apuntes y genera tarjetas de estudio al instante</p>
      </header>

      <main className="max-w-2xl w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-slate-300 text-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center py-4 text-slate-500 hover:text-indigo-600 transition">
            <span className="text-4xl mb-2">📸</span>
            <span className="font-semibold text-slate-700">Selecciona o toma una foto de tu apunte</span>
          </label>

          {imagePreview && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <img src={imagePreview} alt="Apunte cargado" className="max-h-56 mx-auto rounded-lg shadow-sm border border-slate-200 mb-4" />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Procesando apunte con la IA...' : 'Generar Flashcards 🚀'}
              </button>
            </div>
          )}
        </div>

        {/* Renderizado de tarjetas guardadas en la BD */}
        {flashcards.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Tus Flashcards Guardadas ({flashcards.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {flashcards.map((card) => (
                <Flashcard key={card.id || card.question} question={card.question} answer={card.answer} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}