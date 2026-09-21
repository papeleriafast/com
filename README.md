# Papelería Fast — Asistente IA SOLO en la página

El `index.html` mantiene el diseño original y agrega un botón flotante de Asistente IA.

El navegador llama a `/api/chat`; la clave de OpenAI permanece en el backend.

Instalación:
1. `npm install`
2. Copia `.env.example` a `.env`.
3. Coloca `OPENAI_API_KEY`.
4. Ejecuta `npm start`.
5. Sirve el `index.html` y el endpoint `/api/chat` desde el mismo dominio o configura un proxy.

GitHub Pages por sí solo no puede ejecutar `server.js`, así que el endpoint de IA necesita un backend Node.js con HTTPS.
