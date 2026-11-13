package com.tienda.perfumes.dto;

import java.util.List;

public record CrearPedidoRequest(
        Long usuarioId,
        List<ItemPedidoRequest> items,
        ClienteRequest cliente,
        EnvioRequest envio
) {
    public record ItemPedidoRequest(Long id, Integer cantidad) {}

    public record ClienteRequest(
            String nombre,
            String apellido,
            String correo
    ) {}

    public record EnvioRequest(
            String calle,
            String departamento,
            String region,
            String comuna,
            String indicaciones
    ) {}
}
