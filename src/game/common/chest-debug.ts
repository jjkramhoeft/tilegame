export function logChestDebug(message: string, data?: Record<string, unknown>): void {
  console.log(`[ChestDebug] ${message}`, data ?? {});
}