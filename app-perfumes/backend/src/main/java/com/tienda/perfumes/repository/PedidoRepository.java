package com.tienda.perfumes.repository;

import com.tienda.perfumes.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Buscar los pedidos de un usuario
    List<Pedido> findByUsuarioId(Long usuarioId);

    // Buscar pedidos por estado
    List<Pedido> findByEstado(String estado);
}
