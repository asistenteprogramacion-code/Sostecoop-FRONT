# Sostecoop Frontend

Frontend público y panel de administración de Sostecoop Cooperativa. Está construido con Angular y se conecta a una API FastAPI para obtener el contenido, enviar mensajes y administrar las secciones del sitio.

## Requisitos

- Node.js `20.19+`, `22.12+` o `24+`.
- npm (el proyecto declara npm `11.6.2` como versión de referencia).
- El backend de Sostecoop ejecutándose y accesible desde el frontend.

Angular 21 requiere versiones compatibles de Node.js, TypeScript y RxJS. Consulta la [tabla oficial de compatibilidad de Angular](https://angular.dev/reference/versions).

## Descargar e instalar

```bash
git clone https://github.com/asistenteprogramacion-code/Sostecoop-FRONT.git
cd Sostecoop-FRONT
npm ci
```

`npm ci` instala las versiones fijadas en `package-lock.json`.

## Configurar el backend

Este repositorio contiene solo el frontend; para cargar contenido, iniciar sesión y guardar cambios también se necesita el backend de Sostecoop. El backend debe estar iniciado antes de probar esas funciones.

En desarrollo, las rutas `/api` y `/uploads` se reenvían mediante [`proxy.conf.json`](proxy.conf.json). En este checkout, el proxy está configurado para la API disponible en `http://192.168.12.95:8000`. Al clonar el proyecto, revisa esa dirección y usa la dirección IP o el dominio donde realmente esté ejecutándose tu backend. Si ejecutas el backend en el mismo equipo, normalmente será `http://localhost:8000`.

Si ejecutas el backend en otro equipo o puerto, cambia `target` en las dos entradas del archivo `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://192.168.12.95:8000",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  },
  "/uploads": {
    "target": "http://192.168.12.95:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Por ejemplo, si la API está en otro equipo, reemplaza `localhost` por la dirección IP o el dominio de ese equipo. Conserva el protocolo y puerto correctos. Reinicia `npm start` después de modificar el proxy.

El backend debe permitir el origen del frontend (`http://localhost:3000`) en su configuración CORS. Para producción, usa HTTPS y configura frontend y API bajo el mismo sitio para que el navegador pueda enviar la cookie de sesión.

## Iniciar en desarrollo

```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000). El servidor escucha en todas las interfaces de red para permitir acceso desde otros dispositivos de la misma red. Si accedes desde otro dispositivo, agrega también el origen usado allí (por ejemplo, `http://192.168.1.20:3000`) a la configuración CORS del backend. Angular recarga la aplicación al guardar cambios.

El sitio público se muestra en `/`. El acceso al panel está en `/admin/login`; el usuario y la contraseña se configuran en el backend, no en este repositorio.

## Compilar para producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/sostecoop/browser`. Publica ese contenido en un servidor web que sirva Angular como aplicación de una sola página y configure el fallback de rutas hacia `index.html`.

En producción, configura el servidor web para reenviar `/api`, `/uploads` y `/api/public/ws` al backend, bajo el mismo dominio y con HTTPS para que funcione la sesión por cookie. No publiques secretos ni credenciales de administrador en el frontend: cualquier valor compilado en Angular es visible para los visitantes.

## Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm start` | Inicia Angular en `http://localhost:3000` con el proxy de desarrollo. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run watch` | Recompila en modo de desarrollo al detectar cambios. |
| `npm test` | Ejecuta las pruebas configuradas con Vitest. |

## Solución de problemas

- **Error `404` en `/api/...`:** confirma que el backend esté ejecutándose en el destino de `proxy.conf.json` y reinicia `npm start` después de cambiar ese archivo.
- **Error `401` al iniciar sesión:** revisa que las credenciales correspondan a las configuradas en el backend y que la API esté usando la versión compatible con sesión mediante cookie.
- **Error de conexión o `Failed to fetch`:** confirma que el backend esté accesible desde el equipo donde corre Angular y que el puerto configurado sea correcto.
- **Las imágenes no cargan:** comprueba que `/uploads` apunte al mismo backend que `/api`.
- **El puerto `3000` está ocupado:** detén la otra aplicación que lo usa o inicia Angular en otro puerto con `npm start -- --port 3001`.

## Tecnologías

- Angular 21 y TypeScript.
- RxJS.
- CSS propio para los estilos públicos y administrativos.
- API REST y WebSocket de FastAPI.
