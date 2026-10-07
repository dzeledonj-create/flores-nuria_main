<?php

/**
 * Router de la API.
 * Recibe ?controller=xxx&action=yyy, comprueba la sesión, ejecuta el método
 * del controlador y devuelve el resultado en JSON.
 */
class Router
{
    // Controladores disponibles (nombre en la URL => clase)
    private const CONTROLADORES = [
        'auth'        => 'AuthController',
        'productos'   => 'ProductoController',
        'ofertas'     => 'OfertaController',
        'pedidos'     => 'PedidoController',
        'proveedores' => 'ProveedorController',
        'ventas'      => 'VentaController',
        'clientes'    => 'ClienteController',
        'reportes'    => 'ReporteController',
    ];

    // Rutas que no necesitan haber iniciado sesión
    private const RUTAS_PUBLICAS = ['auth/login', 'auth/session'];

    public static function dispatch(string $controlador, string $accion): void
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $respuesta = self::ejecutar($controlador, $accion);
        } catch (HttpException $e) {
            http_response_code($e->getCode());
            $respuesta = ['ok' => false, 'message' => $e->getMessage(), 'data' => null];
        } catch (Throwable $e) {
            http_response_code(500);
            self::registrarError($e);
            $respuesta = ['ok' => false, 'message' => 'Error del servidor: ' . $e->getMessage(), 'data' => null];
        }

        // INVALID_UTF8_SUBSTITUTE: los mensajes de PostgreSQL en Windows pueden no venir en UTF-8
        echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    }

    /**
     * Guarda el error en storage/logs/errores.log
     */
    private static function registrarError(Throwable $e): void
    {
        $config = require __DIR__ . '/../config/config.php';
        $linea = sprintf("[%s] %s en %s:%d\n", date('Y-m-d H:i:s'), $e->getMessage(), $e->getFile(), $e->getLine());
        @file_put_contents($config['storage'] . '/logs/errores.log', $linea, FILE_APPEND);
    }

    private static function ejecutar(string $controlador, string $accion): array
    {
        if (!isset(self::CONTROLADORES[$controlador])) {
            throw new HttpException('Recurso no encontrado.', 404);
        }

        $clase = self::CONTROLADORES[$controlador];
        $objeto = new $clase();

        // Solo se pueden llamar métodos públicos del controlador
        if ($accion === '' || str_starts_with($accion, '_') || !is_callable([$objeto, $accion])) {
            throw new HttpException('Acción no encontrada.', 404);
        }

        if (!in_array("$controlador/$accion", self::RUTAS_PUBLICAS) && !Empleado::checkSession()) {
            throw new HttpException('Sesión no iniciada.', 401);
        }

        return $objeto->$accion();
    }
}
