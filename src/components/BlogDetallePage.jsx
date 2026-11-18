import React from 'react';
import { formatearFecha } from '../data/blogs';

// Detalle de un artículo (Detalle Blog #1, #2...)
export const BlogDetallePage = ({ blog, onVolver }) => {
  if (!blog) {
    return (
      <main className="container my-5 flex-grow-1 text-center">
        <p className="fs-5 text-muted">No encontramos este artículo.</p>
        <button className="btn btn-outline-dark" onClick={onVolver}>← Volver al blog</button>
      </main>
    );
  }

  return (
    <main className="container my-5 flex-grow-1" style={{ maxWidth: '800px' }}>
      <button className="btn btn-outline-dark mb-4 fw-semibold" onClick={onVolver}>
        ← Volver al blog
      </button>
      <article>
        <img
          src={blog.imagen}
          alt={blog.titulo}
          className="img-fluid rounded shadow-sm w-100 mb-4"
          style={{ maxHeight: '360px', objectFit: 'cover' }}
        />
        <small className="text-muted">{formatearFecha(blog.fecha)} · {blog.autor}</small>
        <h1 className="fw-bold mt-1 mb-4">{blog.titulo}</h1>
        {blog.contenido.map((parrafo, i) => (
          <p key={i} className="text-secondary fs-5">{parrafo}</p>
        ))}
      </article>
    </main>
  );
};
