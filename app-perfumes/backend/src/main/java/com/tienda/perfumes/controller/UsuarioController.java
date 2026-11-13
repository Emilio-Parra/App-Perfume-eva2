
package com.tienda.perfumes.controller;

import com.tienda.perfumes.dto.RegistroRequest;
import com.tienda.perfumes.dto.LoginRequest;
import com.tienda.perfumes.model.Usuario;
import com.tienda.perfumes.service.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Registrar un nuevo cliente
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(
            @RequestBody RegistroRequest datos) {

        try {
            Usuario usuario = new Usuario();

            usuario.setRut(datos.rut());
            usuario.setCorreo(datos.correo());
            usuario.setNombre(datos.nombre());
            usuario.setApellido(datos.apellido());
            usuario.setFechaNac(datos.fechaNac());
            usuario.setRegion(datos.region());
            usuario.setComuna(datos.comuna());
            usuario.setDireccion(datos.direccion());

            Usuario nuevo = usuarioService.registrarCliente(
                    usuario, datos.pass()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevo);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Iniciar sesión como cliente
    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(
            @RequestBody LoginRequest datos,
            HttpServletRequest request,
            HttpServletResponse response) {

        Usuario usuario = usuarioService.autenticar(
                datos.correo(), datos.pass()
        ).orElse(null);

        if (usuario == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Correo o contraseña incorrectos."
                    ));
        }

        // Renovar el identificador si ya existe una sesión
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }

        // Identificar al cliente mediante su ID de MySQL
        var autenticacion =
                new UsernamePasswordAuthenticationToken(
                        usuario.getId().toString(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_CLIENTE")
                        )
                );

        // Crear el contexto de seguridad
        SecurityContext contexto =
                SecurityContextHolder.createEmptyContext();

        contexto.setAuthentication(autenticacion);
        SecurityContextHolder.setContext(contexto);

        // Guardar la sesión autenticada en Spring Boot
        new HttpSessionSecurityContextRepository()
                .saveContext(contexto, request, response);

        // Mantener la respuesta que ya utiliza React
        return ResponseEntity.ok(usuario);
    }

    // Consultar cantidad de clientes registrados
    @GetMapping("/total-clientes")
    public ResponseEntity<?> obtenerTotalClientes() {

        long total = usuarioService.contarClientes();

        return ResponseEntity.ok(
                Map.of("totalClientes", total)
        );
    }


    // Cerrar la sesión del cliente
    @PostMapping("/logout")
    public ResponseEntity<?> cerrarSesion(
            HttpServletRequest request) {

        // Eliminar la autenticación actual
        SecurityContextHolder.clearContext();

        // Invalidar la sesión guardada en Spring Boot
        var sesion = request.getSession(false);

        if (sesion != null) {
            sesion.invalidate();
        }

        return ResponseEntity.ok(
                Map.of(
                    "mensaje",
                    "Sesión de cliente cerrada correctamente."
                )
        );
    }

}
