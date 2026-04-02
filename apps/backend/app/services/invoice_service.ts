import Invoice from '#models/invoice'
import env from '#start/env'
import Stripe from 'stripe'

export class InvoiceDomainError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
  }
}

export type PublicInvoiceDetails = {
  amount_inr: string
  client_name: string
  client_secret: string | null
}

export default class InvoiceService {
  private stripe: Stripe

  constructor(stripeClient?: Stripe) {
    this.stripe = stripeClient ?? new Stripe(env.get('STRIPE_SECRET_KEY'))
  }

  async publishInvoice(invoiceId: number) {
    const invoice = await this.getInvoiceOrThrow(invoiceId)

    if (invoice.paymentStatus !== 'DRAFT') {
      throw new InvoiceDomainError(
        400,
        'INVOICE_NOT_DRAFT',
        `Invoice ${invoiceId} cannot be published because it is ${invoice.paymentStatus}`
      )
    }

    const amountInMinorUnits = this.toMinorCurrencyUnit(invoice.amountInr)

    let paymentIntent: Stripe.PaymentIntent

    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInMinorUnits,
        currency: 'inr',
        metadata: {
          invoice_id: String(invoice.id),
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create Stripe PaymentIntent'
      throw new InvoiceDomainError(502, 'STRIPE_PAYMENT_INTENT_CREATE_FAILED', message)
    }

    if (!paymentIntent.client_secret) {
      throw new InvoiceDomainError(
        502,
        'STRIPE_CLIENT_SECRET_MISSING',
        'Stripe did not return a client_secret for the created PaymentIntent'
      )
    }

    invoice.paymentStatus = 'UNPAID'
    invoice.stripePaymentIntentId = paymentIntent.id
    invoice.clientSecret = paymentIntent.client_secret

    await invoice.save()

    return invoice
  }

  async createDummyInvoice() {
    return Invoice.create({
      clientName: 'Stark Industries',
      amountInr: '50000.00',
      paymentStatus: 'DRAFT',
      stripePaymentIntentId: null,
      clientSecret: null,
    })
  }

  async getPublicInvoiceDetails(invoiceId: number): Promise<PublicInvoiceDetails> {
    const invoice = await this.getInvoiceOrThrow(invoiceId)

    if (invoice.paymentStatus === 'PAID') {
      throw new InvoiceDomainError(
        400,
        'INVOICE_ALREADY_PAID',
        `Invoice ${invoiceId} is already paid and cannot be fetched for payment`
      )
    }

    return {
      amount_inr: invoice.amountInr,
      client_name: invoice.clientName,
      client_secret: invoice.clientSecret,
    }
  }

  private async getInvoiceOrThrow(invoiceId: number) {
    const invoice = await Invoice.find(invoiceId)

    if (!invoice) {
      throw new InvoiceDomainError(404, 'INVOICE_NOT_FOUND', `Invoice ${invoiceId} was not found`)
    }

    return invoice
  }

  private toMinorCurrencyUnit(amountInr: string): number {
    const parsedAmount = Number(amountInr)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new InvoiceDomainError(400, 'INVALID_INVOICE_AMOUNT', 'Invoice amount must be a positive number')
    }

    const minorUnits = Math.round(parsedAmount * 100)

    if (minorUnits <= 0) {
      throw new InvoiceDomainError(400, 'INVALID_INVOICE_AMOUNT', 'Invoice amount must be at least INR 0.01')
    }

    return minorUnits
  }
}
