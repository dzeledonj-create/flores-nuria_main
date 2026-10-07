<?php

class Proveedor implements JsonSerializable
{
    private $idProveedor;
    private $nombre;
    private $direccion;
    private $telefono;
    private $correo;

    /**
     * @param $idProveedor
     * @param $nombre
     * @param $direccion
     * @param $telefono
     * @param $correo
     */
    public function __construct($idProveedor, $nombre, $direccion, $telefono, $correo){
        $this->idProveedor = $idProveedor;
        $this->nombre = $nombre;
        $this->direccion = $direccion;
        $this->telefono = $telefono;
        $this->correo = $correo;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdProveedor(){
        return $this->idProveedor;
    }
    public function getNombre(){
        return $this->nombre;
    }
    public function getDireccion(){
        return $this->direccion;
    }
    public function getTelefono(){
        return $this->telefono;
    }
    public function getCorreo(){
        return $this->correo;
    }

    /*********************************  METODOS *****************************************/
    /************************************************************************************/

    /**
     * Devuelve todos los Proveedores de la bd
     * @return array
     */
    public static function getProveedores(): array {
        $conn = BD::FloresNuria();
        $conn = $conn->query("SELECT * FROM proveedor");
        $proveedores = array();
        while ($fila = $conn->fetch(PDO::FETCH_OBJ)) {
            $proveedores[] = new Proveedor(
                $fila->id_proveedor ?? 0,
                $fila->nombre ?? '',
                $fila->direccion ?? '',
                $fila->telefono ?? '',
                $fila->correo ?? ''
            );
        }
        return $proveedores;
    }

    /**
     * Devuelve Proveedores segun el nombre
     * @param $busqueda string texto para buscar
     * @return array
     */
    public static function buscarProveedores($busqueda): array {
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM proveedor WHERE nombre ILIKE ?");
        $stmt->execute(["%" . $busqueda . "%"]);
        $proveedores = array();
        while ($fila = $stmt->fetch(PDO::FETCH_OBJ)) {
            $proveedores[] = new Proveedor(
                $fila->id_proveedor ?? 0,
                $fila->nombre ?? '',
                $fila->direccion ?? '',
                $fila->telefono ?? '',
                $fila->correo ?? ''
            );
        }
        return $proveedores;
    }

    /**
     * Inserta un nuevo proveedor en la BD
     * @return bool
     */
    public function IngresarProveedor(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("INSERT INTO proveedor(nombre, direccion, telefono, correo) VALUES (:nombre, :direccion, :telefono, :correo)");
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":correo", $this->correo);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Elimina al Proveedor de la BD
     * @return bool
     */
    public function EliminarProveedor(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("DELETE FROM proveedor WHERE id_proveedor = :id_proveedor");
        $stmt->bindParam(":id_proveedor", $this->idProveedor);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Actualiza los datos del Proveedor en la BD
     * @return bool
     */
    public function ActualizarProveedor(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("UPDATE proveedor SET nombre = :nombre, direccion = :direccion, telefono = :telefono, correo = :correo WHERE id_proveedor = :id_proveedor");
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":correo", $this->correo);
        $stmt->bindParam(":id_proveedor", $this->idProveedor);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Datos que se envían a la vista en formato JSON
     * @return array
     */
    public function jsonSerialize(): array{
        return [
            'idProveedor' => $this->idProveedor,
            'nombre' => $this->nombre,
            'direccion' => $this->direccion,
            'telefono' => $this->telefono,
            'correo' => $this->correo,
        ];
    }
}
