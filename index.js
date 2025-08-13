import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

//Middleware

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor de correo electrónico en funcionamiento");
});

app.post("/emails", async (req, res) => {
    const {name, email, message} = req.body;
  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
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
    res.status(400).json({error: "Error al enviar el mensaje, por favor intente más tarde."});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
