import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductoCard } from './components/ProductoCard';
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
  const [categoriaActual, setCategoriaActual] = useState('inicio');
  
  // Estado para el filtro por género (Todos, Hombre, Mujer, Unisex)
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

  const handleSeleccionarCategoria = (cat) => {
    setCategoriaActual(cat);
    setProductoSeleccionado(null);
    setFiltroGenero('todos'); // Reinicia el filtro al cambiar de pestaña
  };

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    setCategoriaActual('inicio');
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario_actual');
    setUsuarioActual(null);
    setCategoriaActual('inicio');
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

  // 1. Filtrar por Categoría de la página
  const productosFiltrados = (() => {
    let lista = [];

    if (categoriaActual === 'inicio') {
      const idsInicio = [6, 2, 3, 17];
      lista = productos.filter((p) => idsInicio.includes(Number(p.id)));
    } else if (categoriaActual === 'todos') {
      lista = productos;
    } else {
      lista = productos.filter((p) => {
        const catProducto = (p.tipo || p.categoria || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const catBuscada = categoriaActual
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return catProducto.includes(catBuscada) || catBuscada.includes(catProducto);
      });
    }

    // 2. Aplicar Filtro por Género (Hombre / Mujer / Unisex)
    if (filtroGenero !== 'todos') {
      lista = lista.filter((p) => {
        const generoMatch = p.genero && p.genero.toLowerCase().trim() === filtroGenero.toLowerCase();
        const tipoMatch = p.tipo && p.tipo.toLowerCase().trim() === filtroGenero.toLowerCase();
        return generoMatch || tipoMatch;
      });
    }

    return lista;
  })();

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        totalItems={totalItems} 
        onOpenCart={() => setIsCartOpen(true)} 
        categoriaActual={categoriaActual}
        onSeleccionarCategoria={handleSeleccionarCategoria}
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
      ) : categoriaActual === 'contacto' ? (
        <ContactoPage />
      ) : categoriaActual === 'tiendas' ? (
        <TiendasPage />
      ) : categoriaActual === 'login' ? (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onIrARegistro={() => setCategoriaActual('registro')}
        />
      ) : categoriaActual === 'registro' ? (
        <RegistroPage 
          onIrALogin={() => setCategoriaActual('login')}
        />
      ) : (
        <>
          {/* Carrusel de imágenes en INICIO */}
          {categoriaActual === 'inicio' && (
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
          )}

          <main className="container my-5 flex-grow-1">
            <h1 className="text-center fw-bold mb-4 display-5 text-dark text-uppercase">
              {categoriaActual === 'inicio' && 'MÁS VENDIDOS'}
              {categoriaActual === 'todos' && 'Catálogo Completo'}
              {categoriaActual === 'arabe' && 'Perfumes Árabes'}
              {categoriaActual === 'diseñador' && 'Perfumes de Diseñador'}
              {categoriaActual === 'nicho' && 'Perfumes Nicho'}
            </h1>

            {/* Botones de Filtro (Todos / Hombre / Mujer / Unisex) */}
            <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
              {['todos', 'hombre', 'mujer', 'unisex'].map((opcion) => (
                <button
                  key={opcion}
                  className={`btn ${filtroGenero === opcion ? 'btn-dark' : 'btn-outline-dark'} text-capitalize fw-semibold px-3`}
                  onClick={() => setFiltroGenero(opcion)}
                >
                  {opcion === 'todos' ? 'Todos' : opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                </button>
              ))}
            </div>

            {productosFiltrados.length === 0 ? (
              <p className="text-center text-muted fs-5 my-5">
                No hay productos disponibles para este filtro.
              </p>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {productosFiltrados.map((prod) => (
                  <ProductoCard
                    key={prod.id}
                    producto={prod}
                    onAgregar={handleAgregarAlCarrito}
                    onVerDetalle={setProductoSeleccionado}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Sección de Video solo en INICIO */}
          {categoriaActual === 'inicio' && (
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
          )}
        </>
      )}

      <CarritoModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        carrito={carrito}
        onEliminar={handleEliminarDelCarrito}
        onVaciar={handleVaciarCarrito}
      />

      <Footer />
    </div>
  );
}

export default App;