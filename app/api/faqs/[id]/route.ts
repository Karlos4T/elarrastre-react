import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../../lib/auth";

const sanitize = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const parseId = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    try {
      requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const { id: rawId } = await context.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const hasQuestion = Object.prototype.hasOwnProperty.call(body, "question");
    const hasAnswer = Object.prototype.hasOwnProperty.call(body, "answer");
    const hasVisibility = Object.prototype.hasOwnProperty.call(body, "isVisible");

    if (!hasQuestion && !hasAnswer && !hasVisibility) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar." },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (hasQuestion) {
      const question = sanitize(body?.question);
      if (!question) {
        return NextResponse.json(
          { error: "La pregunta no puede estar vacía." },
          { status: 400 }
        );
      }
      updatePayload.question = question;
    }

    if (hasAnswer) {
      const answer = sanitize(body?.answer);
      updatePayload.answer = answer || null;
    }

    if (hasVisibility) {
      const isVisible = Boolean(body?.isVisible);
      if (isVisible && !sanitize(body?.answer ?? body?.existingAnswer ?? "")) {
        return NextResponse.json(
          { error: "Necesitas una respuesta para hacer visible la pregunta." },
          { status: 400 }
        );
      }
      updatePayload.is_visible = isVisible;
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("faqs")
      .update(updatePayload)
      .eq("id", id)
      .select(
        "id, question, answer, is_visible, position, asker_name, asker_email, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Error actualizando pregunta frecuente", error);
      return NextResponse.json(
        { error: "No se pudo actualizar la pregunta." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Pregunta no encontrada." }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error procesando PUT /api/faqs/:id", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la pregunta." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    try {
      requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const { id: rawId } = await context.params;
    const id = parseId(rawId);
    if (!id) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando pregunta frecuente", error);
      return NextResponse.json(
        { error: "No se pudo eliminar la pregunta." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando DELETE /api/faqs/:id", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la pregunta." },
      { status: 500 }
    );
  }
}
