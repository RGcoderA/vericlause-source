export function roleFromProfile(profile: Record<string, unknown>): "counsel" | "business" {
  const claim =
    profile["https://vericlause.app/role"] ||
    profile.role ||
    (Array.isArray(profile.roles) ? profile.roles[0] : undefined);
  return claim === "counsel" ? "counsel" : "business";
}
