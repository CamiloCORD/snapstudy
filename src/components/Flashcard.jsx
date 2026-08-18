import { useState } from 'react';

export default function Flashcard({ question, answer }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all min-h-[160px] flex flex-col justify-center items-center text-center select-none hover:shadow-md"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
        {flipped ? 'Respuesta' : 'Pregunta (Haz clic para voltear)'}
      </span>
      <p className="text-slate-800 font-medium text-lg">
        {flipped ? answer : question}
      </p>
    </div>
  );
}