import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    try {
      await requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const body = await request.json().catch(() => ({}));
    const order = Array.isArray(body?.order) ? body.order : [];

    if (
      order.length === 0 ||
      order.some(
        (item) =>
          typeof item?.id !== "number" ||
          !Number.isFinite(item.id) ||
          typeof item?.position !== "number" ||
          !Number.isFinite(item.position)
      )
    ) {
      return NextResponse.json(
        { error: "El payload de orden es inválido." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    for (const { id, position } of order) {
      const { error } = await supabase
        .from("collaborators")
        .update({ position })
        .eq("id", id);
      if (error) {
        console.error("Error actualizando posición de colaborador", { id, error });
        return NextResponse.json(
          { error: "No se pudo actualizar el orden de los colaboradores." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando POST /collaborators/reorder", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el orden de los colaboradores." },
      { status: 500 }
    );
  }
}
