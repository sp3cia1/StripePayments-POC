export type PublicInvoiceResponse = {
  amount_inr: string
  client_name: string
  client_secret: string | null
}

export type PublicApiErrorResponse = {
  error: string
  code: string
}
