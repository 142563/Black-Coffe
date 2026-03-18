"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { apiClient } from "@/lib/api-client";
import { getErrorStatus, getErrorMessage } from "@/lib/error";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { useHydrated } from "@/hooks/use-hydrated";

const demoEmail = "julio.cesar.ticas.demo@blackcoffe.local";
const demoPassword = "DemoCafe123*";

export function LoginPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const auth = useAuthStore((state) => state.auth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const pushToast = useUiStore((state) => state.pushToast);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(demoEmail);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(demoPassword);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage("");

    try {
      const response =
        mode === "login"
          ? await apiClient.login({ email, password })
          : await apiClient.register({ fullName, email, phone, password });

      setAuth(response);
      pushToast({
        tone: "success",
        title: mode === "login" ? "Sesion iniciada" : "Cuenta creada",
        description: mode === "login" ? "Tu perfil ya esta listo." : "Tu cuenta se creo e inicio sesion correctamente.",
      });
      router.push("/profile");
    } catch (error) {
      const status = getErrorStatus(error);
      const nextMessage =
        status === 401
          ? "Credenciales invalidas. Verifica correo y password."
          : status === 503
            ? getErrorMessage(error, "La base de datos no esta disponible en este momento.")
            : getErrorMessage(error, "Error de autenticacion.");
      setMessage(nextMessage);
      pushToast({ tone: "error", title: "No se pudo autenticar", description: nextMessage });
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="page-container">
        <section className="section-panel animate-pulse p-8">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="mt-5 h-8 w-72 rounded-full bg-white/10" />
          <div className="mt-8 h-72 rounded-[1.5rem] bg-white/8" />
        </section>
      </div>
    );
  }

  if (auth) {
    return (
      <div className="page-container">
        <section className="section-panel space-y-6 p-8 text-center">
          <p className="section-eyebrow">Mi cuenta</p>
          <h1 className="page-title mt-0">Ya tienes una sesion activa</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
            Continua a tu perfil para ver pedidos, reservas y datos de tu cuenta.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/profile" className="button-primary">Ir a perfil</Link>
            <Link href="/catalog" className="button-secondary">Ver menu</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="section-panel p-8">
        <p className="section-eyebrow">Black Coffe</p>
        <h1 className="page-title mt-4">{mode === "login" ? "Bienvenido" : "Nueva cuenta"}</h1>
        <p className="muted-copy mt-3">Mas que una bebida... es un estilo de vida.</p>
        <p className="mt-6 text-sm leading-7 text-white/60">
          {mode === "login"
            ? "Ingresa con tu cuenta para ver perfil, pedidos y reservas."
            : "Crea tu cuenta para comenzar a pedir desde el menu interactivo y guardar tu historial."}
        </p>
        {mode === "login" ? (
          <button
            type="button"
            className="button-secondary mt-8"
            onClick={() => {
              setMode("login");
              setEmail(demoEmail);
              setPassword(demoPassword);
              setMessage("");
            }}
          >
            Usar demo
          </button>
        ) : null}
      </section>

      <section className="section-panel p-8">
        <PageHeader
          eyebrow={mode === "login" ? "Login" : "Create Account"}
          title={mode === "login" ? "Entrar" : "Crear cuenta"}
          description="Sin romper la API actual: este flujo sigue usando los mismos endpoints y el mismo JWT del backend .NET."
        />

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {mode === "register" ? (
            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" required />
          ) : null}
          <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          {mode === "register" ? (
            <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefono" required />
          ) : null}
          <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />

          {message ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{message}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" className="button-primary w-full" disabled={loading}>
              {loading ? "Procesando" : mode === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
            <button
              type="button"
              className="button-secondary w-full"
              onClick={() => {
                setMode((current) => (current === "login" ? "register" : "login"));
                setMessage("");
              }}
            >
              {mode === "login" ? "Ir a create account" : "Volver a login"}
            </button>
          </div>
        </form>

        <p className="mt-6 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/48">
          Demo: {demoEmail} / {demoPassword}
        </p>
      </section>
    </div>
  );
}
