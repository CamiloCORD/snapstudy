<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flashcard extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'pregunta',
        'respuesta',
    ];

    // Una flashcard pertenece a un apunte
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
