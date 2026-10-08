<?php
/**
 * Punto de entrada único del backend.
 * El frontend (HTML + JavaScript) llama a: api/index.php?controller=xxx&action=yyy
 */
require_once __DIR__ . '/../autoloader.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

Router::dispatch($_GET['controller'] ?? '', $_GET['action'] ?? '');
