<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'image_path',
        'flashcard_data',
        'subject',
        'is_public',
        'image',
    ];

    protected $casts = [
        'flashcard_data' => 'array', // Laravel convierte el JSON a Array automáticamente
        'is_public' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    public function interactions()
    {
        return $this->hasMany(Interaction::class);
    }

    // Atajos
    public function likes()
    {
        return $this->hasMany(Interaction::class)->where('type', 'like');
    }

    public function saves()
    {
        return $this->hasMany(Interaction::class)->where('type', 'save');
    }

    // Un apunte tiene muchas flashcards
    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_posts')->withTimestamps();
    }
}
