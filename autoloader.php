<?php
spl_autoload_register(function ($nombre_clase) {
    // Buscamos la clase en las carpetas del modelo MVC
    foreach (['core', 'models', 'controllers'] as $carpeta) {
        $archivo = __DIR__ . "/app/$carpeta/$nombre_clase.php";
        if (file_exists($archivo)) {
            require_once $archivo;
            return;
        }
    }
});
