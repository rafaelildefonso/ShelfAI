import express from "express";
import { PrismaClient } from '@prisma/client';


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("🚀 API ShelfAI rodando!");
});

// Exemplo com banco
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));