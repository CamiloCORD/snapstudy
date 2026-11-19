# 📚 SnapStudy

<p align="center">
  <a href="https://www.snapstudy.cloud/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Demo_en_Producción-https%3A%2F%2Fwww.snapstudy.cloud-7C3AED?style=for-the-badge&logo=googlechrome&logoColor=white" alt="SnapStudy en Vivo">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/Inertia.js-v2.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js v2">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Google_Gemini-3.1_Flash--Lite-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini API">
  <img src="https://img.shields.io/badge/KaTeX-LaTeX_Math-3298DC?style=for-the-badge&logo=latex&logoColor=white" alt="KaTeX Math">
  <img src="https://img.shields.io/badge/Pest_PHP-v3.x-9E66FF?style=for-the-badge&logo=pest&logoColor=white" alt="Pest PHP">
</p>

---

> 🌐 **Plataforma en Producción Activa:**  
> Puedes acceder y probar la aplicación desplegada en vivo en su dominio oficial:  
> 👉 **[https://www.snapstudy.cloud/](https://www.snapstudy.cloud/)**  
> *(Alojada en un servidor VPS Linux con proxy inverso Nginx, HTTP/2, certificados SSL/TLS de Let's Encrypt y base de datos relacional transaccional).*

---

## 💡 Acerca de SnapStudy

**SnapStudy** es una plataforma educativa integral impulsada por inteligencia artificial diseñada para transformar la experiencia de estudio de estudiantes escolares y universitarios. 

Permite capturar o recortar fotografías de apuntes manuscritos en cuadernos físicos, transcribirlos y estructurarlos automáticamente en **Markdown** enriquecido mediante la API multimodal de **Google Gemini** (`gemini-3.1-flash-lite`), generar cuestionarios didácticos de **Flashcards** interactivas y personalizar las recomendaciones de estudio según el modelo cognitivo **VARK** (*Visual, Auditivo, Lectoescritura, Kinestésico*).

---

## ✨ Características Principales

- 📸 **Digitalización & OCR Inteligente con Visión Multimodal**: Carga o recorte de fotografías de notas físicas con `react-cropper`, procesadas directamente mediante la API de Google Gemini (`inline_data` Base64) para transcribir títulos temáticos y contenido estructurado en Markdown.
- 🧠 **Generación Asistida de Flashcards**: Creación automática de tarjetas didácticas de repaso (pregunta y respuesta) respaldadas por salidas estructuradas estrictas con JSON Schema (`responseSchema`).
- 🎯 **Diagnóstico de Estilo de Aprendizaje (VARK)**: Cuestionario interactivo de onboarding que identifica el perfil cognitivo del usuario (*Visual, Auditivo, Lectoescritura o Kinestésico*) para adaptar la pedagogía de la plataforma.
- 🌐 **Comunidad y Explorador Social**: Descubrimiento y filtrado de apuntes públicos por materia o palabras clave, permitiendo interactuar mediante comentarios y guardar apuntes de otros estudiantes (*forks*).
- 📊 **Panel de Estudio y Métricas**: Dashboard personal con métricas de actividad, historial de apuntes creados, guardados y contador de racha de estudio.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Backend** | PHP 8.2+, Laravel 12 | Enrutamiento web, controladores delgados, form requests, policies y migraciones. |
| **Frontend** | React 18, Inertia.js v2, Vite 7 | SPA moderna monolítica sin API REST desacoplada; reactividad fluida vía `@inertiajs/react`. |
| **Estilos & UI** | Tailwind CSS, Headless UI, Heroicons | Diseño responsivo, tema oscuro/claro y micro-interacciones. |
| **Herramientas Cliente** | `react-cropper`, `axios`, `ziggy-js` | Recorte interactivo de imágenes y resolución de rutas dinámicas de Laravel. |
| **Inteligencia Artificial** | Google Gemini API (`gemini-3.1-flash-lite`) | Extracción OCR multimodal de visión y generación de respuestas estructuradas vía `generateContent`. |
| **Persistencia** | SQLite (desarrollo local) / PostgreSQL (producción) | Modelos Eloquent: `User`, `Post`, `Flashcard`, `Comment`, `Interaction`, `Subject`. |
| **Testing & Calidad** | Pest PHP v3, PHPUnit, Laravel Pint | Pruebas de integración, verificación de policies, mocks de IA y formato PSR-12. |

---

## 📋 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu entorno local:

- **PHP** >= 8.2 (con extensiones `curl`, `mbstring`, `openssl`, `pdo`, `sqlite3` / `pgsql`, `fileinfo`)
- **Composer** >= 2.x
- **Node.js** >= 18.x & **NPM** >= 9.x
- **Google Gemini API Key** (obtenible gratuitamente en [Google AI Studio](https://aistudio.google.com/))

---

## 🚀 Guía de Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/CamiloCORD/snapstudy.git
cd snapstudy
```

### 2. Instalar dependencias de PHP y JavaScript
```bash
composer install
npm install
```

### 3. Configurar las variables de entorno
Copia la plantilla de entorno y genera la clave de aplicación de Laravel:
```bash
cp .env.example .env
php artisan key:generate
```

Abre el archivo `.env` y configura tu clave de la API de Google Gemini:
```ini
APP_NAME=SnapStudy
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

GEMINI_API_KEY=tu_api_key_aqui
GEMINI_MODEL=gemini-3.1-flash-lite
```

### 4. Ejecutar migraciones y datos de prueba
Crea la base de datos local y ejecuta las migraciones:
```bash
# Si utilizas SQLite, crea el archivo de base de datos si no existe:
touch database/database.sqlite

# Ejecutar migraciones y seeders
php artisan migrate --seed
```

### 5. Enlazar almacenamiento de archivos
```bash
php artisan storage:link
```

### 6. Iniciar el entorno de desarrollo
Puedes iniciar los servidores concurrentemente con Composer:
```bash
composer run dev
```

O en terminales independientes:
```bash
# Terminal 1 - Servidor backend
php artisan serve

# Terminal 2 - Compilador de assets Vite
npm run dev
```

Visita `http://localhost:8000` en tu navegador.

---

## 🧪 Pruebas Automatizadas y Calidad de Código

SnapStudy cuenta con una suite completa de pruebas automatizadas con **Pest PHP** que cubre autenticación, extracción OCR con mocks deterministas de Gemini, generación de flashcards y políticas de autorización:

```bash
# Ejecutar todas las pruebas con Pest
php artisan test

# O directamente mediante el binario de Pest:
./vendor/bin/pest

# Verificar y aplicar formato de código PSR-12 con Laravel Pint:
./vendor/bin/pint
```

---

## 📂 Arquitectura del Proyecto

```plaintext
snapstudy/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AdminController.php      # Panel de moderación preventiva y auditoría de IA (CU20, CU21)
│   │   │   ├── CommentController.php    # Creación y eliminación de comentarios protegida por Policy
│   │   │   ├── OnboardingController.php # Diagnóstico cognitivo VARK
│   │   │   ├── PostController.php       # Controlador de apuntes, OCR y generación de flashcards
│   │   │   ├── ProfileController.php    # Perfil y cuenta de usuario
│   │   │   └── ReportController.php     # Gestión de denuncias comunitarias (CU19)
│   │   ├── Middleware/
│   │   │   └── EnsureUserIsAdmin.php    # Control de acceso exclusivo para rol 'admin'
│   │   └── Requests/                    # Form Requests dedicados (StorePost, ExtractOcr, Moderate, etc.)
│   ├── Models/
│   │   ├── AiUsageLog.php               # Métricas de consumo de tokens y latencia de IA
│   │   ├── Comment.php                  # Comentarios en apuntes
│   │   ├── Flashcard.php                # Tarjetas pedagógicas generadas
│   │   ├── Post.php                     # Modelo central de apuntes con scopes de moderación
│   │   ├── Report.php                   # Reportes comunitarios de moderación
│   │   └── User.php                     # Usuario con rol ('student'/'admin') y estilo VARK
│   ├── Policies/                        # Autorización granular (PostPolicy, CommentPolicy)
│   └── Services/
│       └── GeminiAiService.php          # Servicio exclusivo de conexión con Google Gemini API
├── database/
│   ├── migrations/                      # Esquemas relacionales de base de datos
│   └── seeders/
│       └── DatabaseSeeder.php           # Usuarios iniciales (Admin y Estudiante de prueba)
├── resources/
│   └── js/
│       ├── Components/                  # MarkdownViewer (KaTeX), Cropper, ApplicationLogo, etc.
│       ├── Layouts/                     # Layouts Authenticated y Guest con badge VARK
│       └── Pages/                       # Vistas Inertia (Dashboard, Explore, Admin, Posts)
├── routes/
│   ├── auth.php                         # Rutas de autenticación Breeze
│   └── web.php                          # Rutas web de la aplicación y endpoints de Inertia
└── tests/
    ├── Feature/                         # Pruebas de integración (GeminiAiTest, AdminAccessTest, etc.)
    └── Unit/                            # Pruebas unitarias
```

---

## 📖 Documentación del Sistema

Para consultar las especificaciones completas de arquitectura, diccionario de datos y guías de uso, revisa los siguientes manuales disponibles en la raíz del repositorio:

- 📘 **[Manual Técnico del Sistema (MANUAL_TECNICO.md)](MANUAL_TECNICO.md)**: Arquitectura por capas, diagramas Mermaid, catálogo de endpoints, diccionario completo de tablas de base de datos, motor VARK y guía de despliegue en servidor VPS (`https://www.snapstudy.cloud`).
- 📗 **[Manual de Usuario (Manual_de_Usuario_SnapStudy.docx)](Manual_de_Usuario_SnapStudy.docx)**: Guía ilustrada paso a paso para estudiantes y administradores con capturas de pantalla de cada módulo.

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia [MIT](LICENSE).
