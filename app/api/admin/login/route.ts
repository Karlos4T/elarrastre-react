import { NextResponse } from "next/server";
import {
  attachAdminSessionCookie,
  validateAdminCredentials,
} from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    attachAdminSessionCookie(response, username);
    return response;
  } catch (error) {
    console.error("Error en login de admin", error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 }
    );
  }
}
