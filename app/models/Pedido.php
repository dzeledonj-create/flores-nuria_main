<?php

class Pedido implements JsonSerializable
{
    private $idPedido;
    private $estado;
    private $fecha;
    private $bolsaCompra;
    private $totalPedido;
    private $idProveedor;

    /**
     * @param $idPedido int
     * @param $estado string
     * @param $productos array 0-> id del producto, 1-> cantidad del producto
     * @param $fecha string Fecha del pedido
     * @param $totalPedido float Coste total del pedido, 2 decimales
     * @param $idProveedor int
     */
    public function __construct($idPedido, $estado, $bolsa_compra, $fecha,$totalPedido,$idProveedor){
        $this->idPedido = $idPedido;
        $this->estado = $estado;
        $this->bolsaCompra = $bolsa_compra;
        $this->fecha = $fecha;
        $this->totalPedido = $totalPedido;
        $this->idProveedor = $idProveedor;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdPedido(){
        return $this->idPedido;
    }
    public function getEstado(){
        return $this->estado;
    }
    public function getFechaCreacion(){
        return $this->fecha;
    }
    public function getBolsaCompra(){
        return $this->bolsaCompra;
    }
    public function getTotalPedido(){
        return $this->totalPedido;
    }
    public function getIdProveedor(){
        return $this->idProveedor;
    }

    /*********************************  METODOS *****************************************/
    /************************************************************************************/

    public static function getPedidos(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT p.* 
            FROM pedidos p");
        $stmt->execute();
        $pedidos = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $bolsa_compra = BolsaCompra::getBolsaCompraByIdPedido($row->id_pedido);
            $pedidos[] = new Pedido(
                $row->id_pedido,
                $row->estado,
                $bolsa_compra,
                $row->fechaPedido,
                $row->total_pedido,
                $row->id_proveedor
            );
        }
        return $pedidos;
    }

    public static function buscarPedidos($busqueda){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT p.* FROM pedidos p LEFT JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor WHERE p.estado ILIKE :busqueda OR pr.nombre ILIKE :busqueda");
        $termino = "%" . trim($busqueda) . "%";
        $stmt->bindParam(":busqueda", $termino);
        $stmt->execute();
        $pedidos = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $bolsa_compra = BolsaCompra::getBolsaCompraByIdPedido($row->id_pedido);
            $pedidos[] = new Pedido(
                $row->id_pedido,
                $row->estado,
                $bolsa_compra,
                $row->fechaPedido,
                $row->total_pedido,
                $row->id_proveedor
            );
        }
        return $pedidos;
    }

    public function IngresarPedido(){
        $conn = BD::FloresNuria();
        $stmt  = $conn->prepare("INSERT INTO pedidos (\"fechaPedido\", estado, id_proveedor) VALUES (:fecha, :estado, :id_proveedor) RETURNING id_pedido");
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":fecha", $this->fecha);
        $stmt->bindParam(":id_proveedor", $this->idProveedor);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->idPedido = $row['id_pedido'];
            $this->bolsaCompra->IngresarPedidoProductos($this);
            
            if ($this->estado === 'Recibido') {
                $this->ajustarStock(1);
            }
            
            return true;
        }
        return false;
    }

    public function EliminarPedido(){
        $conn = BD::FloresNuria();
        
        $stmtOld = $conn->prepare("SELECT estado FROM pedidos WHERE id_pedido = :id");
        $stmtOld->execute([":id" => $this->idPedido]);
        $old_state = $stmtOld->fetchColumn();
        
        if ($old_state === 'Recibido') {
            $this->ajustarStock(-1);
        }
        
        $stmt = $conn->prepare("DELETE FROM pedido_producto WHERE id_pedido = :id_pedido");
        $stmt->bindParam(":id_pedido", $this->idPedido);
        $stmt->execute();
        $stmt = $conn->prepare("DELETE FROM pedidos WHERE id_pedido = :id_pedido");
        $stmt->bindParam(":id_pedido", $this->idPedido);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function ModificarEstado(){
        $conn = BD::FloresNuria();
        
        $stmtOld = $conn->prepare("SELECT estado FROM pedidos WHERE id_pedido = :id");
        $stmtOld->execute([":id" => $this->idPedido]);
        $old_state = $stmtOld->fetchColumn();
        
        $stmt = $conn->prepare("UPDATE pedidos SET estado = :estado WHERE id_pedido = :id");
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":id", $this->idPedido);
        $stmt->execute();
        
        $updated = $stmt->rowCount() > 0;
        if ($old_state && $old_state !== $this->estado) {
            if ($this->estado === 'Recibido') {
                $this->ajustarStock(1);
            } elseif ($old_state === 'Recibido') {
                $this->ajustarStock(-1);
            }
        }
        
        return $updated;
    }

    public function ActualizarPedido(){
        $conn = BD::FloresNuria();
        
        $stmtOld = $conn->prepare("SELECT estado FROM pedidos WHERE id_pedido = :id");
        $stmtOld->execute([":id" => $this->idPedido]);
        $old_state = $stmtOld->fetchColumn();
        
        $stmt = $conn->prepare("UPDATE pedidos SET \"fechaPedido\" = :fecha, estado = :estado, id_proveedor = :id_proveedor WHERE id_pedido = :id");
        $stmt->bindParam(":estado", $this->estado);
        $stmt->bindParam(":fecha", $this->fecha);
        $stmt->bindParam(":id_proveedor", $this->idProveedor);
        $stmt->bindParam(":id", $this->idPedido);
        $stmt->execute();
        
        $this->bolsaCompra->IngresarPedidoProductos($this);
        
        if ($old_state && $old_state !== $this->estado) {
            if ($this->estado === 'Recibido') {
                $this->ajustarStock(1);
            } elseif ($old_state === 'Recibido') {
                $this->ajustarStock(-1);
            }
        }
        
        return true;
    }

    private function ajustarStock($multiplicador){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT id_producto, cantidad FROM pedido_producto WHERE id_pedido = ?");
        $stmt->execute([$this->idPedido]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $cantidad = $row['cantidad'] * $multiplicador;
            $upd = $conn->prepare("UPDATE producto SET stock = stock + ? WHERE id_producto = ?");
            $upd->execute([$cantidad, $row['id_producto']]);
        }
    }

    /**
     * Datos que se envían a la vista en formato JSON
     * @return array
     */
    public function jsonSerialize(): array{
        return [
            'idPedido' => $this->idPedido,
            'estado' => $this->estado,
            'fecha' => $this->fecha,
            'totalPedido' => $this->totalPedido,
            'idProveedor' => $this->idProveedor,
            'productos' => $this->bolsaCompra ?: [],
        ];
    }
}
