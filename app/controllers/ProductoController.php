<?php

class ProductoController extends Controller
{
    /**
     * Lista de productos. Filtros opcionales: search (nombre) o category
     */
    public function listar(): array
    {
        $busqueda = trim($this->input('search', ''));
        $categoria = trim($this->input('category', ''));

        if ($busqueda !== '') {
            $productos = Producto::buscarProductos($busqueda);
        } elseif ($categoria !== '') {
            $productos = Producto::getProductosByCategoria($categoria);
        } else {
            $productos = Producto::getProductos();
        }
        return $this->ok($productos);
    }

    public function categorias(): array
    {
        return $this->ok(array_values(array_filter(Producto::getCategorias())));
    }

    public function crear(): array
    {
        $this->exigirPost();
        $nombre = trim($this->input('nombre', ''));
        $precio = $this->input('precio', '');
        $stock = $this->input('stock', '');
        $iva = $this->input('iva', 21.00);

        if (empty($nombre) || !is_numeric($precio) || !is_numeric($stock) || !is_numeric($iva)) {
            return $this->error('Datos inválidos. Verifica el formulario.');
        }
        $nuevoProducto = new Producto(null, $nombre, $precio, $stock, null, $iva, null);
        if (!$nuevoProducto->IngresarProducto()) {
            return $this->error('Error al guardar el producto.');
        }
        return $this->ok(null, 'Producto creado correctamente.');
    }

    public function actualizar(): array
    {
        $this->exigirPost();
        $idEdit = $this->input('idProducto', '');
        $nombreEdit = trim($this->input('nombre', ''));
        $precioEdit = $this->input('precio', '');
        $stockEdit = $this->input('stock', '');
        $ivaEdit = $this->input('iva', 21.00);
        $quitarOferta = $this->input('quitar_oferta', '0');

        if (empty($idEdit) || empty($nombreEdit) || !is_numeric($precioEdit) || !is_numeric($stockEdit) || !is_numeric($ivaEdit)) {
            return $this->error('Datos inválidos. Verifica el formulario.');
        }
        $prodActualizar = new Producto($idEdit, $nombreEdit, $precioEdit, $stockEdit, null, $ivaEdit, null);
        if (!$prodActualizar->ActualizarProducto()) {
            return $this->error('No se realizaron cambios o hubo un error.');
        }
        if ($quitarOferta === '1') {
            $prodActualizar->QuitarOfertas();
        }
        return $this->ok(null, 'Producto actualizado correctamente.');
    }

    public function eliminar(): array
    {
        $this->exigirPost();
        $idDel = $this->input('idProducto', '');
        if (empty($idDel)) {
            return $this->error('Producto no indicado.');
        }
        $prodEliminar = new Producto($idDel, '', 0, 0, null, 0, null);
        if (!$prodEliminar->EliminarProducto()) {
            return $this->error('Error al eliminar producto.');
        }
        return $this->ok(null, 'Producto eliminado correctamente.');
    }
}
