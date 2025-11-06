import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin";
import { AdminUnauthorizedError, requireAdminSession } from "../../../lib/auth";

function sanitize(value: unknown): string {
  return (typeof value === "string" ? value : "").trim();
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("collaborators")
      .select("id, name, image, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo colaboradores", error);
      return NextResponse.json(
        { error: "No se pudo obtener la lista de colaboradores." },
        { status: 500 }
      );
    }

    const serialized =
      data?.map((item) => {
        if (typeof item.image !== "string" || !item.image) {
          return { ...item, image: null };
        }

        if (item.image.startsWith("\\x")) {
          const base64 = Buffer.from(item.image.slice(2), "hex").toString("base64");
          return { ...item, image: base64 };
        }

        return item;
      }) ?? [];

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
    let imageBase64 =
      typeof body?.imageBase64 === "string" ? body.imageBase64.trim() : "";

    if (!name || !imageBase64) {
      return NextResponse.json(
        { error: "Nombre e imagen son obligatorios." },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabase
      .from("collaborators")
      .insert({
        name,
        image: imageBuffer,
      })
      .select("id, name, image, created_at")
      .single();

    if (error) {
      console.error("Error creando colaborador", error);
      return NextResponse.json(
        { error: "No se pudo crear el colaborador." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error procesando POST de colaboradores", error);
    return NextResponse.json(
      { error: "No se pudo crear el colaborador." },
      { status: 500 }
    );
  }
}
