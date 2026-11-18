import React from 'react';
import { formatearFecha } from '../data/blogs';

// Listado de artículos del blog
export const BlogPage = ({ blogs, onVerBlog }) => (
  <main className="container my-5 flex-grow-1">
    <h1 className="text-center fw-bold mb-2 display-5 text-dark text-uppercase">Blog</h1>
    <p className="text-center text-muted mb-4">Consejos, guías y novedades del mundo de los perfumes.</p>

    {blogs.length === 0 ? (
      <p className="text-center text-muted fs-5 my-5">Aún no hay artículos publicados.</p>
    ) : (
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {blogs.map((blog) => (
          <div className="col" key={blog.id}>
            <article className="card h-100 border-0 shadow-sm">
              <img
                src={blog.imagen}
                alt={blog.titulo}
                className="card-img-top"
                style={{ height: '220px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => onVerBlog(blog.id)}
              />
              <div className="card-body d-flex flex-column">
                <small className="text-muted">{formatearFecha(blog.fecha)} · {blog.autor}</small>
                <h2 className="h5 fw-bold mt-1">{blog.titulo}</h2>
                <p className="text-secondary">{blog.resumen}</p>
                <button className="btn btn-outline-dark mt-auto align-self-start" onClick={() => onVerBlog(blog.id)}>
                  Leer artículo
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    )}
  </main>
);
