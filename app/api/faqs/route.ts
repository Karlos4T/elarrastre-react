import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";

const sanitize = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const url = new URL(request.url);
    const visibleOnly = url.searchParams.get("visible") === "true";

    let query = supabase
      .from("faqs")
      .select(
        "id, question, answer, is_visible, position, asker_name, asker_email, created_at, updated_at"
      )
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (visibleOnly) {
      query = query.eq("is_visible", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error obteniendo preguntas frecuentes", error);
      return NextResponse.json(
        { error: "No se pudieron obtener las preguntas frecuentes." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error procesando GET /api/faqs", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las preguntas frecuentes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = sanitize(body?.question);
    const name = sanitize(body?.name ?? body?.askerName);
    const email = sanitize(body?.email ?? body?.askerEmail);

    if (!question) {
      return NextResponse.json(
        { error: "La pregunta es obligatoria." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: highestPositionRows } = await supabase
      .from("faqs")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = ((highestPositionRows?.[0]?.position as number | undefined) ?? 0) + 1;

    const insertPayload = {
      question,
      answer: null,
      is_visible: false,
      position: nextPosition,
      asker_name: name || null,
      asker_email: email || null,
    };

    const { data, error } = await supabase
      .from("faqs")
      .insert(insertPayload)
      .select(
        "id, question, answer, is_visible, position, asker_name, asker_email, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Error creando pregunta frecuente", error);
      return NextResponse.json(
        { error: "No se pudo registrar la pregunta." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error procesando POST /api/faqs", error);
    return NextResponse.json(
      { error: "No se pudo registrar la pregunta." },
      { status: 500 }
    );
  }
}
