<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;

test('authenticated user can create a post with valid data', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('posts.store'), [
        'title' => 'Apunte de Biología',
        'content' => 'Conceptos básicos sobre la fotosíntesis.',
        'subject' => 'Biología',
        'is_public' => true,
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertDatabaseHas('posts', [
        'user_id' => $user->id,
        'title' => 'Apunte de Biología',
        'subject' => 'Biología',
    ]);
});

test('store post fails validation if required fields are missing', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('posts.store'), [
        'title' => '',
        'content' => '',
    ]);

    $response->assertSessionHasErrors(['title', 'content']);
});

test('user cannot delete another user post', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($otherUser)->delete(route('posts.destroy', $post));

    $response->assertForbidden();
    $this->assertDatabaseHas('posts', ['id' => $post->id]);
});

test('owner can delete their own post', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($owner)->delete(route('posts.destroy', $post));

    $response->assertRedirect(route('dashboard'));
    $this->assertDatabaseMissing('posts', ['id' => $post->id]);
});

test('user cannot store flashcards on another user post', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($otherUser)->post(route('posts.flashcards.store', $post), [
        'flashcards' => [
            ['pregunta' => 'P1', 'respuesta' => 'R1'],
        ],
    ]);

    $response->assertForbidden();
});

test('user cannot delete another user comment', function () {
    $author = User::factory()->create();
    $otherUser = User::factory()->create();
    $post = Post::factory()->create();
    $comment = Comment::factory()->create([
        'user_id' => $author->id,
        'post_id' => $post->id,
    ]);

    $response = $this->actingAs($otherUser)->delete(route('comments.destroy', $comment));

    $response->assertForbidden();
    $this->assertDatabaseHas('comments', ['id' => $comment->id]);
});

test('author can delete their own comment', function () {
    $author = User::factory()->create();
    $post = Post::factory()->create();
    $comment = Comment::factory()->create([
        'user_id' => $author->id,
        'post_id' => $post->id,
    ]);

    $response = $this->actingAs($author)->delete(route('comments.destroy', $comment));

    $response->assertRedirect();
    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

test('get request to posts extract-text redirects to create note page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/posts/extract-text');

    $response->assertRedirect(route('posts.create'));
});

test('non-numeric post id returns 404 instead of causing database query collision', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/posts/invalid-non-numeric-param');

    $response->assertNotFound();
});
