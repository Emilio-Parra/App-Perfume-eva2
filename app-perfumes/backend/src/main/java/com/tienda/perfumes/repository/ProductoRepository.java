
package com.tienda.perfumes.repository;

import com.tienda.perfumes.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

}
