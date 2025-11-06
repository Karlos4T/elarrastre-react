import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitize(body?.name);
    const mail = sanitize(body?.mail);
    const phone = sanitize(body?.phone);
    const text_request = sanitize(body?.request);

    if (!name || !mail || !text_request) {
      return NextResponse.json(
        { error: "Nombre, email y propuesta son obligatorios." },
        { status: 400 }
      );
    }

    if (!mail.includes("@")) {
      return NextResponse.json(
        { error: "El email no es válido." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("contact_requests")
      .insert({ name, mail, phone: phone || null, request });

    if (error) {
      console.error("Error guardando el mensaje de contacto", error);
      return NextResponse.json(
        { error: "No se pudo guardar el mensaje." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Error procesando solicitud de contacto", error);
    return NextResponse.json(
      { error: "No se pudo guardar el mensaje." },
      { status: 500 }
    );
  }
}
