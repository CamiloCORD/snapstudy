<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    // Guardar comentario
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $post->comments()->create([
            'user_id' => $user->id,
            'content' => $request->validated('content'),
        ]);

        return back();
    }

    // Eliminar comentario (solo si el autor es el dueño vía CommentPolicy)
    public function destroy(Comment $comment): RedirectResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return back();
    }
}
