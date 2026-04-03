import type { PublicApiErrorResponse, PublicInvoiceResponse } from '../types/invoice.ts'
import { getRequiredEnv } from './env.ts'

export class InvoiceFetchError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function fetchPublicInvoice(invoiceId: number): Promise<PublicInvoiceResponse> {
  const baseUrl = getRequiredEnv('VITE_API_BASE_URL')
  const response = await fetch(`${baseUrl}/api/public/invoices/${invoiceId}`)

  const payload = await readPayload(response)

  if (!response.ok) {
    const apiError = payload as Partial<PublicApiErrorResponse>
    throw new InvoiceFetchError(
      apiError.error ?? 'Unable to load this invoice right now.',
      response.status,
      apiError.code,
    )
  }

  if (!isPublicInvoiceResponse(payload)) {
    throw new InvoiceFetchError('Received an invalid invoice response from server.', 502)
  }

  return payload
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return { error: text || 'Unexpected response from server.' }
  }

  return response.json() as Promise<unknown>
}

function isPublicInvoiceResponse(payload: unknown): payload is PublicInvoiceResponse {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }

  const candidate = payload as Record<string, unknown>

  return (
    typeof candidate.amount_inr === 'string' &&
    typeof candidate.client_name === 'string' &&
    (typeof candidate.client_secret === 'string' || candidate.client_secret === null)
  )
}
