import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../../lib/auth";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

function parseId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

type RouteContext = { params: Promise<{ id: string }> };

function bufferFromUnknown(image: unknown): Buffer | null {
  if (!image) return null;
  if (Buffer.isBuffer(image)) return image;
  if (image instanceof ArrayBuffer) return Buffer.from(image);
  if (ArrayBuffer.isView(image)) {
    const view = image as ArrayBufferView;
    return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
  }
  if (typeof image === "object" && image !== null && "data" in image) {
    const data = (image as { data?: ArrayLike<number> }).data;
    if (data) {
      return Buffer.from(data as ArrayLike<number>);
    }
  }
  if (Array.isArray(image)) {
    return Buffer.from(image);
  }
  if (typeof image === "string") {
    if (image.startsWith("\\x")) {
      return Buffer.from(image.slice(2), "hex");
    }
    if (image.startsWith("data:image")) {
      const base64 = image.split(",").pop();
      return base64 ? Buffer.from(base64, "base64") : null;
    }
    return Buffer.from(image, "base64");
  }
  return null;
}

function serializeImage(image: unknown): string | null {
  if (!image) return null;
  if (typeof image === "string") {
    if (image.startsWith("data:image")) return image;
    if (image.startsWith("\\x")) {
      const base64 = Buffer.from(image.slice(2), "hex").toString("base64");
      return `data:image/png;base64,${base64}`;
    }
    return `data:image/png;base64,${image}`;
  }
  const buffer = bufferFromUnknown(image);
  if (!buffer) return null;
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

    const payload = await request.json().catch(() => ({}));
    const name = sanitize(payload?.name);
    let imageBase64 =
      typeof payload?.imageBase64 === "string" ? payload.imageBase64.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { name };
    if (imageBase64) {
      if (imageBase64.includes(",")) {
        imageBase64 = (imageBase64.split(",").pop() ?? "").trim();
      }

      try {
        updateData.image = Buffer.from(imageBase64, "base64");
      } catch (error) {
        console.error("Imagen no válida", error);
        return NextResponse.json(
          { error: "El archivo de imagen no es válido." },
          { status: 400 }
        );
      }
    }

    const webLinkProvided =
      Object.prototype.hasOwnProperty.call(payload ?? {}, "webLink") ||
      Object.prototype.hasOwnProperty.call(payload ?? {}, "web_link");
    if (webLinkProvided) {
      const webLinkValue = sanitize(payload?.webLink ?? payload?.web_link ?? "");
      updateData.web_link = webLinkValue || null;
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("collaborators")
      .update(updateData)
      .eq("id", id)
      .select("id, name, image, created_at, web_link, position")
      .single();

    if (error) {
      console.error("Error actualizando colaborador", error);
      return NextResponse.json(
        { error: "No se pudo actualizar el colaborador." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "No se encontró el colaborador." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...data,
      image: serializeImage(data.image),
    });
  } catch (error) {
    console.error("Error procesando PUT de colaborador", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el colaborador." },
      { status: 500 }
    );
  }
}

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
    const { error } = await supabase.from("collaborators").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando colaborador", error);
      return NextResponse.json(
        { error: "No se pudo eliminar el colaborador." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error procesando DELETE de colaborador", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el colaborador." },
      { status: 500 }
    );
  }
}
