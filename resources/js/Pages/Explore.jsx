import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Explore({ auth, posts, subjects, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('explore'), { search, subject: selectedSubject }, { preserveState: true });
    };

    const handleSubjectChange = (subject) => {
        const newSubject = selectedSubject === subject ? '' : subject;
        setSelectedSubject(newSubject);
        router.get(route('explore'), { search, subject: newSubject }, { preserveState: true });
    };

    const handleSave = (postId) => {
        router.post(route('posts.save', postId), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Explorar Apuntes - SnapStudy" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                {/* ENCABEZADO */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-3xl font-black mb-2">Comunidad SnapStudy 🚀</h1>
                        <p className="text-purple-100 text-sm md:text-base">
                            Explora apuntes compartidos por estudiantes, repasa con sus flashcards generadas por IA y acelera tu aprendizaje.
                        </p>
                    </div>
                </div>

                {/* BUSCADOR Y FILTROS */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">

                    {/* Input de Búsqueda */}
                    <form onSubmit={handleSearch} className="w-full md:w-96 flex gap-2">
                        <input
                            type="text"
                            placeholder="Buscar apuntes o temas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors text-sm"
                        >
                            Buscar
                        </button>
                    </form>

                    {/* Chips de Materias */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button
                            onClick={() => handleSubjectChange('')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedSubject === ''
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            Todas
                        </button>
                        {subjects.map((sub) => (
                            <button
                                key={sub}
                                onClick={() => handleSubjectChange(sub)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedSubject === sub
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FEED DE TARJETAS */}
                {posts.data.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No se encontraron apuntes</h3>
                        <p className="text-slate-500 dark:text-slate-400">Intenta buscar con otros términos o selecciona otra materia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.data.map((post) => (
                            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between">
                                <div>
                                    {/* Imagen */}
                                    <div className="h-40 bg-slate-100 dark:bg-slate-900 relative">
                                        {post.image ? (
                                            <img
                                                src={`/storage/${post.image}`}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                                                Sin portada
                                            </div>
                                        )}
                                        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold text-purple-600 dark:text-purple-400 rounded-lg shadow-sm">
                                            {post.subject || 'General'}
                                        </span>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-5">
                                        {/* Autor */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">
                                                {post.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {post.user?.name || 'Estudiante'}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 line-clamp-1">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                                            {post.content}
                                        </p>
                                    </div>
                                </div>


                                {/* Pie de tarjeta */}
                                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center mt-auto">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-md">
                                            🎴 {post.flashcards_count} Tarjetas
                                        </span>

                                        {/* BOTÓN GUARDAR / DESGUARDAR */}
                                        <button
                                            onClick={() => handleSave(post.id)}
                                            className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${post.is_saved
                                                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                                }`}
                                            title={post.is_saved ? 'Quitar de guardados' : 'Guardar apunte'}
                                        >
                                            {post.is_saved ? '🔖 Guardado' : '📑 Guardar'}
                                        </button>
                                    </div>

                                    <Link
                                        href={route('posts.show', post.id)}
                                        className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
                                    >
                                        Estudiar →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}