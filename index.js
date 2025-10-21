import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import { corsMiddleware } from "./middleware/cors.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(helmet())
app.disable("x-powered-by");
app.use(corsMiddleware());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 requests por IP cada 15 minutos
  message: { error: "Demasiadas solicitudes, por favor intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/emails", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};



app.post("/emails", async (req, res) => {
  const {name, email, message} = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false,
      message: "Todos los campos son obligatorios" });
  }

  if (name.length > 100 || message.length > 1000) {
    return res.status(400).json({ 
      success: false,
      message: "Los campos exceden la longitud máxima permitida" 
    });
  }
  const sanitizedName = sanitizeInput(name);
  const sanitizedMessage = sanitizeInput(message);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: "El correo electrónico no es válido" });
  }

  try {
    const data = await resend.emails.send({
      from: "Formulario Web Dhiso <contacto@dhisoingenieriayconstruccion.com>",
      to: ["ventas@dhisoingenieriayconstruccion.com"],
      subject: `Nuevo mensaje desde el sitio web de: ${sanitizedName}`,
      html: `
              <p>Has recibido un nuevo mensaje a través del formulario de contacto.</p>
              <p><strong>Nombre:</strong> ${sanitizedName}</p>
              <p><strong>Correo electrónico:</strong> ${email}</p>
              <p><strong>Mensaje:</strong><br>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
            `
      });

    res.status(200).json({
      success: true,
      message:"Mensaje enviado exitosamente, nos pondremos en contacto contigo pronto."});
  } catch (error) {
      console.error("Error al enviar el correo:", error);
      res.status(500).json({
        success: false,
        error: "Error al enviar el mensaje, por favor intente más tarde."});
    }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
   res.status(500).json({ 
    success: false,
    error: "Algo salió mal en el servidor" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
