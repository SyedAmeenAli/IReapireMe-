export function isAirtableCatalogModeActive(): boolean {
  const useAirtable = process.env.USE_AIRTABLE;
  if (!useAirtable) return false;
  const normalized = useAirtable.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function assertCatalogWriteAllowed(baseId?: string): void {
  // No-op: unified base allows all reads and writes
}
