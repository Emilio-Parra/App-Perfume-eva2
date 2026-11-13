package com.tienda.perfumes.controller;

import com.tienda.perfumes.model.Usuario;
import com.tienda.perfumes.repository.PedidoRepository;
import com.tienda.perfumes.repository.UsuarioRepository;
import com.tienda.perfumes.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

// Esta API esta protegida por /api/admin/** en SecurityConfig.
// Los administradores se autentican con su propia tabla: aqui solo se gestionan clientes.
@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuariosController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final PedidoRepository pedidoRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AdminUsuariosController(UsuarioRepository usuarioRepository,
                                  UsuarioService usuarioService,
                                  PedidoRepository pedidoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.pedidoRepository = pedidoRepository;
    }

    public record DatosUsuario(String rut, String correo, String nombre, String apellido,
                               String pass, String rol, String fechaNac,
                               String region, String comuna, String direccion) { }

    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll().stream()
                .filter(u -> "cliente".equalsIgnoreCase(u.getRol()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody DatosUsuario datos) {
        if (datos == null || (datos.rol() != null && !"cliente".equals(datos.rol()))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Solo se pueden crear clientes desde esta sección."));
        }
        try {
            Usuario nuevo = new Usuario();
            nuevo.setRut(datos.rut());
            nuevo.setCorreo(datos.correo());
            nuevo.setNombre(datos.nombre());
            nuevo.setApellido(datos.apellido());
            nuevo.setFechaNac(datos.fechaNac());
            nuevo.setRegion(datos.region());
            nuevo.setComuna(datos.comuna());
            nuevo.setDireccion(datos.direccion());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(usuarioService.registrarCliente(nuevo, datos.pass()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{correo}")
    public ResponseEntity<?> editar(@PathVariable String correo, @RequestBody DatosUsuario datos) {
        if (datos == null || (datos.rol() != null && !"cliente".equals(datos.rol()))) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede asignar el rol de administrador desde aquí."));
        }
        Usuario usuario = usuarioRepository.findByCorreo(correo.toLowerCase(Locale.ROOT)).orElse(null);
        if (usuario == null || !"cliente".equalsIgnoreCase(usuario.getRol())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Cliente no encontrado."));
        }
        if (datos.correo() == null || datos.correo().isBlank() ||
            datos.rut() == null || datos.rut().isBlank() ||
            datos.nombre() == null || datos.nombre().isBlank() ||
            datos.apellido() == null || datos.apellido().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Completa RUN, nombre, apellido y correo."));
        }
        String nuevoCorreo = datos.correo().trim().toLowerCase(Locale.ROOT);
        String nuevoRut = datos.rut().trim();
        if (!nuevoCorreo.equals(usuario.getCorreo()) && usuarioRepository.existsByCorreo(nuevoCorreo)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ese correo ya está en uso."));
        }
        if (!nuevoRut.equals(usuario.getRut()) && usuarioRepository.existsByRut(nuevoRut)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ese RUN ya está en uso."));
        }
        usuario.setCorreo(nuevoCorreo);
        usuario.setRut(nuevoRut);
        usuario.setNombre(datos.nombre().trim());
        usuario.setApellido(datos.apellido().trim());
        usuario.setFechaNac(datos.fechaNac());
        usuario.setRegion(datos.region());
        usuario.setComuna(datos.comuna());
        usuario.setDireccion(datos.direccion());
        if (datos.pass() != null && !datos.pass().isBlank()) {
            if (datos.pass().length() < 4 || datos.pass().length() > 10) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener entre 4 y 10 caracteres."));
            }
            usuario.setPasswordHash(encoder.encode(datos.pass()));
        }
        try {
            return ResponseEntity.ok(usuarioRepository.save(usuario));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "No se pudieron guardar los cambios del cliente."));
        }
    }

    @DeleteMapping("/{correo}")
    public ResponseEntity<?> eliminar(@PathVariable String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo.toLowerCase(Locale.ROOT)).orElse(null);
        if (usuario == null || !"cliente".equalsIgnoreCase(usuario.getRol())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Cliente no encontrado."));
        }
        // No borrar clientes que tienen pedidos: la tabla de pedidos los referencia.
        if (!pedidoRepository.findByUsuarioId(usuario.getId()).isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Este cliente tiene pedidos. No se puede eliminar."));
        }
        usuarioRepository.delete(usuario);
        return ResponseEntity.noContent().build();
    }
}
