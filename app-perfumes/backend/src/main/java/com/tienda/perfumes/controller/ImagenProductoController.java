package com.tienda.perfumes.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Guarda imágenes en una carpeta persistente y entrega una URL pública.
 * Spring Security ya limita POST /api/productos/** al administrador;
 * GET /api/** es público para que cualquier cliente vea los perfumes.
 */
@RestController
@RequestMapping("/api/productos/imagen")
public class ImagenProductoController {

    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private final Path carpeta;

    public ImagenProductoController(
            @Value("${app.imagenes.directorio:./uploads/productos}") String directorio) {
        this.carpeta = Paths.get(directorio).toAbsolutePath().normalize();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subir(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Selecciona una imagen."));
        }
        if (archivo.getSize() > MAX_BYTES) {
            return ResponseEntity.badRequest().body(Map.of("error", "La imagen supera 5 MB."));
        }

        try {
            byte[] contenido = archivo.getBytes();
            String extension = extensionValida(contenido);
            if (extension == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Solo se permiten imágenes JPG, PNG o WebP válidas."));
            }

            Files.createDirectories(carpeta);
            String nombre = UUID.randomUUID() + "." + extension;
            Files.write(carpeta.resolve(nombre), contenido, StandardOpenOption.CREATE_NEW);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("url", "/api/productos/imagen/" + nombre));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo almacenar la imagen en el servidor."));
        }
    }

    @GetMapping("/{nombre:.+}")
    public ResponseEntity<Resource> visualizar(@PathVariable String nombre) {
        // El nombre lo genera el servidor. Evita traversal y archivos arbitrarios.
        if (!nombre.matches("[0-9a-f-]{36}\\.(jpg|png|webp)")) {
            return ResponseEntity.notFound().build();
        }
        Path archivo = carpeta.resolve(nombre).normalize();
        if (!archivo.startsWith(carpeta) || !Files.isRegularFile(archivo)) {
            return ResponseEntity.notFound().build();
        }
        try {
            Resource recurso = new UrlResource(archivo.toUri());
            MediaType tipo = nombre.endsWith(".png") ? MediaType.IMAGE_PNG
                    : nombre.endsWith(".webp") ? MediaType.parseMediaType("image/webp")
                    : MediaType.IMAGE_JPEG;
            return ResponseEntity.ok()
                    .contentType(tipo)
                    .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                    .body(recurso);
        } catch (IOException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    private static String extensionValida(byte[] bytes) {
        if (bytes.length < 12 || bytes.length > MAX_BYTES) return null;
        // JPEG: FF D8 FF
        if ((bytes[0] & 255) == 255 && (bytes[1] & 255) == 216 && (bytes[2] & 255) == 255)
            return "jpg";
        // PNG: firma de 8 bytes
        int[] png = {137, 80, 78, 71, 13, 10, 26, 10};
        boolean esPng = true;
        for (int i = 0; i < png.length; i++) {
            if ((bytes[i] & 255) != png[i]) { esPng = false; break; }
        }
        if (esPng) return "png";
        // WebP: RIFF .... WEBP
        if (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P')
            return "webp";
        return null;
    }
}
