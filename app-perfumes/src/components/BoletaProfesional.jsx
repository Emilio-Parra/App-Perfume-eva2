import React from 'react';
import { clp } from '../utils/formato';
import './BoletaProfesional.css';

const mostrar = (valor) => String(valor ?? '').trim() || 'No informado';
const fechaChile = (fecha) => {
  if (!fecha) return 'No informada';
  const d = new Date(fecha);
  return Number.isNaN(d.getTime())
    ? mostrar(fecha)
    : d.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });
};

const Etiqueta = ({ children, valor }) => (
  <div className="ps-dato">
    <span className="ps-dato-etiqueta">{children}</span>
    <span className="ps-dato-valor">{mostrar(valor)}</span>
  </div>
);

/** Comprobante de compra visual. No reemplaza una boleta fiscal autorizada por el SII. */
export function BoletaProfesional({ pedido }) {
  if (!pedido) return null;

  const cliente = pedido.cliente || {};
  const envio = pedido.envio || {};
  const items = Array.isArray(pedido.items) ? pedido.items : [];
  const nombreCliente = [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') ||
    (pedido.usuarioId ? `Cliente #${pedido.usuarioId}` : 'No informado');
  const direccion = [envio.calle, envio.departamento && `Depto. ${envio.departamento}`]
    .filter(Boolean).join(', ');
  const ciudad = [envio.comuna, envio.region].filter(Boolean).join(', ');
  const pagado = String(pedido.estado).toLowerCase() === 'pagado';
  const sumaItems = items.reduce((total, item) => total + Number(item.precio || 0) * Number(item.cantidad || 0), 0);
  const total = Number(pedido.total || 0);

  return (
    <article className="ps-boleta" id="boleta-imprimible" aria-label={`Comprobante de pedido ${pedido.id}`}>
      <header className="ps-cabecera">
        <div className="ps-marca">
          <div className="ps-marca-iso" aria-hidden="true">✦</div>
          <div>
            <div className="ps-nombre-marca">PERFUMES <span>STORE</span></div>
            <div className="ps-marca-descripcion">PERFUMERÍA · EXPERIENCIAS QUE PERDURAN</div>
          </div>
        </div>
        <div className="ps-cabecera-tipo">
          <span className="ps-documento-tipo">COMPROBANTE DE COMPRA</span>
          <div className="ps-documento-numero">N.º {pedido.id}</div>
          <span className={`ps-estado ${pagado ? 'ps-estado-pagado' : 'ps-estado-pendiente'}`}>
            <span className="ps-estado-punto" />
            {pagado ? 'PAGO CONFIRMADO' : mostrar(pedido.estado).toUpperCase()}
          </span>
        </div>
      </header>

      <div className="ps-barra" />

      <section className="ps-resumen-orden" aria-label="Detalles de compra">
        <div>
          <span className="ps-bloque-label">CÓDIGO DE PEDIDO</span>
          <div className="ps-codigo">{mostrar(pedido.codigo)}</div>
        </div>
        <div>
          <span className="ps-bloque-label">FECHA DE COMPRA</span>
          <div className="ps-codigo">{fechaChile(pedido.fecha)}</div>
        </div>
        <div>
          <span className="ps-bloque-label">ESTADO DE PAGO</span>
          <div className="ps-codigo">{pagado ? 'Pagado' : mostrar(pedido.estado)}</div>
        </div>
      </section>

      <div className="ps-personas">
        <section aria-label="Datos del cliente">
          <h3>FACTURADO A</h3>
          <p className="ps-destacado">{nombreCliente}</p>
          <Etiqueta valor={cliente.correo}>Correo electrónico</Etiqueta>
        </section>
        <section aria-label="Dirección de entrega">
          <h3>DIRECCIÓN DE ENTREGA</h3>
          <p className="ps-destacado">{mostrar(direccion)}</p>
          <p className="ps-comuna">{mostrar(ciudad)}</p>
          {envio.indicaciones && <Etiqueta valor={envio.indicaciones}>Indicaciones</Etiqueta>}
        </section>
      </div>

      <section className="ps-productos" aria-label="Productos comprados">
        <h3>DETALLE DE PRODUCTOS</h3>
        <div className="ps-tabla-contenedor">
          <table className="ps-tabla">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th className="ps-numero">CANT.</th>
                <th className="ps-numero">PRECIO UNITARIO</th>
                <th className="ps-numero">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={`${item.id ?? i}-${i}`}>
                  <td>
                    <div className="ps-producto">
                      {item.imagenes && <img src={item.imagenes} alt="" width="40" height="40" />}
                      <div>
                        <strong>{mostrar(item.modelo || item.nombre)}</strong>
                        <small>{mostrar(item.marca)}</small>
                      </div>
                    </div>
                  </td>
                  <td className="ps-numero">{Number(item.cantidad || 0)}</td>
                  <td className="ps-numero">{clp(Number(item.precio || 0))}</td>
                  <td className="ps-numero ps-importe">{clp(Number(item.precio || 0) * Number(item.cantidad || 0))}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="ps-sin-items">Este pedido no tiene productos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ps-totales" aria-label="Resumen del pago">
        <div className="ps-totales-contenido">
          <div className="ps-linea-total"><span>Productos</span><span>{clp(sumaItems)}</span></div>
          <div className="ps-linea-total"><span>Envío</span><span>No desglosado</span></div>
          <div className="ps-linea-final"><span>TOTAL {pagado ? 'PAGADO' : 'DEL PEDIDO'}</span><strong>{clp(total)}</strong></div>
          <div className="ps-moneda">Montos expresados en pesos chilenos (CLP)</div>
        </div>
      </section>

      <footer className="ps-pie">
        <div>
          <strong>Gracias por elegir Perfumes Store.</strong>
          <p>Conserva este comprobante para consultar los detalles de tu pedido.</p>
        </div>
        <div className="ps-nota-legal">
          Comprobante generado por la plataforma de demostración.
          No es una boleta electrónica tributaria autorizada por el SII.
        </div>
      </footer>
    </article>
  );
}
