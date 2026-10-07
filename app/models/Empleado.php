<?php

class Empleado extends Persona implements JsonSerializable{
    private $idEmpleado;
    private $puesto;
    public function __construct($idEmpleado, $nombre, $puesto, $telefono, $correo){
        parent::__construct($idEmpleado, $nombre, $telefono, $correo);
        $this->idEmpleado = $idEmpleado;
        $this->puesto = $puesto;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdEmpleado(){
        return $this->idEmpleado;
    }
    public function getNombre(){
        return $this->nombre;
    }
    public function getPuesto(){
        return $this->puesto;
    }
    public function getTelefono(){
        return $this->telefono;
    }
    public function getCorreo(){
        return $this->correo;
    }

    /*********************************  METODOS *****************************************/
    /************************************************************************************/

    public static function InicioSesion($correo, $password){
        $db = BD::FloresNuria();
        $stmt = $db->prepare("SELECT * FROM empleado WHERE correo = ?");
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$usuario) {
            return null; // Usuario no encontrado
        }
        // Verificar contraseña hasheada
        if (password_verify($password, $usuario['password'])) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Crear sesión con objeto Usuario
            $_SESSION['empleado'] = new Empleado(
                $usuario['id_empleado'],
                $usuario['nombre'],
                $usuario['puesto'],
                $usuario['telefono'],
                $usuario['correo']
            );
            return true;
        } else {
            return null; // Contraseña incorrecta
        }
    }

    public static function checkSession(){
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return isset($_SESSION['empleado']);
    }

    public static function logout(){
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_unset();
        // Borrar la cookie de sesión (opcional pero recomendable)
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),     // Nombre de la cookie (por defecto PHPSESSID)
                '',                 // Valor vacío
                time() - 42000,     // Expira en el pasado
                $params["path"],    // Ruta donde la cookie es válida
                $params["domain"],  // Dominio donde la cookie es válida
                $params["secure"],  // Solo enviar por HTTPS si es true
                $params["httponly"] // Solo accesible vía HTTP (no por JavaScript)
            );
        }
        session_destroy();
    }

    public static function getEmpleadoById($idEmpleado){
        $db = BD::FloresNuria();
        $stmt = $db->prepare("SELECT * FROM empleado WHERE id_empleado = ?");
        $stmt->execute([$idEmpleado]);
        $row = $stmt->fetch(PDO::FETCH_OBJ);
        return new Empleado($row->id_empleado, $row->nombre, $row->puesto, $row->telefono, $row->correo);
    }

    /**
     * Datos que se envían a la vista en formato JSON (sin contraseña)
     * @return array
     */
    public function jsonSerialize(): array{
        return [
            'idEmpleado' => $this->idEmpleado,
            'nombre' => $this->nombre,
            'puesto' => $this->puesto,
            'telefono' => $this->telefono,
            'correo' => $this->correo,
        ];
    }
}
