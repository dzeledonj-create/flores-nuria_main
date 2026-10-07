<?php

class Producto implements JsonSerializable
{
    protected $idProducto;
    protected $nombre;
    protected $precio;
    protected $stock;
    protected $oferta;
    protected $iva;
    protected $categoria;
    public function __construct($idProducto, $nombre, $precio, $stock, $oferta, $iva, $categoria){
        $this->idProducto = $idProducto;
        $this->nombre = $nombre;
        $this->precio = $precio;
        $this->stock = $stock;
        $this->iva = $iva;
        if ($oferta) {
            $this->oferta = $oferta;
        } else {
            $this->oferta = 0;
        }
        $this->categoria = $categoria;
    }

    /*********************************  GETTERS y SETTERS *******************************/
    /************************************************************************************/

    public function getIdProducto(){
        return $this->idProducto;
    }
    public function getNombre(){
        return $this->nombre;
    }
    public function getPrecio(){
        return $this->precio;
    }
    public function getStock(){
        return $this->stock;
    }
    public function getOferta(){
        return $this->oferta;
    }
    public function getIva(){
        return $this->iva;
    }
    public function getCategoria(){
        return $this->categoria;
    }
    // Precio final con descuento
    public function getPrecioConIva(){
        $precioDesc = $this->precio;
        if (!empty($this->oferta)) {
            $descuento = 0;
            foreach ($this->oferta as $oferta) {
                if ($oferta->getActiva() && $oferta->getDescuento() > $descuento) {
                    $descuento = $oferta->getDescuento();
                }
            }
            $precioDesc = $precioDesc * (1 - ($descuento / 100));
        }
        return $precioDesc * (1 + ($this->iva / 100));
    }

    /*********************************  METODOS *****************************************/
    /************************************************************************************/

    public static function getProductos(){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM producto");
        $stmt->execute();
        $productos = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
            $productos[] = new Producto(
                $row->id_producto,
                $row->nombre,
                $row->precioBase,
                $row->stock,
                $oferta,
                $row->iva,
                $row->categoria
            );
        }
        return $productos;
    }

    /**
     * Devuelve los productos de una categoría (flor, planta, accesorio...)
     * @param $categoria string
     * @return array
     */
    public static function getProductosByCategoria($categoria): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM producto WHERE categoria::text = ?");
        $stmt->execute([$categoria]);
        $productos = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
            $productos[] = new Producto(
                $row->id_producto,
                $row->nombre,
                $row->precioBase,
                $row->stock,
                $oferta,
                $row->iva,
                $row->categoria
            );
        }
        return $productos;
    }

    public static function buscarProductos($busqueda){
        $conn = BD::FloresNuria();
        // Usamos ILIKE para búsqueda insensible a mayúsculas en PostgreSQL
        $stmt = $conn->prepare("SELECT * FROM producto WHERE nombre ILIKE ?");
        $stmt->execute(["%" . $busqueda . "%"]);
        $productos = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
            $productos[] = new Producto(
                $row->id_producto,
                $row->nombre,
                $row->precioBase ?? $row->precio ?? 0,
                $row->stock,
                $oferta,
                $row->iva,
                $row->categoria
            );
        }
        return $productos;
    }

    public static function getProductoById($idProducto){
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT * FROM producto WHERE id_producto = ?");
        $stmt->execute(array($idProducto));
        $row = $stmt->fetch(PDO::FETCH_OBJ);
        $oferta = Oferta::getOfertaByIdProducto($row->id_producto);
        return new Producto(
            $row->id_producto,
            $row->nombre,
            $row->precioBase,
            $row->stock,
            $oferta,
            $row->iva,
            $row->categoria
        );
    }

    public function ActualizarProducto(): bool{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("UPDATE producto SET nombre = :nombre, \"precioBase\" = :precio, stock = :stock, iva = :iva WHERE id_producto = :idProducto");
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":iva", $this->iva);
        $stmt->bindParam(":idProducto", $this->idProducto);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function IngresarProducto(): bool{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("INSERT INTO producto(nombre, \"precioBase\", stock, iva) VALUES (:nombre, :precio, :stock, :iva)");
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":iva", $this->iva);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function EliminarProducto(): bool{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("DELETE FROM producto WHERE id_producto = :idProducto");
        $stmt->bindParam(":idProducto", $this->idProducto);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Desvincula el producto de todas sus ofertas
     * @return bool
     */
    public function QuitarOfertas(): bool{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("DELETE FROM oferta_producto WHERE id_producto = ?");
        return $stmt->execute([$this->idProducto]);
    }

    public static function getCategorias(): array{
        $conn = BD::FloresNuria();
        $stmt = $conn->prepare("SELECT DISTINCT categoria FROM producto");
        $stmt->execute();
        $categorias = array();
        while ($row = $stmt->fetch(PDO::FETCH_OBJ)) {
            $categorias[] = $row->categoria;
        }
        return $categorias;

    }

    /**
     * Datos que se envían a la vista en formato JSON
     * @return array
     */
    public function jsonSerialize(): array{
        return [
            'idProducto' => $this->idProducto,
            'nombre' => $this->nombre,
            'precio' => (float)$this->precio,
            'stock' => (int)$this->stock,
            'iva' => (float)$this->iva,
            'categoria' => $this->categoria,
            'precioConIva' => (float)$this->getPrecioConIva(),
            'ofertas' => is_array($this->oferta) ? $this->oferta : [],
        ];
    }
}
