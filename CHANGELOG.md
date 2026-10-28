# Changelog — SnapStudy

Todos los cambios notables de este proyecto estarán documentados en este archivo.

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


