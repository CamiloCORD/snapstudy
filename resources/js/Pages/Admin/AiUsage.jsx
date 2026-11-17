import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AiUsage({ auth, metrics, byType = [], recentLogs }) {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('es-CO').format(num || 0);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Auditoria de Uso de IA - Administracion" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Cabecera */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 mb-2">
                        <span>Auditoria Tecnica (RF16)</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Metricas de Consumo y Rendimiento de IA
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Monitoreo en tiempo real de peticiones a Google Gemini API, volumen de tokens y tiempos de respuesta.
                    </p>
                </div>

                {/* Tarjetas de Metricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Solicitudes Totales
                        </span>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {formatNumber(metrics.totalRequests)}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Peticiones registradas
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Tokens Consumidos
                        </span>
                        <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
                            {formatNumber(metrics.totalTokens)}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Tokens de entrada y salida
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Latencia Promedio
                        </span>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {metrics.avgLatency} ms
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Tiempo de respuesta del modelo
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Tasa de Exito
                        </span>
                        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                            {metrics.successRate}%
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            {metrics.errorCount} errores detectados
                        </span>
                    </div>
                </div>

                {/* Desglose por Tipo de Tarea */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Distribucion por Tipo de Solicitud
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {byType.map((item) => (
                            <div
                                key={item.type}
                                className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center"
                            >
                                <div>
                                    <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                                        {item.type === 'ocr' ? 'Extraccion OCR Vision' : 'Generacion Flashcards'}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                                        {formatNumber(item.count)} operaciones
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400 block">Tokens acumulados</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {formatNumber(item.tokens)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabla de Registros Recientes */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            Historial Detallado de Peticiones
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Usuario</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3">Modelo</th>
                                    <th className="px-6 py-3">Tokens</th>
                                    <th className="px-6 py-3">Latencia</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3">Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-300">
                                {recentLogs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                                            No se registran eventos de uso de IA aun.
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="px-6 py-3 font-mono font-medium">#{log.id}</td>
                                            <td className="px-6 py-3 font-medium">
                                                {log.user?.name || 'Sistema'}
                                            </td>
                                            <td className="px-6 py-3 uppercase font-bold text-slate-500">
                                                {log.type}
                                            </td>
                                            <td className="px-6 py-3 font-mono text-slate-400">
                                                {log.model || 'gemini-3.1-flash-lite'}
                                            </td>
                                            <td className="px-6 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                                                {log.tokens_used}
                                            </td>
                                            <td className="px-6 py-3 font-mono">
                                                {log.latency_ms} ms
                                            </td>
                                            <td className="px-6 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        log.status === 'success'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-400 font-mono">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginacion */}
                    {recentLogs.links && recentLogs.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-1">
                            {recentLogs.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                                        link.active
                                            ? 'bg-purple-600 text-white font-bold'
                                            : link.url
                                            ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

