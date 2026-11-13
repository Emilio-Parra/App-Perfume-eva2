
package com.tienda.perfumes.config;

import com.tienda.perfumes.service.AdministradorService;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class AdministradorInicialConfig {

    @Bean
    public ApplicationRunner crearAdministradorInicial(
            AdministradorService administradorService,
            Environment environment) {

        return args -> {

            String correo = environment.getProperty("ADMIN_EMAIL");
            String contrasena = environment.getProperty("ADMIN_PASSWORD");

            // Si no hay credenciales configuradas,
            // no crear ninguna cuenta.
            if (correo == null || correo.isBlank()
                    || contrasena == null || contrasena.isBlank()) {

                System.out.println(
                    "Administrador inicial: credenciales no configuradas."
                );
                return;
            }

            // Crear la cuenta solamente si todavía no existe.
            administradorService.crearAdministradorInicial(
                    correo, contrasena
            );

            System.out.println(
                "Administrador inicial verificado correctamente."
            );
        };
    }
}
