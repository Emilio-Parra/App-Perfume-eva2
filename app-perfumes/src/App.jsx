import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductoCard } from './components/ProductoCard';
import { CatalogoPage } from './components/CatalogoPage';
import { CarritoPage } from './components/CarritoPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CompraExitosaPage } from './components/CompraExitosaPage';
import { PagoFallidoPage } from './components/PagoFallidoPage';
import { DetallePage } from './components/DetallePage';
import { Footer } from './components/Footer';
import ContactoPage from './components/ContactoPage';
import TiendasPage from './components/TiendasPage';
import { LoginPage } from './components/LoginPage';
import { RegistroPage } from './components/RegistroPage';
import { crearPedido, procesarPago } from './service/pedidosService';
import { cargarProductos, obtenerProductos } from './service/productosService';
import { asegurarAdmin } from './service/usuariosService';
import { AdminPage } from './components/admin/AdminPage';
import { OfertasPage } from './components/OfertasPage';
import { OfertasDestacadas } from './components/OfertasDestacadas';
import { NosotrosPage } from './components/NosotrosPage';
import { BlogPage } from './components/BlogPage';
import { BlogDetallePage } from './components/BlogDetallePage';
import { obtenerBlogs, obtenerBlog } from './data/blogs';
import { precioFinal, enOferta } from './utils/precios';

