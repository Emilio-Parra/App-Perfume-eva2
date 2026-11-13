# Perfumes Store

Aplicación web de una tienda de perfumes desarrollada como proyecto de **Fullstack 2**. Incluye catálogo de productos, cuentas de clientes, carrito de compras, pedidos y un panel de administración.

El frontend está desarrollado con **React + Vite**, el backend con **Java + Spring Boot**, y los datos se almacenan en **MySQL**.

> **Importante:** proyecto académico. El pago es **simulado** y los comprobantes de compra **no son boletas tributarias del SII**.

## 1. Tecnologías

| Parte | Tecnología |
| --- | --- |
| Frontend | React, Vite, JavaScript, Bootstrap |
| Backend | Java 21 o superior, Spring Boot, Maven Wrapper |
| Base de datos | MySQL |
| Persistencia | Spring Data JPA / Hibernate |
| Comunicación | API REST (`/api/...`) |

## 2. Requisitos para ejecutar el proyecto

Antes de empezar, instalar:

- **Git**, para descargar y actualizar el repositorio.
- **Node.js 22 o superior** y npm, para el frontend.
- **JDK 21 o superior**, para el backend.
- **MySQL Server** y, opcionalmente, **MySQL Workbench**.
- **Visual Studio Code** u otro editor.

Para verificar las instalaciones desde una terminal:

```powershell
node -v
npm -v
java -version
git --version
```

> El proyecto incluye `mvnw.cmd` / `mvnw`, así que no es obligatorio instalar Maven por separado.

## 3. Descargar el proyecto

Clonar el repositorio desde GitHub:

```powershell
git clone URL_DEL_REPOSITORIO
```

Luego abrir la carpeta del proyecto (la que contiene `package.json`, `src/` y `backend/`).

> Reemplazar `URL_DEL_REPOSITORIO` por la URL real del repositorio colaborativo. No usar literalmente ese texto.

## 4. Preparar MySQL

1. Iniciar MySQL Server.
2. Abrir MySQL Workbench o una consola de MySQL.
3. Crear la base de datos:

```sql
CREATE DATABASE IF NOT EXISTS tienda_perfumes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

El backend usa `spring.jpa.hibernate.ddl-auto=update`, por lo que **Hibernate puede crear o actualizar las tablas al iniciar**. Esto **no importa automáticamente los productos, usuarios ni pedidos** de la base de datos de otra persona.

Cada integrante tiene su propia base de datos local. Si necesitan trabajar con el catálogo de ejemplo y las ventas existentes, deben compartir e importar un **respaldo SQL de prueba**, sin contraseñas ni datos personales reales. Si no hay respaldo, pueden crear productos y registrar clientes desde la aplicación.

## 5. Configurar el backend

En `backend/src/main/resources/application.properties` deben estar estas configuraciones. **Si el archivo no existe en un clon nuevo, créalo**. Si ya existe con usuario o contraseña escritos directamente, reemplazar esos valores por los marcadores de entorno del ejemplo:

```properties
spring.application.name=perfumes

# Base de datos
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/tienda_perfumes
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Servidor
server.port=8080

# Subida de imágenes de productos
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=6MB
app.imagenes.directorio=./uploads/productos
```

**No publicar contraseñas reales en GitHub.** Las propiedades `DB_USERNAME` y `DB_PASSWORD` permiten configurar las credenciales desde variables de entorno. Las variables se utilizarán solo si las propiedades hacen referencia a ellas como en el ejemplo.

### Ejecutar el backend (Windows / PowerShell)

Abrir una terminal en la raíz de `app-perfumes` y ejecutar:

```powershell
cd backend

# Configurar con los datos locales de MySQL
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "TU_CLAVE_LOCAL"

# Solo si se quiere crear una cuenta administradora inicial
$env:ADMIN_EMAIL = "admin@duoc.cl"
$env:ADMIN_PASSWORD = "TU_CLAVE_ADMIN_LOCAL"

