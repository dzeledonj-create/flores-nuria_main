<?php

class Oferta implements JsonSerializable
{
    private $idOferta;
    private $nombre;
    private $descuento;
    private $fechaCreacion;
    private $fechaActualizacion;
    private $fechaFin;
    private $productosIds;
    private $activa;
    public $producto_nombre; // Para vistas

    public function __construct($idOferta, $nombre, $descuento, $fechaCreacion, $fechaActualizacion, $fechaFin, $productosIds, $activa)
    {
        $this->idOferta = $idOferta;
        $this->nombre = $nombre;
        $this->descuento = $descuento;
        $this->fechaCreacion = $fechaCreacion;
        $this->fechaActualizacion = $fechaActualizacion;
        $this->fechaFin = $fechaFin;
        $this->productosIds = $productosIds;
        $this->activa = $activa;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdOferta(){
        return $this->idOferta;
    }
    public function getNombre(){
        return $this->nombre;
    }
    public function getDescuento(){
        return $this->descuento;
    }
    public function getFechaCreacion(){
        return $this->fechaCreacion;
    }
    public function getFechaActualizacion(){
        return $this->fechaActualizacion;
    }
    public function getFechaFin(){
        return $this->fechaFin;
    }
    public function getProductosIds(){
        return $this->productosIds;
    }
    public function getActiva(){
        return $this->activa;
    }
    public function setActiva($activa){
        $this->activa = filter_var($activa, FILTER_VALIDATE_BOOLEAN);
    }

    /********************************** METODOS *****************************************/
    /************************************************************************************/

    public static function getOfertas(): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT o.*, 
            STRING_AGG(p.nombre, ', ') as producto_nombre, 
            STRING_AGG(p.id_producto::text, ',') as productos_ids
            FROM ofertas o 
            LEFT JOIN oferta_producto op ON o.id_oferta = op.id_oferta
            LEFT JOIN producto p ON op.id_producto = p.id_producto
            GROUP BY o.id_oferta");
        $stmt->execute();
        $ofertas = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = new Oferta(
                $row->id_oferta,
                $row->nombre,
                $row->descuento,
                $row->fecha_creacion,
                $row->fecha_actualizacion,
                $row->fechaFin,
                $row->productos_ids,
                $row->activa
            );
            $oferta->producto_nombre = $row->producto_nombre;
            $ofertas[] = $oferta;
        }
        return $ofertas;
    }

    public static function getOfertaByIdProducto($idProducto): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT o.* FROM ofertas o JOIN oferta_producto op ON o.id_oferta = op.id_oferta WHERE op.id_producto = ?");
        $stmt->execute([$idProducto]);
        $ofertas = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $ofertas[] = new Oferta(
                $row->id_oferta,
                $row->nombre,
                $row->descuento,
                $row->fecha_creacion,
                $row->fecha_actualizacion,
                $row->fechaFin,
                $idProducto,
                $row->activa
            );
        }
        return $ofertas;
    }

    public function IngresarOferta(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("INSERT INTO ofertas(nombre, descuento, \"fechaFin\", activa) VALUES (?, ?, ?, ?)");
        $stmt->execute([$this->nombre, $this->descuento, $this->fechaFin, $this->activa ? 'true' : 'false']);
        $idOferta = $conn->lastInsertId();
        
        if ($idOferta && !empty($this->productosIds)) {
            $stmtInsert = $conn->prepare("INSERT INTO oferta_producto(id_oferta, id_producto) VALUES (?, ?)");
            foreach($this->productosIds as $idProd) {
                $stmtInsert->execute([$idOferta, $idProd]);
            }
        }
        return $idOferta;
    }

    public function ActualizarOferta(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("UPDATE ofertas SET nombre=?, descuento=?, \"fechaFin\"=?, activa=? WHERE id_oferta = ?");
        $ex = $stmt->execute([$this->nombre, $this->descuento, $this->fechaFin, $this->activa ? 'true' : 'false', $this->idOferta]);
        
        if ($ex) {
            $stmtDel = $conn->prepare("DELETE FROM oferta_producto WHERE id_oferta = ?");
            $stmtDel->execute([$this->idOferta]);
            
            if (!empty($this->productosIds)) {
                $stmtInsert = $conn->prepare("INSERT INTO oferta_producto(id_oferta, id_producto) VALUES (?, ?)");
                foreach($this->productosIds as $idProd) {
                    $stmtInsert->execute([$this->idOferta, $idProd]);
                }
            }
        }
        
        return $ex;
    }

    public static function toggleStatus($idOferta){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("UPDATE ofertas SET activa = NOT activa WHERE id_oferta = ?");
        return $stmt->execute([$idOferta]);
    }

    public function EliminarOferta(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("DELETE FROM ofertas WHERE id_oferta = ?");
        $stmt->execute([$this->idOferta]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Datos que se envían a la vista en formato JSON
     * @return array
     */
    public function jsonSerialize(): array{
        $ids = $this->productosIds;
        if (is_string($ids)) {
            $ids = $ids === '' ? [] : explode(',', $ids);
        } elseif (!is_array($ids)) {
            $ids = $ids === null ? [] : [$ids];
        }
        return [
            'idOferta' => $this->idOferta,
            'nombre' => $this->nombre,
            'descuento' => (float)$this->descuento,
            'fechaCreacion' => $this->fechaCreacion,
            'fechaActualizacion' => $this->fechaActualizacion,
            'fechaFin' => $this->fechaFin,
            'productosIds' => array_map('strval', $ids),
            'productoNombre' => $this->producto_nombre,
            'activa' => (bool)$this->activa,
        ];
    }
}
