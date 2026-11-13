package com.tienda.perfumes.dto;

public record RegistroRequest(
        String rut,
        String correo,
        String nombre,
        String apellido,
        String pass,
        String fechaNac,
        String region,
        String comuna,
        String direccion
) {
}
