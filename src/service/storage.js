export const leerLista = (clave) => {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
};

export const guardarLista = (clave, lista) =>
  localStorage.setItem(clave, JSON.stringify(lista));
