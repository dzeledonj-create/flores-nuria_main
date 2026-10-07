<?php

/**
 * Ventas (tickets) y cobros/pagos.
 */
class VentaController extends Controller
{
    /**
     * Lista de ventas con el nombre del empleado y del cliente
     */
    public function listar(): array
    {
        $empleados = [];
        $clientes = [];
        $resultado = [];
        foreach (Ticket::getTickets() as $venta) {
            $idEmpleado = $venta->getEmpleado();
            $idCliente = $venta->getCliente();
            if ($idEmpleado !== null && !array_key_exists($idEmpleado, $empleados)) {
                $empleados[$idEmpleado] = $this->nombreEmpleado($idEmpleado);
            }
            if ($idCliente !== null && !array_key_exists($idCliente, $clientes)) {
                $clientes[$idCliente] = $this->nombreCliente($idCliente);
            }
            $datos = $venta->api_info_data();
            $datos['empleadoNombre'] = $empleados[$idEmpleado] ?? '';
            $datos['clienteNombre'] = $clientes[$idCliente] ?? '';
            $resultado[] = $datos;
        }
        return $this->ok($resultado);
    }

    /**
     * Genera storage/json/tickets.json con todas las ventas y devuelve los tickets leídos del fichero
     */
    public function exportar(): array
    {
        $this->exigirPost();
        $config = require __DIR__ . '/../config/config.php';
        $carpeta = $config['storage'] . '/json';
        if (!is_dir($carpeta)) {
            mkdir($carpeta, 0777, true);
        }

        $jsonTickets = Ticket::api_getAllTickets();
        file_put_contents($carpeta . '/tickets.json', $jsonTickets);
        $tickets = Ticket::ticket_api_decode($jsonTickets) ?? [];
        return $this->ok($tickets, 'Tickets exportados a JSON correctamente.');
    }

    /**
     * Registro de pago (pendiente de implementar la persistencia en BD)
     */
    public function registrarPago(): array
    {
        $this->exigirPost();
        $pedido_id = filter_var($this->input('pedido_id'), FILTER_VALIDATE_INT);
        $monto = filter_var($this->input('monto'), FILTER_VALIDATE_FLOAT);
        $metodo = trim($this->input('metodo', ''));
        $fecha = trim($this->input('fecha', ''));

        if (!$pedido_id || !$monto || !$metodo || !$fecha) {
            return $this->error('Por favor, completa todos los campos obligatorios (*).');
        }

        // TODO: crear la clase Pago y guardar el pago en la base de datos
        return $this->ok(null, 'Pago registrado correctamente.');
    }

    private function nombreEmpleado($idEmpleado): string
    {
        try {
            return Empleado::getEmpleadoById($idEmpleado)->getNombre() ?? '';
        } catch (Throwable $e) {
            return '';
        }
    }

    private function nombreCliente($idCliente): string
    {
        try {
            return Cliente::getClienteById($idCliente)->getNombre() ?? '';
        } catch (Throwable $e) {
            return '';
        }
    }
}
