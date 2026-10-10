import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductoCard } from './components/ProductoCard';
import { CatalogoPage } from './components/CatalogoPage';
import { CarritoModal } from './components/CarritoModal';
import { DetallePage } from './components/DetallePage';
import { Footer } from './components/Footer';
import ContactoPage from './components/ContactoPage';
import TiendasPage from './components/TiendasPage';
import { LoginPage } from './components/LoginPage';
import { RegistroPage } from './components/RegistroPage';

function App() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  // Página visible: inicio | catalogo | tiendas | contacto | login | registro
  const [paginaActual, setPaginaActual] = useState('inicio');

  // Filtros del catálogo (viven aquí para no perderse al abrir un detalle y volver)
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroGenero, setFiltroGenero] = useState('todos');

  // Estado para el usuario que inició sesión
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const sesion = localStorage.getItem('usuario_actual');
    return sesion ? JSON.parse(sesion) : null;
  });

  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito_perfumes');
    return guardado ? JSON.parse(guardado) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('/data/productos.json')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error('Error cargando los productos:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito_perfumes', JSON.stringify(carrito));
  }, [carrito]);

  // categoria es opcional: permite abrir el catálogo ya filtrado (ej. desde el footer)
  const handleNavegar = (pagina, categoria = 'todas') => {
    setPaginaActual(pagina);
    setProductoSeleccionado(null);
    if (pagina === 'catalogo') {
      setFiltroCategoria(categoria);
      setFiltroGenero('todos');
    }
  };

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    setPaginaActual('inicio');
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_actual');
    setUsuarioActual(null);
    setPaginaActual('inicio');
  };

  const handleAgregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const handleEliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const handleVaciarCarrito = () => {
    setCarrito([]);
  };

  // Productos destacados que se muestran en Inicio
  const productosInicio = productos.filter((p) => [6, 2, 3, 17].includes(Number(p.id)));

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        totalItems={totalItems} 
        onOpenCart={() => setIsCartOpen(true)} 
        paginaActual={paginaActual}
        onNavegar={handleNavegar}
        usuarioActual={usuarioActual}
        onCerrarSesion={handleCerrarSesion}
      />

      {/* Vistas Dinámicas */}
      {productoSeleccionado ? (
        <DetallePage
          producto={productoSeleccionado}
          onVolver={() => setProductoSeleccionado(null)}
          onAgregar={handleAgregarAlCarrito}
        />
      ) : paginaActual === 'contacto' ? (
        <ContactoPage />
      ) : paginaActual === 'tiendas' ? (
        <TiendasPage />
      ) : paginaActual === 'login' ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onIrARegistro={() => setPaginaActual('registro')}
        />
      ) : paginaActual === 'registro' ? (
        <RegistroPage
          onIrALogin={() => setPaginaActual('login')}
        />
      ) : paginaActual === 'catalogo' ? (
        <CatalogoPage
          productos={productos}
          filtroCategoria={filtroCategoria}
          onCambiarCategoria={setFiltroCategoria}
          filtroGenero={filtroGenero}
          onCambiarGenero={setFiltroGenero}
          onAgregar={handleAgregarAlCarrito}
          onVerDetalle={setProductoSeleccionado}
        />
      ) : (
        <>
          {/* Carrusel de imágenes en INICIO */}
          <div id="carouselInicio" className="carousel slide" data-bs-ride="carousel" data-bs-interval="2500">
              <div className="carousel-inner" style={{ height: '450px' }}>
                <div className="carousel-item active h-100">
                  <img 
                    src="/img/assets/watermarked_img_4464425131527519554.jpg" 
                    className="d-block w-100 h-100" 
                    alt="Encuentra tu firma olfativa" 
                    style={{ objectFit: 'cover', objectPosition: 'center' }} 
                  />
                </div>
                <div className="carousel-item h-100">
                  <img 
                    src="/img/assets/hombre-con-blue-chanel.jpg" 
                    className="d-block w-100 h-100" 
                    alt="Perfumes para hombre" 
                    style={{ objectFit: 'cover', objectPosition: 'center' }} 
                  />
                </div>
              </div>
          </div>

          <main className="container my-5 flex-grow-1">
            <h1 className="text-center fw-bold mb-4 display-5 text-dark text-uppercase">
              Más vendidos
            </h1>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {productosInicio.map((prod) => (
                <ProductoCard
                  key={prod.id}
                  producto={prod}
                  onAgregar={handleAgregarAlCarrito}
                  onVerDetalle={setProductoSeleccionado}
                />
              ))}
            </div>

            <div className="text-center mt-4">
              <button className="btn btn-dark px-4" onClick={() => handleNavegar('catalogo')}>
                Ver catálogo completo
              </button>
            </div>
          </main>

          {/* Sección de Video solo en INICIO */}
          <section className="container my-5 text-center">
              <h2 className="mb-4 fw-bold">Conoce cómo aplicar tus fragancias</h2>
              <div className="ratio ratio-16x9 mx-auto shadow rounded" style={{ maxWidth: '700px' }}>
                <iframe 
                  src="https://www.youtube.com/embed/hsRiL5t45CY" 
                  title="Video sobre perfumes" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
          </section>
        </>
      )}

      <CarritoModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        carrito={carrito}
        onEliminar={handleEliminarDelCarrito}
        onVaciar={handleVaciarCarrito}
      />

      <Footer onNavegar={handleNavegar} />
    </div>
  );
}

export default App;