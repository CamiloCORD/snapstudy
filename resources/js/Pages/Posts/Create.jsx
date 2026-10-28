import { useState, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MarkdownViewer from '@/Components/MarkdownViewer';
import axios from 'axios';

// 1. Importamos el Cropper y sus estilos CSS
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const SUBJECT_OPTIONS = [
    { name: 'Matemáticas', emoji: '📐' },
    { name: 'Programación', emoji: '💻' },
    { name: 'Historia', emoji: '📚' },
    { name: 'Biología', emoji: '🧬' },
    { name: 'Idiomas', emoji: '🗣️' },
    { name: 'General', emoji: '📌' },
];

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        subject: 'General',
        content: '',
        image: null,
        is_public: true,
    });

    const [isExtracting, setIsExtracting] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [contentTab, setContentTab] = useState('edit'); // 'edit' | 'preview'
    
    // Estados para el editor de imágenes
    const [imageSrc, setImageSrc] = useState(null); // Imagen original para editar
    const [imagePreview, setImagePreview] = useState(null); // Imagen previsualizada (recortada o normal)
    const [isEditing, setIsEditing] = useState(false); // ¿Está abierto el editor?
    const cropperRef = useRef(null); // Referencia al componente del editor

    // Cuando el usuario selecciona un archivo de su PC o cámara
    const handleImageChange = (e) => {
        try {
            setScanError(null);
            const file = e.target.files[0];
            if (file) {
                // Asignamos el archivo inmediatamente al formulario y a la previsualización
                setData('image', file);
                setImagePreview(URL.createObjectURL(file));

                const reader = new FileReader();
                reader.onload = () => {
                    setImageSrc(reader.result);
                    setIsEditing(true); // Abrimos el modo de edición / recorte
                };
                reader.onerror = (error) => {
                    console.error('Error al leer la imagen:', error);
                    setScanError('No se pudo leer el archivo seleccionado. Intenta con otra imagen.');
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error inesperado al seleccionar la imagen:', error);
            setScanError('Ocurrió un error al procesar la imagen.');
        }
    };

    // Función para confirmar el recorte
    const handleCropSave = () => {
        const cropper = cropperRef.current?.cropper;
        if (typeof cropper !== 'undefined') {
            // Obtenemos el recorte y lo convertimos a un archivo (Blob)
            cropper.getCroppedCanvas({
                maxWidth: 1920,
                maxHeight: 1080,
            }).toBlob((blob) => {
                // Creamos un nuevo archivo a partir del recorte para enviarlo a Laravel
                const croppedFile = new File([blob], "apunte_recortado.jpg", { type: "image/jpeg" });
                
                setData('image', croppedFile); // Guardamos para el formulario
                setImagePreview(URL.createObjectURL(croppedFile)); // Guardamos para la vista previa
                setIsEditing(false); // Cerramos el editor
            }, 'image/jpeg', 0.8);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('posts.store'));
    };

    const handleExtractText = async () => {
        if (!data.image) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append('image', data.image); // Enviamos la imagen YA RECORTADA

        try {
            const response = await axios.post(route('posts.extract'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setData(current => ({
                    ...current,
                    title: response.data.title || current.title,
                    content: response.data.content || current.content,
                }));
            }
        } catch (error) {
            console.error('Error al extraer texto con IA:', error);
            const serverMessage = error.response?.data?.message;
            alert(serverMessage || 'No se pudo procesar la imagen. Intenta de nuevo.');
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-slate-800 dark:text-white">Nuevo Apunte</h2>
                    <Link href={route('dashboard')} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white">
                        ← Volver al Panel
                    </Link>
                </div>
            }
        >
            <Head title="Nuevo Apunte - SnapStudy" />

            <div className="py-8 font-sans">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* ZONA 1: ZONA MÁGICA DE IMAGEN */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                                📸 Captura y Edición de Apuntes
                            </label>

                            {/* SI ESTAMOS EN MODO EDICIÓN, MOSTRAMOS EL CROPPER */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                        <Cropper
                                            src={imageSrc}
                                            style={{ height: 400, width: '100%' }}
                                            initialAspectRatio={1}
                                            guides={true}
                                            ref={cropperRef}
                                            viewMode={1}
                                            minCropBoxHeight={10}
                                            minCropBoxWidth={10}
                                            background={false}
                                            responsive={true}
                                            autoCropArea={1}
                                            checkOrientation={false} // Importante para fotos de celular
                                        />
                                    </div>
                                    <div className="flex gap-4 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCropSave}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 shadow-lg"
                                        >
                                            ✂️ Confirmar Recorte
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* SI NO ESTAMOS EDITANDO, MOSTRAMOS EL DROPZONE NORMAL */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                    <div className="relative border-2 border-dashed border-purple-200 dark:border-slate-600 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors bg-purple-50/50 dark:bg-slate-900/50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2 text-purple-600">
                                                📥
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                Arrastra tu foto aquí o <span className="text-purple-600 underline">explora</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        {imagePreview ? (
                                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                                <img src={imagePreview} alt="Recortada" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(true)}
                                                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-semibold"
                                                >
                                                    ✏️ Volver a editar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-40 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
                                                Sin imagen seleccionada
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleExtractText}
                                            disabled={isExtracting || !data.image}
                                            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isExtracting ? (
                                                <><span className="animate-spin">🌀</span> Leyendo...</>
                                            ) : (
                                                <>✨ Extraer con IA</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {errors.image && <p className="text-red-500 text-xs mt-2">{errors.image}</p>}
                        </div>

                        {/* ZONA 2: DETALLES DEL APUNTE (Se mantiene igual) */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Materia / Categoría</label>
                                <div className="flex flex-wrap gap-2">
                                    {SUBJECT_OPTIONS.map((item) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => setData('subject', item.name)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                                data.subject === item.name
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                            }`}
                                        >
                                            <span>{item.emoji}</span> {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Título del Apunte</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-purple-500 focus:ring-purple-500 font-medium"
                                />
                            </div>

                            {scanError && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
                                    ⚠️ {scanError}
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                                        Contenido del Apunte
                                    </label>
                                    
                                    {/* Tabs Editor vs Vista Previa Markdown */}
                                    <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-semibold">
                                        <button
                                            type="button"
                                            onClick={() => setContentTab('edit')}
                                            className={`px-3 py-1 rounded-lg transition-all ${
                                                contentTab === 'edit'
                                                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                            }`}
                                        >
                                            ✏️ Editor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setContentTab('preview')}
                                            className={`px-3 py-1 rounded-lg transition-all ${
                                                contentTab === 'preview'
                                                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                            }`}
                                        >
                                            👁️ Vista Previa Formato
                                        </button>
                                    </div>
                                </div>

                                {contentTab === 'edit' ? (
                                    <textarea
                                        rows="10"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Escribe aquí o extrae el texto automáticamente desde tu foto con el botón '✨ Extraer con IA'..."
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-purple-500 focus:ring-purple-500 font-sans leading-relaxed"
                                    ></textarea>
                                ) : (
                                    <div className="min-h-[250px] p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 overflow-y-auto">
                                        <MarkdownViewer content={data.content || '*Aún no hay contenido para previsualizar. Escribe algo o extrae el texto de una foto.*'} />
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="flex justify-end gap-4">
                            <button type="submit" disabled={processing} className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">
                                Guardar Apunte 🚀
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}