import {
  AuthResponse,
  CreateOrderResponse,
  CreateReservationRequest,
  FeaturedMenuItem,
  Invoice,
  LoginRequest,
  MenuBoardResponse,
  MenuCategory,
  Order,
  OrderPreviewRequest,
  OrderPreviewResponse,
  PlaceOrderRequest,
  RegisterRequest,
  StorefrontBanner,
  StorefrontSettings,
  TableDto,
} from "@/lib/types";

type JsonRecord = Record<string, unknown>;

export class ApiError extends Error {
  status?: number;
  detail?: string;

  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function normalizeBaseUrl() {
  const configured = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5088"
  ).replace(/\/$/, "");

  if (configured.endsWith("/api/v1")) {
    return {
      root: configured.slice(0, -"/api/v1".length),
      v1: configured,
    };
  }

  if (configured.endsWith("/api")) {
    return {
      root: configured.slice(0, -"/api".length),
      v1: `${configured}/v1`,
    };
  }

  return {
    root: configured,
    v1: `${configured}/api/v1`,
  };
}

const API_BASES = normalizeBaseUrl();

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/api/")) {
    return `${API_BASES.root}${path}`;
  }

  return `${API_BASES.v1}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(init.headers || {});

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      "No hay conexion con backend. Levanta primero la API en http://localhost:5088.",
      0,
      error instanceof Error ? error.message : undefined
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload
        ? (payload as JsonRecord).detail?.toString() ||
          (payload as JsonRecord).message?.toString()
        : undefined;

    throw new ApiError(
      detail || response.statusText || "Error de API",
      response.status,
      detail
    );
  }

  return payload as T;
}

function getObject(record: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object") {
      return value as JsonRecord;
    }
  }

  return null;
}

function getString(record: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function getStringArray(record: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === "string");
    }
  }

  return [] as string[];
}

export function normalizeAuth(payload: unknown): AuthResponse | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as JsonRecord;
  const userPayload = getObject(root, "user", "User");
  if (!userPayload) {
    return null;
  }

  const accessToken = getString(root, "accessToken", "AccessToken");
  const refreshToken = getString(root, "refreshToken", "RefreshToken");
  const expiresAtUtc = getString(root, "expiresAtUtc", "ExpiresAtUtc");
  const id = getString(userPayload, "id", "Id");
  const fullName = getString(userPayload, "fullName", "FullName");
  const email = getString(userPayload, "email", "Email");
  const phone = getString(userPayload, "phone", "Phone");
  const status = getString(userPayload, "status", "Status");
  const roles = getStringArray(userPayload, "roles", "Roles");

  if (!accessToken || !refreshToken || !expiresAtUtc || !id || !fullName || !email || !phone || !status) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAtUtc,
    user: {
      id,
      fullName,
      email,
      phone,
      status,
      roles,
    },
  };
}

export const apiClient = {
  login(payload: LoginRequest) {
    return request<AuthResponse | unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((response) => {
      const auth = normalizeAuth(response);
      if (!auth) {
        throw new ApiError("Respuesta de autenticacion invalida.");
      }
      return auth;
    });
  },
  register(payload: RegisterRequest) {
    return request<AuthResponse | unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((response) => {
      const auth = normalizeAuth(response);
      if (!auth) {
        throw new ApiError("Respuesta de autenticacion invalida.");
      }
      return auth;
    });
  },
  getSettings() {
    return request<StorefrontSettings>("/api/storefront/settings");
  },
  getBanners() {
    return request<StorefrontBanner[]>("/api/storefront/banners");
  },
  getMenuCategories() {
    return request<MenuCategory[]>("/api/menu/categories");
  },
  getFeatured() {
    return request<FeaturedMenuItem[]>("/api/menu/featured");
  },
  getMenuBoard() {
    return request<MenuBoardResponse>("/catalog/menu-board");
  },
  previewOrder(payload: OrderPreviewRequest) {
    return request<OrderPreviewResponse>("/api/orders/preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createOrder(payload: PlaceOrderRequest, token: string) {
    return request<CreateOrderResponse>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
  },
  getInvoice(orderId: string, token: string) {
    return request<Invoice>(`/api/orders/${orderId}/invoice`, {}, token);
  },
  getMyOrders(token: string) {
    return request<Order[]>("/orders/my", {}, token);
  },
  getTables(token: string) {
    return request<TableDto[]>("/admin/tables", {}, token);
  },
  createReservation(payload: CreateReservationRequest, token: string) {
    return request<void>("/reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    }, token);
  },
};
