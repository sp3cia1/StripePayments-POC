import { Link, Navigate, Route, Routes } from 'react-router-dom'
import CheckoutPage from './pages/CheckoutPage.tsx'
import SuccessPage from './pages/SuccessPage.tsx'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-10 text-center shadow-2xl shadow-amber-100/80">
        <img
          alt="DevsLane logo"
          className="mx-auto h-10 w-auto"
          src="https://erp.devslane.com/svgs/devslane.svg"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">DevsLane Invoice Portal</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-slate-900">Page Not Found</h1>
        <p className="mt-3 text-slate-600">
          The payment link may be incomplete. Check the URL from your invoice PDF and try again.
        </p>
        <Link
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#FDB813] to-[#F59E0B] px-5 py-3 font-semibold text-white transition hover:brightness-105"
          to="/success"
        >
          Open Success Screen
        </Link>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/pay/:invoiceId" element={<CheckoutPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/" element={<Navigate replace to="/success" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
