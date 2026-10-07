<?php

class ProveedorController extends Controller
{
    /**
     * Lista de proveedores. Filtro opcional: search (nombre)
     */
    public function listar(): array
    {
        $busqueda = trim($this->input('search', ''));
        $proveedores = $busqueda !== '' ? Proveedor::buscarProveedores($busqueda) : Proveedor::getProveedores();
        return $this->ok($proveedores);
    }

    public function crear(): array
    {
        $this->exigirPost();
        $nombre = trim($this->input('nombre', ''));
        if (empty($nombre)) {
            return $this->error('El nombre es obligatorio.');
        }
        $nuevoProveedor = new Proveedor(
            null,
            $nombre,
            $this->input('direccion', ''),
            $this->input('telefono', '') ?: null,
            $this->input('correo', '')
        );
        if (!$nuevoProveedor->IngresarProveedor()) {
            return $this->error('Error al guardar el proveedor.');
        }
        return $this->ok(null, 'Proveedor creado correctamente.');
    }

    public function actualizar(): array
    {
        $this->exigirPost();
        $idEdit = $this->input('idProveedor', '');
        $nombreEdit = trim($this->input('nombre', ''));
        if (empty($idEdit) || empty($nombreEdit)) {
            return $this->error('Datos inválidos. Verifica el formulario.');
        }
        $provActualizar = new Proveedor(
            $idEdit,
            $nombreEdit,
            $this->input('direccion', ''),
            $this->input('telefono', '') ?: null,
            $this->input('correo', '')
        );
        if (!$provActualizar->ActualizarProveedor()) {
            return $this->error('No se realizaron cambios o hubo un error.');
        }
        return $this->ok(null, 'Proveedor actualizado correctamente.');
    }

    public function eliminar(): array
    {
        $this->exigirPost();
        $idDel = $this->input('idProveedor', '');
        if (empty($idDel)) {
            return $this->error('Proveedor no indicado.');
        }
        $provEliminar = new Proveedor($idDel, '', '', '', '');
        if (!$provEliminar->EliminarProveedor()) {
            return $this->error('Error al eliminar proveedor.');
        }
        return $this->ok(null, 'Proveedor eliminado correctamente.');
    }
}
