import express from "express";
import dotenv from "dotenv";
import { connection } from "./config/database";
import router from "./routes";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();

connection()
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", router);
