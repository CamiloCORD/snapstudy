<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    // Muestra el cuestionario
    public function show(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        // Si el usuario ya tiene un estilo definido, lo mandamos al Dashboard
        if ($user->learning_style) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/VarkTest');
    }

    // Guarda el resultado del test
    public function store(Request $request)
    {
        $request->validate([
            'learning_style' => 'required|in:visual,auditory,reading,kinesthetic',
        ]);

        /** @var User $user */
        $user = $request->user();

        $user->learning_style = $request->learning_style;
        $user->save();

        return redirect()->route('dashboard')->with('success', '¡Perfil configurado con éxito!');
    }
}
