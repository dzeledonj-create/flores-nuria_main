<?php
/**
 * Configuración global de la aplicación.
 * Centraliza los datos de conexión y las rutas de almacenamiento.
 */
return [
    'db' => [
        'host' => 'localhost',
        'user' => 'postgres',
        'pass' => '1234',
        'name' => 'flores_nuria',
    ],
    // Carpeta donde se guardan los ficheros generados (JSON exportados, logs...)
    'storage' => dirname(__DIR__, 2) . '/storage',
];
