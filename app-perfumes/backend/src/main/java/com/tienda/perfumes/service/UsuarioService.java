
package com.tienda.perfumes.service;

import com.tienda.perfumes.model.Usuario;
import com.tienda.perfumes.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Locale;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Registrar un nuevo cliente
    public Usuario registrarCliente(Usuario datos, String contrasena) {

        if (datos == null ||
                datos.getCorreo() == null ||
                datos.getCorreo().isBlank() ||
                datos.getRut() == null ||
                datos.getRut().isBlank() ||
                contrasena == null ||
                contrasena.isBlank()) {
            throw new IllegalArgumentException(
                    "Correo, RUT y contraseña son obligatorios."
            );
        }

        String correo = datos.getCorreo().trim()
                .toLowerCase(Locale.ROOT);
        String rut = datos.getRut().trim();

        // Validar correo duplicado
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException(
                    "El correo ya está registrado."
            );
        }

        // Validar RUT duplicado
        if (usuarioRepository.existsByRut(rut)) {
            throw new IllegalArgumentException(
                    "El RUT ya está registrado."
            );
        }

        Usuario nuevo = new Usuario();

        nuevo.setRut(rut);
        nuevo.setCorreo(correo);
        nuevo.setNombre(datos.getNombre());
        nuevo.setApellido(datos.getApellido());
        nuevo.setFechaNac(datos.getFechaNac());
        nuevo.setRegion(datos.getRegion());
        nuevo.setComuna(datos.getComuna());
        nuevo.setDireccion(datos.getDireccion());

        // Todos los registros públicos serán clientes
        nuevo.setRol("cliente");

        // Guardar la contraseña protegida
        nuevo.setPasswordHash(
                passwordEncoder.encode(contrasena)
        );

        return usuarioRepository.save(nuevo);
    }

    // Validar las credenciales para iniciar sesión
    public Optional<Usuario> autenticar(
            String correo, String contrasena) {

        if (correo == null || contrasena == null) {
            return Optional.empty();
        }

        return usuarioRepository
                .findByCorreo(
                        correo.trim().toLowerCase(Locale.ROOT)
                )
                .filter(usuario ->
                        passwordEncoder.matches(
                                contrasena,
                                usuario.getPasswordHash()
                        )
                );
    }

    // Buscar un usuario por correo
    public Optional<Usuario> obtenerPorCorreo(String correo) {
        if (correo == null) {
            return Optional.empty();
        }

        return usuarioRepository.findByCorreo(
                correo.trim().toLowerCase(Locale.ROOT)
        );
    }


    // Contar los clientes registrados en MySQL
    public long contarClientes() {
        return usuarioRepository.countByRol("cliente");
    }

}
