
package com.tienda.perfumes.service;

import com.tienda.perfumes.model.Categoria;
import com.tienda.perfumes.repository.CategoriaRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    // Obtener todas las categorias
    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    // Buscar una categoria por su ID
    public Optional<Categoria> obtenerPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    // Guardar una nueva categoria
    public Categoria guardarCategoria(Categoria categoria) {
        categoria.setId(null);
        return categoriaRepository.save(categoria);
    }

    // Actualizar una categoria existente
    public Optional<Categoria> actualizarCategoria(Long id, Categoria categoria) {
        if (!categoriaRepository.existsById(id)) {
            return Optional.empty();
        }

        categoria.setId(id);
        return Optional.of(categoriaRepository.save(categoria));
    }

    // Eliminar una categoria
    public boolean eliminarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            return false;
        }

        categoriaRepository.deleteById(id);
        return true;
    }
}
