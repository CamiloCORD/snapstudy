<?php

namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;
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
    public function extractTextFromImage(UploadedFile|string $image): array
    {
        $this->ensureApiKeyConfigured();

        [$mimeType, $base64Data] = $this->resolveImageData($image);

        $prompt = 'Analiza esta imagen que contiene apuntes escolares o universitarios. '.
            'Actúa como un estudiante de excelencia y digitalizador profesional. '.
            '1) Crea un título corto, claro y representativo del tema. '.
            '2) Transcribe y estructura el contenido de forma organizada utilizando Markdown enriquecido (encabezados, negritas, listas ordenadas y viñetas).';

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

        $response = $this->sendGenerateContentRequest($payload);
        $decoded = $this->parseResponseText($response);

        if (! is_array($decoded) || ! isset($decoded['title'], $decoded['content'])) {
            Log::error('Respuesta estructurada inválida de Gemini OCR:', ['decoded' => $decoded]);
            throw new RuntimeException('La respuesta del modelo de visión no contiene el formato esperado.');
        }

        return [
            'title' => (string) $decoded['title'],
            'content' => (string) $decoded['content'],
        ];
    }

    /**
     * Genera un conjunto de flashcards de estudio a partir del contenido de un apunte.
     *
     * @return array<int, array{question: string, answer: string, pregunta: string, respuesta: string}>
     *
     * @throws RuntimeException
     */
    public function generateFlashcards(string $noteContent, int $count = 5): array
    {
        $this->ensureApiKeyConfigured();

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

        $response = $this->sendGenerateContentRequest($payload);
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
