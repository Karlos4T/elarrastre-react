import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../../lib/auth";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

function parseId(param: string | string[] | undefined) {
  const value = Array.isArray(param) ? param[0] : param;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const id = parseId(params?.id);
    if (!id) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    const payload = await request.json().catch(() => ({}));
    const name = sanitize(payload?.name);

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("registrations")
      .update({ name })
      .eq("id", id)
      .select("id, name, created_at")
      .single();

    if (error) {
      console.error("Error actualizando inscripción", error);
      return NextResponse.json(
        { error: "No se pudo actualizar el registro." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No se encontró el registro." },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error procesando PUT /registrations/:id", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el registro." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const id = parseId(params?.id);
    if (!id) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("registrations").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando inscripción", error);
      return NextResponse.json(
        { error: "No se pudo eliminar el registro." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando DELETE /registrations/:id", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el registro." },
      { status: 500 }
    );
  }
}
