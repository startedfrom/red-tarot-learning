const DEFAULT_RETURN_PATH = "/me";
const RETURN_PATH_ORIGIN = "https://return-path.invalid";
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;
const EXTERNAL_LIKE_PATH = /^\/[a-z][a-z\d+.-]*:/i;
const ENCODED_CONTROL_CHARACTER =
  /%(?:25)*(?:0[\da-f]|1[\da-f]|7f)/i;
const ENCODED_PATH_SEPARATOR = /%(?:25)*(?:2f|5c)/i;
const ENCODED_DOT_SEGMENT = /^(?:(?:%(?:25)*2e)|\.){1,2}$/i;
const MAX_PATH_DECODE_PASSES = 3;
const RESERVED_AUTH_PATHS = new Set(["/auth/callback", "/auth/signout"]);

export const AUTH_ERROR_MESSAGES = {
  config: "로그인 연결이 아직 준비되지 않았어요.",
  missing_code: "로그인 응답을 확인할 수 없어요. 다시 시도해 주세요.",
  callback: "로그인을 완료하지 못했어요. 다시 시도해 주세요.",
  csrf: "안전한 로그아웃 요청인지 확인할 수 없어요. 다시 시도해 주세요.",
  signout: "로그아웃을 완료하지 못했어요. 다시 시도해 주세요.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

export function safeReturnPath(value?: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN_PATH;
  }

  if (CONTROL_CHARACTER.test(value) || ENCODED_CONTROL_CHARACTER.test(value)) {
    return DEFAULT_RETURN_PATH;
  }

  // Return targets use strict canonical paths: no schemes, dot segments,
  // encoded separators, or auth routes.
  const rawPathname = value.split(/[?#]/, 1)[0];
  if (!hasSafeDecodedPathnames(rawPathname)) {
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

function hasSafeDecodedPathnames(rawPathname: string): boolean {
  let pathname = rawPathname;

  for (let pass = 0; pass <= MAX_PATH_DECODE_PASSES; pass += 1) {
    if (hasUnsafePathname(pathname)) return false;

    let decodedPathname: string;
    try {
      decodedPathname = decodeURIComponent(pathname);
    } catch {
      return true;
    }
    if (decodedPathname === pathname) return true;
    if (pass === MAX_PATH_DECODE_PASSES) return false;
    pathname = decodedPathname;
  }

  return true;
}

function hasUnsafePathname(pathname: string): boolean {
  if (
    CONTROL_CHARACTER.test(pathname) ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    EXTERNAL_LIKE_PATH.test(pathname) ||
    ENCODED_PATH_SEPARATOR.test(pathname) ||
    isReservedAuthPath(pathname)
  ) {
    return true;
  }

  return pathname.split("/").some((segment) => {
    return (
      segment === "." ||
      segment === ".." ||
      ENCODED_DOT_SEGMENT.test(segment)
    );
  });
}

function isReservedAuthPath(pathname: string): boolean {
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
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
