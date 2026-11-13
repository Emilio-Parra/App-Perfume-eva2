
package com.tienda.perfumes.repository;

import com.tienda.perfumes.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdministradorRepository
        extends JpaRepository<Administrador, Long> {

    // Buscar administrador por correo
    Optional<Administrador> findByCorreo(String correo);

    // Comprobar si ya existe
    boolean existsByCorreo(String correo);
}
