import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const url = new URL(request.url);
    const summary = url.searchParams.get("summary");

    if (summary === "count") {
      const { count, error } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true });

      if (error) {
        console.error("Error contando inscripciones", error);
        return NextResponse.json(
          { error: "No se pudieron contar las inscripciones." },
          { status: 500 }
        );
      }

      return NextResponse.json({ count: count ?? 0 });
    }

    const { data, error } = await supabase
      .from("registrations")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo inscripciones", error);
      return NextResponse.json(
        { error: "No se pudieron obtener las inscripciones." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: data?.length ?? 0,
      registrations: data ?? [],
    });
  } catch (error) {
    console.error("Error procesando GET /api/registrations", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las inscripciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawNames = Array.isArray(body?.names) ? body.names : [body?.name].filter(Boolean);
    const names = rawNames.map(sanitize).filter(Boolean);

    if (names.length === 0) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const rows = names.map((name: any) => ({ name }));

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("registrations")
      .insert(rows)
      .select("id, name, created_at");

    if (error) {
      console.error("Error guardando inscripción", error);
      return NextResponse.json(
        { error: "No se pudo crear el registro." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 201 });
  } catch (error) {
    console.error("Error procesando solicitud de inscripción", error);
    return NextResponse.json(
      { error: "No se pudo crear el registro." },
      { status: 500 }
    );
  }
}
