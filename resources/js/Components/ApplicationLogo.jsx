export default function ApplicationLogo({ className = 'h-9 w-9', showText = false, textClassName = 'text-xl' }) {
    return (
        <div className="inline-flex items-center gap-2.5 font-sans select-none">
            <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <defs>
                    <linearGradient id="snapstudy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="50%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDE047" />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Base Squircle con gradiente */}
                <rect
                    x="2"
                    y="2"
                    width="44"
                    height="44"
                    rx="12"
                    fill="url(#snapstudy-grad)"
                    filter="url(#glow)"
                />

                {/* Contorno interno brillante */}
                <rect
                    x="2.5"
                    y="2.5"
                    width="43"
                    height="43"
                    rx="11.5"
                    stroke="white"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                />

                {/* Cuaderno / Apunte abierto */}
                <path
                    d="M13 14C13 12.8954 13.8954 12 15 12H31C32.1046 12 33 12.8954 33 14V34C33 35.1046 32.1046 36 31 36H15C13.8954 36 13 35.1046 13 34V14Z"
                    fill="white"
                    fillOpacity="0.95"
                />

                {/* Marcador / Lomo del cuaderno */}
                <rect x="13" y="12" width="3.5" height="24" rx="1.5" fill="#DDD6FE" />

                {/* Líneas de notas */}
                <rect x="19" y="17" width="10" height="2" rx="1" fill="#8B5CF6" />
                <rect x="19" y="22" width="8" height="2" rx="1" fill="#A78BFA" />
                <rect x="19" y="27" width="6" height="2" rx="1" fill="#C4B5FD" />

                {/* Destello de cámara / Escaneo inteligente (Snap Sparkle) */}
                <path
                    d="M33 12C33 15 36 17 38 18C36 19 33 21 33 24C33 21 30 19 28 18C30 17 33 15 33 12Z"
                    fill="url(#sparkle-grad)"
                />
                <circle cx="33" cy="18" r="1.2" fill="#FFFFFF" />
            </svg>

            {showText && (
                <div className="flex items-center tracking-tight">
                    <span className={`font-black text-slate-800 dark:text-white ${textClassName}`}>
                        Snap
                    </span>
                    <span className={`font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent ${textClassName}`}>
                        Study
                    </span>
                    <span className="ms-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                        AI
                    </span>
                </div>
            )}
        </div>
    );
}
