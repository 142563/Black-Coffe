import { ApiError } from "@/lib/api-client";

export function getErrorStatus(error: unknown) {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (typeof error === "object" && error && "status" in error) {
    return Number((error as { status?: number }).status);
  }

  return undefined;
}

export function getErrorMessage(error: unknown, fallback = "Ocurrio un error inesperado.") {
  if (error instanceof ApiError) {
    return error.detail || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
