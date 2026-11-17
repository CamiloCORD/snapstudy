<?php

namespace App\Services;

use App\Models\AiUsageLog;
use App\Models\User;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GeminiAiService
{
    protected string $apiKey;

    protected string $model;

    protected string $endpoint;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.api_key', env('GEMINI_API_KEY', ''));
        $this->model = (string) config('services.gemini.model', env('GEMINI_MODEL', 'gemini-3.1-flash-lite'));
        $this->endpoint = (string) config('services.gemini.endpoint', 'https://generativelanguage.googleapis.com/v1beta/models/');
    }

    /**
     * Extrae texto estructurado y título desde una imagen de apuntes usando Gemini Vision.
     *
     * @return array{title: string, content: string}
     *
     * @throws RuntimeException
     */
    public function extractTextFromImage(UploadedFile|string $image, ?int $postId = null): array
    {
        $this->ensureApiKeyConfigured();
        $startTime = microtime(true);

        [$mimeType, $base64Data] = $this->resolveImageData($image);

        $prompt = 'Analiza esta imagen para una plataforma educativa universitaria (SnapStudy). '.
            'Actúa como un estudiante de excelencia y digitalizador profesional. '.
            '1) Evalúa con rigor si la imagen contiene texto escrito a mano o impreso legible (has_legible_text). Si es una imagen sin texto, un paisaje, foto de una persona/objeto o totalmente ilegible, devuelve false. '.
            '2) Evalúa si el texto corresponde a apuntes, notas académicas, ejercicios, fórmulas o temas de estudio escolar o universitario (is_educational). Si es una captura de chat, meme, comprobante de pago o contenido no educativo, devuelve false. '.
            '3) Crea un título representativo, claro y sintético del tema. '.
            '4) Transcribe y estructura el contenido utilizando Markdown enriquecido (encabezados, negritas, listas ordenadas y viñetas). '.
            'Si encuentras ecuaciones, fórmulas matemáticas o notación científica, transcríbelas en formato LaTeX estándar utilizando $$...$$ para fórmulas en bloque y $...$ para expresiones en línea.';

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $base64Data,
                            ],
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'has_legible_text' => [
                            'type' => 'BOOLEAN',
                            'description' => 'True si la imagen contiene texto escrito a mano o impreso legible',
                        ],
                        'is_educational' => [
                            'type' => 'BOOLEAN',
                            'description' => 'True si el contenido es académico, educativo o apunte de estudio',
                        ],
                        'title' => [
                            'type' => 'STRING',
                            'description' => 'Título representativo del apunte',
                        ],
                        'content' => [
                            'type' => 'STRING',
                            'description' => 'Contenido estructurado en formato Markdown',
                        ],
                    ],
                    'required' => ['title', 'content'],
                ],
            ],
        ];

        try {
            $response = $this->sendGenerateContentRequest($payload);
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
            $tokensUsed = $response['usageMetadata']['totalTokenCount'] ?? 0;

            $this->recordAiUsage('ocr', $latencyMs, $tokensUsed, 'success', null, $postId);

            $decoded = $this->parseResponseText($response);

            if (! is_array($decoded) || ! isset($decoded['title'], $decoded['content'])) {
                Log::error('Respuesta estructurada inválida de Gemini OCR:', ['decoded' => $decoded]);
                throw new RuntimeException('La respuesta del modelo de visión no contiene el formato esperado.');
            }

            return [
                'has_legible_text' => (bool) ($decoded['has_legible_text'] ?? true),
                'is_educational' => (bool) ($decoded['is_educational'] ?? true),
                'title' => (string) $decoded['title'],
                'content' => (string) $decoded['content'],
            ];
        } catch (\Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
            $this->recordAiUsage('ocr', $latencyMs, 0, 'error', $e->getMessage(), $postId);
            throw $e;
        }
    }

    /**
     * Genera un conjunto de flashcards de estudio a partir del contenido de un apunte.
     *
     * @return array<int, array{question: string, answer: string, pregunta: string, respuesta: string}>
     *
     * @throws RuntimeException
     */
    public function generateFlashcards(string $noteContent, int $count = 5, ?int $postId = null): array
    {
        $this->ensureApiKeyConfigured();
        $startTime = microtime(true);

        $prompt = 'Actúa como un profesor y tutor pedagógico experto. '.
            "A partir del siguiente texto de apuntes, genera exactamente {$count} flashcards de estudio de alto impacto. ".
            "Cada tarjeta debe contener una pregunta que desafíe la comprensión y una respuesta concisa, clara y pedagógica.\n\n".
            "Apunte de estudio:\n{$noteContent}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'question' => [
                                'type' => 'STRING',
                                'description' => 'Pregunta clara y desafiante',
                            ],
                            'answer' => [
                                'type' => 'STRING',
                                'description' => 'Respuesta concisa y correcta',
                            ],
                        ],
                        'required' => ['question', 'answer'],
                    ],
                ],
            ],
        ];

        try {
            $response = $this->sendGenerateContentRequest($payload);
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
            $tokensUsed = $response['usageMetadata']['totalTokenCount'] ?? 0;

            $this->recordAiUsage('flashcards', $latencyMs, $tokensUsed, 'success', null, $postId);

            $decoded = $this->parseResponseText($response);

            if (! is_array($decoded)) {
                Log::error('Respuesta de flashcards de Gemini no es un arreglo válido:', ['decoded' => $decoded]);
                throw new RuntimeException('La respuesta de Gemini para flashcards no contiene un formato de lista válido.');
            }

            // Si vino envuelto en un objeto tipo {"flashcards": [...]}
            if (isset($decoded['flashcards']) && is_array($decoded['flashcards'])) {
                $decoded = $decoded['flashcards'];
            }

            return array_map(function (mixed $item): array {
                $itemArray = is_array($item) ? $item : [];
                $question = (string) ($itemArray['question'] ?? $itemArray['pregunta'] ?? '');
                $answer = (string) ($itemArray['answer'] ?? $itemArray['respuesta'] ?? '');

                return [
                    'question' => $question,
                    'answer' => $answer,
                    'pregunta' => $question,
                    'respuesta' => $answer,
                ];
            }, $decoded);
        } catch (\Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
            $this->recordAiUsage('flashcards', $latencyMs, 0, 'error', $e->getMessage(), $postId);
            throw $e;
        }
    }

    /**
     * Registra auditoría operativa del uso de IA (RF16 / ai_usage_logs).
     */
    protected function recordAiUsage(string $type, int $latencyMs, int $tokensUsed, string $status, ?string $errorMessage = null, ?int $postId = null): void
    {
        try {
            $userId = Auth::id() ?? User::query()->value('id');

            if ($userId) {
                AiUsageLog::create([
                    'user_id' => $userId,
                    'post_id' => $postId,
                    'type' => $type,
                    'model' => $this->model,
                    'tokens_used' => $tokensUsed,
                    'latency_ms' => $latencyMs,
                    'status' => $status,
                    'error_message' => $errorMessage,
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('No se pudo registrar log de uso de IA:', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Envía la petición HTTP POST al endpoint de Gemini con timeout y manejo de errores.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     *
     * @throws RuntimeException
     */
    protected function sendGenerateContentRequest(array $payload): array
    {
        $url = rtrim($this->endpoint, '/')."/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $client = Http::timeout(45)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ]);

            if (app()->environment('local', 'testing')) {
                $client = $client->withoutVerifying();
            }

            $response = $client->post($url, $payload);

            if (! $response->successful()) {
                Log::error('Error en llamada a Gemini API:', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                $errorMessage = $response->json('error.message')
                    ?? "Error de comunicación con Gemini API (HTTP {$response->status()}).";

                throw new RuntimeException($errorMessage, $response->status());
            }

            $responseData = $response->json();

            // Verificar si el modelo bloqueó por seguridad o filtros
            $candidate = $responseData['candidates'][0] ?? null;
            if ($candidate && isset($candidate['finishReason']) && in_array($candidate['finishReason'], ['SAFETY', 'RECITATION', 'BLOCKLIST'])) {
                Log::error('Generación bloqueada por filtros de seguridad de Gemini:', [
                    'candidate' => $candidate,
                ]);
                throw new RuntimeException("La generación fue bloqueada por políticas de seguridad ({$candidate['finishReason']}).");
            }

            return $responseData;
        } catch (RuntimeException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error('Excepción al conectar con Gemini API:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new RuntimeException('No se pudo conectar con el servicio de IA de Gemini: '.$e->getMessage(), 500, $e);
        }
    }

    /**
     * Parsea el texto devuelto en candidates[0].content.parts[0].text como JSON.
     *
     * @param  array<string, mixed>  $response
     *
     * @throws RuntimeException
     */
    protected function parseResponseText(array $response): mixed
    {
        $rawText = $response['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (! is_string($rawText) || trim($rawText) === '') {
            Log::error('Gemini API retornó una respuesta vacía o sin texto en parts:', ['response' => $response]);
            throw new RuntimeException('El servicio de IA no generó contenido para esta solicitud.');
        }

        $decoded = json_decode(trim($rawText), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Intento de extracción si contiene bloques markdown ```json ... ```
            if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $rawText, $matches)) {
                $decoded = json_decode(trim($matches[1]), true);
            }
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Error al decodificar JSON de Gemini:', [
                'rawText' => $rawText,
                'json_error' => json_last_error_msg(),
            ]);
            throw new RuntimeException('La respuesta recibida de Gemini no es un JSON válido.');
        }

        return $decoded;
    }

    /**
     * Resuelve los datos Base64 y MIME type de una imagen UploadedFile o string.
     *
     * @return array{0: string, 1: string}
     */
    protected function resolveImageData(UploadedFile|string $image): array
    {
        if ($image instanceof UploadedFile) {
            $mimeType = $image->getMimeType() ?: 'image/jpeg';
            $data = base64_encode((string) file_get_contents($image->getRealPath()));

            return [$mimeType, $data];
        }

        if (str_starts_with($image, 'data:')) {
            $commaPos = strpos($image, ',');
            if ($commaPos !== false) {
                $header = substr($image, 0, $commaPos);
                $data = trim(substr($image, $commaPos + 1));
                $mimeType = 'image/jpeg';
                if (preg_match('/data:([^;,]+)/', $header, $matches)) {
                    $mimeType = $matches[1];
                }

                return [$mimeType, $data];
            }
        }

        if (is_file($image)) {
            $mimeType = mime_content_type($image) ?: 'image/jpeg';
            $data = base64_encode((string) file_get_contents($image));

            return [$mimeType, $data];
        }

        // Asumir que ya es una cadena base64 limpia
        return ['image/jpeg', trim($image)];
    }

    /**
     * Valida que la API key de Gemini esté presente.
     *
     * @throws RuntimeException
     */
    protected function ensureApiKeyConfigured(): void
    {
        if (empty($this->apiKey)) {
            Log::error('Falta la clave GEMINI_API_KEY en la configuración del servidor.');
            throw new RuntimeException('Falta la configuración de GEMINI_API_KEY en el servidor.', 500);
        }
    }
}
