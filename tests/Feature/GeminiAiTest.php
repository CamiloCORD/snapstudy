<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

test('extracts text from image successfully using Gemini API', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'title' => 'Leyes de Newton',
                                    'content' => "# Leyes de Newton\n\n1. Inercia\n2. Fuerza\n3. Acción y reacción",
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $file = UploadedFile::fake()->create('apunte.png', 50, 'image/png');

    $response = $this->actingAs($user)->postJson(route('posts.extract'), [
        'image' => $file,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'title' => 'Leyes de Newton',
            'content' => "# Leyes de Newton\n\n1. Inercia\n2. Fuerza\n3. Acción y reacción",
        ]);
});

test('extracts text from base64 data url image successfully using Gemini API', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'title' => 'Célula Eucariota',
                                    'content' => "# Célula Eucariota\n\n- Núcleo\n- Mitocondrias",
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $base64Image = 'data:image/png;base64,'.base64_encode('fake-image-binary-data');

    $response = $this->actingAs($user)->postJson(route('posts.extract'), [
        'image' => $base64Image,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'title' => 'Célula Eucariota',
            'content' => "# Célula Eucariota\n\n- Núcleo\n- Mitocondrias",
        ]);
});

test('handles Gemini API error gracefully during OCR extraction with 500 status', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'error' => [
                'code' => 500,
                'message' => 'Internal Gemini service error',
            ],
        ], 500),
    ]);

    $file = UploadedFile::fake()->create('apunte.jpg', 50, 'image/jpeg');

    $response = $this->actingAs($user)->postJson(route('posts.extract'), [
        'image' => $file,
    ]);

    $response->assertStatus(500)
        ->assertJson([
            'success' => false,
        ]);
});

test('handles Gemini API rate limit error gracefully with 429 status', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'error' => [
                'code' => 429,
                'message' => 'Resource exhausted (quota limit reached).',
            ],
        ], 429),
    ]);

    $file = UploadedFile::fake()->create('apunte.jpg', 50, 'image/jpeg');

    $response = $this->actingAs($user)->postJson(route('posts.extract'), [
        'image' => $file,
    ]);

    $response->assertStatus(429)
        ->assertJson([
            'success' => false,
            'message' => 'Resource exhausted (quota limit reached).',
        ]);
});

test('generates flashcards successfully for a post using Gemini API', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'title' => 'Mitosis Celular',
        'content' => 'La mitosis es un proceso de división celular que produce dos células genéticamente idénticas.',
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    [
                                        'question' => '¿Qué es la mitosis?',
                                        'answer' => 'División celular que produce células idénticas.',
                                    ],
                                    [
                                        'question' => '¿Cuántas células hijas resultan de la mitosis?',
                                        'answer' => 'Dos células hijas genéticamente idénticas.',
                                    ],
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user)->postJson(route('posts.flashcards', $post));

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'flashcards' => [
                [
                    'question' => '¿Qué es la mitosis?',
                    'answer' => 'División celular que produce células idénticas.',
                    'pregunta' => '¿Qué es la mitosis?',
                    'respuesta' => 'División celular que produce células idénticas.',
                ],
            ],
        ]);
});

test('handles Gemini API error gracefully during flashcard generation', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create([
        'user_id' => $user->id,
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'error' => [
                'code' => 500,
                'message' => 'Error generating flashcards',
            ],
        ], 500),
    ]);

    $response = $this->actingAs($user)->postJson(route('posts.flashcards', $post));

    $response->assertStatus(500)
        ->assertJson([
            'success' => false,
        ]);
});

test('owner can store generated flashcards into database', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $payload = [
        'flashcards' => [
            [
                'pregunta' => '¿Cuál es la primera ley de Newton?',
                'respuesta' => 'La ley de la inercia.',
            ],
            [
                'pregunta' => '¿Cuál es la segunda ley de Newton?',
                'respuesta' => 'F = m * a.',
            ],
        ],
    ];

    $response = $this->actingAs($user)->post(route('posts.flashcards.store', $post), $payload);

    $response->assertRedirect();
    $this->assertDatabaseHas('flashcards', [
        'post_id' => $post->id,
        'pregunta' => '¿Cuál es la primera ley de Newton?',
        'respuesta' => 'La ley de la inercia.',
    ]);
    $this->assertDatabaseCount('flashcards', 2);
});
