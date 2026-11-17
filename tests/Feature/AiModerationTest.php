<?php

use App\Models\AiUsageLog;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

test('rejects OCR extraction with 422 when no legible text is detected', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'has_legible_text' => false,
                                    'is_educational' => false,
                                    'title' => '',
                                    'content' => '',
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
            'usageMetadata' => [
                'totalTokenCount' => 120,
            ],
        ], 200),
    ]);

    $file = UploadedFile::fake()->create('no_text.png', 50, 'image/png');

    $response = $this->actingAs($user)->postJson(route('posts.extract'), [
        'image' => $file,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => 'No se detectó texto legible en la imagen. Por favor sube una fotografía clara de tus apuntes.',
        ]);

    expect(AiUsageLog::where('type', 'ocr')->exists())->toBeTrue();
});

test('saves post as pending_review when AI marks it as not educational', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('posts.store'), [
        'title' => 'Meme de Examen',
        'content' => 'Texto chistoso no académico',
        'subject' => 'Varios',
        'is_public' => true,
        'is_educational' => false,
    ]);

    $response->assertRedirect(route('dashboard'));

    $post = Post::latest()->first();
    expect($post->status)->toBe('pending_review');
    expect($post->moderation_notes)->toContain('Marcado automáticamente por la IA');
});

test('public post with pending_review status is excluded from explore feed', function () {
    $author = User::factory()->create();
    $student = User::factory()->create();

    $approvedPost = Post::factory()->create([
        'user_id' => $author->id,
        'title' => 'Apunte Aprobado',
        'is_public' => true,
        'status' => 'active',
    ]);

    $pendingPost = Post::factory()->create([
        'user_id' => $author->id,
        'title' => 'Apunte Sospechoso en Revisión',
        'is_public' => true,
        'status' => 'pending_review',
    ]);

    $response = $this->actingAs($student)->get(route('explore'));

    $response->assertOk();
    $posts = $response->viewData('page')['props']['posts']['data'];
    $titles = collect($posts)->pluck('title')->toArray();

    expect($titles)->toContain('Apunte Aprobado');
    expect($titles)->not->toContain('Apunte Sospechoso en Revisión');
});
