
package com.tienda.perfumes.controller;

import com.tienda.perfumes.dto.CrearPedidoRequest;
import com.tienda.perfumes.model.Pedido;
import com.tienda.perfumes.service.PedidoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // Obtener todos los pedidos para el administrador
    @GetMapping("/admin")
    public ResponseEntity<?> obtenerPedidosAdmin() {

        return ResponseEntity.ok(
                pedidoService.obtenerPedidosAdmin()
        );
    }

    // Crear un pedido para el cliente autenticado
    @PostMapping
    public ResponseEntity<?> crearPedido(
            @RequestBody CrearPedidoRequest datos,
            Authentication authentication) {

        try {
            // Obtener el ID del cliente desde Spring Security
            Long usuarioAutenticadoId =
                    Long.valueOf(authentication.getName());

            // Comprobar que el pedido pertenece al cliente
            if (datos.usuarioId() == null ||
                    !datos.usuarioId().equals(usuarioAutenticadoId)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "error",
                                "No puedes crear pedidos para otro usuario."
                        ));
            }

            Pedido pedido = pedidoService.crearPedido(datos);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "id", pedido.getId(),
                            "codigo", pedido.getCodigo(),
                            "estado", pedido.getEstado(),
                            "fecha", pedido.getFecha().toString(),
                            "total", pedido.getTotal(),
                            "cantidadProductos",
                            pedido.getDetalles().size()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Procesar el pago de un pedido propio
    @PostMapping("/{id}/pago")
    public ResponseEntity<?> procesarPago(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            // Obtener el ID del cliente autenticado
            Long usuarioAutenticadoId =
                    Long.valueOf(authentication.getName());

            // Buscar el pedido antes de pagarlo
            Pedido pedidoExistente = pedidoService
                    .obtenerPorId(id)
                    .orElse(null);

            if (pedidoExistente == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "error", "El pedido no existe."
                        ));
            }

            // Comprobar que el cliente es dueño del pedido
            if (!pedidoExistente.getUsuario().getId()
                    .equals(usuarioAutenticadoId)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "error",
                                "No puedes pagar un pedido de otro usuario."
                        ));
            }

            // Procesar el pago con la lógica existente
            Pedido pedido = pedidoService.procesarPago(id);

            return ResponseEntity.ok(Map.of(
                    "id", pedido.getId(),
                    "codigo", pedido.getCodigo(),
                    "estado", pedido.getEstado(),
                    "intentos", pedido.getIntentos(),
                    "total", pedido.getTotal()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
