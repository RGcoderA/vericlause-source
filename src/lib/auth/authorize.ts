const MFA_ACR = "http://schemas.openid.net/pape/policies/2007/06/multi-factor";

export type AuthScreen = "login" | "signup";
export type AuthConnection = "google-oauth2";

export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || url.host;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function authConnection(value: string | null): AuthConnection | undefined {
  return value === "google-oauth2" ? "google-oauth2" : undefined;
}

export function buildAuthorizeUrl(args: {
  origin: string;
  domain: string;
  clientId: string;
  state: string;
  screen: AuthScreen;
  connection?: AuthConnection;
  mfa?: boolean;
}): URL {
  const authorize = new URL(`https://${args.domain}/authorize`);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", args.clientId);
  authorize.searchParams.set("redirect_uri", `${args.origin}/api/auth/auth0/callback`);
  authorize.searchParams.set("scope", "openid profile email");
  authorize.searchParams.set("state", args.state);
  if (args.mfa) authorize.searchParams.set("acr_values", MFA_ACR);
  if (args.screen === "signup") authorize.searchParams.set("screen_hint", "signup");
  if (args.connection) authorize.searchParams.set("connection", args.connection);
  return authorize;
}

export function authErrorCode(error: string, description: string): "google" | "mfa" | "auth" {
  const text = `${error} ${description}`.toLowerCase();
  if (text.includes("google") || text.includes("connection")) return "google";
  if (text.includes("mfa") || text.includes("multi-factor") || text.includes("multifactor")) return "mfa";
  return "auth";
}