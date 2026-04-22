# Despliegue gratuito recomendado

## Stack
- Frontend: Netlify
- Backend: Render
- Base de datos: Neon

## 1. GitHub
1. Crea un repositorio privado.
2. Sube `client/`, `server/`, `render.yaml` y este documento.
3. No subas `.env`, `node_modules` ni `uploads/`.

## 2. Neon
1. Crea una base PostgreSQL en Neon.
2. Copia la variable `DATABASE_URL`.

## 3. Backend en Render
1. Crea un `Web Service` desde GitHub.
2. Render puede detectar `render.yaml` automaticamente.
3. Si configuras manualmente:
   - Root Directory: `server`
   - Build Command: `npm install && npm run prisma:generate && npm run build && npm run prisma:migrate:deploy`
   - Start Command: `npm run start`
4. Variables de entorno requeridas:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `FRONTEND_URL`
   - `BREVO_API_KEY`
   - `MAIL_FROM_NAME`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_REQUIRE_TLS`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `PORT` (opcional, Render la inyecta normalmente)
5. En Neon:
   - usa la URL con pooler para `DATABASE_URL`
   - usa la URL directa, sin pooler, para `DATABASE_URL_UNPOOLED`
   - las migraciones de Prisma deben usar la conexion directa para evitar timeouts o advisory locks fallidos
6. Para correo en Brevo:
   - `BREVO_API_KEY` desde API keys en Brevo
   - con esa clave el backend usara la API HTTPS de Brevo y evitara problemas de SMTP saliente en Render
   - `MAIL_FROM_NAME=Fono App` o el nombre de la profesional
   - `SMTP_HOST=smtp-relay.brevo.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_REQUIRE_TLS=true`
   - `SMTP_USER` y `SMTP_PASS` desde SMTP & API en Brevo
   - `SMTP_FROM` debe ser un remitente verificado en Brevo

## 4. Frontend en Netlify
1. Importa el repositorio desde GitHub.
2. Configura:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Variable requerida:
   - `VITE_API_URL=https://tu-backend.onrender.com/api/v1`

## 5. Conectar dominios
1. Cuando Netlify te entregue la URL final, actualiza en Render:
   - `CLIENT_URL=https://tu-app.netlify.app`
   - `FRONTEND_URL=https://tu-app.netlify.app`
2. Vuelve a desplegar el backend.
3. Verifica que `VITE_API_URL` en Netlify apunte al backend real.

## 6. Verificaciones
- Login admin y paciente
- Creacion y edicion de pacientes
- Citas y correos
- Cambio de password desde correo
- Anamnesis
- Pre-lavado
- Descarga de PDF
- Subida de archivos

## 7. Limitaciones del plan gratuito
- Render free puede dormir el backend.
- `node-cron` puede retrasarse si el servicio entra en sleep.
- `uploads/` en disco no es persistente a largo plazo.
- Para una etapa siguiente conviene mover archivos a storage externo.
