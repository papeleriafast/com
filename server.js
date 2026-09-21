import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import OpenAI from "openai";
import { catalogo } from "./catalogo.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = Number(process.env.PORT || 3000);
const sessions = new Map();

const SYSTEM = `
Eres el asistente virtual de Papelería Fast y SOLO atiendes a los visitantes de la página web.
Habla en español mexicano, amable, claro y breve.
Puedes ayudar a buscar productos y explicar precios usando exclusivamente el catálogo proporcionado.
NO inventes precios, existencias, horarios, promociones ni productos.
Si un dato no aparece en el catálogo, indica que no está especificado y no lo inventes.
Puedes ayudar al cliente a preparar una lista de productos, pero no afirmes que una compra está pagada o confirmada.
Nunca solicites contraseñas, códigos SMS, NIP, CVV ni datos bancarios.
No menciones WhatsApp, llamadas ni canales externos a menos que el visitante pregunte explícitamente por ellos.
CATALOGO:
${JSON.stringify(catalogo)}
`;

function clean(v) {
  return String(v || "").replace(/\s+/g, " ").trim();
}

async function answer(sessionId, message) {
  const history = sessions.get(sessionId) || [];
  const result = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    input: [
      { role: "developer", content: SYSTEM },
      ...history,
      { role: "user", content: message }
    ],
    max_output_tokens: 400,
    store: false
  });

  const text = clean(result.output_text) ||
    "No pude generar una respuesta en este momento.";

  const next = [
    ...history,
    { role: "user", content: message },
    { role: "assistant", content: text }
  ].slice(-12);

  sessions.set(sessionId, next);
  return text;
}

app.post("/api/chat", async (req, res) => {
  try {
    const message = clean(req.body?.message);
    const sessionId = clean(req.body?.sessionId) || "web-" + crypto.randomUUID();

    if (!message) {
      return res.status(400).json({ error: "Escribe una pregunta." });
    }

    const text = await answer(sessionId, message);
    res.json({ ok: true, answer: text, sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo conectar con el asistente." });
  }
});

app.listen(PORT, () => {
  console.log("Papelería Fast — Asistente IA en puerto " + PORT);
});
