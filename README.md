# Sostecoop Frontend

Frontend público y panel de administración de Sostecoop Cooperativa. Está construido con Angular y se conecta a una API FastAPI para obtener el contenido, enviar mensajes y administrar las secciones del sitio.

## Requisitos

- Node.js `20.19+`, `22.12+` o `24+`.
- npm (el proyecto declara npm `11.6.2` como versión de referencia).
- El backend de Sostecoop ejecutándose y accesible desde el frontend.

Angular 21 requiere versiones compatibles de Node.js, TypeScript y RxJS. Consulta la [tabla oficial de compatibilidad de Angular](https://angular.dev/reference/versions).

## Arrancar desde la terminal integrada de VS Code (Windows)

El frontend necesita el backend para cargar contenido, iniciar sesión y guardar cambios. Sigue los pasos en orden y deja **dos terminales integradas de VS Code abiertas**: una ejecutará el backend y la otra el frontend.

También puedes consultar el [README del backend](https://github.com/asistente-coder/Sostecoop-Back/blob/main/README.md).

### 1. Preparar la carpeta de trabajo

Instala Git, Python, Node.js y npm. Abre VS Code y selecciona **Archivo → Abrir carpeta**. Elige o crea una carpeta para guardar ambos repositorios, por ejemplo `Documents\GitHub\Sostecoop`.

En VS Code selecciona **Terminal → Nuevo terminal**. Los ejemplos de abajo están escritos para PowerShell, el perfil habitual de la terminal integrada en Windows.

### 2. Descargar los dos repositorios

En esa terminal, desde la carpeta de trabajo abierta en VS Code, clona el backend y el frontend:

```powershell
git clone https://github.com/asistente-coder/Sostecoop-Back.git
git clone https://github.com/asistenteprogramacion-code/Sostecoop-FRONT.git
```

Si ya descargaste alguno de los repositorios, no vuelvas a clonarlo; usa la carpeta que ya tienes.

### 3. Instalar y arrancar el backend

En la terminal integrada, ejecuta estos comandos uno por uno:

```powershell
cd Sostecoop-Back
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Deja esta terminal abierta. Comprueba que el backend arrancó visitando [http://localhost:8000/api/health](http://localhost:8000/api/health); debe responder `{"status":"ok"}`.

Si PowerShell bloquea la activación del entorno, ejecuta este comando y vuelve a activar:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 4. Instalar el frontend y revisar el proxy

En VS Code crea una segunda terminal con **Terminal → Nuevo terminal**. Ejecuta:

```powershell
cd Sostecoop-FRONT
npm ci
```

`npm ci` instala las dependencias del frontend. Antes de iniciarlo, abre [`proxy.conf.json`](proxy.conf.json) en VS Code. Las dos entradas `target`, para `/api` y `/uploads`, deben apuntar al backend local:

```json
"target": "http://localhost:8000"
```

El backend debe permitir el origen `http://localhost:3000` en su configuración CORS.

### 5. Arrancar el frontend

En esa misma terminal, desde la carpeta `Sostecoop-FRONT`, ejecuta:

```powershell
npm start
```

Angular se inicia en el puerto `3000`. Deja abiertas las dos terminales mientras uses el sitio.

### 6. Abrir la aplicación

- Sitio público: [http://localhost:3000](http://localhost:3000)
- Panel de administración: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

El usuario y la contraseña del administrador se configuran en el backend; no están guardados en este frontend.

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
