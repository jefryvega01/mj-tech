"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSessionCookie, destroySessionCookie } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validators";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(
      `/cuenta/registro?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });
  if (existing) {
    redirect(
      `/cuenta/registro?error=${encodeURIComponent(
        "Ya existe una cuenta con ese correo"
      )}`
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "cliente",
    })
    .returning();

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect("/cuenta");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const redirectBase = formData.get("redirectBase")?.toString() || "/cuenta";
  const loginPath =
    redirectBase === "/admin" ? "/admin/login" : "/cuenta/login";

  if (!parsed.success) {
    redirect(
      `${loginPath}?error=${encodeURIComponent("Revisa tu correo y contraseña")}`
    );
  }

  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({
    where: (u, { eq: eqOp }) => eqOp(u.email, email),
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect(
      `${loginPath}?error=${encodeURIComponent("Correo o contraseña incorrectos")}`
    );
  }

  if (redirectBase === "/admin" && user.role !== "admin") {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Esta cuenta no tiene permisos de administrador"
      )}`
    );
  }

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect(user.role === "admin" ? "/admin" : "/cuenta");
}

export async function logoutAction() {
  await destroySessionCookie();
  redirect("/");
}
