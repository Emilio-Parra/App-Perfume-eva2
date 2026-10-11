import React from 'react';
import { clp } from '../utils/formato';

// Tabla de solo lectura con los productos (checkout, compra exitosa y pago fallido)
export const TablaResumen = ({ items }) => (
  <div className="table-responsive">
    <table className="table table-sm align-middle mb-0">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th className="text-end">Precio</th>
          <th className="text-center">Cantidad</th>
          <th className="text-end">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const nombre = item.modelo || item.nombre;
          return (
            <tr key={item.id}>
              <td>
                <img
                  src={item.imagenes}
                  alt={nombre}
                  width="40"
                  height="40"
                  style={{ objectFit: 'contain' }}
                />
              </td>
              <td>
                <small className="text-muted text-uppercase d-block">{item.marca}</small>
                {nombre}
              </td>
              <td className="text-end">{clp(item.precio)}</td>
              <td className="text-center">{item.cantidad}</td>
              <td className="text-end">{clp(item.precio * item.cantidad)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
