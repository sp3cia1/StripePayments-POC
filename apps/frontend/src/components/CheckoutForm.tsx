import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useState } from 'react'
import type { FormEvent } from 'react'

type CheckoutFormProps = {
  returnUrl: string
}

export default function CheckoutForm({ returnUrl }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements || isSubmitting) {
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    const submitResult = await elements.submit()

    if (submitResult.error) {
      setSubmitError(submitResult.error.message ?? 'Please complete your card details before submitting.')
      setIsSubmitting(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    })

    if (error) {
      setSubmitError(error.message ?? 'Payment could not be confirmed. Please try again.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
          },
        }}
      />

      {submitError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {submitError}
        </p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-[#FDB813] to-[#F59E0B] px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
        disabled={!stripe || !elements || isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Processing...' : 'Pay Securely'}
      </button>
    </form>
  )
}
