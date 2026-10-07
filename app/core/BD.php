<?php

class BD
{
    private $server;
    private $user;
    private $pass;
    private $bd;
    // Conexión compartida durante la petición para no abrir una nueva en cada consulta
    private static $conexion = null;

    private function __construct($server, $user, $pass, $bd) {
        $this->server = $server;
        $this->user = $user;
        $this->pass = $pass;
        $this->bd = $bd;
    }
    private function conectar(){
        $conn = new PDO("pgsql:host=".$this->server.";dbname=". $this->bd, $this->user, $this->pass);
        // set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $conn;
    }
    public static function FloresNuria() {
        if (self::$conexion === null) {
            $config = require __DIR__ . '/../config/config.php';
            $db = $config['db'];
            $bd = new BD($db['host'], $db['user'], $db['pass'], $db['name']);
            self::$conexion = $bd->conectar();
        }
        return self::$conexion;
    }
}
