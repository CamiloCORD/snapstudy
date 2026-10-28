<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// --- RUTA DEL DASHBOARD CON APUNTES GUARDADOS ---
Route::get('/dashboard', function (Request $request) {
    /** @var User $user */
    $user = $request->user();

    if (is_null($user->learning_style)) {
        return redirect()->route('onboarding.show');
    }

    $stats = [
        'created_posts' => $user->posts()->count(),
        'saved_posts' => $user->savedPosts()->count(),
        'streak' => 1,
    ];

    // Traemos los últimos 3 de cada lista
    $recentPosts = $user->posts()->withCount('flashcards')->latest()->take(3)->get();
    $savedPosts = $user->savedPosts()->with('user')->withCount('flashcards')->latest()->take(3)->get();

    return Inertia::render('Dashboard', [
        'stats' => $stats,
        'recentPosts' => $recentPosts,
        'savedPosts' => $savedPosts,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// --- GRUPO DE RUTAS PROTEGIDAS ---
Route::middleware('auth')->group(function () {

    // Onboarding VARK
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Perfil de Usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Apuntes & Flashcards
    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::get('/posts/extract-text', fn () => redirect()->route('posts.create'));
    Route::post('/posts/extract-text', [PostController::class, 'extractText'])->name('posts.extract');

    Route::whereNumber('post')->group(function () {
        Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
        Route::post('/posts/{post}/flashcards', [PostController::class, 'generateFlashcards'])->name('posts.flashcards');
        Route::post('/posts/{post}/flashcards/save', [PostController::class, 'storeFlashcards'])->name('posts.flashcards.store');
        Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
        Route::post('/posts/{post}/save', [PostController::class, 'toggleSave'])->name('posts.save');
        Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    });

    // Feed Social & Interacción
    Route::get('/explore', [PostController::class, 'explore'])->name('explore');

    // Rutas de Comentarios
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])
        ->whereNumber('comment')
        ->name('comments.destroy');
});

require __DIR__.'/auth.php';
