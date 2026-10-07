<?php

class PedidoController extends Controller
{
    /**
     * Lista de pedidos con el nombre de cada producto incluido.
     * Filtro opcional: search (estado o nombre del proveedor)
     */
    public function listar(): array
    {
        $busqueda = trim($this->input('search', ''));
        $pedidos = $busqueda !== '' ? Pedido::buscarPedidos($busqueda) : Pedido::getPedidos();

        // Mapa id => nombre para mostrar nombres en lugar de IDs
        $prodMap = [];
        foreach (Producto::getProductos() as $p) {
            $prodMap[$p->getIdProducto()] = $p->getNombre();
        }

        $resultado = [];
        foreach ($pedidos as $pedido) {
            $datos = $pedido->jsonSerialize();
            $items = [];
            foreach ($pedido->getBolsaCompra()->getProductos() as $item) {
                $items[] = [
                    'nombre' => $prodMap[$item[0]] ?? 'Producto Desconocido',
                    'cantidad' => (int)$item[1],
                ];
            }
            $datos['productos'] = $items;
            $resultado[] = $datos;
        }
        return $this->ok($resultado);
    }

    public function crear(): array
    {
        $this->exigirPost();
        $proveedor = $this->input('id_proveedor', '');
        $fecha = $this->input('fecha', '') ?: date('Y-m-d');
        $estado = $this->input('estado', 'Pendiente');
        $prods = (array)$this->input('productos', []);
        $cants = (array)$this->input('cantidades', []);

        if (empty($proveedor)) {
            return $this->error('El proveedor es obligatorio.');
        }
        $bolsa = new BolsaCompra();
        for ($i = 0; $i < count($prods); $i++) {
            if (!empty($prods[$i]) && !empty($cants[$i]) && $cants[$i] > 0) {
                $bolsa->addProducto($prods[$i], $cants[$i]);
            }
        }

        $nuevoPedido = new Pedido(null, $estado, $bolsa, $fecha, 0, $proveedor);
        if (!$nuevoPedido->IngresarPedido()) {
            return $this->error('Error al guardar el pedido.');
        }
        return $this->ok(null, 'Pedido creado exitosamente.');
    }

    public function actualizar(): array
    {
        $this->exigirPost();
        $idEdit = $this->input('idPedido', '');
        $provEdit = $this->input('id_proveedor', '');
        $fechaEdit = $this->input('fecha', '');
        $estEdit = $this->input('estado', '');

        if (empty($idEdit) || empty($provEdit)) {
            return $this->error('Datos inválidos. Verifica el formulario.');
        }
        $bolsaVacia = new BolsaCompra(); // Evita errores
        $pedActualizar = new Pedido($idEdit, $estEdit, $bolsaVacia, $fechaEdit, 0, $provEdit);
        if (!$pedActualizar->ActualizarPedido()) {
            return $this->error('No se realizaron cambios o hubo un error.');
        }
        return $this->ok(null, 'Pedido actualizado correctamente.');
    }

    public function cambiarEstado(): array
    {
        $this->exigirPost();
        $idStatus = $this->input('idPedido', '');
        $nuevoEstado = $this->input('estado', '');
        if (empty($idStatus) || empty($nuevoEstado)) {
            return $this->error('Datos inválidos.');
        }
        $ped = new Pedido($idStatus, $nuevoEstado, null, null, null, null);
        if (!$ped->ModificarEstado()) {
            return $this->error('Error al cambiar el estado.');
        }
        return $this->ok(null, 'Estado del pedido actualizado.');
    }

    public function eliminar(): array
    {
        $this->exigirPost();
        $idDel = $this->input('idPedido', '');
        if (empty($idDel)) {
            return $this->error('Pedido no indicado.');
        }
        $pedEliminar = new Pedido($idDel, '', null, '', 0, 0);
        if (!$pedEliminar->EliminarPedido()) {
            return $this->error('Error al eliminar pedido.');
        }
        return $this->ok(null, 'Pedido eliminado correctamente.');
    }
}
