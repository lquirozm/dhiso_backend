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

app.post("/send-email", async (req, res) => {
    const {name, email, message} = req.body;
  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["langelq59@gmail.com"],
      subject: `Nuevo mensaje del Formulario Web de parte de: ${name}`,
      html: `<strong>Mensaje:</strong> ${message}<br><strong>Correo:</strong> ${email}`
    });

    res.status(200).json({message:"Mensaje enviado exitosamente, nos pondremos en contacto contigo pronto."});
  } catch (error) {
    res.status(400).json({error: "Error al enviar el mensaje, por favor intente más tarde."});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
