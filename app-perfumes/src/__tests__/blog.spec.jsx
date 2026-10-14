import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BlogPage } from '../components/BlogPage';
import { BlogDetallePage } from '../components/BlogDetallePage';
import { BLOGS, obtenerBlog, obtenerBlogs } from '../data/blogs';

describe('data/blogs', () => {
  it('tiene al menos 2 artículos con título y contenido', () => {
    expect(obtenerBlogs().length).toBeGreaterThanOrEqual(2);
    BLOGS.forEach((b) => {
      expect(b.titulo).toBeTruthy();
      expect(b.contenido.length).toBeGreaterThan(0);
    });
  });

  it('obtenerBlog busca por id y devuelve null si no existe', () => {
    expect(obtenerBlog(1).id).toBe(1);
    expect(obtenerBlog('2').id).toBe(2);
    expect(obtenerBlog(999)).toBeNull();
  });
});

describe('components/BlogPage', () => {
  afterEach(cleanup);

  it('muestra una tarjeta por artículo', () => {
    render(<BlogPage blogs={BLOGS} onVerBlog={() => {}} />);
    BLOGS.forEach((b) => expect(screen.getByText(b.titulo)).toBeTruthy());
  });

  it('"Leer artículo" llama a onVerBlog con el id del artículo', () => {
    const onVerBlog = jasmine.createSpy('onVerBlog');
    render(<BlogPage blogs={BLOGS} onVerBlog={onVerBlog} />);
    fireEvent.click(screen.getAllByRole('button', { name: /leer artículo/i })[1]);
    expect(onVerBlog).toHaveBeenCalledOnceWith(BLOGS[1].id);
  });

  it('muestra un mensaje si no hay artículos', () => {
    render(<BlogPage blogs={[]} onVerBlog={() => {}} />);
    expect(screen.getByText(/aún no hay artículos/i)).toBeTruthy();
  });
});

describe('components/BlogDetallePage', () => {
  afterEach(cleanup);

  it('dibuja el título y todos los párrafos del artículo', () => {
    render(<BlogDetallePage blog={BLOGS[0]} onVolver={() => {}} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(BLOGS[0].titulo);
    expect(screen.getByText(BLOGS[0].contenido[0])).toBeTruthy();
  });

  it('el botón volver llama a onVolver', () => {
    const onVolver = jasmine.createSpy('onVolver');
    render(<BlogDetallePage blog={BLOGS[0]} onVolver={onVolver} />);
    fireEvent.click(screen.getByRole('button', { name: /volver al blog/i }));
    expect(onVolver).toHaveBeenCalled();
  });

  it('si el artículo no existe muestra un mensaje de error', () => {
    render(<BlogDetallePage blog={null} onVolver={() => {}} />);
    expect(screen.getByText(/no encontramos este artículo/i)).toBeTruthy();
  });
});