.\mvnw.cmd spring-boot:run
```

Si MySQL usa contraseña vacía, configurar `DB_PASSWORD` como una cadena vacía. Si su usuario MySQL es distinto de `root`, cambiar `DB_USERNAME`.

Cuando aparezca `Started ...`, el backend estará disponible en **http://localhost:8080**. **Dejar esta terminal abierta**.

En macOS/Linux, desde `backend/`, utilizar `./mvnw spring-boot:run` y exportar las variables de entorno con `export`.

> `ADMIN_EMAIL` y `ADMIN_PASSWORD` se utilizan únicamente para **crear el administrador inicial si todavía no existe**. No cambian la contraseña de una cuenta ya creada. No subir credenciales administrativas al repositorio.

## 6. Ejecutar el frontend

Abrir **otra terminal** en la raíz del proyecto (donde está `package.json`):

```powershell
npm ci
npm run dev
```

Abrir en el navegador la dirección que indica Vite; normalmente:

**http://localhost:5173**

El archivo `vite.config.js` redirige las peticiones `/api` a **http://localhost:8080**. Por lo tanto, para utilizar login, productos, pedidos y panel administrativo, **MySQL y el backend deben estar funcionando**.

### Resumen rápido de comandos

| Servicio | Carpeta | Comando |
| --- | --- | --- |
| Backend | `backend/` | `.\mvnw.cmd spring-boot:run` |
| Frontend | Raíz del proyecto | `npm run dev` |
| Instalar dependencias de frontend | Raíz del proyecto | `npm ci` |
| Compilar frontend | Raíz del proyecto | `npm run build` |
| Ejecutar pruebas del backend | `backend/` | `.\mvnw.cmd test` |

## 7. Funcionalidades principales

**Cliente**
- Consultar el catálogo y filtrar perfumes por categoría o género.
- Registrarse e iniciar sesión.
- Agregar productos al carrito y realizar pedidos.
- Simular el pago y consultar el comprobante de compra.

**Administrador**
- Crear, editar y eliminar productos y categorías.
- Subir fotografías JPG, PNG o WebP al crear o editar un producto.
- Consultar clientes y pedidos.
- Consultar reportes comerciales, ventas por mes y productos más vendidos.
- Imprimir reportes y comprobantes.
- Modificar su perfil de administrador.

## 8. ¿Dónde se guardan los datos?

- **MySQL:** productos, categorías, cuentas, pedidos, detalles y datos relacionados con las ventas.
- **Imágenes nuevas:** archivos en `backend/uploads/productos/` cuando el backend se inicia desde `backend/`; MySQL conserva su ruta.
- **Navegador:** algunos datos temporales del carrito y de la interfaz pueden utilizar `localStorage`.

**Atención al trabajar en equipo:** las imágenes subidas localmente y las bases de datos de cada integrante **no se sincronizan por Git**. Si se importa una base de datos que contiene rutas de imágenes subidas, también deben existir los archivos correspondientes en el servidor local.

## 9. Estructura del proyecto

```text
app-perfumes/
├── src/                       # Frontend React
│   ├── components/            # Páginas y componentes
│   │   └── admin/             # Panel de administración
│   └── service/               # Comunicación y servicios de datos
├── public/                    # Recursos estáticos
├── backend/
│   ├── src/main/java/         # Controladores, servicios y modelos Java
│   ├── src/main/resources/    # application.properties
│   ├── uploads/productos/     # Imágenes cargadas localmente
│   └── mvnw.cmd               # Maven Wrapper para Windows
├── package.json
├── vite.config.js
└── README.md
```

## 10. Antes de subir cambios a GitHub

No incluir archivos generados ni secretos. Revisar que `.gitignore` contemple, al menos:

```gitignore
node_modules/
dist/
backend/target/
backend/uploads/
backend/src/main/resources/application.properties
.env
.env.*
```

**Importante:** si `application.properties` **ya fue subido o agregado a Git**, ponerlo en `.gitignore` no lo retira automáticamente del control de versiones. Hay que dejar de rastrearlo y revisar el historial si contenía contraseñas reales. Mantener documentadas las propiedades necesarias en este README.

Antes de subir, comprobar `git status` para revisar qué archivos se van a publicar. No subir respaldos reales de clientes ni contraseñas.

Para colaborar sin pisarse los cambios, cada integrante debe traer las actualizaciones del repositorio antes de empezar y realizar commits claros de sus modificaciones.

## 11. Problemas frecuentes

| Problema | Qué revisar |
| --- | --- |
| El frontend abre, pero no carga datos | Que Spring Boot esté encendido en el puerto 8080. |
| Error de conexión MySQL | Que MySQL esté iniciado, exista `tienda_perfumes` y las credenciales sean correctas. |
| Error 401 o 403 | Revisar que la sesión esté iniciada y tenga el rol requerido. |
| No aparecen los 28 productos de la demostración | Un repositorio Git no incluye automáticamente la base de datos local; hay que importar datos de prueba. |
| Una fotografía subida no aparece en otro computador | Comprobar que también exista el archivo en `backend/uploads/productos/`. |
| Puerto 5173 u 8080 ocupado | Cerrar la otra aplicación que utiliza ese puerto o revisar la configuración. |

---

**Proyecto académico Fullstack 2 — Perfumes Store.**
