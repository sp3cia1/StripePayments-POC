/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const InvoicesController = () => import('#controllers/invoices_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.get('/invoices/generate-dummy', [InvoicesController, 'generateDummy']).use(middleware.admin())
    router.post('/invoices/:id/publish', [InvoicesController, 'publish']).use(middleware.admin())
  })
  .prefix('/api/admin')

router
  .group(() => {
    router.get('/invoices/:id', [InvoicesController, 'showPublic'])
  })
  .prefix('/api/public')
