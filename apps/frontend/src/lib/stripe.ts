import { loadStripe } from '@stripe/stripe-js'
import { getRequiredEnv } from './env.ts'

export const stripePromise = loadStripe(getRequiredEnv('VITE_STRIPE_PUBLIC_KEY'))
