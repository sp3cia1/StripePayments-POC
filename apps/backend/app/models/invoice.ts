import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type InvoicePaymentStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'FAILED'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'client_name' })
  declare clientName: string

  @column({ columnName: 'amount_inr' })
  declare amountInr: string

  @column({ columnName: 'payment_status' })
  declare paymentStatus: InvoicePaymentStatus

  @column({ columnName: 'stripe_payment_intent_id' })
  declare stripePaymentIntentId: string | null

  @column({ columnName: 'client_secret' })
  declare clientSecret: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}