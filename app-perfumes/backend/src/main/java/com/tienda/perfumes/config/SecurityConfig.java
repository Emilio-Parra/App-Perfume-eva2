
package com.tienda.perfumes.config;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            // Configuración temporal para desarrollo.
            // La protección CSRF sigue pendiente.
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            )

            // Recuperar la autenticación de la sesión
            .securityContext(context -> context
                .securityContextRepository(
                    new HttpSessionSecurityContextRepository()
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Inicio de sesión de administrador
                .requestMatchers(
                    HttpMethod.POST, "/api/admin/login"
                ).permitAll()

                // Consultas privadas del administrador
                .requestMatchers(
                    "/api/pedidos/admin",
                    "/api/usuarios/total-clientes"
                ).hasRole("ADMIN")

                // Rutas administrativas
                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")

                // Gestión de productos
                .requestMatchers(
                    HttpMethod.POST, "/api/productos/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT, "/api/productos/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE, "/api/productos/**"
                ).hasRole("ADMIN")

                // Crear pedidos: requiere sesión de cliente
                .requestMatchers(
                    HttpMethod.POST, "/api/pedidos"
                ).hasRole("CLIENTE")

                // Procesar pagos: requiere sesión de cliente
                .requestMatchers(
                    HttpMethod.POST, "/api/pedidos/*/pago"
                ).hasRole("CLIENTE")

                // Registro, login de clientes y catálogo
                .requestMatchers("/api/**").permitAll()

                .anyRequest().denyAll()
            )

            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, error) ->
                        response.setStatus(
                            HttpServletResponse.SC_UNAUTHORIZED
                        )
                )
            );

        return http.build();
    }
}
