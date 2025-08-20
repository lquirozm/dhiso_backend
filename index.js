import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/emails", async (req, res) => {
  const {name, email, message} = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "El correo electrónico no es válido" });
  }

  try {
    const data = await resend.emails.send({
      from: "Formulario Web <contacto@dhisoingenieriayconstruccion.com>",
      to: ["ventas@dhisoingenieriayconstruccion.com"],
      subject: `Nuevo mensaje desde el sitio web de: ${name}`,
      html: `
              <p>Has recibido un nuevo mensaje a través del formulario de contacto.</p>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Correo electrónico:</strong> ${email}</p>
              <p><strong>Mensaje:</strong><br>${message}</p>
            `
      });

    res.status(200).json({message:"Mensaje enviado exitosamente, nos pondremos en contacto contigo pronto."});
  } catch (error) {
      console.error("Error al enviar el correo:", error);
      res.status(500).json({error: "Error al enviar el mensaje, por favor intente más tarde."});
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
