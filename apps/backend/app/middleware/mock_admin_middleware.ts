import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class MockAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const adminToken = ctx.request.header('x-admin-token')

    if (!adminToken || adminToken !== env.get('ADMIN_API_TOKEN')) {
      return ctx.response.unauthorized({
        error: 'Unauthorized admin request',
        code: 'UNAUTHORIZED_ADMIN_REQUEST',
      })
    }

    return next()
  }
}
