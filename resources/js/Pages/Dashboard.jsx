import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ auth, stats, recentPosts, savedPosts = [] }) {
    const [activeTab, setActiveTab] = useState('my-posts');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard - SnapStudy" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                
                {/* SALUDO Y BIENVENIDA */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                            Estilo: {auth.user.learning_style || 'General'}
                        </span>
                        <h1 className="text-3xl font-black mb-1">¡Hola, {auth.user.name}! 👋</h1>
                        <p className="text-purple-100 text-sm md:text-base">
                            Sigue convirtiendo tus apuntes en flashcards y acelerando tu aprendizaje.
                        </p>
                    </div>

                    <div className="flex gap-3 relative z-10 w-full md:w-auto">
                        <Link
                            href={route('posts.create')}
                            className="w-full md:w-auto px-5 py-3 bg-white text-purple-700 font-bold rounded-2xl shadow-lg hover:bg-purple-50 transition-all text-center text-sm"
                        >
                            + Crear Apunte
                        </Link>
                        <Link
                            href={route('explore')}
                            className="w-full md:w-auto px-5 py-3 bg-purple-700/50 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all text-center text-sm backdrop-blur-sm border border-purple-400/30"
                        >
                            🔍 Explorar Feed
                        </Link>
                    </div>
                </div>

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mis Apuntes */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mis Apuntes</p>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white">{stats.created_posts}</h2>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-xl">
                            📝
                        </div>
                    </div>

                    {/* Apuntes Guardados */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Guardados de Comunidad</p>
                            <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.saved_posts}</h2>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center text-xl">
                            🔖
                        </div>
                    </div>

                    {/* Racha */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Racha Activa</p>
                            <h2 className="text-3xl font-black text-amber-500">{stats.streak} {stats.streak === 1 ? 'Día' : 'Días'} 🔥</h2>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center text-xl">
                            ⚡
                        </div>
                    </div>
                </div>

                {/* SECCIÓN PRINCIPAL CON PESTAÑAS */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                    
                    {/* Navegación por pestañas */}
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('my-posts')}
                                className={`font-bold text-sm md:text-base pb-2 relative transition-colors ${
                                    activeTab === 'my-posts'
                                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            >
                                📝 Mis Apuntes Recientes ({recentPosts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('saved-posts')}
                                className={`font-bold text-sm md:text-base pb-2 relative transition-colors ${
                                    activeTab === 'saved-posts'
                                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            >
                                🔖 Guardados ({savedPosts.length})
                            </button>
                        </div>

                        {activeTab === 'saved-posts' ? (
                            <Link href={route('explore')} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                                Ir al Feed →
                            </Link>
                        ) : (
                            <Link href={route('posts.create')} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                                + Nuevo Apunte
                            </Link>
                        )}
                    </div>

                    {/* CONTENIDO PESTAÑA 1: MIS APUNTES */}
                    {activeTab === 'my-posts' && (
                        <div>
                            {recentPosts.length === 0 ? (
                                <div className="text-center py-10 space-y-3">
                                    <div className="text-5xl">📄</div>
                                    <p className="text-slate-500 font-medium text-sm">Aún no has creado ningún apunte.</p>
                                    <Link
                                        href={route('posts.create')}
                                        className="inline-block px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700"
                                    >
                                        Crear mi primer apunte
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recentPosts.map((post) => (
                                        <div key={post.id} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-slate-800">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                                                    {post.subject || 'General'}
                                                </span>
                                                <h4 className="font-bold text-slate-800 dark:text-white mt-2 mb-1 line-clamp-1">{post.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                                    {post.content ? post.content.replace(/[#*`_~]/g, '') : ''}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800 pt-3">
                                                <span className="text-xs text-slate-400 font-medium">🎴 {post.flashcards_count || 0} Tarjetas</span>
                                                <Link href={route('posts.show', post.id)} className="text-xs font-bold text-purple-600 hover:underline">
                                                    Estudiar →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CONTENIDO PESTAÑA 2: APUNTES GUARDADOS */}
                    {activeTab === 'saved-posts' && (
                        <div>
                            {savedPosts.length === 0 ? (
                                <div className="text-center py-10 space-y-3">
                                    <div className="text-5xl">🔖</div>
                                    <p className="text-slate-500 font-medium text-sm">Aún no has guardado ningún apunte de la comunidad.</p>
                                    <Link
                                        href={route('explore')}
                                        className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                                    >
                                        Explorar la Comunidad
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {savedPosts.map((post) => (
                                        <div key={post.id} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-slate-800">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                                        {post.subject || 'General'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Por: {post.user?.name || 'Estudiante'}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{post.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                                    {post.content ? post.content.replace(/[#*`_~]/g, '') : ''}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-800 pt-3">
                                                <span className="text-xs text-slate-400 font-medium">🎴 {post.flashcards_count || 0} Tarjetas</span>
                                                <Link href={route('posts.show', post.id)} className="text-xs font-bold text-purple-600 hover:underline">
                                                    Estudiar →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}