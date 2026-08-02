import { safeReturnPath } from "./auth-return";

export type AuthCallbackClient = {
  auth: {
    exchangeCodeForSession(
      code: string,
    ): PromiseLike<{ error: unknown | null }>;
  };
};

export type AuthCallbackClientFactory = () => Promise<AuthCallbackClient | null>;

export async function handleAuthCallback(
  request: Request,
  createClient: AuthCallbackClientFactory,
): Promise<Response> {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const redirect = (path: string) => Response.redirect(new URL(path, origin), 307);
  const client = await createClient();

  if (!client) return redirect("/login?error=config");

  const code = requestUrl.searchParams.get("code");
  if (!code) return redirect("/login?error=missing_code");

  try {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return redirect("/login?error=callback");
  } catch {
    return redirect("/login?error=callback");
  }

  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  return redirect(next);
}
