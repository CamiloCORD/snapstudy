<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Agregamos la columna 'image' después de 'content'.
            // Es 'nullable' porque no todos los apuntes tendrán foto obligatoriamente.
            $table->string('image')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Por si necesitamos revertir el cambio, esto borra la columna
            $table->dropColumn('image');
        });
    }
};
