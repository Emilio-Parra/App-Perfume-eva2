package com.tienda.perfumes.service;

import com.tienda.perfumes.model.Administrador;
import com.tienda.perfumes.repository.AdministradorRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class AdministradorService {

    private final AdministradorRepository administradorRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AdministradorService(
            AdministradorRepository administradorRepository) {

        this.administradorRepository = administradorRepository;
    }

    // Buscar administrador por correo y validar su contraseña
    public Optional<Administrador> autenticar(
            String correo, String contrasena) {

        if (correo == null || contrasena == null) {
            return Optional.empty();
        }

        String correoNormalizado =
                correo.trim().toLowerCase(Locale.ROOT);

        return administradorRepository
                .findByCorreo(correoNormalizado)
                .filter(admin ->
                        passwordEncoder.matches(
                                contrasena,
                                admin.getPasswordHash()
                        )
                );
    }

    // Consultar el perfil real del administrador en MySQL.
    public Optional<Administrador> obtenerPorCorreo(String correo) {
        if (correo == null) return Optional.empty();
        return administradorRepository.findByCorreo(
                correo.trim().toLowerCase(Locale.ROOT)
        );
    }

    // Actualizar solo el administrador autenticado.
    @Transactional
    public Administrador actualizarPerfil(
            String correo, String nombre, String apellido, String nuevaContrasena) {

        if (nombre == null || nombre.trim().isEmpty() || nombre.trim().length() > 50) {
            throw new IllegalArgumentException("El nombre es obligatorio (máximo 50 caracteres).");
        }
        if (apellido == null || apellido.trim().isEmpty() || apellido.trim().length() > 100) {
            throw new IllegalArgumentException("El apellido es obligatorio (máximo 100 caracteres).");
        }

        Administrador admin = obtenerPorCorreo(correo)
                .orElseThrow(() -> new NoSuchElementException("No existe el administrador."));

        admin.setNombre(nombre.trim());
        admin.setApellido(apellido.trim());

        // Campo vacío: conservar la contraseña anterior.
        if (nuevaContrasena != null && !nuevaContrasena.isEmpty()) {
            if (nuevaContrasena.length() < 4 || nuevaContrasena.length() > 10) {
                throw new IllegalArgumentException("La contraseña debe tener entre 4 y 10 caracteres.");
            }
            admin.setPasswordHash(passwordEncoder.encode(nuevaContrasena));
        }

        return administradorRepository.save(admin);
    }

    // Crear la cuenta inicial desde el backend
    // No se expondrá como registro público
    public Administrador crearAdministradorInicial(
            String correo, String contrasena) {

        if (correo == null || correo.isBlank() ||
                contrasena == null || contrasena.isBlank()) {

            throw new IllegalArgumentException(
                    "El correo y la contraseña son obligatorios."
            );
        }

        String correoNormalizado =
                correo.trim().toLowerCase(Locale.ROOT);

        Optional<Administrador> existente =
                administradorRepository.findByCorreo(correoNormalizado);

        if (existente.isPresent()) {
            return existente.get();
        }

        Administrador admin = new Administrador();
        admin.setCorreo(correoNormalizado);
        admin.setNombre("Administrador");
        admin.setApellido("Perfumes Store");

        // Nunca guardar la contraseña en texto normal
        admin.setPasswordHash(
                passwordEncoder.encode(contrasena)
        );

        return administradorRepository.save(admin);
    }
}
