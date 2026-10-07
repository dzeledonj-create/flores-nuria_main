<?php

/**
 * Cálculos para los informes analíticos (ventas, pedidos y productos).
 */
class Reporte
{
    /**
     * Total vendido agrupado por mes
     * @param $tickets array de Ticket
     * @return array [{mes, total}]
     */
    public static function ventasPorMes(array $tickets): array{
        $salesByMonth = [];
        foreach ($tickets as $ticket) {
            $fecha = strtotime($ticket->getFechaCreacion());
            if ($fecha === false) {
                continue;
            }
            $mes = date('Y-m', $fecha);
            if (!isset($salesByMonth[$mes])) {
                $salesByMonth[$mes] = 0;
            }
            $salesByMonth[$mes] += floatval($ticket->getTotalVenta());
        }
        ksort($salesByMonth);
        $salesChart = [];
        foreach ($salesByMonth as $mes => $total) {
            $salesChart[] = [
                'mes' => $mes,
                'total' => round($total, 2),
            ];
        }
        return $salesChart;
    }

    /**
     * Número de pedidos por estado
     * @param $pedidos array de Pedido
     * @return array [{estado, count}]
     */
    public static function pedidosPorEstado(array $pedidos): array{
        $orderStatuses = [];
        foreach ($pedidos as $pedido) {
            $estado = trim($pedido->getEstado() ?? '') ?: 'Sin estado';
            if (!isset($orderStatuses[$estado])) {
                $orderStatuses[$estado] = 0;
            }
            $orderStatuses[$estado]++;
        }
        $orderChart = [];
        foreach ($orderStatuses as $estado => $count) {
            $orderChart[] = [
                'estado' => $estado,
                'count' => $count,
            ];
        }
        return $orderChart;
    }

    /**
     * Unidades vendidas y pedidas de cada producto, ordenado de más a menos movimiento
     * @return array [{producto, ventas, pedidos}]
     */
    public static function productosVendidosVsPedidos(array $tickets, array $pedidos, array $productos): array{
        $productNames = [];
        foreach ($productos as $producto) {
            $productNames[$producto->getIdProducto()] = $producto->getNombre();
        }

        $soldQuantities = self::sumarCantidades($tickets);
        $orderedQuantities = self::sumarCantidades($pedidos);

        $productChart = [];
        foreach (array_unique(array_merge(array_keys($soldQuantities), array_keys($orderedQuantities))) as $idProducto) {
            $productChart[] = [
                'producto' => $productNames[$idProducto] ?? "Producto {$idProducto}",
                'ventas' => $soldQuantities[$idProducto] ?? 0,
                'pedidos' => $orderedQuantities[$idProducto] ?? 0,
            ];
        }

        usort($productChart, function ($a, $b) {
            return ($b['ventas'] + $b['pedidos']) <=> ($a['ventas'] + $a['pedidos']);
        });
        return $productChart;
    }

    /**
     * Suma las cantidades por producto de las bolsas de compra (tickets o pedidos)
     */
    private static function sumarCantidades(array $elementos): array{
        $cantidades = [];
        foreach ($elementos as $elemento) {
            foreach ($elemento->getBolsaCompra()->getProductos() as $producto) {
                [$idProducto, $cantidad] = $producto;
                if (!isset($cantidades[$idProducto])) {
                    $cantidades[$idProducto] = 0;
                }
                $cantidades[$idProducto] += intval($cantidad);
            }
        }
        return $cantidades;
    }
}
