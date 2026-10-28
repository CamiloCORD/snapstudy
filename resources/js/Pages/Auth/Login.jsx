import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
            <Head title="Iniciar Sesión" />

            {/* Decoración de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-400/20 dark:bg-pink-900/20 rounded-full blur-3xl"></div>

            {/* Tarjeta de Login */}
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 relative z-10">
                
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-purple-600 p-2 rounded-xl shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            Snap<span className="text-purple-600 dark:text-purple-400">Study</span>
                        </span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">¡Hola de nuevo! 👋</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ingresa para continuar con tus apuntes.</p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            autoComplete="username"
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Contraseña</label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            autoComplete="current-password"
                            required
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-purple-600 shadow-sm focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900/50"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                            Mantener sesión iniciada
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-600/30 disabled:opacity-75"
                    >
                        Ingresar
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    ¿Aún no tienes cuenta?{' '}
                    <Link href={route('register')} className="font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400">
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}