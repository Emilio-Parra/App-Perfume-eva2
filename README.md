# Perfumes Store — Frontend

Frontend de **Perfumes Store**, tienda de perfumes desarrollada como proyecto académico para la asignatura **Fullstack 2**. Permite consultar el catálogo, filtrar productos, registrarse, iniciar sesión, comprar de forma simulada y utilizar un panel de administración.

Este repositorio contiene **solo el frontend**, desarrollado con **React, Vite, JavaScript y Bootstrap**. El backend y la base de datos se trabajan por separado con **Spring Boot y MySQL**.

| Proyecto | Enlace |
| --- | --- |
| **Frontend (este repositorio)** | https://github.com/Emilio-Parra/App-Perfume-eva2 |
| **Backend** | https://github.com/Emilio-Parra/App-Perfume-Backend |
| **Página local** | http://localhost:5173 |
| **API local para comprobar productos** | http://localhost:8080/api/v1/productos |

> **Importante:** es un proyecto académico. Las compras y los pagos son **simulados**; los comprobantes no son boletas tributarias del SII.

## 1. ¿Qué tecnologías usamos?

| Componente | Tecnología | ¿Para qué sirve? |
| --- | --- | --- |
| Interfaz | React 19 + JavaScript | Construir las pantallas de la tienda |
| Entorno de desarrollo | Vite 8 | Iniciar la página y compilar el frontend |
| Estilos | Bootstrap 5 + React Bootstrap | Diseño y componentes visuales |
| Navegación | React Router | Cambiar entre las vistas |
| Comunicación | API REST versionada (`/api/v1/...`) | Obtener y enviar datos al backend |
| Servidor | Java 21+ y Spring Boot | Procesar usuarios, productos, pedidos y administración |
| Base de datos | MySQL | Guardar productos, categorías, cuentas y compras |

**El frontend no se conecta directamente a MySQL.** Se comunica con Spring Boot, y Spring Boot es quien consulta o actualiza la base de datos.

## 2. Requisitos para usarlo en los PC del instituto

Necesitamos:

- **Node.js 22.12 o superior** y npm para el frontend (requisito de Vite 8 según el `package-lock.json`).
- **Java JDK 21 o superior** para el backend.
- **MySQL Server** y **MySQL Workbench** para la base de datos.
- **Git** para clonar y actualizar los repositorios.
- **Visual Studio Code** para abrir los proyectos.
- Internet al menos durante la primera instalación de dependencias.

Comprobar desde una terminal de PowerShell:

```powershell
node -v
npm -v
java -version
git --version
```

> En los PC del instituto, MySQL Workbench normalmente permite entrar a la conexión local con `root` sin pedir contraseña. **Eso no significa que el usuario `tienda_app` tampoco tenga contraseña**: configuraremos su propia clave.

## 3. Descargar o abrir los dos repositorios

Si ya clonaron ambos proyectos, **no es necesario clonarlos otra vez**. Basta con abrir las carpetas correctas en dos ventanas de VS Code.

Si parten de cero, pueden descargarlos con:

```powershell
git clone https://github.com/Emilio-Parra/App-Perfume-eva2.git
git clone https://github.com/Emilio-Parra/App-Perfume-Backend.git
```

Las carpetas quedan separadas, por ejemplo:

```text
Downloads/
├── App-Perfume-eva2/         # Aquí está package.json: FRONTEND
└── App-Perfume-Backend/      # Aquí están pom.xml y mvnw.cmd: BACKEND
```

**Ojo:** ahora el frontend está organizado directamente en la **raíz de `App-Perfume-eva2`**. No hay que entrar a una carpeta adicional `app-perfumes` para ejecutar `npm`.

## 4. Primera vez: preparar MySQL Workbench

Este paso se realiza **una sola vez por instalación local de MySQL**. Es necesario para que Spring Boot se conecte; después no hay que importar los perfumes manualmente.

### A. Entrar con `root` y crear la base de datos

1. Abrir **MySQL Workbench**.
2. Entrar en la conexión existente, normalmente **Local instance MySQL80**, usando `root`. En los computadores del instituto suele entrar sin pedir contraseña.
3. Abrir una pestaña SQL (`SQL +`).
4. Copiar y ejecutar **todo** lo siguiente con el botón del rayo:

