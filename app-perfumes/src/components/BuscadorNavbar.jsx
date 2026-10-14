import React, { useState } from 'react';

export function BuscadorNavbar({ textoInicial = '', onBuscar }) {
  const [texto, setTexto] = useState(textoInicial);

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar(texto.trim());
  };

  return (
    <form className="d-flex me-lg-3 mb-2 mb-lg-0" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        className="form-control form-control-sm me-2"
        placeholder="Buscar perfumes..."
        aria-label="Buscar perfumes"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <button type="submit" className="btn btn-outline-warning btn-sm">
        Buscar
      </button>
    </form>
  );
}