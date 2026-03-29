const GRADIENTS = [
  "from-[#5a6b52]/90 via-[#7a8a6e]/70 to-[#a8b89e]/50",
  "from-[#4a5568]/85 via-[#6b7280]/60 to-[#9ca3af]/40",
  "from-[#6b5c4c]/90 via-[#8b7355]/65 to-[#c4a882]/45",
];

export function gradientClassForAreaId(id: string) {
  const n = parseInt(id.replace(/-/g, "").slice(0, 8), 16) || 0;
  return GRADIENTS[n % GRADIENTS.length];
}
