import React from 'react';

export default function TiendasPage() {
  const tiendas = [
    {
      id: 1,
      nombre: 'Plaza Vespucio',
      direccion: 'Av. Vicuña Mackenna Ote. 7110, 8240000 La Florida, Región Metropolitana.',
      imagen: '/img/tiendas/Mallplaza-Vespucio.webp',
      alt: 'Tienda Plaza Vespucio',
      mapaUrl: 'https://www.google.com/maps/place/Mallplaza+Vespucio/data=!4m2!3m1!1s0x0:0x913dd02e5daeb4b7?sa=X&ved=1t:2428&ictx=111'
    },
    {
      id: 2,
      nombre: 'Plaza Egaña',
      direccion: 'Av. Larraín 5862, 7870154 La Reina, Región Metropolitana.',
      imagen: '/img/tiendas/mallplaza-egana-2958111.webp',
      alt: 'Tienda Plaza Egaña',
      mapaUrl: 'https://www.google.com/maps/place/Mallplaza+Ega%C3%B1a/@-33.4524332,-70.5720453,17z/data=!3m2!4b1!5s0x9662ce4bbe7459d9:0xdcba1c2edc241072!4m6!3m5!1s0x9662ce4a396cff93:0x3da8a6f37f2ba003!8m2!3d-33.4524377!4d-70.5694704!16s%2Fg%2F11byw66n4w?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D'
    },
    {
      id: 3,
      nombre: 'Cenco Costanera',
      direccion: 'Andrés Bello Avenue 2425, Providencia, Santiago, Región Metropolitana.',
      imagen: '/img/tiendas/Costanera-Center-chile-1-3.jpg',
      alt: 'Tienda Cenco Costanera',
      mapaUrl: 'https://www.google.com/maps/place/Cenco+Costanera/@-33.4179935,-70.6063901,17z/data=!3m1!4b1!4m6!3m5!1s0x9662cf69d4854951:0x9a87ef2fefaad0df!8m2!3d-33.4179935!4d-70.6063901!16zL20vMGQ4NGtz?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D'
    },
    {
      id: 4,
      nombre: 'Arauco Maipú',
      direccion: 'Av. Américo Vespucio 399, 9250000 Maipú, Región Metropolitana.',
      imagen: '/img/tiendas/Mall_Arauco_Maipú_-_Exterior_-_2026.jpg',
      alt: 'Tienda Arauco Maipu',
      mapaUrl: 'https://www.google.com/maps/place/Mall+Arauco+Maip%C3%BA/@-33.4810808,-70.7538019,17z/data=!3m1!4b1!4m6!3m5!1s0x9662c31831293283:0x337f64adabfcd765!8m2!3d-33.4810853!4d-70.751227!16s%2Fg%2F1234bl7k?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D'
    },
    {
      id: 5,
      nombre: 'Plaza Norte',
      direccion: 'Av. Américo Vespucio 1737, 8600036 Huechuraba, Región Metropolitana.',
      imagen: '/img/tiendas/17309971866627.webp',
      alt: 'Tienda Plaza Norte',
      mapaUrl: 'https://www.google.com/maps/place/Mallplaza+Norte/@-33.4809059,-70.8336273,12z/data=!4m10!1m2!2m1!1small+plaza+norte!3m6!1s0x9662c7001df976e3:0x50ee14928c2cc182!8m2!3d-33.3672681!4d-70.6788608!15sChBtYWxsIHBsYXphIG5vcnRlIgOIAQFaEiIQbWFsbCBwbGF6YSBub3J0ZZIBD3Nob3BwaW5nX2NlbnRlcpoBRENpOURRVWxSUVVOdlpFTm9kSGxqUmpsdlQycENWMVJWV2xaVVZrSlZWa2QzZWs5SVpGVlRSMGwwVlVVeGVWVlhZeEFC4AEA-gEECAAQOA!16s%2Fg%2F11z9nj00b3?entry=ttu&g_ep=EgoyMDI2MDgzMS4wIKXMDSoASAFQAw%3D%3D'
    }
  ];

  return (
    <main className="container my-5">
      <h1 className="text-center mt-4 fw-bold">Visita nuestras tiendas</h1>
      <p className="text-center text-muted mb-5">
        Visítanos y descubre una selección única de fragancias de diseñador, árabes y de nicho. ¡Pruébalas y encuentra tu aroma perfecto!
      </p>

      <section className="tiendas-container">

        {tiendas.map((tienda) => (
          <div key={tienda.id} className="tienda-card mb-4">
            <div className="tienda-imagen">
              <img src={tienda.imagen} alt={tienda.alt} />
            </div>
            <div className="tienda-detalle">
              <h3>{tienda.nombre}</h3>
              <p className="direccion">{tienda.direccion}</p>
              <h4>Horarios</h4>
              <ul className="horarios-lista">
                <li><strong>Lunes:</strong> 10 AM – 8:30 PM</li>
                <li><strong>Martes:</strong> 10 AM – 8:30 PM</li>
                <li><strong>Miércoles:</strong> 10 AM – 8:30 PM</li>
                <li><strong>Jueves:</strong> 10 AM – 8:30 PM</li>
                <li><strong>Viernes:</strong> 10 AM – 8:30 PM</li>
                <li><strong>Sábado:</strong> 10 AM – 8:30 PM</li>
                <li><strong>Domingo:</strong> 10 AM – 8:30 PM</li>
              </ul>
              <a
                href={tienda.mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mapa-link"
              >
                Ver en el mapa
              </a>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}