<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('content'); // Para los de Lectura/Escritura y Auditivos (Text-to-speech)
            $table->string('image_path')->nullable(); // Para los Visuales
            $table->json('flashcard_data')->nullable(); // Para los Kinestésicos (Preguntas y respuestas)
            $table->string('subject')->nullable(); // Materia (Ej. Biología, Historia)
            $table->boolean('is_public')->default(true); // Por si quieren apuntes privados
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
