<?php

namespace App\Http\Controllers;

use App\Http\Requests\ModeratePostRequest;
use App\Http\Requests\ResolveReportRequest;
use App\Models\AiUsageLog;
use App\Models\Post;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Muestra la bandeja de moderación preventiva (IA) y comunitaria (CU20 / RF15).
     */
    public function moderation(Request $request): Response
    {
        $pendingPosts = Post::where('status', 'pending_review')
            ->with('user')
            ->withCount('flashcards')
            ->latest()
            ->get();

        $reports = Report::with(['post.user', 'reporter'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Admin/Moderation', [
            'pendingPosts' => $pendingPosts,
            'reports' => $reports,
            'initialTab' => $request->query('tab', 'pending'),
        ]);
    }

    /**
     * Modera un apunte en revisión preventiva de la IA (Aprobar u Ocultar).
     */
    public function moderatePost(ModeratePostRequest $request, Post $post): RedirectResponse
    {
        $validated = $request->validated();

        if ($validated['action'] === 'approve') {
            $post->update([
                'status' => 'active',
                'moderation_notes' => $validated['moderation_notes'] ?? 'Aprobado manualmente por el administrador.',
            ]);
            $msg = 'El apunte ha sido aprobado y ya es visible en la comunidad.';
        } else {
            $post->update([
                'status' => 'hidden',
                'moderation_notes' => $validated['moderation_notes'] ?? 'Ocultado por el administrador.',
            ]);
            $msg = 'El apunte ha sido ocultado de la plataforma.';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Resuelve un reporte comunitario de un estudiante (Aceptar o Rechazar).
     */
    public function resolveReport(ResolveReportRequest $request, Report $report): RedirectResponse
    {
        $validated = $request->validated();
        $adminId = $request->user()->id;

        if ($validated['action'] === 'accept') {
            $report->update([
                'status' => 'accepted',
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
            ]);

            // Ocultar el apunte reportado
            $report->post()->update([
                'status' => 'hidden',
                'moderation_notes' => 'Ocultado tras aceptar reporte comunitario de infracción.',
            ]);

            $msg = 'Reporte aceptado. El apunte ha sido retirado de la vista pública.';
        } else {
            $report->update([
                'status' => 'rejected',
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
            ]);

            $msg = 'Reporte rechazado. El apunte permanece activo.';
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Consulta el panel de auditoría y métricas de consumo de IA (CU21 / RF16).
     */
    public function aiUsage(Request $request): Response
    {
        $totalRequests = AiUsageLog::count();
        $totalTokens = (int) AiUsageLog::sum('tokens_used');
        $avgLatency = (int) round((float) AiUsageLog::avg('latency_ms'));
        $successCount = AiUsageLog::where('status', 'success')->count();
        $errorCount = AiUsageLog::where('status', 'error')->count();

        // Agrupación por tipo (ocr vs flashcards)
        $byType = AiUsageLog::select('type', DB::raw('count(*) as count'), DB::raw('sum(tokens_used) as tokens'))
            ->groupBy('type')
            ->get();

        // Registros recientes con paginación
        $recentLogs = AiUsageLog::with('user')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/AiUsage', [
            'metrics' => [
                'totalRequests' => $totalRequests,
                'totalTokens' => $totalTokens,
                'avgLatency' => $avgLatency,
                'successCount' => $successCount,
                'errorCount' => $errorCount,
                'successRate' => $totalRequests > 0 ? round(($successCount / $totalRequests) * 100, 1) : 100,
            ],
            'byType' => $byType,
            'recentLogs' => $recentLogs,
        ]);
    }
}
