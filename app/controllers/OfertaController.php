<?php

class OfertaController extends Controller
{
    /**
     * Lista de ofertas. Filtro opcional: search (nombre de la oferta)
     */
    public function listar(): array
    {
        $ofertas = Oferta::getOfertas();
        $busqueda = trim($this->input('search', ''));
        if ($busqueda !== '') {
            $ofertas = array_values(array_filter($ofertas, function ($oferta) use ($busqueda) {
                return mb_stripos($oferta->getNombre() ?? '', $busqueda) !== false;
            }));
        }
        return $this->ok($ofertas);
    }

    public function crear(): array
    {
        $this->exigirPost();
        [$nombre, $descuento, $productosIds, $fechaFin, $activa] = $this->leerFormulario();

        if (empty($nombre) || !is_numeric($descuento) || empty($productosIds)) {
            return $this->error('Datos inválidos. Verifica el formulario.');
        }
        $nuevaOferta = new Oferta(null, $nombre, $descuento, null, null, $fechaFin, $productosIds, $activa);
        if (!$nuevaOferta->IngresarOferta()) {
            return $this->error('Error al crear la oferta.');
        }
        return $this->ok(null, 'Oferta creada correctamente.');
    }

    public function actualizar(): array
    {
        $this->exigirPost();
        $idEdit = $this->input('idOferta', '');
        [$nombre, $descuento, $productosIds, $fechaFin, $activa] = $this->leerFormulario();

        if (empty($idEdit) || empty($nombre) || !is_numeric($descuento) || empty($productosIds)) {
            return $this->error('Datos inválidos. Verifica el formulario.');
        }
        $ofertaActualizar = new Oferta($idEdit, $nombre, $descuento, null, null, $fechaFin, $productosIds, $activa);
        if (!$ofertaActualizar->ActualizarOferta()) {
            return $this->error('No se realizaron cambios o hubo un error.');
        }
        return $this->ok(null, 'Oferta actualizada correctamente.');
    }

    /**
     * Activa / desactiva una oferta
     */
    public function cambiarEstado(): array
    {
        $this->exigirPost();
        $idToggle = $this->input('idOferta', '');
        if (empty($idToggle) || !Oferta::toggleStatus($idToggle)) {
            return $this->error('Error al actualizar el estado de la oferta.');
        }
        return $this->ok(null, 'Estado de la oferta actualizado correctamente.');
    }

    public function eliminar(): array
    {
        $this->exigirPost();
        $idDel = $this->input('idOferta', '');
        if (empty($idDel)) {
            return $this->error('Oferta no indicada.');
        }
        $ofertaEliminar = new Oferta($idDel, '', 0, null, null, null, [], false);
        if (!$ofertaEliminar->EliminarOferta()) {
            return $this->error('Error al eliminar la oferta.');
        }
        return $this->ok(null, 'Oferta eliminada correctamente.');
    }

    /**
     * Campos comunes de los formularios de crear y editar
     */
    private function leerFormulario(): array
    {
        $fechaFin = $this->input('fechaFin', null);
        return [
            trim($this->input('nombre', '')),
            $this->input('descuento', ''),
            (array)$this->input('productos', []),
            empty($fechaFin) ? null : $fechaFin,
            $this->input('activa', '1') === '1',
        ];
    }
}
