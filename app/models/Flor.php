<?php

class Flor extends Producto
{
    private $color;
    private $especie;
    private $fecha_corte;

    public function __construct($idProducto, $nombre, $precio, $stock, $oferta, $iva, $categoria, $color, $especie, $fecha_corte){
        parent::__construct($idProducto, $nombre, $precio, $stock, $oferta, $iva, $categoria);
        $this->color = $color;
        $this->especie = $especie;
        $this->fecha_corte = $fecha_corte;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getColor(){
        return $this->color;
    }
    public function getEspecie(){
        return $this->especie;
    }
    public function getFechaCorte(){
        return $this->fecha_corte;
    }

    /********************************** METODOS *****************************************/
    /************************************************************************************/

    public static function getProductos(): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT p.*, f.* FROM producto p 
            RIGHT JOIN flores f ON p.id_producto = f.producto_id WHERE p.categoria = ?");
        $stmt->execute(["flor"]);
        $flores = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
            $flores[] = new Flor(
                $row->id_producto,
                $row->nombre,
                $row->precio,
                $row->stock,
                $oferta,
                $row->iva,
                $row->color,
                $row->especie,
                $row->fecha_corte
            );
        }
        return $flores;
    }
}