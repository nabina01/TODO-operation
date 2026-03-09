import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import todoRoutes from "./src/routes/todo.routes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);

app.get("/", (request, response) => {
  response.send("Todo API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));