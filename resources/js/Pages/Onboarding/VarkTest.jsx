import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

// Batería de preguntas con sus respuestas asociadas a cada estilo
const questions = [
    {
        question: "Cuando tienes que aprender un tema nuevo y complejo para un examen, prefieres...",
        options: [
            { text: "Ver diagramas, mapas mentales o videos explicativos.", style: "visual" },
            { text: "Escuchar una explicación del profesor o discutirlo con compañeros.", style: "auditory" },
            { text: "Leer el libro de texto, artículos y hacer resúmenes escritos.", style: "reading" },
            { text: "Intentar hacer ejercicios prácticos o asociarlo a ejemplos reales.", style: "kinesthetic" },
        ]
    },
    {
        question: "Estás tratando de recordar cómo llegar a un lugar nuevo. ¿Qué haces?",
        options: [
            { text: "Visualizo un mapa o puntos de referencia en mi cabeza.", style: "visual" },
            { text: "Recuerdo las instrucciones que me dijeron en voz alta.", style: "auditory" },
            { text: "Leo las indicaciones escritas o el texto del GPS.", style: "reading" },
            { text: "Sigo mi intuición, me muevo y me oriento en el camino.", style: "kinesthetic" },
        ]
    },
    {
        question: "Para prepararte mejor, tu técnica de estudio favorita es...",
        options: [
            { text: "Usar muchos colores, resaltadores y dibujar esquemas.", style: "visual" },
            { text: "Estudiar en grupo, debatir o grabarte leyendo en voz alta.", style: "auditory" },
            { text: "Escribir y reescribir apuntes, y leer manuales detallados.", style: "reading" },
            { text: "Crear tarjetas didácticas (flashcards) y caminar mientras repaso.", style: "kinesthetic" },
        ]
    },
    {
        question: "Acabas de comprar un nuevo software o dispositivo. ¿Cómo aprendes a usarlo?",
        options: [
            { text: "Busco un video tutorial rápido en YouTube.", style: "visual" },
            { text: "Le pido a un amigo que me explique cómo funciona.", style: "auditory" },
            { text: "Leo la documentación o el manual de instrucciones.", style: "reading" },
            { text: "Lo enciendes y empiezas a presionar botones para descubrirlo.", style: "kinesthetic" },
        ]
    }
];

export default function VarkTest() {
    const [currentStep, setCurrentStep] = useState(0);
    const [scores, setScores] = useState({
        visual: 0,
        auditory: 0,
        reading: 0,
        kinesthetic: 0
    });

    const handleOptionSelect = (style) => {
        // Sumar un punto al estilo seleccionado
        const newScores = { ...scores, [style]: scores[style] + 1 };
        setScores(newScores);

        // Avanzar o finalizar
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishTest(newScores);
        }
    };

    const finishTest = (finalScores) => {
        // Buscar cuál es el estilo con mayor puntaje (Dominante)
        const dominantStyle = Object.keys(finalScores).reduce((a, b) => 
            finalScores[a] > finalScores[b] ? a : b
        );

        // Enviar el resultado al Backend usando Inertia
        router.post('/onboarding', {
            learning_style: dominantStyle
        });
    };

    const progressPercentage = ((currentStep) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <Head title="Descubre tu estilo de aprendizaje" />
            
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 h-2">
                    <div 
                        className="bg-indigo-600 h-2 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">
                            Pregunta {currentStep + 1} de {questions.length}
                        </span>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900 leading-tight">
                            {questions[currentStep].question}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {questions[currentStep].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(option.style)}
                                className="w-full text-left p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group flex items-center"
                            >
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 mr-4 flex-shrink-0"></div>
                                <span className="text-gray-700 font-medium group-hover:text-indigo-900">
                                    {option.text}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <p className="mt-8 text-gray-500 text-sm text-center max-w-md">
                SnapStudy usará estas respuestas para adaptar el contenido del muro social 
                a la forma en la que tu cerebro procesa mejor la información.
            </p>
        </div>
    );
}