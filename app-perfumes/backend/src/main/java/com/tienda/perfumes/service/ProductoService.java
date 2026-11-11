
package com.tienda.perfumes.service;

import com.tienda.perfumes.model.Producto;
import com.tienda.perfumes.repository.ProductoRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // Obtener todos los productos
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    // Buscar un producto por su ID
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    // Guardar un nuevo producto
    public Producto guardarProducto(Producto producto) {
        producto.setId(null);
        return productoRepository.save(producto);
    }

    // Actualizar un producto existente
    public Optional<Producto> actualizarProducto(Long id, Producto producto) {
        if (!productoRepository.existsById(id)) {
            return Optional.empty();
        }

        producto.setId(id);
        return Optional.of(productoRepository.save(producto));
    }

    // Eliminar un producto
    public boolean eliminarProducto(Long id) {
        if (!productoRepository.existsById(id)) {
            return false;
        }

        productoRepository.deleteById(id);
        return true;
    }
}
