// Fuente de datos del blog (simula una tabla de artículos).
// Cada artículo tiene: id, titulo, resumen, fecha, autor, imagen y contenido (lista de párrafos).
export const BLOGS = [
  {
    id: 1,
    titulo: 'Cómo aplicar tu perfume para que dure más',
    resumen: 'Dónde rociar, cuánta cantidad usar y qué errores evitar para que tu fragancia te acompañe todo el día.',
    fecha: '2026-09-15',
    autor: 'Equipo Perfumes Store',
    imagen: '/img/assets/hombre-con-blue-chanel.jpg',
    contenido: [
      'La duración de una fragancia no depende solo de su concentración: la forma de aplicarla marca la diferencia. Lo ideal es hacerlo después de la ducha, con la piel limpia e hidratada, porque la piel seca absorbe el aroma y lo deja evaporar más rápido.',
      'Rocía en los puntos de pulso: cuello, muñecas y parte interna de los codos. Allí la piel está más tibia y ayuda a que el perfume se abra de forma progresiva. Con dos o tres pulverizaciones suele bastar; en fragancias muy intensas, como muchas árabes, menos es más.',
      'Evita frotar las muñecas después de rociar. Ese gesto rompe las moléculas de las notas de salida y altera la evolución del aroma. Deja que se seque solo.',
      'Por último, guarda tus frascos lejos de la luz directa y del calor. Un cajón o su caja original conservan mejor la fragancia que el baño o una ventana soleada.',
    ],
  },
  {
    id: 2,
    titulo: 'Árabes, diseñador y nicho: ¿cuál es la diferencia?',
    resumen: 'Una guía rápida para entender las tres grandes familias de nuestro catálogo y elegir la que va contigo.',
    fecha: '2026-09-28',
    autor: 'Equipo Perfumes Store',
    imagen: '/img/assets/watermarked_img_4464425131527519554.jpg',
    contenido: [
      'Las fragancias árabes suelen destacar por su intensidad y larga duración. Es común encontrar notas de ámbar, oud, vainilla y especias, con una proyección que se nota desde que entras a una habitación.',
      'Los perfumes de diseñador pertenecen a grandes casas de moda. Son aromas pensados para gustar a un público amplio, fáciles de usar y reconocibles, con versiones frescas para el día y otras más cálidas para la noche.',
      'La perfumería de nicho se enfoca en composiciones más exclusivas y menos masivas, con ingredientes poco habituales y producciones limitadas. Son ideales si buscas un aroma distinto, que casi nadie más lleva.',
      'No existe una familia mejor que otra: depende de la ocasión, el clima y tu gusto personal. Si dudas, prueba primero una fragancia fresca y una más cálida para descubrir hacia dónde se inclina tu estilo.',
    ],
  },
];

export const obtenerBlogs = () => BLOGS;

export const obtenerBlog = (id) => BLOGS.find((b) => Number(b.id) === Number(id)) || null;

// Fecha legible en español: "15 de septiembre de 2026"
export const formatearFecha = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
