<?php

class Ticket implements JsonSerializable
{
    private $idTicket;
    private $empleado;
    private $cliente;
    private $fechaCreacion;
    private $totalVenta;
    private $num_ticket;
    private $BolsaCompra;

    public function __construct($idTicket, $empleado, $cliente, $fechaCreacion, $totalVenta, $num_ticket, $BolsaCompra)
    {
        $this->idTicket = $idTicket;
        $this->empleado = $empleado;
        $this->cliente = $cliente;
        $this->fechaCreacion = $fechaCreacion;
        $this->totalVenta = $totalVenta;
        $this->num_ticket = $num_ticket;
        $this->BolsaCompra = $BolsaCompra;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdTicket()
    {
        return $this->idTicket;
    }

    public function getEmpleado()
    {
        return $this->empleado;
    }

    public function getCliente()
    {
        return $this->cliente;
    }

    public function getFechaCreacion()
    {
        return $this->fechaCreacion;
    }

    public function getTotalVenta()
    {
        return $this->totalVenta;
    }

    public function getBolsaCompra()
    {
        return $this->BolsaCompra;
    }

    public function getNumTicket(){
        return $this->num_ticket;
    }

    /*********************************  METODOS *****************************************/
    /************************************************************************************/

    public static function getTickets(): array
    {
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM venta");
        $stmt->execute();
        $tickets = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $bolsa_compra = BolsaCompra::getBolsaCompraByIdTicket($row->id_venta);
            $tickets[] = new Ticket(
                $row->id_venta,
                $row->id_empleado,
                $row->id_cliente,
                $row->fecha,
                $row->precio,
                $row->num_venta,
                $bolsa_compra
            );
        }
        return $tickets;
    }

    public function IngresarTicket()
    {
        $conn = BD::FloresNuria();
        try {
            $stmt = $conn->prepare("INSERT INTO venta(precio, fecha, num_venta, id_cliente, id_empleado) VALUES (:precio, :fecha, :num_venta, :id_cliente, :id_empleado)");
            $stmt->bindParam(":precio", $this->totalVenta);
            $stmt->bindParam(":fecha", $this->fechaCreacion);
            $stmt->bindParam(":num_venta", $this->num_ticket);
            $stmt->bindParam(":id_cliente", $this->cliente);
            $stmt->bindParam(":id_empleado", $this->empleado);
            $stmt->execute();
            $this->BolsaCompra->IngresarVentaProductos($this);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            throw new Exception($e);
        }
    }

    public function ActualizarTicket(): bool
    {
        $conn = BD::FloresNuria();
        try {
            if ($this->BolsaCompra->IngresarVentaProductos($this)) {
                $stmt = $conn->prepare("UPDATE venta SET precio = :precio, fecha = :fecha, num_venta = :num_venta, id_cliente = :id_cliente WHERE id_venta = :id_venta");
                $stmt->bindParam(":precio", $this->totalVenta);
                $stmt->bindParam(":fecha", $this->fechaCreacion);
                $stmt->bindParam(":num_venta", $this->num_ticket);
                $stmt->bindParam(":id_cliente", $this->cliente);
                $stmt->bindParam(":id_venta", $this->idTicket);
                $stmt->execute();
                return $stmt->rowCount() > 0;
            } else {
                return false;
            }
        } catch (Exception $e) {
            throw new Exception($e);
        }
    }

    public function EliminarTicket(): bool
    {
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("DELETE FROM venta_producto WHERE id_venta = :id_venta");
        $stmt->bindParam(":id_venta", $this->idTicket);
        $stmt->execute();
        $stmt = $conn->prepare("DELETE FROM venta WHERE id_venta = :id_venta");
        $stmt->bindParam(":id_venta", $this->idTicket);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /* Retorna los datos crudos para evitar dobles codificaciones JSON */
    public function api_info_data(): array
    {
        return [
            'idTicket' => $this->idTicket,
            'empleado' => $this->empleado,
            'cliente' => $this->cliente,
            'fechaCreacion' => $this->fechaCreacion,
            'totalVenta' => $this->totalVenta,
            'num_ticket' => $this->num_ticket,
            'BolsaCompra' => $this->BolsaCompra,
        ];
    }

    public function api_info(): string
    {
        return json_encode($this->api_info_data());
    }

    public static function api_getAllTickets(): string
    {
        $tickets = Ticket::getTickets();
        $json = array();
        foreach ($tickets as $ticket) {
            // Usamos el array crudo para que json_encode final no rompa el formato
            $json[] = $ticket->api_info_data();
        }
        return json_encode($json);
    }

    /**
     * Recibe un JSON, lo decodifica y devuelve una instancia de Ticket
     * @param string $jsonString archivo json con la información de ticket
     * @return array|null
     */
    public static function ticket_api_decode(string $jsonString)
    {
        $ticket = json_decode($jsonString, true);

        // Si el JSON es inválido, retornamos null
        if (!$ticket) {
            return null;
        }
        $tickets = array();
        foreach ($ticket as $data) {
            // Retornamos la nueva instancia mapeando las claves del JSON
            $tickets[] = new self(
                $data['idTicket'] ?? null,
                $data['empleado'] ?? null,
                $data['cliente'] ?? null,
                $data['fechaCreacion'] ?? null,
                $data['totalVenta'] ?? null,
                $data['num_ticket'] ?? null,
                $data['BolsaCompra'] ?? null
            );
        }
        return $tickets;
    }

    // Crear json de los tikets con sus productos
    public function api_getTiketsVigentes(): string
    {
        $tikets = Ticket::getTickets();
        $json = array();
        foreach ($tikets as $tiket) {
            $json[] = $tiket->api_info_data();
        }
        return json_encode($json);
    }

    public static function getTicketFromApi($jsonString) {


    }

    /**
     * Datos que se envían a la vista en formato JSON
     * @return array
     */
    public function jsonSerialize(): array{
        return $this->api_info_data();
    }
}
