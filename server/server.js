const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyWwnjSBGTXG83gBDZCj8ev6q0f_gUduSjIpkEn6Rf0TX7jQVNzc9wW8RAMANiOJUfyxw/exec";

const serverUploadsDir = path.join(__dirname, "uploads");
const publicUploadsDir = path.join(__dirname, "..", "public", "uploads");

if (!fs.existsSync(serverUploadsDir)) {
  fs.mkdirSync(serverUploadsDir, { recursive: true });
}
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

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
    origin: ["http://localhost:5174", "http://127.0.0.1:5174"],
  })
);

// Permitir JSON hasta 25MB para fotos en base64
app.use(express.json({ limit: "25mb" }));

// Servir imagenes estaticas
app.use("/uploads", express.static(serverUploadsDir));

// POST /api/hermanos/:brotherId/foto
app.post("/api/hermanos/:brotherId/foto", (req, res) => {
  try {
    const { brotherId } = req.params;
    const { photoBase64 } = req.body;

    if (!brotherId) {
      return res.status(400).json({ ok: false, error: "Falta el ID del hermano" });
    }

    if (!photoBase64 || typeof photoBase64 !== "string") {
      return res.status(400).json({ ok: false, error: "Falta la imagen en formato base64" });
    }

    const matches = photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = "png";

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
      else if (mime.includes("webp")) ext = "webp";
      else if (mime.includes("png")) ext = "png";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(photoBase64, "base64");
    }

    const filename = `brother-${brotherId}.${ext}`;
    const serverFilePath = path.join(serverUploadsDir, filename);
    const publicFilePath = path.join(publicUploadsDir, filename);

    fs.writeFileSync(serverFilePath, buffer);
    try {
      fs.writeFileSync(publicFilePath, buffer);
    } catch (e) {
      console.warn("No se pudo sincronizar con public/uploads:", e.message);
    }

    const photoUrl = `/uploads/${filename}?t=${Date.now()}`;
    res.json({
      ok: true,
      data: {
        brotherId,
        photoUrl,
      },
    });
  } catch (error) {
    console.error("Error al guardar foto de hermano:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// GET /api/hermanos/:brotherId/foto
app.get("/api/hermanos/:brotherId/foto", (req, res) => {
  try {
    const { brotherId } = req.params;
    const extensions = ["png", "jpg", "webp"];
    for (const ext of extensions) {
      const filename = `brother-${brotherId}.${ext}`;
      const serverFilePath = path.join(serverUploadsDir, filename);
      if (fs.existsSync(serverFilePath)) {
        return res.json({
          ok: true,
          data: {
            brotherId,
            photoUrl: `/uploads/${filename}`,
          },
        });
      }
    }
    return res.status(404).json({ ok: false, error: "Foto no encontrada" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

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
