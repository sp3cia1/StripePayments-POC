import { Elements } from '@stripe/react-stripe-js'
import type { Appearance } from '@stripe/stripe-js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CheckoutForm from '../components/CheckoutForm.tsx'
import { fetchPublicInvoice, InvoiceFetchError } from '../lib/api.ts'
import { stripePromise } from '../lib/stripe.ts'
import type { PublicInvoiceResponse } from '../types/invoice.ts'

type CheckoutState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; invoice: PublicInvoiceResponse }

const elementsAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#F59E0B',
    colorBackground: '#ffffff',
    colorText: '#1d1222',
    colorDanger: '#be123c',
    fontFamily: 'Poppins, Segoe UI, sans-serif',
    spacingUnit: '4px',
    borderRadius: '14px',
    fontSizeBase: '16px',
  },
  rules: {
    '.Input': {
      border: '1px solid #f6d9a0',
      boxShadow: 'none',
      padding: '11px 14px',
    },
    '.Input:focus': {
      border: '1px solid #F59E0B',
      boxShadow: '0 0 0 1px #F59E0B',
    },
    '.Input--invalid': {
      border: '1px solid #be123c',
      boxShadow: '0 0 0 1px #be123c',
    },
    '.Label': {
      color: '#334155',
      fontWeight: '600',
    },
    '.Tab': {
      border: '1px solid #f6d9a0',
      boxShadow: 'none',
      borderRadius: '10px',
    },
    '.Tab--selected': {
      borderColor: '#F59E0B',
      boxShadow: '0 0 0 1px #F59E0B',
    },
  },
}

export default function CheckoutPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const [state, setState] = useState<CheckoutState>({ status: 'loading' })
  const parsedInvoiceId = Number(invoiceId)
  const hasInvalidInvoiceId = !invoiceId || !Number.isInteger(parsedInvoiceId) || parsedInvoiceId <= 0

  useEffect(() => {
    let isMounted = true

    if (hasInvalidInvoiceId) {
      return
    }

    fetchPublicInvoice(parsedInvoiceId)
      .then((invoice) => {
        if (!isMounted) {
          return
        }

        setState({ status: 'ready', invoice })
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }

        if (error instanceof InvoiceFetchError) {
          setState({ status: 'error', message: mapInvoiceError(error) })
          return
        }

        setState({ status: 'error', message: 'Something went wrong while loading your invoice.' })
      })

    return () => {
      isMounted = false
    }
  }, [hasInvalidInvoiceId, parsedInvoiceId])

  const content = useMemo(() => {
    if (hasInvalidInvoiceId) {
      return (
        <div className="space-y-5 py-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            <p className="text-sm font-semibold">Unable to load payment details</p>
            <p className="mt-1 text-sm">This payment link is invalid. Please request a fresh invoice link.</p>
          </div>
          <p className="text-sm text-slate-500">
            If the issue persists, contact your billing representative for a new payment link.
          </p>
        </div>
      )
    }

    if (state.status === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600" role="status">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-medium">Loading your secure checkout...</p>
        </div>
      )
    }

    if (state.status === 'error') {
      return (
        <div className="space-y-5 py-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            <p className="text-sm font-semibold">Unable to load payment details</p>
            <p className="mt-1 text-sm">{state.message}</p>
          </div>
          <p className="text-sm text-slate-500">
            If the issue persists, contact your billing representative for a new payment link.
          </p>
        </div>
      )
    }

    const formattedAmount = formatInrAmount(state.invoice.amount_inr)

    return (
      <>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Invoice Summary</p>
          <dl className="mt-4 space-y-2 text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-slate-500">Client</dt>
              <dd className="text-right text-sm font-semibold text-slate-900">{state.invoice.client_name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2">
              <dt className="text-sm text-slate-500">Amount Due</dt>
              <dd className="text-right text-xl font-semibold text-slate-900">{formattedAmount}</dd>
            </div>
          </dl>
        </div>

        {state.invoice.client_secret ? (
          <div className="pt-1">
            <Elements
              options={{
                appearance: elementsAppearance,
                clientSecret: state.invoice.client_secret,
              }}
              stripe={stripePromise}
            >
              <CheckoutForm returnUrl="http://localhost:5173/success" />
            </Elements>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
            <p className="text-sm font-semibold">Invoice not ready for payment yet</p>
            <p className="mt-1 text-sm">
              This invoice is still being prepared. Ask the sender to publish the invoice before retrying.
            </p>
          </div>
        )}
      </>
    )
  }, [hasInvalidInvoiceId, state])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <section className="rounded-3xl border border-amber-200 bg-white/90 p-8 shadow-2xl shadow-amber-100/90 backdrop-blur sm:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            <img
              alt="DevsLane logo"
              className="h-7 w-auto"
              src="https://erp.devslane.com/svgs/devslane.svg"
            />
            DevsLane
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Secure Billing</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Complete Your Payment with Confidence
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
              This DevsLane payment portal is powered by Stripe and designed for transparent, enterprise-grade transactions.
            </p>
          </div>

          <div className="mt-8">{content}</div>
        </section>

        <aside className="rounded-3xl border border-amber-200/80 bg-linear-to-b from-white to-amber-50/50 p-8 shadow-xl shadow-amber-100/70 backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">Why This Is Trusted</p>
          <ul className="mt-5 space-y-4 text-sm text-slate-700">
            <li className="rounded-xl border border-amber-200 bg-white px-4 py-3">
              Card data is encrypted and sent directly to Stripe. Our backend never touches raw card numbers.
            </li>
            <li className="rounded-xl border border-amber-200 bg-white px-4 py-3">
              Payment status is reconciled asynchronously through signed backend webhooks for reliable bookkeeping.
            </li>
            <li className="rounded-xl border border-amber-200 bg-white px-4 py-3">
              Clear communication and ownership are part of our delivery values, from invoice issue to settlement.
            </li>
          </ul>

          <p className="mt-6 text-sm text-slate-600">
            Need assistance with this invoice? Contact DevsLane billing support before making payment.
          </p>

          <Link
            className="mt-6 inline-flex text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-900"
            to="/success"
          >
            View payment confirmation preview
          </Link>
        </aside>
      </div>
    </main>
  )
}

function formatInrAmount(amountInr: string): string {
  const parsedAmount = Number(amountInr)

  if (Number.isNaN(parsedAmount)) {
    return `INR ${amountInr}`
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(parsedAmount)
}

function mapInvoiceError(error: InvoiceFetchError): string {
  if (error.code === 'INVOICE_ALREADY_PAID') {
    return 'This invoice has already been paid. No further action is needed.'
  }

  if (error.code === 'INVOICE_NOT_FOUND' || error.status === 404) {
    return 'This invoice link is no longer valid. Please request a fresh payment link.'
  }

  if (error.code === 'INVALID_INVOICE_ID' || error.status === 400) {
    return error.message
  }

  return 'We could not prepare checkout at the moment. Please try again shortly.'
}
