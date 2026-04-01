import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('client_name').notNullable()
      table.decimal('amount_inr', 12, 2).notNullable()
      table
        .enu('payment_status', ['DRAFT', 'UNPAID', 'PAID', 'FAILED'], {
          useNative: true,
          enumName: 'invoice_payment_status',
          existingType: false,
        })
        .notNullable()
        .defaultTo('DRAFT')
      table.string('stripe_payment_intent_id').nullable()
      table.string('client_secret').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS invoice_payment_status')
  }
}