<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Administrador por defecto del sistema
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador SnapStudy',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'learning_style' => 'visual',
            ]
        );

        // Estudiante de prueba
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Estudiante de Prueba',
                'password' => bcrypt('password'),
                'role' => 'student',
                'learning_style' => 'visual',
            ]
        );
    }
}