```sql
CREATE DATABASE IF NOT EXISTS tienda_perfumes
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'tienda_app'@'localhost'
IDENTIFIED BY 'Root1234';

ALTER USER 'tienda_app'@'localhost'
IDENTIFIED BY 'Root1234';

GRANT ALL PRIVILEGES ON tienda_perfumes.*
TO 'tienda_app'@'localhost';
```

5. Actualizar **SCHEMAS** y verificar que aparezca **`tienda_perfumes`**.

Este SQL crea una cuenta MySQL de práctica llamada `tienda_app`. **`Root1234` es la contraseña de esa cuenta, no la de `root`**. La instrucción `ALTER USER` vuelve a configurar su contraseña si ya existía, así que debe utilizarse solo en la instalación local de práctica.

### B. Crear la conexión `Tienda Perfumes`

1. Volver al inicio de Workbench con el ícono de la casa.
2. Presionar **`+`** en **MySQL Connections**.
3. Completar:

| Campo | Valor |
| --- | --- |
| Connection Name | `Tienda Perfumes` |
| Connection Method | `Standard (TCP/IP)` |
| Hostname | `127.0.0.1` |
| Port | `3306` |
| Username | `tienda_app` |
| Password | `Root1234` (usar **Store in Vault...** o introducirla cuando la pida) |
| Default Schema | `tienda_perfumes` |

4. Presionar **Test Connection**. Si todo está bien, aparecerá `Successfully made the MySQL connection`.
5. Guardar y abrir **Tienda Perfumes**.

**No creen las tablas manualmente ni importen el archivo SQL:** eso lo hace el backend al iniciarse por primera vez.

## 5. Iniciar el backend (antes que el frontend)

Abrir una primera ventana de VS Code en la carpeta **`App-Perfume-Backend`**, la que contiene `pom.xml`, `mvnw.cmd`, `src` e `iniciar-backend.ps1`.

Abrir **Terminal → New Terminal** y ejecutar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\iniciar-backend.ps1
```

Cuando aparezcan las preguntas, utilizar estas respuestas **en la primera ejecución de práctica**:

| Pregunta del script | Qué ingresar |
| --- | --- |
| `Clave MySQL de tienda_app` | `Root1234` |
| `Clave inicial del administrador` | `Root1234` |

**Sí: durante el primer inicio se escribe `Root1234` en ambas preguntas.** La primera corresponde a MySQL y la segunda crea la cuenta de administrador de la tienda **solo si todavía no existe**. Después pueden iniciar sesión como administrador con:

- **Correo:** `admin@duoc.cl`
- **Contraseña inicial de práctica:** `Root1234`

En los siguientes inicios, si el administrador **ya existe en esa misma base de datos**, pueden dejar vacía la segunda pregunta y presionar Enter. Si la tabla `administradores` está vacía, **no deben dejarla vacía en el primer inicio**, porque la cuenta no se creará.

Cuando aparezca `Tomcat started on port 8080` y `Started PerfumesApplication`, el backend está iniciado. **Dejar abierta esta terminal**.

Pueden comprobarlo entrando a http://localhost:8080/api/v1/productos: debería aparecer una lista JSON con los productos.

### ¿Qué se crea automáticamente?

Al iniciar sobre una base nueva, Spring Boot:

1. Crea las tablas de MySQL mediante Hibernate.
2. Carga **27 perfumes y 3 categorías** desde el catálogo inicial, cuando `productos` está vacío.
3. Crea el administrador inicial cuando se le proporciona la contraseña y todavía no existe la cuenta.

Si ya hay productos, **no los vuelve a importar ni duplica el catálogo**. Cada integrante trabaja con su propia base de datos local; las compras realizadas en otro PC no se transfieren por GitHub.

> Para más detalles sobre MySQL, Swagger, permisos y los comandos de Spring Boot, consultar el [README del repositorio backend](https://github.com/Emilio-Parra/App-Perfume-Backend#readme).

## 6. Iniciar el frontend React

Con el backend ya iniciado, abrir **una segunda ventana de VS Code** y entrar a:

```text
App-Perfume-eva2
```

Comprobar que en esa carpeta estén `package.json`, `src`, `public` y `vite.config.js`.

Abrir **Terminal → New Terminal** y ejecutar, uno por uno:

```powershell
npm install
npm run dev
```

- `npm install` instala las dependencias del frontend. Normalmente basta con hacerlo la primera vez o cuando cambien las dependencias.
- `npm run dev` levanta Vite, que mostrará una dirección como **http://localhost:5173/**.

Abrir esa dirección en Chrome. Si Vite usa otro puerto, usar la URL que muestre la terminal.

**No cierren ninguna de las dos terminales** mientras utilicen la tienda: una mantiene el backend en el puerto 8080 y la otra el frontend en el 5173.

**Documentación de la API:** con Spring Boot iniciado, abrir [Swagger UI](http://localhost:8080/swagger-ui.html). También existe la especificación [OpenAPI JSON](http://localhost:8080/v3/api-docs). Swagger documenta las rutas `/api/v1/...`; no sustituye al frontend y no es necesario abrirlo para comprar.

### Comandos rápidos

| Tarea | Carpeta donde ejecutar | Comando |
| --- | --- | --- |
| Instalar dependencias de React | `App-Perfume-eva2` | `npm install` |
| Iniciar frontend | `App-Perfume-eva2` | `npm run dev` |
| Compilar frontend | `App-Perfume-eva2` | `npm run build` |
| Vista previa de la compilación | `App-Perfume-eva2` | `npm run preview` |
| Revisar código con el linter | `App-Perfume-eva2` | `npm run lint` |
| Iniciar backend en Windows | `App-Perfume-Backend` | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\iniciar-backend.ps1` |
| Iniciar backend con Maven Wrapper (avanzado) | `App-Perfume-Backend` | `.\mvnw.cmd spring-boot:run` (requiere tener configuradas las variables de entorno) |

