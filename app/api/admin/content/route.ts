import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { validateAdminRequest } from "@/lib/auth";
import { contentSchemas, contentStatusSchema, deleteSchema, toSlug } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import type { SupportedCollection } from "@/types/content";

const allCollections = new Set(Object.keys(contentSchemas));

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for") ?? "unknown";
}

export async function GET(request: Request) {
  try {
    if (!checkRateLimit(`admin:${getClientIp(request)}`)) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const validated = await validateAdminRequest(request);
    if ("error" in validated) return validated.error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as SupportedCollection;
    if (!type || !allCollections.has(type)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }

    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category")?.toLowerCase();
    const queryFilter = searchParams.get("q")?.toLowerCase();

    const snapshot = await getAdminDb().collection(type).orderBy("updatedAt", "desc").limit(60).get();
    const items = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: String(data.title ?? data.titulo ?? "Sem título"),
          category: String(data.category ?? data.categoria ?? "Geral"),
          slug: typeof data.slug === "string" ? data.slug : undefined,
          status: String(data.status ?? "draft"),
          coverImage: typeof data.coverImage === "string" ? data.coverImage : undefined,
        };
      })
      .filter((item) => (statusFilter ? item.status === statusFilter : true))
      .filter((item) => (categoryFilter ? item.category.toLowerCase().includes(categoryFilter) : true))
      .filter((item) =>
        queryFilter
          ? `${item.title} ${item.category} ${item.slug ?? ""}`.toLowerCase().includes(queryFilter)
          : true,
      );

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`admin:${getClientIp(request)}`)) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const validated = await validateAdminRequest(request);
    if ("error" in validated) return validated.error;

    const body = await request.json();
    const type = body?.type as SupportedCollection;

    if (!type || !allCollections.has(type)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }

    const schema = contentSchemas[type];
    const result = schema.safeParse(body.data);

    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: "Dados inválidos.", details: errors }, { status: 400 });
    }

    const statusResult = contentStatusSchema.safeParse(body.data.status ?? "draft");
    const status = statusResult.success ? statusResult.data : "draft";

    const data: Record<string, unknown> = { ...result.data };
    data.slug = toSlug(String(data.title));
    data.status = status;

    await getAdminDb()
      .collection(type)
      .add({
        ...data,
        publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: validated.userEmail,
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!checkRateLimit(`admin:${getClientIp(request)}`)) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const validated = await validateAdminRequest(request);
    if ("error" in validated) return validated.error;

    const body = await request.json();
    const type = body?.type as SupportedCollection;
    const docId = body?.id as string;

    if (!type || !allCollections.has(type) || !docId) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const schema = contentSchemas[type];
    const result = schema.safeParse(body.data);

    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: "Dados inválidos.", details: errors }, { status: 400 });
    }

    const statusResult = contentStatusSchema.safeParse(body.data.status ?? "draft");
    const status = statusResult.success ? statusResult.data : "draft";

    const data: Record<string, unknown> = { ...result.data };
    data.slug = toSlug(String(data.title));
    data.status = status;

    await getAdminDb()
      .collection(type)
      .doc(docId)
      .set(
        {
          ...data,
          publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!checkRateLimit(`admin:${getClientIp(request)}`)) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const validated = await validateAdminRequest(request);
    if ("error" in validated) return validated.error;

    const body = await request.json();
    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Payload inválido para exclusão." }, { status: 400 });
    }

    await getAdminDb().collection(result.data.type).doc(result.data.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
