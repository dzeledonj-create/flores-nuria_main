<?php

class Planta extends Producto
{
    private $frecuencia_riego;
    private $es_exterior;
    private $sustrato;

    public function __construct($idProducto, $nombre, $precio, $stock, $oferta, $iva, $frecuencia_riego, $es_exterior, $sustrato){
        parent::__construct($idProducto, $nombre, $precio, $stock, $oferta, $iva);
        $this->frecuencia_riego = $frecuencia_riego;
        $this->es_exterior = $es_exterior;
        $this->sustrato = $sustrato;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getFrecuenciaRiego(){
        return $this->frecuencia_riego;
    }
    public function esExterior(){
        return $this->es_exterior;
    }
    public function getSustrato(){
        return $this->sustrato;
    }

    /********************************** METODOS *****************************************/
    /************************************************************************************/

    public static function getProductos(): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT p.*, pl.* FROM producto p 
            RIGHT JOIN plantas pl ON p.id_producto = pl.producto_id WHERE p.categoria = ?");
        $stmt->execute(["planta"]);
        $plantas = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
            $plantas[] = new Planta(
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
        return $plantas;
    }
}