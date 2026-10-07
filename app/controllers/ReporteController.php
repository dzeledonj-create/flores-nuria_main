<?php

class ReporteController extends Controller
{
    /**
     * Datos para los gráficos de la página de informes
     */
    public function datos(): array
    {
        $tickets = Ticket::getTickets();
        $pedidos = Pedido::getPedidos();
        $productos = Producto::getProductos();

        return $this->ok([
            'ventas' => Reporte::ventasPorMes($tickets),
            'pedidos' => Reporte::pedidosPorEstado($pedidos),
            'productos' => Reporte::productosVendidosVsPedidos($tickets, $pedidos, $productos),
        ]);
    }
}
