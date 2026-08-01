import { safeReturnPath } from "./auth-return";

export type AuthSignoutClient = {
  auth: {
    signOut(options: { scope: "local" }): PromiseLike<{ error: unknown | null }>;
  };
};

export type AuthSignoutClientFactory = () => Promise<AuthSignoutClient | null>;

export async function handleAuthSignout(
  request: Request,
  createClient: AuthSignoutClientFactory,
): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const redirect = (path: string) =>
    Response.redirect(new URL(path, origin), 303);
  const requestOrigin = request.headers.get("origin");

  // Origin can be absent for same-site forms and server navigation.
  // When present, it must match the request origin.
  if (requestOrigin !== null && !hasSameOrigin(requestOrigin, origin)) {
    return redirect("/login?error=csrf");
  }

  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  const client = await createClient();
  if (!client) return redirect(next);

  try {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return redirect("/login?error=signout");
  } catch {
    return redirect("/login?error=signout");
  }

  return redirect(next);
}

function hasSameOrigin(candidate: string, expected: string): boolean {
  try {
    return new URL(candidate).origin === expected;
  } catch {
    return false;
  }
}
