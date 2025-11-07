"use client";

import { ChevronDown, GripVertical, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useToast, ToastVariant } from "../components/ToastProvider";

type Registration = {
  id: number;
  name: string;
  created_at: string;
};

type Collaborator = {
  id: number;
  name: string;
  created_at: string;
  imageSrc: string | null;
  webLink: string | null;
  position: number;
};

type ContactRequest = {
  id: number;
  name: string;
  mail: string;
  phone: string | null;
  request: string;
  created_at: string;
};

type FAQ = {
  id: number;
  question: string;
  answer: string | null;
  isVisible: boolean;
  position: number;
  askerName: string | null;
  askerEmail: string | null;
  created_at: string;
};

const SECTION_KEYS = ["registrations", "collaborators", "proposals", "faqs"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];
const lastSeenStorageKey = (section: SectionKey) => `admin:lastSeen:${section}`;
type CreatedRecord = { created_at: string };

type Props = {
  registrations: Registration[];
  collaborators: Collaborator[];
  contactRequests: ContactRequest[];
  faqs: FAQ[];
};

type ActionState = {
  message: string | null;
  error: string | null;
};

const initialActionState: ActionState = { message: null, error: null };

export default function AdminDashboard({
  registrations: initialRegistrations,
  collaborators,
  contactRequests,
  faqs,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const notify = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      showToast({ message, variant });
    },
    [showToast]
  );
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [drafts, setDrafts] = useState<Record<number, string>>(() =>
    Object.fromEntries(initialRegistrations.map((item) => [item.id, item.name]))
  );
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [actionState, setActionState] = useState<ActionState>(initialActionState);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setRegistrations(initialRegistrations);
    setDrafts(
      Object.fromEntries(initialRegistrations.map((item) => [item.id, item.name]))
    );
  }, [initialRegistrations]);

  const [collaboratorList, setCollaboratorList] = useState(collaborators);
  const [collaboratorOrderDirty, setCollaboratorOrderDirty] = useState(false);
  const [collaboratorModal, setCollaboratorModal] = useState<{
    open: boolean;
    collaborator: Collaborator | null;
  }>({ open: false, collaborator: null });
  const [draggedCollaboratorId, setDraggedCollaboratorId] = useState<number | null>(
    null
  );
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [contactRequestList, setContactRequestList] = useState(contactRequests);
  const [contactToDelete, setContactToDelete] = useState<ContactRequest | null>(null);
  const [contactDeleting, setContactDeleting] = useState(false);
  const [contactDeleteError, setContactDeleteError] = useState<string | null>(null);

  const buildFaqDrafts = (items: FAQ[]) =>
    Object.fromEntries(
      items.map((faq) => [faq.id, { question: faq.question, answer: faq.answer ?? "", isVisible: faq.isVisible }])
    );

  const [faqList, setFaqList] = useState(faqs);
  const [faqDrafts, setFaqDrafts] = useState<Record<number, { question: string; answer: string; isVisible: boolean }>>(
    () => buildFaqDrafts(faqs)
  );
  const [faqSavingId, setFaqSavingId] = useState<number | null>(null);
  const [faqDeletingId, setFaqDeletingId] = useState<number | null>(null);
  const [draggedFaqId, setDraggedFaqId] = useState<number | null>(null);
  const [faqOrderDirty, setFaqOrderDirty] = useState(false);
  const [faqOrderSaving, setFaqOrderSaving] = useState(false);
  const [faqOrderError, setFaqOrderError] = useState<string | null>(null);
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);
  const getInitialNewFaq = () => ({ question: "", answer: "", isVisible: false });
  const [newFaq, setNewFaq] = useState(() => getInitialNewFaq());
  const [creatingFaq, setCreatingFaq] = useState(false);
  const [createFaqError, setCreateFaqError] = useState<string | null>(null);
  const [showNewFaqForm, setShowNewFaqForm] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionKey>("registrations");
  const initialTimestamp = new Date(0).toISOString();
  const [lastSeen, setLastSeen] = useState<Record<SectionKey, string>>({
    registrations: initialTimestamp,
    collaborators: initialTimestamp,
    proposals: initialTimestamp,
    faqs: initialTimestamp,
  });
  const [lastSeenReady, setLastSeenReady] = useState(false);

  useEffect(() => {
    setCollaboratorList(collaborators);
    setOrderError(null);
    setCollaboratorOrderDirty(false);
  }, [collaborators]);

  useEffect(() => {
    setFaqList(faqs);
    setFaqDrafts(buildFaqDrafts(faqs));
    setFaqOrderError(null);
    setFaqOrderDirty(false);
    setActiveFaqId(null);
    setNewFaq(getInitialNewFaq());
    setCreateFaqError(null);
    setShowNewFaqForm(false);
  }, [faqs]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLastSeen((prev) => {
      const next = { ...prev };
      let changed = false;
      SECTION_KEYS.forEach((section) => {
        const stored = window.localStorage.getItem(lastSeenStorageKey(section));
        if (stored) {
          if (stored !== prev[section]) {
            next[section] = stored;
            changed = true;
          }
        } else {
          const now = new Date().toISOString();
          window.localStorage.setItem(lastSeenStorageKey(section), now);
          next[section] = now;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setLastSeenReady(true);
  }, []);

  const totalRegistrations = registrations.length;
  const totalCollaborators = collaboratorList.length;
  const totalRequests = contactRequestList.length;
  const totalFaqs = faqList.length;

  const mostRecentRequest = useMemo(() => {
    return contactRequestList
      .slice()
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
  }, [contactRequestList]);
  useEffect(() => {
    setContactRequestList(contactRequests);
  }, [contactRequests]);

  const handleChange = (id: number, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = async (id: number) => {
    const name = drafts[id]?.trim();
    if (!name) {
      setActionState({ error: "El nombre no puede estar vacío.", message: null });
      return;
    }

    setLoadingId(id);
    setActionState(initialActionState);

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo actualizar el registro.");
      }

      const payload = (await response.json()) as Registration;
      setRegistrations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, name: payload.name } : item))
      );
      setDrafts((prev) => ({ ...prev, [id]: payload.name }));
      setActionState({ message: "Registro actualizado.", error: null });
      notify("Registro actualizado.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
      notify(message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const registration = registrations.find((item) => item.id === id);
    if (!registration) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a "${registration.name}"?`
    );
    if (!confirmed) {
      return;
    }

    setLoadingId(id);
    setActionState(initialActionState);

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo eliminar el registro.");
      }

      setRegistrations((prev) => prev.filter((item) => item.id !== id));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setActionState({ message: "Registro eliminado.", error: null });
      notify("Registro eliminado.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
      notify(message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const openCollaboratorModal = (collaborator?: Collaborator) => {
    setCollaboratorModal({ open: true, collaborator: collaborator ?? null });
  };

  const closeCollaboratorModal = () => {
    setCollaboratorModal({ open: false, collaborator: null });
  };

  const handleCollaboratorSaved = (item: Collaborator) => {
    let existsAlready = false;
    setCollaboratorList((prev) => {
      existsAlready = prev.some((collab) => collab.id === item.id);
      if (existsAlready) {
        return prev
          .map((collab) => (collab.id === item.id ? item : collab))
          .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
      }
      const enriched = [
        ...prev,
        { ...item, position: item.position ?? prev.length + 1 },
      ];
      return enriched.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
    });
    setActionState({
      message: existsAlready ? "Colaborador actualizado." : "Colaborador añadido.",
      error: null,
    });
  };

  const handleCollaboratorDeleted = (id: number) => {
    setCollaboratorList((prev) =>
      prev
        .filter((collab) => collab.id !== id)
        .map((collab, index) => ({ ...collab, position: index + 1 }))
    );
    setActionState({ message: "Colaborador eliminado.", error: null });
  };

  const reorderList = (
    list: Collaborator[],
    sourceId: number,
    targetId: number
  ): Collaborator[] => {
    const updated = [...list];
    const sourceIndex = updated.findIndex((item) => item.id === sourceId);
    const targetIndex = updated.findIndex((item) => item.id === targetId);
    if (
      sourceIndex === -1 ||
      targetIndex === -1 ||
      sourceIndex === targetIndex
    ) {
      return list;
    }
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    return updated.map((item, index) => ({ ...item, position: index + 1 }));
  };

  const persistCollaboratorOrder = async (list: Collaborator[]) => {
    setOrderSaving(true);
    setOrderError(null);
    try {
      const payload = {
        order: list.map((item, index) => ({
          id: item.id,
          position: item.position ?? index + 1,
        })),
      };
      const response = await fetch("/api/collaborators/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar el orden.");
      }

      setActionState({ message: "Orden de colaboradores actualizado.", error: null });
      notify("Orden de colaboradores actualizado.", "success");
      router.refresh();
      setCollaboratorOrderDirty(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el orden.";
      setOrderError(message);
      notify(message, "error");
    } finally {
      setOrderSaving(false);
    }
  };

  const handleDragStart = (id: number) => {
    setDraggedCollaboratorId(id);
  };

  const handleDragOver = (
    event: DragEvent<HTMLLIElement>,
    targetId: number
  ) => {
    event.preventDefault();
    if (draggedCollaboratorId === null || draggedCollaboratorId === targetId) {
      return;
    }
    setCollaboratorList((prev) => {
      const reordered = reorderList(prev, draggedCollaboratorId, targetId);
      if (reordered === prev) {
        return prev;
      }
      setCollaboratorOrderDirty(true);
      return reordered;
    });
  };

  const handleDrop = (
    event: DragEvent<HTMLLIElement>,
    targetId: number
  ) => {
    event.preventDefault();
    if (draggedCollaboratorId === null) {
      return;
    }
    setCollaboratorList((prev) => {
      const reordered = reorderList(prev, draggedCollaboratorId, targetId);
      if (reordered === prev) {
        return prev;
      }
      setCollaboratorOrderDirty(true);
      return reordered;
    });
    setDraggedCollaboratorId(null);
  };

  const handleDragEnd = () => {
    setDraggedCollaboratorId(null);
  };

  const handleCollaboratorOrderSave = () => {
    if (!collaboratorOrderDirty || orderSaving) {
      return;
    }
    persistCollaboratorOrder(collaboratorList);
  };

  const handleCollaboratorClick = (collaborator: Collaborator) => {
    if (draggedCollaboratorId !== null) {
      return;
    }
    openCollaboratorModal(collaborator);
  };

  const itemsBySection = useMemo<Record<SectionKey, CreatedRecord[]>>(
    () => ({
      registrations,
      collaborators: collaboratorList,
      proposals: contactRequestList,
      faqs: faqList,
    }),
    [registrations, collaboratorList, contactRequestList, faqList]
  );

  const getLatestTimestampFromItems = (items: CreatedRecord[]) => {
    if (!items?.length) {
      return new Date().toISOString();
    }
    const latestMs = items.reduce((max, item) => {
      const value = Date.parse(item.created_at);
      if (Number.isNaN(value)) {
        return max;
      }
      return Math.max(max, value);
    }, 0);
    return new Date(latestMs || Date.now()).toISOString();
  };

  const markSectionAsRead = (section: SectionKey, items: CreatedRecord[]) => {
    if (typeof window === "undefined" || !lastSeenReady) {
      return;
    }
    const timestamp = getLatestTimestampFromItems(items);
    window.localStorage.setItem(lastSeenStorageKey(section), timestamp);
    setLastSeen((prev) => ({ ...prev, [section]: timestamp }));
  };

  useEffect(() => {
    if (!lastSeenReady) {
      return;
    }
    markSectionAsRead(activeTab, itemsBySection[activeTab]);
  }, [activeTab, itemsBySection, lastSeenReady]);

  const newCounts = useMemo<Record<SectionKey, number>>(() => {
    const counts: Record<SectionKey, number> = {
      registrations: 0,
      collaborators: 0,
      proposals: 0,
      faqs: 0,
    };
    if (!lastSeenReady) {
      return counts;
    }
    SECTION_KEYS.forEach((section) => {
      const lastSeenTimestamp = lastSeen[section];
      const lastMs = lastSeenTimestamp ? Date.parse(lastSeenTimestamp) : 0;
      if (Number.isNaN(lastMs)) {
        counts[section] = 0;
        return;
      }
      const items = itemsBySection[section] ?? [];
      counts[section] = items.filter((item) => {
        const createdMs = Date.parse(item.created_at);
        return !Number.isNaN(createdMs) && createdMs > lastMs;
      }).length;
    });
    return counts;
  }, [itemsBySection, lastSeen, lastSeenReady]);

  const handleTabSelect = (section: SectionKey) => {
    setActiveTab(section);
    markSectionAsRead(section, itemsBySection[section]);
  };

  const normalizeFaq = (item: any): FAQ => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    isVisible: Boolean(item.is_visible ?? item.isVisible),
    position: item.position ?? 0,
    askerName: item.asker_name ?? item.askerName ?? null,
    askerEmail: item.asker_email ?? item.askerEmail ?? null,
    created_at: item.created_at,
  });

  const handleFaqDraftChange = (
    id: number,
    field: "question" | "answer" | "isVisible",
    value: string | boolean
  ) => {
    setFaqDrafts((prev) => {
      const current = prev[id] ?? { question: "", answer: "", isVisible: false };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: field === "isVisible" ? Boolean(value) : (value as string),
        },
      };
    });
  };

  const handleNewFaqFieldChange = (
    field: "question" | "answer" | "isVisible",
    value: string | boolean
  ) => {
    setNewFaq((prev) => ({
      ...prev,
      [field]: field === "isVisible" ? Boolean(value) : (value as string),
    }));
  };

  const handleCreateFaq = async () => {
    const question = newFaq.question.trim();
    const answer = newFaq.answer.trim();
    if (!question) {
      setCreateFaqError("La pregunta no puede estar vacía.");
      return;
    }
    if (newFaq.isVisible && !answer) {
      setCreateFaqError("Necesitas una respuesta antes de hacerla visible.");
      return;
    }
    setCreatingFaq(true);
    setCreateFaqError(null);
    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer: answer || null,
          isVisible: newFaq.isVisible,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo crear la pregunta.");
      }

      const payload = await response.json();
      const normalized = normalizeFaq(payload);
      setFaqList((prev) =>
        [...prev, normalized].sort(
          (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
        )
      );
      setFaqDrafts((prev) => ({
        ...prev,
        [normalized.id]: {
          question: normalized.question,
          answer: normalized.answer ?? "",
          isVisible: normalized.isVisible,
        },
      }));
      setNewFaq(getInitialNewFaq());
      setShowNewFaqForm(false);
      setActionState({ message: "Pregunta creada.", error: null });
      notify("Pregunta creada.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear la pregunta.";
      setCreateFaqError(message);
      notify(message, "error");
    } finally {
      setCreatingFaq(false);
    }
  };

  const handleFaqSave = async (id: number) => {
    const draft = faqDrafts[id];
    if (!draft) {
      return;
    }

    const question = draft.question.trim();
    const answer = draft.answer.trim();

    if (!question) {
      setActionState({ message: null, error: "La pregunta no puede estar vacía." });
      return;
    }

    if (draft.isVisible && !answer) {
      setActionState({
        message: null,
        error: "Necesitas una respuesta antes de hacerla visible.",
      });
      return;
    }

    setFaqSavingId(id);
    setActionState(initialActionState);
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
          isVisible: draft.isVisible,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar la pregunta.");
      }

      const payload = await response.json();
      const normalized = normalizeFaq(payload);
      setFaqList((prev) =>
        prev
          .map((faq) => (faq.id === id ? normalized : faq))
          .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
      );
      setFaqDrafts((prev) => ({
        ...prev,
        [id]: {
          question: normalized.question,
          answer: normalized.answer ?? "",
          isVisible: normalized.isVisible,
        },
      }));
      setActionState({ message: "Pregunta guardada.", error: null });
      notify("Pregunta guardada.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
      notify(message, "error");
    } finally {
      setFaqSavingId(null);
    }
  };

  const handleFaqDelete = async (id: number) => {
    const faq = faqList.find((item) => item.id === id);
    if (!faq) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la pregunta "${faq.question}"?`
    );
    if (!confirmed) {
      return;
    }

    setFaqDeletingId(id);
    setActionState(initialActionState);
    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo eliminar la pregunta.");
      }

      setFaqList((prev) => prev.filter((item) => item.id !== id));
      setActiveFaqId((current) => (current === id ? null : current));
      setFaqDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setActionState({ message: "Pregunta eliminada.", error: null });
      notify("Pregunta eliminada.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
      notify(message, "error");
    } finally {
      setFaqDeletingId(null);
    }
  };

  const reorderFaqList = (list: FAQ[], sourceId: number, targetId: number): FAQ[] => {
    const updated = [...list];
    const sourceIndex = updated.findIndex((item) => item.id === sourceId);
    const targetIndex = updated.findIndex((item) => item.id === targetId);
    if (
      sourceIndex === -1 ||
      targetIndex === -1 ||
      sourceIndex === targetIndex
    ) {
      return list;
    }
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    return updated.map((item, index) => ({ ...item, position: index + 1 }));
  };

  const persistFaqOrder = async (list: FAQ[]) => {
    setFaqOrderSaving(true);
    setFaqOrderError(null);
    try {
      const payload = {
        order: list.map((item, index) => ({
          id: item.id,
          position: item.position ?? index + 1,
        })),
      };
      const response = await fetch("/api/faqs/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar el orden.");
      }

      router.refresh();
      setActionState({ message: "Orden de preguntas actualizado.", error: null });
      notify("Orden de preguntas actualizado.", "success");
      setFaqOrderDirty(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el orden.";
      setFaqOrderError(message);
      notify(message, "error");
    } finally {
      setFaqOrderSaving(false);
    }
  };

  const handleFaqDragStart = (id: number) => {
    setDraggedFaqId(id);
  };

  const handleFaqDragOver = (
    event: DragEvent<HTMLLIElement>,
    targetId: number
  ) => {
    event.preventDefault();
    if (draggedFaqId === null || draggedFaqId === targetId) {
      return;
    }
    setFaqList((prev) => {
      const reordered = reorderFaqList(prev, draggedFaqId, targetId);
      if (reordered === prev) {
        return prev;
      }
      setFaqOrderDirty(true);
      return reordered;
    });
  };

  const handleFaqDrop = (
    event: DragEvent<HTMLLIElement>,
    targetId: number
  ) => {
    event.preventDefault();
    if (draggedFaqId === null) {
      return;
    }
    setFaqList((prev) => {
      const reordered = reorderFaqList(prev, draggedFaqId, targetId);
      if (reordered === prev) {
        return prev;
      }
      setFaqOrderDirty(true);
      return reordered;
    });
    setDraggedFaqId(null);
  };

  const handleFaqDragEnd = () => {
    setDraggedFaqId(null);
  };

  const handleFaqOrderSave = () => {
    if (!faqOrderDirty || faqOrderSaving) {
      return;
    }
    persistFaqOrder(faqList);
  };

  const toggleFaqCard = (id: number) => {
    setActiveFaqId((current) => (current === id ? null : id));
  };

  const requestDeleteContact = (contact: ContactRequest) => {
    setContactDeleteError(null);
    setContactToDelete(contact);
  };

  const cancelDeleteContact = () => {
    if (contactDeleting) {
      return;
    }
    setContactToDelete(null);
    setContactDeleteError(null);
  };

  const confirmDeleteContact = async () => {
    if (!contactToDelete) {
      return;
    }
    setContactDeleting(true);
    setContactDeleteError(null);
    try {
      const response = await fetch(`/api/contact/${contactToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo eliminar la propuesta.");
      }
      setContactRequestList((prev) =>
        prev.filter((contact) => contact.id !== contactToDelete.id)
      );
      setActionState({ message: "Propuesta eliminada.", error: null });
      notify("Propuesta eliminada.", "success");
      setContactToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setContactDeleteError(message);
      notify(message, "error");
    } finally {
      setContactDeleting(false);
    }
  };

  const handleLogout = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoggingOut(true);
    setActionState(initialActionState);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo cerrar la sesión.");
      }

      router.replace("/admin/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <div className="flex w-full flex-col gap-12 pb-28 md:pb-12">
      <header className="flex flex-col gap-4 rounded-[48px] border-4 border-[var(--color-ink)] bg-white p-8 shadow-[0_18px_0_rgba(27,27,31,0.1)] sm:p-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">
              Panel de administración
            </h1>
            <p className="text-md font-medium text-[var(--color-ink)]/70">
              Gestiona participantes, colaboradores y propuestas recibidas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ink)] px-4 py-2 text-md font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-sky)]/20"
            >
              Ir al home
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ink)] px-4 py-2 text-md font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blush)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Inscripciones"
            value={totalRegistrations}
            delta={newCounts.registrations}
            active={activeTab === "registrations"}
            onClick={() => handleTabSelect("registrations")}
          />
          <StatCard
            label="Colaboradores"
            value={totalCollaborators}
            delta={newCounts.collaborators}
            active={activeTab === "collaborators"}
            onClick={() => handleTabSelect("collaborators")}
          />
          <StatCard
            label="Propuestas"
            value={totalRequests}
            helper={
              mostRecentRequest
                ? `Última: ${new Date(
                  mostRecentRequest.created_at
                ).toLocaleDateString()}`
                : null
            }
            delta={newCounts.proposals}
            active={activeTab === "proposals"}
            onClick={() => handleTabSelect("proposals")}
          />
          <StatCard
            label="Preguntas"
            value={totalFaqs}
            delta={newCounts.faqs}
            active={activeTab === "faqs"}
            onClick={() => handleTabSelect("faqs")}
          />
        </div>
        {actionState.message && (
          <p className="rounded-xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/12 px-4 py-2 text-md font-semibold text-[var(--color-forest)]">
            {actionState.message}
          </p>
        )}
        {actionState.error && (
          <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-md font-semibold text-red-600">
            {actionState.error}
          </p>
        )}
      </header>
      <section className="rounded-[40px] border-2 border-dashed border-[var(--color-ink)]/25 bg-white/80 p-6 shadow-[0_12px_0_rgba(27,27,31,0.05)] sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Guía rápida</h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-ink)]/70">
          Acciones disponibles para admins:
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-[var(--color-ink)]/80 sm:grid-cols-2">
          <li className="rounded-3xl bg-[var(--color-sky)]/10 px-4 py-3">
            Reordena colaboradores y FAQs arrastrando desde el icono de agarre y pulsa
            el botón <b>Guardar cambios</b> para fijar el nuevo orden.
          </li>
          <li className="rounded-3xl bg-[var(--color-sun)]/20 px-4 py-3">
            Abre la ficha de cada colaborador para editar o eliminar información, o usa
            “Añadir colaborador” para crear uno nuevo.
          </li>
          <li className="rounded-3xl bg-[var(--color-blush)]/20 px-4 py-3">
            Gestiona las FAQs: crea preguntas nuevas, edita pregunta y respuesta dentro
            de cada tarjeta y decide si son visibles en la web.
          </li>
          <li className="rounded-3xl bg-[var(--color-ink)]/5 px-4 py-3">
            Actualiza nombres de inscripciones o elimina duplicados, y revisa propuestas
            de contacto aceptando o descartando las que ya atendiste.
          </li>
        </ul>
      </section>

      <section
        id="admin-registrations"
        className={`${activeTab === "registrations" ? "block" : "hidden"} admin-section organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8 reveal-on-scroll`}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            Participantes apuntados
          </h2>
          <p className="text-md font-medium text-[var(--color-ink)]/70">
            Edita los nombres o elimina inscripciones duplicadas.
          </p>
        </div>
        {registrations.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-md font-medium text-[var(--color-ink)]/60">
            Todavía no hay personas registradas.
          </p>
        ) : (
          <ul className="grid gap-4">
            {registrations.map((registration) => {
              const draftValue = drafts[registration.id] ?? registration.name;
              const hasChanges = draftValue.trim() !== registration.name;
              const isBusy = loadingId === registration.id;

              return (
                <li
                  key={registration.id}
                  className="grid gap-3 rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={draftValue}
                      onChange={(event) =>
                        handleChange(registration.id, event.target.value)
                      }
                      className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-md font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate(registration.id)}
                    disabled={!hasChanges || isBusy}
                    aria-label="Guardar cambios"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/20 text-lg transition hover:bg-[var(--color-sky)]/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span aria-hidden="true"><Save/></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(registration.id)}
                    disabled={isBusy}
                    aria-label="Eliminar registro"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-300 text-lg text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span aria-hidden="true"><Trash2/></span>
                  </button>
                  <p className="col-span-full text-xs font-medium text-[var(--color-ink)]/60">
                    Apuntado el{" "}
                    {new Date(registration.created_at).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        id="admin-collaborators"
        className={`${activeTab === "collaborators" ? "block" : "hidden"} admin-section organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8 reveal-on-scroll`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              Colaboradores publicados
            </h2>
            <p className="text-md font-medium text-[var(--color-ink)]/70">
              Toca una card para editarla o usa el botón para añadir un nuevo colaborador.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={handleCollaboratorOrderSave}
              disabled={!collaboratorOrderDirty || orderSaving}
              className="w-full rounded-full bg-[var(--color-sky)] px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-[var(--color-sky)]/80 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {orderSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => openCollaboratorModal()}
              className="button-secondary w-full rounded-full px-6 py-3 text-base sm:w-auto"
            >
              Añadir colaborador
            </button>
          </div>
        </div>
        {collaboratorOrderDirty && !orderSaving && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/70">
            Tienes cambios de orden sin guardar.
          </p>
        )}
        {orderSaving && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
            Guardando nuevo orden...
          </p>
        )}
        {orderError && (
          <p className="text-xs font-semibold text-red-600">{orderError}</p>
        )}
        {collaboratorList.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-md font-medium text-[var(--color-ink)]/60">
            Todavía no hay colaboradores publicados.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collaboratorList.map((collaborator) => (
              <li
                key={collaborator.id}
                onDragOver={(event) => handleDragOver(event, collaborator.id)}
                onDrop={(event) => handleDrop(event, collaborator.id)}
              >
                <button
                  type="button"
                  onClick={() => handleCollaboratorClick(collaborator)}
                  className="relative flex w-full flex-col items-center gap-3 rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white p-4 text-center shadow-[0_10px_0_rgba(27,27,31,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_0_rgba(27,27,31,0.08)]"
                >
                  <span
                    className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-full border border-[var(--color-ink)]/15 bg-white/90 text-[var(--color-ink)]/50 shadow-sm transition hover:text-[var(--color-ink)] active:cursor-grabbing"
                    draggable
                    aria-label="Reordenar colaborador"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      handleDragStart(collaborator.id);
                    }}
                    onDragEnd={(event) => {
                      event.stopPropagation();
                      handleDragEnd();
                    }}
                  >
                    <GripVertical size={16} />
                  </span>
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-sun)] bg-[var(--color-sun)]/30">
                    {collaborator.imageSrc ? (
                      <img
                        src={collaborator.imageSrc}
                        alt={collaborator.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-ink)]/60">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <p className="text-md font-semibold text-[var(--color-ink)]">
                    {collaborator.name}
                  </p>
                  {collaborator.webLink && (
                    <p className="text-xs font-medium text-[var(--color-sky)] underline">
                      {collaborator.webLink}
                    </p>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
                    Alta el{" "}
                    {new Date(collaborator.created_at).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <CollaboratorModal
        open={collaboratorModal.open}
        collaborator={collaboratorModal.collaborator}
        onClose={closeCollaboratorModal}
        onSaved={handleCollaboratorSaved}
        onDeleted={handleCollaboratorDeleted}
        notify={notify}
      />

      <section
        id="admin-faqs"
        className={`${activeTab === "faqs" ? "block" : "hidden"} admin-section organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8 reveal-on-scroll`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              Preguntas frecuentes
            </h2>
            <p className="text-md font-medium text-[var(--color-ink)]/70">
              Edita, responde y decide cuáles son visibles en la landing.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => setShowNewFaqForm((prev) => !prev)}
              className="w-full rounded-full border-2 border-[var(--color-ink)]/15 px-6 py-3 text-base font-semibold text-[var(--color-ink)] shadow transition hover:border-[var(--color-sky)]/50 sm:w-auto"
            >
              {showNewFaqForm ? "Cerrar nueva pregunta" : "Nueva pregunta"}
            </button>
            <button
              type="button"
              onClick={handleFaqOrderSave}
              disabled={!faqOrderDirty || faqOrderSaving}
              className="w-full rounded-full bg-[var(--color-sun)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] shadow transition hover:bg-[var(--color-sun)]/80 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {faqOrderSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
        {showNewFaqForm && (
          <div className="rounded-[24px] border-2 border-dashed border-[var(--color-ink)]/20 bg-white p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)]">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                  Pregunta
                </label>
                <textarea
                  value={newFaq.question}
                  onChange={(event) =>
                    handleNewFaqFieldChange("question", event.target.value)
                  }
                  rows={2}
                  className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-md font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
                  placeholder="¿Cuál es tu pregunta?"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                  Respuesta (opcional)
                </label>
                <textarea
                  value={newFaq.answer}
                  onChange={(event) =>
                    handleNewFaqFieldChange("answer", event.target.value)
                  }
                  rows={3}
                  className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-md font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sun)] focus:ring-2 focus:ring-[var(--color-sun)]/30"
                  placeholder="Añade la respuesta si ya la tienes."
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={newFaq.isVisible}
                  onChange={(event) =>
                    handleNewFaqFieldChange("isVisible", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-[var(--color-ink)]/40"
                />
                Visible en la web
              </label>
              {createFaqError && (
                <p className="text-sm font-semibold text-red-600">{createFaqError}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCreateFaq}
                  disabled={creatingFaq}
                  className="rounded-full bg-[var(--color-ink)] px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-[var(--color-ink)]/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingFaq ? "Creando..." : "Publicar pregunta"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewFaq(getInitialNewFaq());
                    setCreateFaqError(null);
                    setShowNewFaqForm(false);
                  }}
                  className="rounded-full border-2 border-[var(--color-ink)]/15 px-6 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-ink)]/40"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {faqOrderDirty && !faqOrderSaving && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/70">
            Tienes cambios de orden sin guardar.
          </p>
        )}
        {faqOrderSaving && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
            Guardando nuevo orden...
          </p>
        )}
        {faqOrderError && (
          <p className="text-xs font-semibold text-red-600">{faqOrderError}</p>
        )}
        {faqList.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-md font-medium text-[var(--color-ink)]/60">
            Todavía no hay preguntas registradas.
          </p>
        ) : (
          <ul className="grid gap-4">
            {faqList.map((faq) => {
              const draft =
                faqDrafts[faq.id] ?? {
                  question: faq.question,
                  answer: faq.answer ?? "",
                  isVisible: faq.isVisible,
                };
              const hasChanges =
                draft.question.trim() !== faq.question ||
                draft.answer.trim() !== (faq.answer ?? "") ||
                draft.isVisible !== faq.isVisible;
              const busy = faqSavingId === faq.id;
              const deleting = faqDeletingId === faq.id;
              const isActive = activeFaqId === faq.id;
              const answerPreview = draft.answer.trim()
                ? `${draft.answer.trim().slice(0, 120)}${
                    draft.answer.trim().length > 120 ? "…" : ""
                  }`
                : "Sin respuesta todavía.";
              const visibilityLabel = draft.isVisible
                ? "Visible en la web"
                : "Oculta en la web";
              const visibilityBadgeClass = draft.isVisible
                ? "bg-[var(--color-sky)]/20 text-[var(--color-sky)]"
                : "bg-[var(--color-ink)]/10 text-[var(--color-ink)]/70";

              return (
                <li
                  key={faq.id}
                  onDragOver={(event) => handleFaqDragOver(event, faq.id)}
                  onDrop={(event) => handleFaqDrop(event, faq.id)}
                  className="relative rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)]"
                >
                  <span
                    className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-full border border-[var(--color-ink)]/15 bg-white/90 text-[var(--color-ink)]/50 shadow-sm transition hover:text-[var(--color-ink)] active:cursor-grabbing"
                    draggable
                    aria-label="Reordenar pregunta"
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      handleFaqDragStart(faq.id);
                    }}
                    onDragEnd={(event) => {
                      event.stopPropagation();
                      handleFaqDragEnd();
                    }}
                  >
                    <GripVertical size={16} />
                  </span>
                  <div className="pr-10">
                    <button
                      type="button"
                      onClick={() => toggleFaqCard(faq.id)}
                      aria-expanded={isActive}
                      className={`w-full rounded-2xl border border-transparent bg-[var(--color-ink)]/5 px-4 py-3 text-left transition hover:border-[var(--color-sky)]/40 ${
                        isActive ? "border-[var(--color-sky)]/60 shadow-inner" : ""
                      }`}
                    >
                      <p className="text-base font-semibold text-[var(--color-ink)]">
                        {draft.question.trim() || "Sin pregunta"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-ink)]/70">
                        {answerPreview}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${visibilityBadgeClass}`}
                        >
                          {visibilityLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/70">
                          {isActive ? "Cerrar" : "Editar"}
                          <ChevronDown
                            size={14}
                            className={`transition ${isActive ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </button>
                  </div>
                  {isActive && (
                    <div className="mt-4 grid gap-4">
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                          Pregunta
                        </label>
                        <textarea
                          value={draft.question}
                          onChange={(event) =>
                            handleFaqDraftChange(faq.id, "question", event.target.value)
                          }
                          rows={2}
                          className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-md font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                          Respuesta
                        </label>
                        <textarea
                          value={draft.answer}
                          onChange={(event) =>
                            handleFaqDraftChange(faq.id, "answer", event.target.value)
                          }
                          rows={4}
                          className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-md font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sun)] focus:ring-2 focus:ring-[var(--color-sun)]/30"
                        />
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                          <input
                            type="checkbox"
                            checked={draft.isVisible}
                            onChange={(event) =>
                              handleFaqDraftChange(faq.id, "isVisible", event.target.checked)
                            }
                            className="h-4 w-4 rounded border-[var(--color-ink)]/40"
                          />
                          Visible en la web
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleFaqSave(faq.id)}
                            disabled={!hasChanges || busy}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)]/20 px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-sky)]/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Save size={16} /> Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFaqDelete(faq.id)}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 rounded-full border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={16} /> Eliminar
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-[var(--color-ink)]/60">
                        Recibida el{" "}
                        {new Date(faq.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                        {faq.askerName ? ` · ${faq.askerName}` : ""}
                        {faq.askerEmail ? ` · ${faq.askerEmail}` : ""}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        id="admin-proposals"
        className={`${activeTab === "proposals" ? "block" : "hidden"} admin-section organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8 reveal-on-scroll`}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            Propuestas recibidas
          </h2>
          <p className="text-md font-medium text-[var(--color-ink)]/70">
            Contacta con los colaboradores potenciales y coordina su aportación.
          </p>
        </div>
        {contactRequestList.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-md font-medium text-[var(--color-ink)]/60">
            No hay propuestas registradas todavía.
          </p>
        ) : (
          <ul className="grid gap-4">
            {contactRequestList.map((contact) => (
              <li
                key={contact.id}
                className="grid gap-3 rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)]"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-md font-semibold text-[var(--color-ink)]">
                    {contact.name}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                    Recibido el{" "}
                    {new Date(contact.created_at).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--color-ink)]/60">
                  <span className="rounded-full bg-[var(--color-sky)]/40 px-3 py-1">
                    {contact.mail}
                  </span>
                  {contact.phone && (
                    <span className="rounded-full bg-[var(--color-blush)]/60 px-3 py-1">
                      {contact.phone}
                    </span>
                  )}
                </div>
                <p className="rounded-[24px] border border-[var(--color-ink)]/10 bg-white/80 p-3 text-md font-medium leading-relaxed text-[var(--color-ink)]">
                  {contact.request}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => requestDeleteContact(contact)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-300 text-base text-red-600 transition hover:bg-red-100"
                    aria-label="Eliminar propuesta"
                  >
                    <Trash2></Trash2>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ContactDeleteModal
        open={Boolean(contactToDelete)}
        contact={contactToDelete}
        onCancel={cancelDeleteContact}
        onConfirm={confirmDeleteContact}
        submitting={contactDeleting}
        error={contactDeleteError}
      />
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  helper?: string | null;
  delta?: number;
  active?: boolean;
  onClick?: () => void;
};

function StatCard({ label, value, helper, delta, active = false, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col gap-1 rounded-[28px] border-2 p-4 text-left shadow-[0_10px_0_rgba(27,27,31,0.05)] transition focus:outline-none focus:ring-4 focus:ring-[var(--color-sky)]/30 ${
        active
          ? "border-[var(--color-ink)] bg-[var(--color-sky)]/10"
          : "border-[var(--color-ink)]/10 bg-white/80 hover:-translate-y-1"
      }`}
      aria-pressed={active}
    >
      {delta && delta > 0 ? (
        <span className="absolute right-4 top-4 rounded-full bg-[var(--color-tangerine)] px-3 py-1 text-xs font-bold text-[var(--color-ink)]">
          +{delta}
        </span>
      ) : null}
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
        {label}
      </span>
      <span className="text-2xl font-extrabold text-[var(--color-ink)]">
        {value}
      </span>
      {helper ? (
        <span className="text-xs font-medium text-[var(--color-ink)]/60">{helper}</span>
      ) : null}
    </button>
  );
}

type CollaboratorModalProps = {
  open: boolean;
  collaborator: Collaborator | null;
  onClose: () => void;
  onSaved: (collaborator: Collaborator) => void;
  onDeleted: (id: number) => void;
  notify: (message: string, variant?: ToastVariant) => void;
};

function normalizeCollaborator(data: any): Collaborator {
  return {
    id: data.id,
    name: data.name,
    created_at: data.created_at,
    imageSrc:
      typeof data.image === "string"
        ? data.image
        : typeof data.imageSrc === "string"
          ? data.imageSrc
          : null,
    webLink: data.webLink ?? data.web_link ?? null,
    position:
      typeof data.position === "number"
        ? data.position
        : Number.isFinite(Number(data.position))
          ? Number(data.position)
          : 0,
  };
}

function CollaboratorModal({
  open,
  collaborator,
  onClose,
  onSaved,
  onDeleted,
  notify,
}: CollaboratorModalProps) {
  const isEditing = Boolean(collaborator);
  const [name, setName] = useState(collaborator?.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(collaborator?.imageSrc ?? null);
  const [webLink, setWebLink] = useState(collaborator?.webLink ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName(collaborator?.name ?? "");
    setFile(null);
    setPreview(collaborator?.imageSrc ?? null);
    setWebLink(collaborator?.webLink ?? "");
    setError(null);
  }, [open, collaborator]);

  useEffect(() => {
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!isEditing && !file) {
      setError("Selecciona una imagen para el nuevo colaborador.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let imageBase64: string | undefined;
      if (file) {
        const buffer = await file.arrayBuffer();
        imageBase64 = arrayBufferToBase64(buffer);
      }

      const payload: Record<string, string> = { name: trimmed };
      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }
      const cleanedLink = webLink.trim();
      if (cleanedLink) {
        payload.webLink = cleanedLink;
      } else if (isEditing && collaborator?.webLink) {
        payload.webLink = "";
      }

      const endpoint = isEditing
        ? `/api/collaborators/${collaborator!.id}`
        : "/api/collaborators";

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar el colaborador.");
      }

      const saved = normalizeCollaborator(await response.json());
      onSaved(saved);
      notify(isEditing ? "Colaborador actualizado." : "Colaborador añadido.", "success");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setError(message);
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!collaborator) {
      return;
    }
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a "${collaborator.name}"?`
    );
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/collaborators/${collaborator.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo eliminar el colaborador.");
      }

      onDeleted(collaborator.id);
      notify("Colaborador eliminado.", "success");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setError(message);
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-[40px] border-4 border-[var(--color-ink)] bg-white p-6 shadow-[0_20px_0_rgba(27,27,31,0.18)] sm:p-8"
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 text-lg font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-tangerine)]"
        >
          ✕
        </button>
        <h3 className="mb-2 text-2xl font-bold text-[var(--color-ink)]">
          {isEditing ? "Editar colaborador" : "Nuevo colaborador"}
        </h3>
        <p className="text-md font-medium text-[var(--color-ink)]/70">
          Completa los datos y guarda los cambios para que se reflejen en la web.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-md font-semibold text-[var(--color-ink)]">
            Nombre del colaborador
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-tangerine)] focus:ring-2 focus:ring-[var(--color-tangerine)]/40"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-md font-semibold text-[var(--color-ink)]">
            Enlace web (opcional)
            <input
              type="url"
              value={webLink}
              placeholder="https://..."
              onChange={(event) => setWebLink(event.target.value)}
              className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-tangerine)] focus:ring-2 focus:ring-[var(--color-tangerine)]/40"
            />
          </label>

          <label className="flex flex-col gap-2 text-md font-semibold text-[var(--color-ink)]">
            {isEditing ? "Actualizar imagen (opcional)" : "Imagen del colaborador"}
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rounded-[26px] border-2 border-dashed border-[var(--color-ink)]/15 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-tangerine)] focus:ring-2 focus:ring-[var(--color-tangerine)]/40"
            />
          </label>

          {preview && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--color-sky)]/30 bg-[var(--color-sky)]/10 p-3 text-md text-[var(--color-ink)]">
              <img
                src={preview}
                alt="Previsualización"
                className="h-14 w-14 rounded-full object-cover"
              />
              <span>Previsualización</span>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-md font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="button-secondary flex-1 justify-center px-6 py-3"
              >
                {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Publicar"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/20 px-6 py-3 text-md font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-ink)]/5"
              >
                Cancelar
              </button>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full border-2 border-red-200 px-4 py-3 text-md font-semibold text-red-600 transition hover:bg-red-50"
              >
                {submitting ? "Eliminando..." : "Eliminar"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

type ContactDeleteModalProps = {
  open: boolean;
  contact: ContactRequest | null;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
};

function ContactDeleteModal({
  open,
  contact,
  onCancel,
  onConfirm,
  submitting,
  error,
}: ContactDeleteModalProps) {
  if (!open || !contact) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[32px] border-4 border-[var(--color-ink)] bg-white p-6 shadow-[0_18px_0_rgba(27,27,31,0.18)] sm:p-8">
        <h3 className="text-xl font-bold text-[var(--color-ink)]">
          ¿Eliminar esta propuesta?
        </h3>
        <p className="mt-2 text-md font-medium text-[var(--color-ink)]/70">
          Esta acción no se puede deshacer. Se eliminará la propuesta enviada por{" "}
          <strong>{contact.name}</strong>.
        </p>

        <div className="mt-6 space-y-3 text-md text-[var(--color-ink)]/70">
          <div>
            <span className="font-semibold text-[var(--color-ink)]">Email:</span>{" "}
            {contact.mail}
          </div>
          {contact.phone && (
            <div>
              <span className="font-semibold text-[var(--color-ink)]">Teléfono:</span>{" "}
              {contact.phone}
            </div>
          )}
          <div className="rounded-2xl border border-[var(--color-ink)]/10 bg-[var(--color-ink)]/5 p-3 text-md leading-relaxed text-[var(--color-ink)]">
            {contact.request}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-md font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ink)]/20 px-5 py-2 text-md font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-ink)]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full border-2 border-red-300 px-5 py-2 text-md font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
