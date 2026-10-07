<?php

/**
 * Controlador base. Todos los controladores heredan de aquí.
 * Formato de respuesta común: { ok: bool, message: string, data: mixed }
 */
abstract class Controller
{
    /**
     * Respuesta correcta
     * @param mixed $data datos a enviar a la vista
     * @param string $mensaje mensaje para mostrar al usuario
     * @return array
     */
    protected function ok($data = null, string $mensaje = ''): array
    {
        return ['ok' => true, 'message' => $mensaje, 'data' => $data];
    }

    /**
     * Respuesta de error
     * @param string $mensaje mensaje para mostrar al usuario
     * @param int $status código HTTP
     * @return array
     */
    protected function error(string $mensaje, int $status = 400): array
    {
        http_response_code($status);
        return ['ok' => false, 'message' => $mensaje, 'data' => null];
    }

    /**
     * Lee un parámetro de la petición (primero POST y después GET)
     */
    protected function input(string $clave, $defecto = null)
    {
        return $_POST[$clave] ?? $_GET[$clave] ?? $defecto;
    }

    /**
     * Corta la petición si no se ha enviado por POST
     */
    protected function exigirPost(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            throw new HttpException('Método no permitido.', 405);
        }
    }
}
