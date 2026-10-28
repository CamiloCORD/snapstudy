# Changelog — SnapStudy

Todos los cambios notables de este proyecto estarán documentados en este archivo.

## [Fase 2] - 2026-10-28
### Rediseño de Navegación, Soporte de LaTeX / Markdown Enriquecido, Mejoras en Flashcards y Solución de Imágenes

#### Añadido
- **Identidad de Marca SnapStudy (`resources/js/Components/ApplicationLogo.jsx`)**: Logotipo propio vectorial con isotipo (cuaderno de notas + destello IA) y tipografía de marca `SnapStudy AI`.
- **Renderizador de Markdown y Fórmulas LaTeX (`resources/js/Components/MarkdownViewer.jsx`)**:
  - Procesamiento enriquecido de Markdown usando `react-markdown` y `remark-gfm`.
  - Soporte matemático y científico completo para fórmulas en bloque (`$$...$$`) y en línea (`$...$`) con `remark-math`, `rehype-katex` y `katex`.
  - Bloques de código con cabecera de lenguaje, formato monoespaciado y botón interactivo para copiar con confirmación visual.
  - Citas, tablas responsive y tipografía estructurada para lectura académica.
- **Utilidad de Limpieza de Texto (`resources/js/Utils/text.js`)**:
  - Función `stripMarkdown(content)` para limpiar símbolos de formato (`#`, `**`, `$$`, viñetas, enlaces) en snippets y tarjetas de vista previa.
- **Pestaña de Previsualización en Creación (`resources/js/Pages/Posts/Create.jsx`)**: Selector de pestañas `[ ✏️ Editor ]` y `[ 👁️ Vista Previa Formato ]` para inspeccionar el texto extraído por la IA antes de guardarlo.
- **Botones Interactivos en Flashcards (`resources/js/Pages/Posts/Show.jsx`)**:
  - Botón explícito `[ 👁️ Mostrar Respuesta ]` y `[ 🔄 Ocultar Respuesta ]` en cada tarjeta de estudio.
  - Botón global `[ 👁️ Revelar todas ]` / `[ 🙈 Ocultar todas ]` para alternar la visualización de todas las tarjetas.
  - Integración de `MarkdownViewer` en preguntas y respuestas para renderizar fórmulas matemáticas en las tarjetas.
- **Acceso Directo y Seguro a Imágenes (`app/Models/Post.php`)**: Accessor `image_url` en el modelo Eloquent para resolver la ruta absoluta mediante `Storage::disk('public')->url()`.
- **Fallback Visual para Imágenes (`resources/js/Pages/Explore.jsx` y `Show.jsx`)**: Placeholders elegantes con diseño de cuaderno e icono para evitar mostrar el icono roto nativo del navegador ante fallas de carga o 404.

#### Modificado
- **Barra de Navegación Superior (`resources/js/Layouts/AuthenticatedLayout.jsx`)**:
  - Reemplazo del logo genérico de Laravel por el logo propio de SnapStudy con enlace a `route('dashboard')`.
  - División de la barra en tres zonas: Marca/VARK (izquierda), Navegación Dashboard/Explorar (centro) y Botón CTA "+ Nuevo Apunte" con menú de usuario y avatar (derecha).
  - Menú móvil colapsable adaptado con todas las opciones y accesos rápidos.
  - Estilos de píldora activa en `NavLink.jsx` y `ResponsiveNavLink.jsx`.
- **Estilo Unificado en Invitados (`GuestLayout.jsx` y `Welcome.jsx`)**: Integración del nuevo `ApplicationLogo` con tipografía de marca.
- **Prompt de Gemini OCR (`app/Services/GeminiAiService.php`)**: Se instruye explícitamente a Gemini para transcribir fórmulas matemáticas y científicas en notación LaTeX estándar (`$$...$$` y `$...$`).
- **Limpieza de Snippets y Previsualizaciones (`resources/js/Pages/Explore.jsx` y `Dashboard.jsx`)**: Integración completa de la utilidad `stripMarkdown` para asegurar que las tarjetas de exploración comunitaria y del dashboard de estudio muestren resúmenes en texto plano limpio, purgando por completo caracteres de encabezados (`#`), formato en negrita (`**`), fórmulas (`$$`), enlaces, viñetas y bloques de código.
- **Configuración de Entorno (`.env.example` y `.env`)**:
  - Base de datos local SQLite configurada por defecto (`DB_CONNECTION=sqlite`) para ejecución instantánea sin dependencias externas.
  - Documentación completa del Connection Pooler de Supabase en AWS `us-east-1` (`aws-0-us-east-1.pooler.supabase.com`) con compatibilidad IPv4 y SSL requerido.
