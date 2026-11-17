import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MarkdownViewer from '@/Components/MarkdownViewer';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Componente auxiliar para previsualizar la imagen del apunte o mostrar un placeholder sobrio.
 */
function PostMediaPreview({ imageUrl, title, onInspect }) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <div
                onClick={() => onInspect({ url: imageUrl, title })}
                className="relative w-full sm:w-48 h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 cursor-pointer group shrink-0 flex items-center justify-center shadow-sm"
                title="Haga clic para ampliar la imagen"
            >
                <img
                    src={imageUrl}
                    alt={title || 'Imagen del apunte'}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-2 text-center backdrop-blur-[2px]">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span className="text-xs font-semibold">Ampliar imagen</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full sm:w-48 h-44 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center p-3 shrink-0">
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Sin imagen adjunta
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Apunte textual
            </span>
        </div>
    );
}

export default function Moderation({ auth, pendingPosts = [], reports = [], initialTab = 'pending' }) {
    const [activeTab, setActiveTab] = useState(initialTab); // 'pending' | 'reports'
    const [inspectImage, setInspectImage] = useState(null); // { url, title }

    const handleModeratePost = (postId, action) => {
        router.post(route('admin.posts.moderate', postId), {
            action,
            moderation_notes: action === 'approve' ? 'Aprobado por el administrador.' : 'Ocultado por el administrador.',
        }, {
            preserveScroll: true,
        });
    };

    const handleResolveReport = (reportId, action) => {
        router.post(route('admin.reports.resolve', reportId), {
            action,
            notes: action === 'accept' ? 'Reporte aceptado y apunte retirado.' : 'Reporte desestimado.',
        }, {
            preserveScroll: true,
        });
    };

    const formatReason = (reason) => {
        const labels = {
            contenido_inapropiado: 'Contenido inapropiado',
            plagio: 'Posible plagio',
            spam: 'Spam o publicidad',
            otro: 'Otro motivo',
        };
        return labels[reason] || reason;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Panel de Moderacion - Administracion" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Cabecera */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 mb-2">
                            <span>Administracion</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Centro de Moderacion y Calidad
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Revision preventiva de contenidos clasificados por IA y resolucion de denuncias de la comunidad.
                        </p>
                    </div>

                    {/* Selector de Pestanas */}
                    <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === 'pending'
                                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Revision Preventiva ({pendingPosts.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('reports')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === 'reports'
                                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Reportes Comunitarios ({reports.length})
                        </button>
                    </div>
                </div>

                {/* Pestana 1: Apuntes en Revision Preventiva de IA */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {pendingPosts.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                    Bandeja limpia
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    No hay apuntes pendientes de revision preventiva en este momento.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {pendingPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/40 shadow-sm space-y-4"
                                    >
                                        {/* Barra superior de estado y acciones */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                                        Revision Preventiva
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Materia: <strong className="text-slate-700 dark:text-slate-200">{post.subject || 'General'}</strong>
                                                    </span>
                                                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Autor: <strong className="text-slate-700 dark:text-slate-200">{post.user?.name || 'Estudiante'}</strong> ({post.user?.email})
                                                    </span>
                                                    {post.flashcards_count > 0 && (
                                                        <>
                                                            <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                                                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                                {post.flashcards_count} flashcards
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {post.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link
                                                    href={route('posts.show', post.id)}
                                                    target="_blank"
                                                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <span>Ver apunte</span>
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleModeratePost(post.id, 'approve')}
                                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Aprobar apunte</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleModeratePost(post.id, 'hide')}
                                                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    <span>Ocultar apunte</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Nota u observacion del clasificador IA */}
                                        {post.moderation_notes && (
                                            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/50 flex items-start gap-2.5">
                                                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div>
                                                    <strong className="font-bold">Observacion del clasificador: </strong>
                                                    <span>{post.moderation_notes}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contenido multimedia y texto */}
                                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                                            <PostMediaPreview
                                                imageUrl={post.image_url}
                                                title={post.title}
                                                onInspect={setInspectImage}
                                            />

                                            <div className="flex-1 w-full min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                        Contenido del apunte
                                                    </h4>
                                                </div>
                                                <div className="max-h-56 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/80 text-sm">
                                                    <MarkdownViewer content={post.content} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pestana 2: Reportes Comunitarios */}
                {activeTab === 'reports' && (
                    <div className="space-y-4">
                        {reports.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                    Sin denuncias pendientes
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    No hay reportes de la comunidad sin resolver en este momento.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                                                        {formatReason(report.reason)}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Reportado por: <strong className="text-slate-700 dark:text-slate-200">{report.reporter?.name || 'Estudiante'}</strong> ({report.reporter?.email})
                                                    </span>
                                                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Fecha: {new Date(report.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Apunte reportado: {report.post?.title || 'Apunte eliminado o no disponible'}
                                                </h3>
                                                {report.post?.user && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Autor del apunte: <strong className="text-slate-700 dark:text-slate-300">{report.post.user.name}</strong> ({report.post.user.email})
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {report.post && (
                                                    <Link
                                                        href={route('posts.show', report.post.id)}
                                                        target="_blank"
                                                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                    >
                                                        <span>Ver apunte</span>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleResolveReport(report.id, 'accept')}
                                                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Aceptar y ocultar</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleResolveReport(report.id, 'reject')}
                                                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    <span>Desestimar</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Descripcion proporcionada por el estudiante en la denuncia */}
                                        {report.details && (
                                            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                                                <span className="font-bold text-slate-900 dark:text-slate-100">Motivo detallado por el denunciante: </span>
                                                <span>{report.details}</span>
                                            </div>
                                        )}

                                        {/* Visualizacion del contenido del apunte reportado */}
                                        {report.post ? (
                                            <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                                                <PostMediaPreview
                                                    imageUrl={report.post.image_url}
                                                    title={report.post.title}
                                                    onInspect={setInspectImage}
                                                />

                                                <div className="flex-1 w-full min-w-0">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                                        Contenido reportado
                                                    </h4>
                                                    <div className="max-h-48 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/80 text-sm">
                                                        <MarkdownViewer content={report.post.content} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-500 italic">
                                                El apunte asociado a este reporte ya no se encuentra disponible.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Inspeccion de Imagen a Pantalla Completa */}
            {inspectImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setInspectImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera del modal */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 text-white">
                            <div className="truncate pr-4">
                                <h4 className="text-sm font-bold truncate">
                                    {inspectImage.title || 'Inspeccion de apunte'}
                                </h4>
                                <span className="text-xs text-slate-400">
                                    Visualizacion detallada de imagen original
                                </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={inspectImage.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors inline-flex items-center gap-1.5"
                                >
                                    <span>Abrir en pestana</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setInspectImage(null)}
                                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                    title="Cerrar vista previa"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenedor de la imagen */}
                        <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
                            <img
                                src={inspectImage.url}
                                alt={inspectImage.title || 'Imagen original'}
                                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
                            />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
