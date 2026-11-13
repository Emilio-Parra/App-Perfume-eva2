
package com.tienda.perfumes.repository;

import com.tienda.perfumes.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Buscar un usuario por correo
    Optional<Usuario> findByCorreo(String correo);

    // Buscar un usuario por RUT
    Optional<Usuario> findByRut(String rut);

    // Comprobar si ya existe un correo
    boolean existsByCorreo(String correo);

    // Comprobar si ya existe un RUT
    boolean existsByRut(String rut);

    // Contar usuarios según su rol
    long countByRol(String rol);
}
