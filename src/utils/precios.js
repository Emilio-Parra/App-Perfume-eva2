// Descuento en porcentaje (0-90). Si no hay descuento, el precio final es el precio normal.
export const porcentajeDescuento = (p) => {
  const d = Number(p?.descuento);
  return Number.isFinite(d) && d > 0 ? Math.min(d, 90) : 0;
};

export const enOferta = (p) => porcentajeDescuento(p) > 0;

// Precio que realmente se cobra (redondeado a peso entero)
export const precioFinal = (p) => {
  const precio = Number(p?.precio) || 0;
  return Math.round(precio * (1 - porcentajeDescuento(p) / 100));
};
