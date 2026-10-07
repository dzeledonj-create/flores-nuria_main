<?php

class Cliente extends Persona implements JsonSerializable
{
    private $idCliente;

    public function __construct($idCliente, $nombre, $telefono, $correo){
        parent::__construct($idCliente, $nombre, $telefono, $correo);
        $this->idCliente = $idCliente;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdCliente(){
        return $this->idCliente;
    }
    public function getNombre(){
        return $this->nombre;
    }
    public function getTelefono(){
        return $this->telefono;
    }
    public function getCorreo(){
        return $this->correo;
    }

    /*********************************  METODOS *****************************************/
    /************************************************************************************/

    public static function getClienteById($idCliente){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM cliente WHERE id_cliente = ?");
        $stmt->execute([$idCliente]);
        $row = $stmt->fetch(PDO::FETCH_OBJ);
        return new Cliente($row->id_cliente, $row->nombre, $row->telefono, $row->mail);
    }

    public static function getClientes(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM cliente");
        $stmt->execute();
        $clientes = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $clientes[] = new Cliente($row->id_cliente, $row->nombre, $row->telefono, $row->mail);
        }
        return $clientes;
    }

    /**
     * Datos que se envían a la vista en formato JSON
     * @return array
     */
    public function jsonSerialize(): array{
        return [
            'idCliente' => $this->idCliente,
            'nombre' => $this->nombre,
            'telefono' => $this->telefono,
            'correo' => $this->correo,
        ];
    }
}
