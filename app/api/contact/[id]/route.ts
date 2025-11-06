import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../../lib/auth";

function parseId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    try {
      await requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const { id: rawId } = await context.params;
    const id = parseId(rawId);

    if (!id) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_requests").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando propuesta de contacto", error);
      return NextResponse.json(
        { error: "No se pudo eliminar la propuesta." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando DELETE /contact/:id", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la propuesta." },
      { status: 500 }
    );
  }
}
