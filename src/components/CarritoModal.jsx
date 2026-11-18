import React from 'react';

export const CarritoModal = ({ isOpen, onClose, carrito, onEliminar, onVaciar }) => {
  if (!isOpen) return null;

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleFinalizarCompra = () => {
    alert('🎉 ¡Compra realizada con éxito! Muchas gracias por tu compra.');
    onVaciar();
    onClose();
  };

  return (
    <div className="modal fade show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable modal-md ms-auto me-3 mt-3">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">🛒 Mi Carrito</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {carrito.length === 0 ? (
              <p className="text-center text-muted my-4">El carrito está vacío.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {carrito.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <h6 className="my-0 fw-bold">{item.marca} - {item.modelo || item.nombre}</h6>
                      <small className="text-muted">
                        ${item.precio.toLocaleString('es-CL')} x {item.cantidad}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold">${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => onEliminar(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {carrito.length > 0 && (
            <div className="modal-footer flex-column align-items-stretch">
              <div className="d-flex justify-content-between fs-5 fw-bold mb-3">
                <span>Total:</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
              <button className="btn btn-dark w-100 py-2 fw-bold" onClick={handleFinalizarCompra}>
                Finalizar Compra
              </button>
              <button className="btn btn-link text-danger text-decoration-none btn-sm mt-1" onClick={onVaciar}>
                Vaciar Carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};