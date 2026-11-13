package com.tienda.perfumes.repository;

import com.tienda.perfumes.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetallePedidoRepository
        extends JpaRepository<DetallePedido, Long> {

    // Obtener los productos de un pedido
    List<DetallePedido> findByPedidoId(Long pedidoId);
}
