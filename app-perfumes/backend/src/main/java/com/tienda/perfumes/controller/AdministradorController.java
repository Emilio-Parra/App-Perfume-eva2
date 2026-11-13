package com.tienda.perfumes.controller;

import com.tienda.perfumes.dto.LoginRequest;
import com.tienda.perfumes.model.Administrador;
import com.tienda.perfumes.service.AdministradorService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/admin")
public class AdministradorController {

    private final AdministradorService administradorService;

    public AdministradorController(
            AdministradorService administradorService) {

        this.administradorService = administradorService;
    }

    private Map<String, Object> datosPublicos(Administrador admin) {
        return Map.of(
                "id", admin.getId(),
                "correo", admin.getCorreo(),
                "nombre", admin.getNombre() == null ? "Administrador" : admin.getNombre(),
                "apellido", admin.getApellido() == null ? "Perfumes Store" : admin.getApellido(),
                "rol", "admin"
        );
    }

    // Iniciar sesión como administrador
    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(
            @RequestBody LoginRequest datos,
            HttpServletRequest request,
            HttpServletResponse response) {

        Administrador admin = administradorService.autenticar(
                datos.correo(),
                datos.pass()
        ).orElse(null);

        if (admin == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Correo o contraseña incorrectos."
                    ));
        }

        // Renovar el identificador de sesión si ya existe
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }

        // Autenticación con rol ADMIN
        var autenticacion =
                new UsernamePasswordAuthenticationToken(
                        admin.getCorreo(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_ADMIN")
                        )
                );

        SecurityContext contexto =
                SecurityContextHolder.createEmptyContext();

        contexto.setAuthentication(autenticacion);
        SecurityContextHolder.setContext(contexto);

        // Guardar la autenticación en la sesión HTTP
        new HttpSessionSecurityContextRepository()
                .saveContext(contexto, request, response);

        return ResponseEntity.ok(datosPublicos(admin));
    }

    // Perfil guardado en MySQL; no se toman IDs o correos desde React.
    @GetMapping("/perfil")
    public ResponseEntity<?> consultarPerfil(Authentication autenticacion) {
        if (autenticacion == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return administradorService.obtenerPorCorreo(autenticacion.getName())
                .<ResponseEntity<?>>map(admin -> ResponseEntity.ok(datosPublicos(admin)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Administrador no encontrado.")));
    }

    public record CambiosPerfil(String nombre, String apellido, String pass) {}

    // Cambiar datos del administrador que está autenticado.
    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(
            @RequestBody CambiosPerfil cambios,
            Authentication autenticacion) {

        if (autenticacion == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Administrador actualizado = administradorService.actualizarPerfil(
                    autenticacion.getName(),
                    cambios.nombre(),
                    cambios.apellido(),
                    cambios.pass()
            );
            return ResponseEntity.ok(datosPublicos(actualizado));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
        } catch (NoSuchElementException error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    // Cerrar la sesión del administrador
    @PostMapping("/logout")
    public ResponseEntity<?> cerrarSesion(
            HttpServletRequest request) {

        SecurityContextHolder.clearContext();

        HttpSession sesion = request.getSession(false);
        if (sesion != null) {
            sesion.invalidate();
        }

        return ResponseEntity.ok(Map.of(
                "mensaje", "Sesión cerrada correctamente."
        ));
    }
}
