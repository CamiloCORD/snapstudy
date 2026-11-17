<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Models\Post;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;

class ReportController extends Controller
{
    /**
     * Registra un reporte comunitario sobre un apunte público (CU19 / RF15).
     */
    public function store(StoreReportRequest $request, Post $post): RedirectResponse
    {
        $userId = $request->user()->id;

        // Evitar que el autor reporte su propio apunte
        if ($post->user_id === $userId) {
            return redirect()->back()->with('error', 'No puedes reportar tu propio apunte.');
        }

        // Verificar si el usuario ya tiene un reporte pendiente sobre este apunte
        $existing = Report::where('post_id', $post->id)
            ->where('reporter_id', $userId)
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return redirect()->back()->with('info', 'Ya has enviado un reporte previo para este apunte que está en revisión.');
        }

        $validated = $request->validated();
        $validated['post_id'] = $post->id;
        $validated['reporter_id'] = $userId;
        $validated['status'] = 'pending';

        Report::create($validated);

        return redirect()->back()->with('success', 'El reporte ha sido enviado al equipo de moderación.');
    }
}
