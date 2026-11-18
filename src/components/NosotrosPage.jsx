import React from 'react';

const VALORES = [
  { icono: '✅', titulo: 'Autenticidad', texto: 'Trabajamos con fragancias originales y proveedores confiables.' },
  { icono: '🎯', titulo: 'Asesoría cercana', texto: 'Te ayudamos a elegir el perfume que mejor va con tu estilo y tu presupuesto.' },
  { icono: '🚚', titulo: 'Envíos a todo Chile', texto: 'Despacho a todas las regiones, gratis en compras sobre $50.000.' },
];

export const NosotrosPage = ({ onIrACatalogo }) => (
  <main className="container my-5 flex-grow-1">
    <h1 className="text-center fw-bold mb-4 display-5 text-dark text-uppercase">Nosotros</h1>

    <div className="row align-items-center g-4 mb-5">
      <div className="col-md-6">
        <img
          src="/img/tiendas/Costanera-Center-chile-1-3.jpg"
          alt="Una de nuestras tiendas"
          className="img-fluid rounded shadow-sm w-100"
          style={{ maxHeight: '320px', objectFit: 'cover' }}
        />
      </div>
      <div className="col-md-6">
        <h2 className="h4 fw-bold">Nuestra historia</h2>
        <p className="text-secondary">
          Perfumes Store nació de la pasión por las fragancias. Partimos con un pequeño catálogo de perfumes árabes y hoy
          reunimos también las mejores casas de diseñador y la perfumería de nicho, para que encuentres tu firma olfativa
          en un solo lugar.
        </p>
        <p className="text-secondary mb-0">
          Creemos que un perfume es parte de la identidad de cada persona, por eso cuidamos cada detalle: desde la
          selección de los productos hasta que lleguen a tus manos.
        </p>
      </div>
    </div>

    <div className="row g-4 mb-5">
      <div className="col-md-6">
        <div className="card h-100 border-0 shadow-sm p-4">
          <h2 className="h5 fw-bold">Misión</h2>
          <p className="text-secondary mb-0">
            Acercar fragancias originales de calidad a todo Chile, con una experiencia de compra simple, segura y con
            asesoría cercana.
          </p>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card h-100 border-0 shadow-sm p-4">
          <h2 className="h5 fw-bold">Visión</h2>
          <p className="text-secondary mb-0">
            Ser la tienda de perfumes de referencia en el país, reconocida por su variedad, su confianza y su pasión por
            la perfumería.
          </p>
        </div>
      </div>
    </div>

    <h2 className="text-center fw-bold mb-4">Nuestros valores</h2>
    <div className="row row-cols-1 row-cols-md-3 g-4 mb-5">
      {VALORES.map(({ icono, titulo, texto }) => (
        <div className="col" key={titulo}>
          <div className="card h-100 border-0 shadow-sm text-center p-4">
            <div className="fs-1 mb-2" aria-hidden="true">{icono}</div>
            <h3 className="h5 fw-bold">{titulo}</h3>
            <p className="text-secondary mb-0">{texto}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center">
      <button className="btn btn-dark px-4" onClick={onIrACatalogo}>
        Conoce nuestro catálogo
      </button>
    </div>
  </main>
);
