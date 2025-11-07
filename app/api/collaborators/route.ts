import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../lib/auth";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

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

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("collaborators")
      .select("id, name, image, created_at, web_link, position")
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error obteniendo colaboradores", error);
      return NextResponse.json(
        { error: "No se pudo obtener la lista de colaboradores." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error procesando GET de colaboradores", error);
    return NextResponse.json(
      { error: "No se pudo obtener la lista de colaboradores." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    try {
      await requireAdminSession();
    } catch (error) {
      if (error instanceof AdminUnauthorizedError) {
        return NextResponse.json({ error: "No autorizado." }, { status: 401 });
      }
      throw error;
    }

    const supabase = createSupabaseAdminClient();
    const body = await request.json();
    const name = sanitize(body?.name);
    const webLink = sanitize(body?.webLink ?? body?.web_link ?? "");
    const imageBase64 =
      typeof body?.imageBase64 === "string" ? body.imageBase64.trim() : "";

    if (!name || !imageBase64) {
      return NextResponse.json(
        { error: "Nombre e imagen son obligatorios." },
        { status: 400 }
      );
    }

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
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadResult.error) {
      console.error("Error subiendo imagen a storage", uploadResult.error);
      return NextResponse.json(
        { error: "No se pudo guardar la imagen." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl ?? null;

    const explicitPosition =
      typeof body?.position === "number" && Number.isFinite(body.position)
        ? Number(body.position)
        : null;

    const { data: highestPositionRows } = await supabase
      .from("collaborators")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition =
      explicitPosition ?? ((highestPositionRows?.[0]?.position ?? 0) as number) + 1;

    const insertPayload: Record<string, unknown> = {
      name,
      image: publicUrl,
      web_link: webLink || null,
      position: nextPosition,
    };

    const { data, error } = await supabase
      .from("collaborators")
      .insert(insertPayload)
      .select("id, name, image, created_at, web_link, position")
      .single();

    if (error) {
      console.error("Error creando colaborador", error);
      return NextResponse.json(
        { error: "No se pudo crear el colaborador." },
        { status: 500 }
      );
    }

    // añadimos también data URL en la respuesta POST
    return NextResponse.json(
      data
        ? {
            ...data,
          }
        : data,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error procesando POST de colaboradores", error);
    return NextResponse.json(
      { error: "No se pudo crear el colaborador." },
      { status: 500 }
    );
  }
}
