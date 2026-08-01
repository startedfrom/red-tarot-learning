const DEFAULT_RETURN_PATH = "/me";
const RETURN_PATH_ORIGIN = "https://return-path.invalid";
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;
const RESERVED_AUTH_PATHS = new Set(["/auth/callback", "/auth/signout"]);

export const AUTH_ERROR_MESSAGES = {
  config: "로그인 연결이 아직 준비되지 않았어요.",
  missing_code: "로그인 응답을 확인할 수 없어요. 다시 시도해 주세요.",
  callback: "로그인을 완료하지 못했어요. 다시 시도해 주세요.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

export function safeReturnPath(value?: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN_PATH;
  }

  const decodedValue = decodeRepeatedly(value);
  if (
    decodedValue === null ||
    CONTROL_CHARACTER.test(decodedValue) ||
    decodedValue.includes("\\") ||
    !decodedValue.startsWith("/") ||
    decodedValue.startsWith("//")
  ) {
    return DEFAULT_RETURN_PATH;
  }

  let url: URL;
  try {
    url = new URL(value, RETURN_PATH_ORIGIN);
  } catch {
    return DEFAULT_RETURN_PATH;
  }

  if (
    url.origin !== RETURN_PATH_ORIGIN ||
    url.pathname.startsWith("//") ||
    isReservedAuthPath(url.pathname)
  ) {
    return DEFAULT_RETURN_PATH;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildAuthCallbackUrl(
  origin: string,
  next?: string | null,
): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.search = `?next=${encodeURIComponent(safeReturnPath(next))}`;
  return callbackUrl.toString();
}

export function authErrorMessage(code: string): string;
export function authErrorMessage(code?: null): null;
export function authErrorMessage(code?: string | null): string | null;
export function authErrorMessage(code?: string | null): string | null {
  if (!code) return null;
  if (Object.hasOwn(AUTH_ERROR_MESSAGES, code)) {
    return AUTH_ERROR_MESSAGES[code as AuthErrorCode];
  }
  return AUTH_ERROR_MESSAGES.callback;
}

function decodeRepeatedly(value: string): string | null {
  let decoded = value;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return null;
    }
    if (next === decoded) return next;
    decoded = next;
  }

  return null;
}

function isReservedAuthPath(pathname: string): boolean {
  const decodedPathname = decodeRepeatedly(pathname);
  if (decodedPathname === null) return true;

  const normalizedPathname =
    decodedPathname.length > 1
      ? decodedPathname.replace(/\/+$/, "")
      : decodedPathname;
  for (const reservedPath of RESERVED_AUTH_PATHS) {
    if (
      normalizedPathname === reservedPath ||
      normalizedPathname.startsWith(`${reservedPath}/`)
    ) {
      return true;
    }
  }

  return false;
}
