import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="SnapStudy - Aprende más rápido" />
            
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-500 selection:text-white overflow-hidden">
                
                {/* Navbar */}
                <header className="relative z-10 flex items-center justify-between p-6 w-full max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ApplicationLogo showText={true} className="h-9 w-9 group-hover:scale-105 transition-transform" textClassName="text-2xl" />
                    </Link>

                    <nav className="hidden md:flex justify-end gap-3 font-medium">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-full bg-purple-100 text-purple-700 px-6 py-2.5 hover:bg-purple-200 dark:bg-slate-800 dark:text-purple-400 dark:hover:bg-slate-700 transition"
                            >
                                Ir a mis apuntes
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-full px-6 py-2.5 text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition"
                                >
                                    Ingresar
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-purple-600 px-6 py-2.5 text-white hover:bg-purple-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-purple-600/30"
                                >
                                    Crear cuenta gratis
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Hero Section */}
                <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Textos y Call To Action */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-bold tracking-wide uppercase">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                            La nueva forma de estudiar
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                            Domina tus exámenes en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">tiempo récord.</span>
                        </h1>
                        
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0">
                            Crea flashcards, organiza tus apuntes y ponte a prueba con nuestros cuestionarios inteligentes. Todo lo que necesitas para sacar la máxima nota, en un solo lugar.
                        </p>
                        
                        {!auth.user && (
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link
                                    href={route('register')}
                                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-600/30 hover:-translate-y-1 transition-all"
                                >
                                    Empezar a estudiar
                                </Link>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Totalmente gratis.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Elemento visual (Tarjetas estilo Flashcards) */}
                    <div className="relative w-full max-w-md mx-auto aspect-square hidden md:block">
                        {/* Decoración de fondo */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl opacity-70"></div>
                        
                        {/* Flashcard 1 (Atrás) */}
                        <div className="absolute top-10 right-10 w-64 h-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 rotate-12 p-6 flex flex-col justify-center items-center opacity-80 scale-90">
                            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-600 rounded-full mb-3"></div>
                            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                        </div>

                        {/* Flashcard 2 (Principal) */}
                        <div className="absolute top-20 left-4 w-72 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 -rotate-3 p-6 flex flex-col z-10 transition-transform hover:-translate-y-2 hover:rotate-0 duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Biología</span>
                                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">La Mitocondria</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">¿Cuál es la función principal de este orgánulo celular?</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button className="w-full text-center text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700">Ver respuesta ➔</button>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute bottom-10 right-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-20 animate-bounce" style={{animationDuration: '3s'}}>
                            <div className="bg-green-100 text-green-600 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">¡Racha de 5 días!</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}