function App() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [blogSeleccionado, setBlogSeleccionado] = useState(null); // id del artículo abierto en Blog
  // Página visible: inicio | catalogo | ofertas | nosotros | blog | carrito | checkout | compra-exitosa | pago-fallido | tiendas | contacto | login | registro
  const [paginaActual, setPaginaActual] = useState('inicio');

  // Filtros del catálogo (viven aquí para no perderse al abrir un detalle y volver)
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroGenero, setFiltroGenero] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');

  // Estado para el usuario que inició sesión
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const sesion = localStorage.getItem('usuario_actual');
    return sesion ? JSON.parse(sesion) : null;
  });

  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito_perfumes');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Pedido que se está pagando / acaba de pagarse, y si hay un pago en curso
  const [pedidoActual, setPedidoActual] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    asegurarAdmin(); // crea el usuario administrador por defecto si no existe
    cargarProductos()
      .then((data) => setProductos(data))
      .catch((err) => console.error('Error cargando los productos:', err));
  }, []);

  // El panel admin modifica los productos: se vuelve a leer el catálogo para la tienda
  const recargarProductos = () => setProductos(obtenerProductos());

  const esAdmin = usuarioActual?.rol === 'admin';

  useEffect(() => {
    localStorage.setItem('carrito_perfumes', JSON.stringify(carrito));
  }, [carrito]);

  // categoria es opcional: permite abrir el catálogo ya filtrado (ej. desde el footer)
  const handleNavegar = (pagina, categoria = 'todas') => {
    setPaginaActual(pagina);
    setProductoSeleccionado(null);
    setBlogSeleccionado(null);
    if (pagina === 'catalogo') {
      setFiltroCategoria(categoria);
      setFiltroGenero('todos');
      setFiltroTexto('');
    }
  };

  // Buscador del Navbar: abre el catálogo con el texto buscado (y sin otros filtros)
  const handleBuscar = (texto) => {
    setProductoSeleccionado(null);
    setFiltroCategoria('todas');
    setFiltroGenero('todos');
    setFiltroTexto(texto);
    setPaginaActual('catalogo');
  };

  const handleLoginSuccess = (usuario) => {
    setUsuarioActual(usuario);
    setPaginaActual(usuario.rol === 'admin' ? 'admin' : 'inicio');
  };

  // El admin edita su perfil o sus datos: se actualiza también la sesión guardada
  const handleUsuarioActualizado = (usuario) => {
    localStorage.setItem('usuario_actual', JSON.stringify(usuario));
    setUsuarioActual(usuario);
  };

  // Cerrar la sesión de Spring Boot (cliente o administrador)
  // antes de eliminar la sesión local de React.
  const handleCerrarSesion = async () => {
    if (usuarioActual) {
      const rutaLogout = usuarioActual.rol === 'admin'
        ? '/api/admin/logout'
        : '/api/usuarios/logout';

      try {
        const respuesta = await fetch(rutaLogout, {
          method: 'POST',
          credentials: 'same-origin'
        });

        // Si la sesión expiró en el servidor, también se puede limpiar React.
        if (!respuesta.ok && respuesta.status !== 401) {
          throw new Error(`HTTP ${respuesta.status}`);
        }
      } catch (error) {
        console.error('No se pudo cerrar la sesión en el backend:', error);
        window.alert('No se pudo confirmar el cierre de sesión con el servidor. Inténtalo nuevamente.');
        return;
      }
    }

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
      // En el carrito se guarda el precio ya con descuento: así el total y el pedido cobran lo correcto
      return [...prev, { ...producto, precioOriginal: producto.precio, precio: precioFinal(producto), cantidad: 1 }];
    });
  };

  const handleEliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const handleVaciarCarrito = () => {
    setCarrito([]);
  };

  // delta = +1 o -1; la cantidad mínima es 1 (para quitar el producto se usa "Eliminar")
  const handleCambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
      )
    );
  };

  // ---------- Pago ----------
  // El backend registra el pedido, simula el pago y descuenta el stock.
  // React solo actualiza el carrito y las pantallas según la respuesta.
  const cobrarPedido = async (pedido) => {
    setProcesandoPago(true);

    try {
      const resultado = await procesarPago(pedido.id);
      setPedidoActual(resultado);

      if (resultado.estado === 'pagado') {
        // El descuento de stock ya fue realizado por Spring Boot.
        setCarrito([]);
        setPaginaActual('compra-exitosa');

        // Consultar el stock actualizado desde MySQL.
        try {
          const catalogoActualizado = await cargarProductos();
          setProductos(catalogoActualizado);
        } catch (error) {
          // Un error al actualizar el catálogo NO invalida un pago confirmado.
          console.error('No se pudo actualizar el catálogo:', error);
        }
      } else {
        setPaginaActual('pago-fallido');
      }
    } catch (error) {
      console.error('No se pudo confirmar el pago:', error);
      setPedidoActual(pedido);
      setPaginaActual('pago-fallido');
      window.alert(
        'No se pudo confirmar el estado del pago: ' + error.message +
        '. Antes de reintentar, verifica el estado del pedido en MySQL.'
      );
    } finally {
      setProcesandoPago(false);
    }
  };

  // Checkout: espera que Spring Boot cree el pedido antes de cobrarlo.
  const handlePagar = async ({ cliente, envio }) => {
    if (procesandoPago) return;
    setProcesandoPago(true);

    try {
      const pedido = await crearPedido({ cliente, envio, items: carrito });
      setPedidoActual(pedido);
      await cobrarPedido(pedido);
    } catch (error) {
      console.error('No se pudo crear el pedido:', error);
      window.alert('No se pudo crear el pedido: ' + error.message);
    } finally {
      setProcesandoPago(false);
    }
  };

  // Si el pago falla, reintenta el mismo pedido sin crear otro.
  const handleReintentarPago = () => {
    if (procesandoPago || !pedidoActual) return;
    cobrarPedido(pedidoActual);
  };

  // Productos destacados que se muestran en Inicio
  const productosInicio = productos.filter((p) => [6, 2, 3, 17].includes(Number(p.id)));

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMonto = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Panel de administración: layout propio, solo para usuarios con rol admin
  if (paginaActual === 'admin' && esAdmin) {
    return (
      <AdminPage
        usuarioActual={usuarioActual}
        onUsuarioActualizado={handleUsuarioActualizado}
        onProductosCambiados={recargarProductos}
        onIrATienda={() => handleNavegar('inicio')}
        onCerrarSesion={handleCerrarSesion}
      />
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        totalItems={totalItems} 
        totalMonto={totalMonto}
        paginaActual={paginaActual}
        onNavegar={handleNavegar}
        usuarioActual={usuarioActual}
        onCerrarSesion={handleCerrarSesion}
        textoBusqueda={filtroTexto}
        onBuscar={handleBuscar}
      />

      {/* Vistas Dinámicas */}
      {productoSeleccionado ? (
        <DetallePage
          producto={productoSeleccionado}
          onVolver={() => setProductoSeleccionado(null)}
          onAgregar={handleAgregarAlCarrito}
        />
      ) : paginaActual === 'nosotros' ? (
        <NosotrosPage onIrACatalogo={() => handleNavegar('catalogo')} />
      ) : paginaActual === 'blog' ? (
        blogSeleccionado ? (
          <BlogDetallePage blog={obtenerBlog(blogSeleccionado)} onVolver={() => setBlogSeleccionado(null)} />
        ) : (
          <BlogPage blogs={obtenerBlogs()} onVerBlog={setBlogSeleccionado} />
        )
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
      ) : paginaActual === 'carrito' ? (
        <CarritoPage
          carrito={carrito}
          productos={productos}
          onAgregar={handleAgregarAlCarrito}
          onCambiarCantidad={handleCambiarCantidad}
          onEliminar={handleEliminarDelCarrito}
          onVaciar={handleVaciarCarrito}
          onComprar={() => handleNavegar('checkout')}
          onVerDetalle={setProductoSeleccionado}
          onIrACatalogo={() => handleNavegar('catalogo')}
        />
      ) : paginaActual === 'checkout' ? (
        <CheckoutPage
          carrito={carrito}
          usuarioActual={usuarioActual}
          procesando={procesandoPago}
          onPagar={handlePagar}
          onVolver={() => handleNavegar('carrito')}
        />
      ) : paginaActual === 'compra-exitosa' ? (
        <CompraExitosaPage
          pedido={pedidoActual}
          onSeguirComprando={() => handleNavegar('catalogo')}
        />
      ) : paginaActual === 'pago-fallido' ? (
        <PagoFallidoPage
          pedido={pedidoActual}
          procesando={procesandoPago}
          onReintentar={handleReintentarPago}
          onVolverAlCarrito={() => handleNavegar('carrito')}
        />
      ) : paginaActual === 'ofertas' ? (
        <OfertasPage
          productos={productos}
          onAgregar={handleAgregarAlCarrito}
          onVerDetalle={setProductoSeleccionado}
        />
      ) : paginaActual === 'catalogo' ? (
        <CatalogoPage
          productos={productos}
          filtroCategoria={filtroCategoria}
          onCambiarCategoria={setFiltroCategoria}
          filtroGenero={filtroGenero}
          onCambiarGenero={setFiltroGenero}
          filtroTexto={filtroTexto}
          onCambiarTexto={setFiltroTexto}
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

          {/* Ofertas destacadas en INICIO */}
          <OfertasDestacadas
            productos={productos}
            onAgregar={handleAgregarAlCarrito}
            onVerDetalle={setProductoSeleccionado}
            onVerTodas={() => handleNavegar('ofertas')}
          />

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

      <Footer onNavegar={handleNavegar} />
    </div>
  );
}

export default App;