import { randomUUID } from "crypto";
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

const BUCKET = "elarrastre";

function decodeBase64Image(image: string) {
  let contentType = "image/png";
  let base64 = image;

  const match = image.match(/^data:(.*?);base64,(.*)$/);
  if (match) {
    contentType = match[1] || contentType;
    base64 = match[2] || "";
  }

  try {
    const buffer = Buffer.from(base64, "base64");
    const extension =
      contentType.split("/")[1]?.split("+")[0]?.split(";")[0] || "png";
    return { buffer, contentType, extension };
  } catch (error) {
    console.error("No se pudo decodificar la imagen base64", error);
    return { buffer: null, contentType, extension: "png" };
  }
}

function extractStoragePathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.slice(index + marker.length);
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
    const imageBase64 =
      typeof payload?.imageBase64 === "string" ? payload.imageBase64.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: existingRow } = await supabase
      .from("collaborators")
      .select("image")
      .eq("id", id)
      .single();

    const updateData: Record<string, unknown> = { name };
    let uploadedFilePath: string | null = null;
    if (imageBase64) {
      const { buffer, contentType, extension } = decodeBase64Image(imageBase64);
      if (!buffer) {
        return NextResponse.json(
          { error: "El archivo de imagen no es válido." },
          { status: 400 }
        );
      }
      const filePath = `collaborators/${randomUUID()}.${extension}`;
      const uploadResult = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType, upsert: false });
      if (uploadResult.error) {
        console.error("Error subiendo imagen a storage", uploadResult.error);
        return NextResponse.json(
          { error: "No se pudo guardar la imagen." },
          { status: 500 }
        );
      }
      uploadedFilePath = filePath;
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);
      updateData.image = publicUrlData?.publicUrl ?? null;
    }

    const webLinkProvided =
      Object.prototype.hasOwnProperty.call(payload ?? {}, "webLink") ||
      Object.prototype.hasOwnProperty.call(payload ?? {}, "web_link");
    if (webLinkProvided) {
      const webLinkValue = sanitize(payload?.webLink ?? payload?.web_link ?? "");
      updateData.web_link = webLinkValue || null;
    }

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

    if (uploadedFilePath && existingRow?.image) {
      const previousPath = extractStoragePathFromUrl(existingRow.image);
      if (previousPath) {
        await supabase.storage.from(BUCKET).remove([previousPath]);
      }
    }

    return NextResponse.json(data);
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
    const { data: existingRow } = await supabase
      .from("collaborators")
      .select("image")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("collaborators").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando colaborador", error);
      return NextResponse.json(
        { error: "No se pudo eliminar el colaborador." },
        { status: 500 }
      );
    }

    if (existingRow?.image) {
      const path = extractStoragePathFromUrl(existingRow.image);
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
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
