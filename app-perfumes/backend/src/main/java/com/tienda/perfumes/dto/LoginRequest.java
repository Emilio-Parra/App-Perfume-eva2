package com.tienda.perfumes.dto;

public record LoginRequest(
        String correo,
        String pass
) {
}
