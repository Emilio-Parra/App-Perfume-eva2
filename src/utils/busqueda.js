
export const normalizar = (texto = '') =>
  String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export const coincideTexto = (producto, texto) => {
  const palabras = normalizar(texto).split(' ').filter(Boolean);
  if (palabras.length === 0) return true;

  const campos = normalizar(
    [
      producto.marca,
      producto.modelo || producto.nombre,
      producto.tipo || producto.categoria,
      producto.genero,
    ]
      .filter(Boolean)
      .join(' ')
  );
  return palabras.every((palabra) => campos.includes(palabra));
};