- **Configuración de Testing (`phpunit.xml`)**: Añadida clave dummy `GEMINI_API_KEY` para ejecución offline de la suite de pruebas Pest.

#### Mantenimiento y Base de Datos
- **Purga y Reconstrucción de Base de Datos**: Ejecución de `php artisan migrate:fresh` para limpiar la base de datos por completo y restablecer todas las tablas desde cero de forma limpia y consistente (tanto en esquema local SQLite como en Supabase PostgreSQL).

## [Fase 1] - 2026-10-27
### Refactorización Arquitectónica: Migración a Google Gemini y Limpieza Backend

#### Añadido
- **`app/Services/GeminiAiService.php`**: Servicio dedicado para la integración nativa con Google Gemini API (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`). Incluye `extractTextFromImage` (con `inline_data` Base64 y JSON schema estructurado de título y contenido en Markdown) y `generateFlashcards` (con schema estricto de tarjetas pedagógicas).
- **Form Requests dedicados**:
  - `app/Http/Requests/StorePostRequest.php`
  - `app/Http/Requests/UpdatePostRequest.php`
  - `app/Http/Requests/ExtractOcrRequest.php`
  - `app/Http/Requests/StoreFlashcardsRequest.php`
  - `app/Http/Requests/StoreCommentRequest.php`
- **Políticas de Autorización (Policies)**:
  - `app/Policies/PostPolicy.php`
  - `app/Policies/CommentPolicy.php`
- **Model Factories**:
  - `database/factories/PostFactory.php`
  - `database/factories/CommentFactory.php`
- **Suites de Pruebas con Pest**:
  - `tests/Feature/GeminiAiTest.php`: Cobertura completa de extracción OCR exitosa, manejo de errores 500 y 429 de la API de Gemini, generación y guardado de flashcards.
  - `tests/Feature/PostPolicyTest.php`: Cobertura de validaciones de Form Requests y autorizaciones de edición/eliminación de posts y comentarios.

#### Modificado
- **`config/services.php`**: Eliminadas configuraciones de `openrouter` y `groq`. Formalizado el servicio `gemini` (`api_key`, `model`, `endpoint`).
- **`.env.example`** y **`.env`**: Configurado exclusivamente `GEMINI_API_KEY` y `GEMINI_MODEL=gemini-2.5-flash`.
- **`app/Http/Controllers/PostController.php`**: Adelgazado completamente mediante inyección de dependencias de `GeminiAiService`, soporte dual para `UploadedFile` y Base64 en `extractText`, uso de Form Requests y formalización de autorización mediante Policies (`$this->authorize()`).
- **`app/Services/GeminiAiService.php`**: Soporte de deshabilitación de verificación SSL (`withoutVerifying()`) en entornos locales para solventar `cURL error 60`, y sanitización de prefijos `data:image/...;base64,`.
- **`app/Http/Requests/ExtractOcrRequest.php`**: Validación flexible que acepta tanto archivos binarios (`file|image`) como cadenas Base64.
- **`resources/js/Pages/Posts/Create.jsx`**: Mensajes de error claros provenientes de la respuesta del backend en Axios en lugar de alertas genéricas.
- **`app/Http/Controllers/CommentController.php`**: Refactorizado para usar `StoreCommentRequest` y `$this->authorize('delete', $comment)`.
- **`app/Http/Controllers/Controller.php`**: Incorporado el trait `AuthorizesRequests`.
- **`app/Providers/AppServiceProvider.php`**: Definición de patrones globales `Route::pattern` para `post` y `comment` (`[0-9]+`), previniendo colisiones de tipo bigint en PostgreSQL.
- **`routes/web.php`**: Definida la ruta `GET /posts/extract-text` antes de `/posts/{post}` y aplicada la restricción `Route::whereNumber('post')` para evitar errores `SQLSTATE[22P02]`.
- **`app/Models/Subject.php`**: Eliminada relación huérfana con el modelo extinto `Note`.
- **`AGENTS.md`**: Actualizado reflejando Google Gemini como proveedor único de IA, nuevas reglas de arquitectura Laravel 12 + Inertia v2, Form Requests, Policies y ejemplos de mocks para Pest.

#### Eliminado
- **`app/Models/Note.php`**: Eliminado por tratarse de código muerto en desuso, consolidando a `Post.php` como el único modelo de persistencia para apuntes.
- Dependencias lógicas y menciones residuales de OpenRouter y Groq.


