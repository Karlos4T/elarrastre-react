require("dotenv/config");
const { Client } = require("pg");

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Faltan variables de entorno. Define POSTGRES_URL_NON_POOLING o POSTGRES_URL."
  );
}

async function setup() {
  const client = new Client({
    connectionString,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  const statements = [
    `
      CREATE TABLE IF NOT EXISTS registrations (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS collaborators (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image BYTEA NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS contact_requests (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mail VARCHAR(255) NOT NULL,
        phone VARCHAR(60),
        request TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  ];

  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log("Tablas creadas o comprobadas ✅");
  } finally {
    await client.end();
  }
}

setup().catch((error) => {
  console.error("Error creando las tablas ❌", error);
  process.exit(1);
});
