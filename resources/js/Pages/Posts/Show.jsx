import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Show({ auth, post }) {
    // Inicializamos el estado con las flashcards que vengan de la BD (si existen)
    const [flashcards, setFlashcards] = useState(post.flashcards || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Controla el modo edición
    const [isSaving, setIsSaving] = useState(false);
    const [revealed, setRevealed] = useState({});

    const { data, setData, post: submitComment, processing, reset, errors } = useForm({
        content: '',
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        submitComment(route('comments.store', post.id), {
            onSuccess: () => reset('content'),
        });
    };

    const handleDeleteComment = (commentId) => {
        if (confirm('¿Deseas eliminar este comentario?')) {
            router.delete(route('comments.destroy', commentId));
        }
    };

    const handleGenerateFlashcards = async () => {
        setIsGenerating(true);
        try {
            const response = await axios.post(route('posts.flashcards', post.id));
            if (response.data.success) {
                setFlashcards(response.data.flashcards);
                setIsEditing(true); // Entramos a modo edición inmediatamente después de generar
            }
        } catch (error) {
            console.error(error);
            alert('Hubo un error al generar las tarjetas.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Actualiza el texto mientras el usuario escribe
    const handleCardChange = (index, field, value) => {
        const newFlashcards = [...flashcards];
        newFlashcards[index][field] = value;
        setFlashcards(newFlashcards);
    };

    // Guarda las flashcards en la base de datos
    const handleSaveFlashcards = () => {
        setIsSaving(true);
        router.post(route('posts.flashcards.store', post.id), {
            flashcards: flashcards
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setIsEditing(false); // Salimos del modo edición
                setRevealed({}); // Ocultamos las respuestas
            },
            onError: () => {
                setIsSaving(false);
                alert('Hubo un error al guardar las flashcards.');
            }
        });
    };

    const toggleCard = (index) => {
        setRevealed(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('dashboard')} className="w-10 h-10 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-300 transition-colors">
                        ←
                    </Link>
                    <h2 className="font-bold text-2xl text-slate-800 dark:text-white leading-tight">
                        Modo Lectura
                    </h2>
                </div>
            }
        >
            <Head title={`${post.title} - SnapStudy`} />

            <div className="py-8 font-sans max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* APUNTE PRINCIPAL */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    {post.image && (
                        <div className="w-full h-64 sm:h-96 relative bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <img src={`/storage/${post.image}`} alt={post.title} className="w-full h-full object-contain p-4" />
                        </div>
                    )}
                    <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-700">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
                            {post.title}
                        </h1>
                    </div>
                    <div className="p-8 md:p-12">
                        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                            {post.content}
                        </div>
                    </div>
                </div>

                {/* ZONA DE FLASHCARDS INTERACTIVAS */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-3xl border border-purple-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">🧠 Tarjetas de Estudio</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {isEditing ? "Edita el contenido antes de guardarlo" : "Comprueba lo que aprendiste"}
                            </p>
                        </div>

                        {/* Botón inicial para generar (si no hay flashcards) */}
                        {flashcards.length === 0 && !isGenerating && (
                            <button
                                onClick={handleGenerateFlashcards}
                                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg"
                            >
                                ✨ Generar Flashcards
                            </button>
                        )}
                        {isGenerating && <span className="text-purple-600 font-bold animate-pulse">Generando con IA...</span>}

                        {/* Botones de control si ya existen flashcards */}
                        {flashcards.length > 0 && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-300 transition-all"
                            >
                                ✏️ Editar Tarjetas
                            </button>
                        )}
                    </div>

                    {/* MODO EDICIÓN vs MODO ESTUDIO */}
                    {flashcards.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {flashcards.map((card, index) => (
                                isEditing ? (
                                    /* VISTA DE EDICIÓN (Formularios) */
                                    <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-purple-600 uppercase">Pregunta</label>
                                            <textarea
                                                value={card.pregunta}
                                                onChange={(e) => handleCardChange(index, 'pregunta', e.target.value)}
                                                className="w-full mt-1 p-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-purple-500"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-emerald-600 uppercase">Respuesta</label>
                                            <textarea
                                                value={card.respuesta}
                                                onChange={(e) => handleCardChange(index, 'respuesta', e.target.value)}
                                                className="w-full mt-1 p-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:ring-emerald-500"
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* VISTA DE ESTUDIO (Tarjetas que se voltean) */
                                    <div
                                        key={index}
                                        onClick={() => toggleCard(index)}
                                        className={`relative w-full h-64 rounded-2xl cursor-pointer transition-all duration-500 shadow-md ${revealed[index] ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
                                            }`}
                                    >
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                            {revealed[index] ? (
                                                <>
                                                    <span className="text-xs uppercase font-bold text-purple-200 mb-3">Respuesta</span>
                                                    <p className="font-bold text-lg">{card.respuesta}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs uppercase font-bold text-purple-500 mb-3">Pregunta {index + 1}</span>
                                                    <p className="font-bold text-lg">{card.pregunta}</p>
                                                    <span className="mt-4 text-xs text-slate-400">Toca para revelar</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {/* BOTÓN PARA GUARDAR (Solo visible en modo edición) */}
                    {isEditing && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSaveFlashcards}
                                disabled={isSaving}
                                className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : '💾 Guardar Flashcards'}
                            </button>
                        </div>
                    )}
                </div>
                {/* SECCIÓN DE COMENTARIOS */}
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        💬 Comentarios ({post.comments?.length || 0})
                    </h3>

                    {/* Formulario de Nuevo Comentario */}
                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="Escribe una pregunta, aporte o comentario sobre este apunte..."
                            rows="3"
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                            required
                        ></textarea>
                        {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                            >
                                {processing ? 'Publicando...' : 'Publicar comentario'}
                            </button>
                        </div>
                    </form>

                    {/* Lista de Comentarios */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        {!post.comments || post.comments.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-4">
                                Sé el primero en comentar sobre este apunte.
                            </p>
                        ) : (
                            post.comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4"
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            {comment.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                    {comment.user?.name || 'Estudiante'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botón borrar (Solo visible para el dueño del comentario) */}
                                    {comment.user_id === auth.user.id && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-slate-400 hover:text-red-500 text-xs transition-colors p-1"
                                            title="Eliminar comentario"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}