## 7. ¿Cómo se conecta el frontend con el backend?

El frontend todavía realiza solicitudes a rutas como `/api/productos`, mientras que el backend nuevo publica sus endpoints en **`/api/v1/productos`**. Para mantener la compatibilidad sin editar todos los servicios React, **Vite debe tener una regla `rewrite`** que agregue el prefijo `/v1` durante el desarrollo.

En `vite.config.js`, la parte del proxy debe contener esta configuración:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api(?!\/v1)/, '/api/v1'),
    },
  },
},
```

**Cómo funciona:**

| Petición del frontend | Ruta que recibe Spring Boot |
| --- | --- |
| `/api/productos` | `/api/v1/productos` |
| `/api/categorias` | `/api/v1/categorias` |
| `/api/admin/login` | `/api/v1/admin/login` |
| `/api/productos/imagen/foto.jpg` | `/api/v1/productos/imagen/foto.jpg` |
| `/api/v1/productos` | `/api/v1/productos` (no agrega `v1` dos veces) |

Este cambio también ayuda a mantener las fotos subidas anteriormente si sus rutas quedaron guardadas en MySQL como `/api/productos/imagen/...`.

> **Importante:** el proxy de `vite.config.js` funciona con el servidor de desarrollo (`npm run dev`), no configura automáticamente un despliegue en producción. Para publicar la aplicación necesitarán configurar el proxy del servidor real o actualizar las URLs de los servicios para apuntar a la API v1.

**Antes de probar en otro computador:** verifica que el `vite.config.js` descargado desde GitHub incluya realmente `rewrite`. Si falta, las peticiones antiguas pueden recibir un error **404**. Reinicia Vite tras cambiar ese archivo.

```text
Navegador (http://localhost:5173)
              |
              v
React + Vite (frontend)
              |  /api/...  ->  /api/v1/... (proxy)
              v
Spring Boot (http://localhost:8080)
              |
              v
MySQL (tienda_perfumes)
```

Por eso no basta con abrir solo React: si Spring Boot está detenido, pueden verse las pantallas, pero el login, los pedidos y los datos de productos dejarán de funcionar correctamente.

## 8. Funcionalidades principales

### Vista cliente

- Consultar perfumes y sus imágenes, precios, descuentos, descripciones y stock.
- Filtrar productos por categoría (árabe, nicho y diseñador) y otras opciones disponibles en la interfaz.
- Registrar una cuenta e iniciar sesión.
- Agregar productos al carrito, revisar cantidades y completar datos de envío.
- Realizar un **pedido simulado** y consultar el comprobante correspondiente.

### Vista vendedor

- Iniciar sesión con la cuenta que le crea el administrador (**Usuarios → + Nuevo usuario → Rol: Vendedor**).
- Ver la lista y el detalle de las **órdenes** (boletas).
- Ver la lista y el detalle de los **productos**, en modo solo lectura: no aparecen los botones para crear, editar ni eliminar.
- El menú del panel muestra solo **Órdenes** y **Productos**. Las demás secciones no aparecen, y si alguien intenta usarlas, el backend responde 403.

### Vista administrador

- Iniciar sesión con la cuenta de administrador configurada en MySQL.
- Crear, editar y eliminar clientes y **vendedores**.
- Consultar y administrar productos: crear, editar y eliminar.
- Gestionar categorías y subir imágenes para los productos.
- Revisar clientes y pedidos.
- Consultar reportes de ventas y productos más vendidos.
- Modificar los datos del perfil administrativo.

**Los pedidos y el stock se guardan en MySQL a través del backend**, no se comparten automáticamente entre computadores del instituto.

### Autenticación con JWT

Al iniciar sesión, el backend devuelve un **token JWT** (válido por 2 horas) que se guarda junto con el usuario en `localStorage` (`usuario_actual`).

- `src/service/authFetch.js` agrega automáticamente el encabezado `Authorization: Bearer <token>` a **todas** las llamadas a `/api`. Se activa en `src/main.jsx`, así no hay que modificar cada `fetch`.
- Si el backend responde **401** (el token venció o no es válido), `authFetch.js` borra la sesión y `App.jsx` muestra *"Tu sesión expiró. Inicia sesión nuevamente."* y lleva al login.
- `src/utils/roles.js` define qué ve cada rol en el panel. Esto solo oculta opciones: **la seguridad real está en el backend**.

| Rol | Al iniciar sesión | Puede ver |
|---|---|---|
| Cliente | Queda en la tienda | Tienda, carrito, compra y boleta |
| Vendedor | Entra al panel en **Órdenes** | Órdenes y productos (solo lectura) |
| Administrador | Entra al panel en el **Dashboard** | Todo el panel |

## 9. Estructura del frontend y dónde están los datos

Estructura general del proyecto (puede haber más archivos y carpetas dentro de `src`):

```text
App-Perfume-eva2/
├── public/
│   └── img/                 # Imágenes originales del catálogo
├── src/
│   ├── components/          # Páginas y componentes de la interfaz
│   │   └── admin/           # Panel de administrador y vendedor
│   ├── service/             # Servicios que llaman a la API
│   │   └── authFetch.js     # Agrega el token JWT a cada llamada
│   ├── utils/
│   │   └── roles.js         # Qué secciones ve cada rol
│   └── main.jsx             # Activa authFetch al iniciar
├── index.html
├── package.json             # Dependencias y comandos de npm
├── package-lock.json        # Versiones de dependencias instalables
├── vite.config.js           # Proxy que adapta /api a /api/v1 en desarrollo
└── README.md                # Esta guía
```

- **Productos, categorías, usuarios, pedidos y compras:** se almacenan en MySQL del PC, a través del backend.
- **Imágenes originales:** están en `public/img/` y se incluyen con el frontend.
- **Imágenes nuevas subidas desde administración:** normalmente se guardan en `App-Perfume-Backend/uploads/productos/`; son archivos locales excluidos de Git y deben respaldarse por separado si se necesitan en otro computador.
- **Carrito y otros estados de interfaz:** pueden conservar datos temporales en el navegador mediante `localStorage`.

**No es necesario copiar el backend dentro de la carpeta del frontend.** Son dos proyectos independientes conectados mediante la API.

### Rutas de la API v1

La versión nueva agrupa sus endpoints en `/api/v1`, por ejemplo:

- `/api/v1/productos` — catálogo y CRUD de productos.
- `/api/v1/categorias` — categorías.
- `/api/v1/usuarios` — registro y acceso de clientes.
- `/api/v1/admin` — acceso y perfil del administrador.
- `/api/v1/admin/usuarios` — gestión de clientes desde administración.
- `/api/v1/pedidos` — pedidos y proceso de pago simulado.
- `/api/v1/productos/imagen` — imágenes de productos.

Estos endpoints están descritos en Swagger. Las solicitudes con escritura o datos privados exigen un **token JWT** con el rol adecuado (ADMIN, VENDEDOR o CLIENTE): sin token el backend responde 401, y con un rol sin permiso responde 403. El detalle está en `docs/SEGURIDAD.md` del repositorio backend.

## 10. Cómo comprobar que todo está funcionando

Después de iniciar ambos proyectos:

1. Entrar a **http://localhost:8080/api/v1/productos** y comprobar que devuelve JSON. Abrir también **http://localhost:8080/swagger-ui.html** para comprobar Swagger.
2. Abrir **http://localhost:5173/** y revisar que aparezcan **27 perfumes**, con sus imágenes.
3. Probar los filtros de categorías.
4. Iniciar sesión como administrador con `admin@duoc.cl` y la contraseña configurada durante el primer inicio.
5. Probar el registro de un cliente y un pedido de ejemplo si es necesario.
6. Crear un vendedor desde **Usuarios** e iniciar sesión con él: debe ver solo **Órdenes** y **Productos**.
7. Comprobar en Workbench, usando la conexión **Tienda Perfumes**, que los datos se guardan en la base local.

En Workbench, algunas consultas útiles son:

```sql
USE tienda_perfumes;

SELECT COUNT(*) AS total_productos FROM productos;
SELECT tipo, COUNT(*) AS cantidad FROM productos GROUP BY tipo;
SELECT id, codigo, fecha, estado, total FROM pedidos ORDER BY fecha DESC;
```

## 11. Problemas frecuentes

| Problema | Qué hacer |
| --- | --- |
| `npm` no se reconoce | Revisar que Node.js y npm estén instalados (`node -v` y `npm -v`). |
| `npm` no encuentra `package.json` | Están en la carpeta equivocada; ingresar a **`App-Perfume-eva2`**. |
| Vite abre, pero no aparecen los productos | Comprobar que Spring Boot siga funcionando y abrir `http://localhost:8080/api/v1/productos`. |
| Error 404 en `/api/productos` | Comprobar el `rewrite` del proxy en `vite.config.js`, porque el backend responde en `/api/v1/productos`. Reiniciar Vite. |
| Swagger no abre | Verificar que el backend esté iniciado y que la dependencia springdoc esté instalada; comprobar `/swagger-ui.html` y `/v3/api-docs`. |
| Error de conexión con MySQL | Revisar que exista `tienda_perfumes` y que la conexión `Tienda Perfumes` funcione con `tienda_app` y `Root1234`. |
| El administrador no puede iniciar sesión | Comprobar en Workbench `SELECT correo FROM administradores;`. Si no existe `admin@duoc.cl`, volver a iniciar el backend y **escribir la segunda contraseña** al solicitarla. |
| Contraseña del administrador incorrecta | No confundir la contraseña MySQL con la del admin; solo coinciden si se configuraron iguales. La contraseña inicial no reemplaza una cuenta ya existente, incluso si un compañero utiliza otra clave como `admin123`. En una base nueva de práctica, usen la que indiquen al iniciar por primera vez. |
| Vite usa otro puerto | Abrir la URL que indique la terminal; `5173` puede estar ocupado. |
| Puerto 8080 ocupado | Detener el backend que ya se esté ejecutando antes de iniciar otra instancia. |
| No se ven fotografías nuevas en otro PC | La carpeta `uploads/productos` del backend no se sincroniza por Git. |
| Los pedidos no aparecen en el PC de otro compañero | Cada PC tiene su propia base MySQL; GitHub comparte el código, no los datos de cada integrante. |

## 12. Trabajar en equipo y subir cambios

Antes de editar, desde la carpeta del repositorio correspondiente (`App-Perfume-eva2`, la misma raíz que contiene `.git` y `package.json`):

```powershell
git pull origin main
```

Después de terminar y revisar los archivos modificados:

```powershell
git status
git add README.md
git commit -m "docs: documentar frontend y API v1"
git push origin main
```

**Revisen `git status` antes de hacer `git add .`** para no subir archivos innecesarios, dependencias (`node_modules`), compilaciones (`dist`) ni información privada.

Los cambios en React se suben al repositorio **`App-Perfume-eva2`**, mientras que los cambios en Java y la carga automática de datos se suben a **`App-Perfume-Backend`**.

**Coordinación importante:** el backend nuevo y el proxy actualizado del frontend deben estar en los repositorios **antes** de que un compañero haga `git pull` y los ejecute. No basta con que los cambios funcionen en el PC de quien los hizo.

---

**Proyecto académico — Fullstack 2 — Perfumes Store.**

> **Seguridad:** `Root1234` es una contraseña compartida solo para facilitar esta práctica local del instituto. No la utilicen en servidores públicos ni con datos personales reales. En un entorno real, cada instalación debe usar contraseñas distintas y seguras.
