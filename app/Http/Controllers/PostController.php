<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExtractOcrRequest;
use App\Http\Requests\StoreFlashcardsRequest;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Models\User;
use App\Services\GeminiAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PostController extends Controller
{
    public function __construct(
        protected GeminiAiService $gemini
    ) {}

    // Formulario para crear apunte
    public function create(): Response
    {
        return Inertia::render('Posts/Create');
    }

    // Guardar nuevo apunte
    public function store(StorePostRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['is_public'] = $request->boolean('is_public', false);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('apuntes', 'public');
            $validated['image'] = $path;
        }

        $request->user()->posts()->create($validated);

        return redirect()->route('dashboard')->with('success', '¡Apunte creado con éxito!');
    }

    // 1. Extraer texto estructurado de la imagen usando Google Gemini API nativo
    public function extractText(ExtractOcrRequest $request): JsonResponse
    {
        try {
            /** @var UploadedFile|string|null $image */
            $image = $request->hasFile('image') ? $request->file('image') : $request->input('image');

            if (! $image) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se proporcionó un archivo o imagen válida.',
                ], 422);
            }

            $result = $this->gemini->extractTextFromImage($image);

            return response()->json([
                'success' => true,
                'title' => $result['title'],
                'content' => $result['content'],
            ]);
        } catch (Throwable $e) {
            $code = $e->getCode();
            $statusCode = ($code >= 400 && $code < 600) ? (int) $code : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Error inesperado al procesar la imagen con IA.',
            ], $statusCode);
        }
    }

    // 2. Generar flashcards pedagógicas usando Google Gemini API nativo
    public function generateFlashcards(Post $post): JsonResponse
    {
        $this->authorize('view', $post);

        try {
            $flashcards = $this->gemini->generateFlashcards((string) $post->content);

            return response()->json([
                'success' => true,
                'flashcards' => $flashcards,
            ]);
        } catch (Throwable $e) {
            $code = $e->getCode();
            $statusCode = ($code >= 400 && $code < 600) ? (int) $code : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    // Ver apunte individual
    public function show(Post $post): Response
    {
        $this->authorize('view', $post);

        $post->load([
            'user',
            'flashcards',
            'comments.user',
        ]);

        return Inertia::render('Posts/Show', [
            'post' => $post,
        ]);
    }

    // Guardar flashcards generadas
    public function storeFlashcards(StoreFlashcardsRequest $request, Post $post): RedirectResponse
    {
        $this->authorize('update', $post);

        $validated = $request->validated();

        $post->flashcards()->delete();
        $post->flashcards()->createMany($validated['flashcards']);

        return redirect()->back();
    }

    // Borrar apunte
    public function destroy(Post $post): RedirectResponse
    {
        $this->authorize('delete', $post);

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->route('dashboard');
    }

    // Feed Explorar / Social
    public function explore(Request $request): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        $query = Post::where('is_public', true)
            ->with('user')
            ->withCount('flashcards')
            ->latest();

        if ($user) {
            $query->withExists(['savedByUsers as is_saved' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        if ($request->filled('subject')) {
            $query->where('subject', (string) $request->subject);
        }

        if ($request->filled('search')) {
            $search = (string) $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        $posts = $query->paginate(12)->withQueryString();
        $subjects = Post::where('is_public', true)
            ->whereNotNull('subject')
            ->distinct()
            ->pluck('subject');

        return Inertia::render('Explore', [
            'posts' => $posts,
            'subjects' => $subjects,
            'filters' => $request->only(['subject', 'search']),
        ]);
    }

    // Guardar / Desguardar apunte
    public function toggleSave(Request $request, Post $post): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->savedPosts()->toggle($post->id);

        return back();
    }
}
