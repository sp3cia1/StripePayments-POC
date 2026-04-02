import type { HttpContext } from '@adonisjs/core/http'
import InvoiceService, { InvoiceDomainError } from '#services/invoice_service'

const invoiceService = new InvoiceService()

export default class InvoicesController {
  async generateDummy({ response }: HttpContext) {
    try {
      const invoice = await invoiceService.createDummyInvoice()
      return response.created(invoice.serialize())
    } catch (error) {
      return this.handleDomainError(error, response)
    }
  }

  async publish({ params, response }: HttpContext) {
    try {
      const invoiceId = this.parseInvoiceId(params.id)
      const invoice = await invoiceService.publishInvoice(invoiceId)
      return response.ok(invoice.serialize())
    } catch (error) {
      return this.handleDomainError(error, response)
    }
  }

  async showPublic({ params, response }: HttpContext) {
    try {
      const invoiceId = this.parseInvoiceId(params.id)
      const invoiceDetails = await invoiceService.getPublicInvoiceDetails(invoiceId)
      return response.ok(invoiceDetails)
    } catch (error) {
      return this.handleDomainError(error, response)
    }
  }

  private parseInvoiceId(rawId: string): number {
    const invoiceId = Number.parseInt(rawId, 10)

    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
      throw new InvoiceDomainError(400, 'INVALID_INVOICE_ID', 'Invoice id must be a positive integer')
    }

    return invoiceId
  }

  private handleDomainError(error: unknown, response: HttpContext['response']) {
    if (error instanceof InvoiceDomainError) {
      return response.status(error.status).send({
        error: error.message,
        code: error.code,
      })
    }

    throw error
  }
}
