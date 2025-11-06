import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../lib/auth";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

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

    const serialized =
      data?.map((item) => ({
        ...item,
        image: serializeImage(item.image),
      })) ?? [];

    return NextResponse.json(serialized);
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
    let imageBase64 =
      typeof body?.imageBase64 === "string" ? body.imageBase64.trim() : "";

    if (!name || !imageBase64) {
      return NextResponse.json(
        { error: "Nombre e imagen son obligatorios." },
        { status: 400 }
      );
    }

    // eliminamos prefijo data:image/...;base64,
    if (imageBase64.includes(",")) {
      imageBase64 = (imageBase64.split(",").pop() ?? "").trim();
    }

    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(imageBase64, "base64");
    } catch (conversionError) {
      console.error("Imagen no válida", conversionError);
      return NextResponse.json(
        { error: "El archivo de imagen no es válido." },
        { status: 400 }
      );
    }

    if (imageBuffer.length === 0) {
      return NextResponse.json(
        { error: "La imagen no puede estar vacía." },
        { status: 400 }
      );
    }

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
      image: imageBuffer,
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
            image: serializeImage(data.image),
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
