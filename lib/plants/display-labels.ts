export function labelAcquisitionType(t: string): string {
  const map: Record<string, string> = {
    purchased: "Purchased",
    propagated: "Propagated",
    gift: "Gift",
    seed: "Grown from seed",
    other: "Other",
  };
  return map[t] ?? t;
}

export function labelLifeStage(t: string): string {
  const map: Record<string, string> = {
    sprout: "Sprout",
    juvenile: "Juvenile",
    mature: "Mature",
  };
  return map[t] ?? t;
}
