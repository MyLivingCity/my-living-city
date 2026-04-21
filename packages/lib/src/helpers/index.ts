export function cleanAddress(address: string) {
  const cleaned = address.replace(/^\s*\d+\s*/, "");
  return cleaned;
}
