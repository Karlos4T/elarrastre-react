import { createSupabaseAdminClient } from "../lib/supabaseAdmin";
import HomeClient from "./components/HomeClient";

type CollaboratorRow = {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  web_link: string | null;
  position: number | null;
};

type Collaborator = CollaboratorRow & { imageSrc: string | null; webLink: string | null };

type FaqRow = {
  id: number;
  question: string;
  answer: string | null;
  is_visible: boolean | null;
  position: number | null;
  created_at: string;
};

type Faq = {
  id: number;
  question: string;
  answer: string | null;
  position: number;
  created_at: string;
};

export default async function Home() {
  const supabase = createSupabaseAdminClient();
  const [collaboratorsResult, faqsResult] = await Promise.all([
    supabase
      .from("collaborators")
      .select("id, name, image, created_at, web_link, position")
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("faqs")
      .select("id, question, answer, is_visible, position, created_at")
      .eq("is_visible", true)
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
  ]);

  if (collaboratorsResult.error) {
    throw new Error(
      `No se pudo obtener la lista de colaboradores: ${collaboratorsResult.error.message}`
    );
  }

  if (faqsResult.error) {
    throw new Error(
      `No se pudo obtener las preguntas frecuentes: ${faqsResult.error.message}`
    );
  }

  const normalizeImage = (image: string | null) => {
    if (!image) return null;
    if (image.startsWith("\\x")) {
      return Buffer.from(image.slice(2), "hex").toString("base64");
    }
    return image;
  };

  const collaborators: Collaborator[] = (collaboratorsResult.data ?? [])
    .map((item, index) => ({
      ...item,
      imageSrc: (() => {
        const base64 = normalizeImage(item.image);
        return base64 ? `data:image/png;base64,${base64}` : null;
      })(),
      webLink: item.web_link,
      position: item.position ?? index + 1,
    }))
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  const faqs: Faq[] = ((faqsResult.data as FaqRow[] | null) ?? [])
    .map((item, index) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      position: item.position ?? index + 1,
      created_at: item.created_at,
    }))
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  const { count: registrationsCount = 0, error: registrationsError } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true });

  if (registrationsError) {
    console.error("No se pudo contar las inscripciones", registrationsError.message);
  }
  return (
    <HomeClient
      collaborators={collaborators}
      registrationsCount={registrationsCount ?? 0}
      faqs={faqs}
    />
  );
}
