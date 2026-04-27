import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import Stripe from 'stripe'
import type { IncomingMessage } from 'node:http'
import env from '#start/env'
import InvoiceService from '#services/invoice_service'

const stripe = new Stripe(env.get('STRIPE_SECRET_KEY'))
const invoiceService = new InvoiceService()

export default class WebhooksController {
  async handleStripe({ request, response }: HttpContext) {
    const signature = request.header('stripe-signature')

    if (!signature) {
      logger.warn({ code: 'MISSING_STRIPE_SIGNATURE' }, 'Stripe webhook signature header missing')
      return response.badRequest({
        error: 'Missing Stripe-Signature header',
        code: 'MISSING_STRIPE_SIGNATURE',
      })
    }

    const rawBody = await this.readRawBody(request.request)

    if (!rawBody) {
      logger.warn({ code: 'MISSING_RAW_WEBHOOK_BODY' }, 'Stripe webhook raw body missing')
      return response.badRequest({
        error: 'Missing raw webhook request body',
        code: 'MISSING_RAW_WEBHOOK_BODY',
      })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.get('STRIPE_WEBHOOK_SECRET'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Webhook signature verification failed'

      logger.warn(
        {
          code: 'INVALID_STRIPE_SIGNATURE',
          message,
        },
        'Stripe webhook signature verification failed'
      )

      return response.badRequest({
        error: 'Invalid Stripe webhook signature',
        code: 'INVALID_STRIPE_SIGNATURE',
      })
    }

    if (event.type !== 'payment_intent.succeeded') {
      logger.info({ eventType: event.type }, 'Stripe webhook event ignored')
      return response.ok({ received: true })
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const paymentIntentId = paymentIntent.id

    const reconciliationResult = await invoiceService.reconcilePaidInvoice(paymentIntentId)

    logger.info(
      {
        eventType: event.type,
        paymentIntentId,
        reconciliationResult,
      },
      'Stripe webhook event reconciled'
    )

    return response.ok({ received: true })
  }

  private readRawBody(nodeRequest: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      nodeRequest.on('data', (chunk: Buffer) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })

      nodeRequest.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'))
      })

      nodeRequest.on('error', (error) => {
        reject(error)
      })
    })
  }
}
