<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'image_path',
        'flashcard_data',
        'subject',
        'is_public',
        'image',
        'status',
        'moderation_notes',
    ];

    protected $casts = [
        'flashcard_data' => 'array', // Laravel convierte el JSON a Array automáticamente
        'is_public' => 'boolean',
    ];

    protected $appends = [
        'image_url',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        return asset('storage/'.ltrim($this->image, '/'));
    }

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

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function aiUsageLogs()
    {
        return $this->hasMany(AiUsageLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }

    public function scopePublicActive($query)
    {
        return $query->where('is_public', true)->where('status', 'active');
    }
}
