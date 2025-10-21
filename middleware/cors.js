import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const allowedOrigins = process.env.ACCEPTED_ORIGINS?.split(",").map(origin => origin.trim()); 

export const corsMiddleware = () => {
  return cors({
    origin: (origin, callback) => {
       if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
    },
    methods: ["POST"],
    optionsSuccessStatus: 200
  });
};