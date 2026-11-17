<?php

use App\Models\Post;
use App\Models\Report;
use App\Models\User;

test('students cannot access admin routes and receive 403 forbidden', function () {
    $student = User::factory()->create(['role' => 'student']);

    $responseMod = $this->actingAs($student)->get(route('admin.moderation'));
    $responseMod->assertForbidden();

    $responseUsage = $this->actingAs($student)->get(route('admin.ai-usage'));
    $responseUsage->assertForbidden();
});

test('administrator can access moderation and ai usage dashboards', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $responseMod = $this->actingAs($admin)->get(route('admin.moderation'));
    $responseMod->assertOk();

    $responseUsage = $this->actingAs($admin)->get(route('admin.ai-usage'));
    $responseUsage->assertOk();
});

test('student can report an inappropriate post but not their own', function () {
    $author = User::factory()->create();
    $student = User::factory()->create();

    $post = Post::factory()->create([
        'user_id' => $author->id,
        'is_public' => true,
        'status' => 'active',
    ]);

    // Author cannot report own post
    $ownReport = $this->actingAs($author)->post(route('posts.report', $post), [
        'reason' => 'spam',
        'details' => 'Me estoy autoreportando',
    ]);
    $ownReport->assertRedirect();
    expect(Report::where('post_id', $post->id)->exists())->toBeFalse();

    // Student can report post
    $validReport = $this->actingAs($student)->post(route('posts.report', $post), [
        'reason' => 'contenido_inapropiado',
        'details' => 'Contenido no académico',
    ]);
    $validReport->assertRedirect();

    $report = Report::where('post_id', $post->id)->first();
    expect($report)->not->toBeNull();
    expect($report->reason)->toBe('contenido_inapropiado');
    expect($report->status)->toBe('pending');
});

test('admin can approve or hide pending posts', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $author = User::factory()->create();

    $post = Post::factory()->create([
        'user_id' => $author->id,
        'status' => 'pending_review',
    ]);

    // Admin approves post
    $response = $this->actingAs($admin)->post(route('admin.posts.moderate', $post), [
        'action' => 'approve',
        'moderation_notes' => 'Aprobado manualmente.',
    ]);
    $response->assertRedirect();

    expect($post->fresh()->status)->toBe('active');
    expect($post->fresh()->moderation_notes)->toBe('Aprobado manualmente.');
});

test('admin can resolve community report by accepting and hiding post', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $author = User::factory()->create();
    $student = User::factory()->create();

    $post = Post::factory()->create([
        'user_id' => $author->id,
        'status' => 'active',
    ]);

    $report = Report::create([
        'post_id' => $post->id,
        'reporter_id' => $student->id,
        'reason' => 'plagio',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('admin.reports.resolve', $report), [
        'action' => 'accept',
        'notes' => 'Post infringía derechos.',
    ]);
    $response->assertRedirect();

    expect($report->fresh()->status)->toBe('accepted');
    expect($report->fresh()->reviewed_by)->toBe($admin->id);
    expect($post->fresh()->status)->toBe('hidden');
});
