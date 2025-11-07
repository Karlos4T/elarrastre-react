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
    `
      CREATE TABLE IF NOT EXISTS faqs (
        id BIGSERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT,
        is_visible BOOLEAN NOT NULL DEFAULT FALSE,
        position INTEGER NOT NULL DEFAULT 0,
        asker_name VARCHAR(255),
        asker_email VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
    `
      CREATE OR REPLACE FUNCTION set_faqs_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `,
    `
      DROP TRIGGER IF EXISTS set_faqs_updated_at_trigger ON faqs;
    `,
    `
      CREATE TRIGGER set_faqs_updated_at_trigger
      BEFORE UPDATE ON faqs
      FOR EACH ROW
      EXECUTE PROCEDURE set_faqs_updated_at();
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
