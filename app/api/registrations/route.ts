import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitize(body?.name);

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("registrations")
      .insert({ name })
      .select("id, name, created_at")
      .single();

    if (error) {
      console.error("Error guardando inscripción", error);
      return NextResponse.json(
        { error: "No se pudo crear el registro." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error procesando solicitud de inscripción", error);
    return NextResponse.json(
      { error: "No se pudo crear el registro." },
      { status: 500 }
    );
  }
}
