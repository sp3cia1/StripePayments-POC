import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import Invoice from '#models/invoice'

export default class extends BaseSeeder {
  async run() {
    await db.rawQuery('TRUNCATE TABLE invoices RESTART IDENTITY CASCADE')

    await Invoice.create({
      clientName: 'Escecion Technologies',
      amountInr: '2644.00',
      paymentStatus: 'DRAFT',
      stripePaymentIntentId: null,
      clientSecret: null,
    })
  }
}