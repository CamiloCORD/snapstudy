import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const LEARNING_STYLE_EMOJIS = {
    Visual: '👁️',
    Auditivo: '🎧',
    Lectoescritura: '📖',
    Kinestésico: '🖐️',
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const styleEmoji = user?.learning_style ? (LEARNING_STYLE_EMOJIS[user.learning_style] || '🎓') : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 antialiased">
            {/* Barra de navegación superior sticky con glassmorphism */}
            <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        
                        {/* ZONA 1: LOGO E IDENTIDAD DE MARCA */}
                        <div className="flex items-center gap-8">
                            <Link href={route('dashboard')} className="flex items-center gap-2 group transition-transform">
                                <ApplicationLogo className="h-9 w-9 group-hover:scale-105 transition-transform" showText={true} textClassName="text-xl" />
                            </Link>

                            {/* Badge sutil del estilo cognitivo del estudiante */}
                            {user?.learning_style && (
                                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                                    <span>{styleEmoji}</span>
                                    <span>Estilo {user.learning_style}</span>
                                </span>
                            )}

                            {/* ZONA 2: NAVEGACIÓN PRINCIPAL (ESCRITORIO) */}
                            <div className="hidden space-x-2 sm:flex sm:items-center">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="px-3 py-2 text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard
                                </NavLink>

                                <NavLink
                                    href={route('explore')}
                                    active={route().current('explore')}
                                    className="px-3 py-2 text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Explorar
                                </NavLink>
                            </div>
                        </div>

                        {/* ZONA 3: ACCIONES RÁPIDAS & PERFIL DE USUARIO */}
                        <div className="hidden sm:flex sm:items-center sm:gap-4">
                            
                            {/* CTA Primario: Nuevo Apunte / Digitalizar con IA */}
                            <Link
                                href={route('posts.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Nuevo Apunte</span>
                            </Link>

                            {/* Dropdown de Usuario con Avatar */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all focus:outline-none"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                                                {user.name}
                                            </span>
                                            <svg
                                                className="h-4 w-4 text-slate-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="py-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 w-56">
                                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-xs font-medium text-slate-400">Conectado como</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2">
                                            <span>👤</span> Mi Perfil
                                        </Dropdown.Link>
                                        
                                        <Dropdown.Link href={route('onboarding.show')} className="flex items-center gap-2">
                                            <span>🧠</span> Test VARK ({user.learning_style || 'Pendiente'})
                                        </Dropdown.Link>

                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-red-600 dark:text-red-400 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <span>🚪</span> Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* BOTÓN HAMBURGUESA (MÓVIL) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MENÚ DESPLEGABLE MÓVIL */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-4 space-y-3'}>
                    {/* Botón CTA en Móvil */}
                    <Link
                        href={route('posts.create')}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>+ Nuevo Apunte</span>
                    </Link>

                    <div className="space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            📊 Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('explore')} active={route().current('explore')}>
                            🔍 Explorar Apuntes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('onboarding.show')} active={route().current('onboarding.show')}>
                            🧠 Estilo de Aprendizaje: {user.learning_style || 'Completar'}
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                        <div className="flex items-center gap-3 px-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                👤 Mi Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-red-600 dark:text-red-400">
                                🚪 Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
