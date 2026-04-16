const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyWwnjSBGTXG83gBDZCj8ev6q0f_gUduSjIpkEn6Rf0TX7jQVNzc9wW8RAMANiOJUfyxw/exec";

const mapObservationFromAppsScript = (row = {}) => ({
  id: row.id,
  brotherId: row.brotherId ?? row.idHermano,
  text: row.text ?? row.texto,
  author: row.author ?? row.autor,
  role: row.role ?? row.rol,
  createdAt: row.createdAt ?? row.fechaCreacion,
  process: row.process ?? row.proceso,
});

// Permitir requests desde tu frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Permitir JSON
app.use(express.json());

// GET observaciones
app.get("/api/observaciones/:brotherId", async (req, res) => {
  try {
    const { brotherId } = req.params;

    const url = new URL(WEB_APP_URL);
    url.searchParams.set("accion", "obtenerObservaciones");
    url.searchParams.set("idHermano", brotherId);

    const response = await fetch(url.toString());
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        ok: false,
        error: "Respuesta inválida de Apps Script",
        raw: text,
      });
    }

    if (!response.ok || !data.ok) {
      return res.status(500).json({
        ok: false,
        error: data.error || "Error al obtener observaciones",
      });
    }

    const observations = Array.isArray(data.data) ? data.data : [];

    res.json({
      ok: true,
      data: observations.map(mapObservationFromAppsScript),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// POST observación
app.post("/api/observaciones", async (req, res) => {
  try {
    const { brotherId, text, author, role, process } = req.body;

    if (!brotherId || !text || !author || !role || !process) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos",
      });
    }

    const payload = {
      accion: "agregarObservacion",
      idHermano: brotherId,
      texto: text,
      autor: author,
      rol: role,
      proceso: process,
    };

    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const textResponse = await response.text();

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      return res.status(500).json({
        ok: false,
        error: "Respuesta inválida de Apps Script",
        raw: textResponse,
      });
    }

    if (!response.ok || !data.ok) {
      return res.status(500).json({
        ok: false,
        error: data.error || "Error al guardar observación",
      });
    }

    res.json({
      ok: true,
      data: mapObservationFromAppsScript(data.data),
    });
  } catch (error) {
    console.error("ERROR POST /api/observaciones:", error);

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
