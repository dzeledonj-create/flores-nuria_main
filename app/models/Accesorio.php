<?php

class Accesorio extends Producto
{
    private $tamano;
    private $material;

    public function __construct($idProducto, $nombre, $precio, $stock, $oferta, $iva, $tamano, $material)
    {
        parent::__construct($idProducto, $nombre, $precio, $stock, $oferta, $iva);
        $this->tamano = $tamano;
        $this->material = $material;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getTamano(){
        return $this->tamano;
    }
    public function getMaterial(){
        return $this->material;
    }

    /********************************** METODOS *****************************************/
    /************************************************************************************/

    /**
     * @return array
     */
    public static function getProductos(): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT p.*, a.* FROM producto p 
            RIGHT JOIN accesorios a ON p.id_producto = a.producto_id WHERE p.categoria = ?");
        $stmt->execute(["accesorio"]);
        $accesorios = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
            $accesorios[] = new Flor(
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
        return $accesorios;
    }
}