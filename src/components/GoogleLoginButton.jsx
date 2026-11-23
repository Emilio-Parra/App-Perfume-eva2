import React, { useEffect, useRef } from 'react';

// Client ID es publico. No se coloca el client secret en React.
const GOOGLE_CLIENT_ID = (import.meta.env?.VITE_GOOGLE_CLIENT_ID || '').trim();
const URL_GOOGLE = 'https://accounts.google.com/gsi/client';

export function GoogleLoginButton({ onCredential, onError }) {
  const contenedor = useRef(null);
  const credencialActual = useRef(onCredential);
  const errorActual = useRef(onError);

  // La funcion que recibe Google siempre usa los callbacks React mas recientes.
  credencialActual.current = onCredential;
  errorActual.current = onError;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let montado = true;

    const iniciar = () => {
      if (!montado || !contenedor.current || !window.google?.accounts?.id) return;
      contenedor.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        callback: (respuesta) => {
          if (!respuesta?.credential) {
            errorActual.current?.('Google no entregó una credencial.');
            return;
          }
          credencialActual.current?.(respuesta.credential);
        },
      });
      window.google.accounts.id.renderButton(contenedor.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'signin_with',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      iniciar();
      return () => { montado = false; };
    }

    // Reusar el script si ya fue insertado por otra vista.
    let script = document.querySelector('script[data-perfumes-google-login]');
    if (!script) {
      script = document.createElement('script');
      script.src = URL_GOOGLE;
      script.async = true;
      script.defer = true;
      script.dataset.perfumesGoogleLogin = '1';
      document.head.appendChild(script);
    }
    const error = () => errorActual.current?.('No se pudo cargar el acceso con Google.');
    script.addEventListener('load', iniciar);
    script.addEventListener('error', error);
    return () => {
      montado = false;
      script.removeEventListener('load', iniciar);
      script.removeEventListener('error', error);
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div className="d-flex justify-content-center" ref={contenedor} />;
}
