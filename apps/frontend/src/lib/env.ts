export type RequiredEnvKey = 'VITE_API_BASE_URL' | 'VITE_STRIPE_PUBLIC_KEY'

export function getRequiredEnv(key: RequiredEnvKey): string {
  const value = import.meta.env[key]

  if (!value) {
    throw new Error(`Missing required env value: ${key}. Add it to apps/frontend/.env and restart Vite.`)
  }

  return value
}
