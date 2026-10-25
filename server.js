const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Criação da tabela de forma segura ao iniciar
pool.query(`
  CREATE TABLE IF NOT EXISTS fichas_gamificacao (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classe TEXT,
    hobbies TEXT,
    ratings JSONB,
    photo TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catchall?.() || pool.query(`
  CREATE TABLE IF NOT EXISTS fichas_gamificacao (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classe TEXT,
    hobbies TEXT,
    ratings JSONB,
    photo TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error("Erro ao criar tabela:", err));

app.get("/", (req, res) => {
  res.json({ status: "online", servico: "Paperpel API" });
});

app.get("/teste-neon", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ conectado: true, banco: "Neon PostgreSQL", horario: result.rows[0].now });
  } catch (error) {
    console.error(error);
    res.status(500).json({ conectado: false, erro: error.message });
  }
});

// Rota para Salvar Ficha
app.post("/api/fichas", async (req, res) => {
  try {
    const { name, slug, classe, hobbies, ratings, photo, updatedAt } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ erro: "Nome e slug são obrigatórios." });
    }

    const query = `
      INSERT INTO fichas_gamificacao (slug, name, classe, hobbies, ratings, photo, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (slug) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        classe = EXCLUDED.classe,
        hobbies = EXCLUDED.hobbies,
        ratings = EXCLUDED.ratings,
        photo = EXCLUDED.photo,
        updated_at = EXCLUDED.updated_at;
    `;

    await pool.query(query, [slug, name, classe, hobbies, JSON.stringify(ratings), photo, updatedAt]);
    res.json({ sucesso: true, mensagem: `Ficha de ${name} salva com sucesso!` });
  } catch (error) {
    console.error("Erro detalhado ao salvar:", error);
    res.status(500).json({ erro: error.message });
  }
});

// Rota para Buscar Ficha
app.get("/api/fichas/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query("SELECT * FROM fichas_gamificacao WHERE slug = $1", [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Ficha não encontrada." });
    }

    const row = result.rows[0];
    res.json({
      name: row.name,
      slug: row.slug,
      classe: row.classe,
      hobbies: row.hobbies,
      ratings: row.ratings,
      photo: row.photo,
      updatedAt: row.updated_at
    });
  } catch (error) {
    console.error("Erro ao buscar:", error);
    res.status(500).json({ erro: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Paperpel API rodando na porta ${PORT}`);
});
