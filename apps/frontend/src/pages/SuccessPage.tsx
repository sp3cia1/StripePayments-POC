export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white px-8 py-12 text-center shadow-2xl shadow-amber-100/80">
        <img
          alt="DevsLane logo"
          className="mx-auto h-10 w-auto"
          src="https://erp.devslane.com/svgs/devslane.svg"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">DevsLane Billing</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">Payment Successful!</h1>
        <p className="mt-3 text-slate-600">
          Thank you. Your transaction is being reconciled securely with our billing system.
        </p>
        <div className="mx-auto mt-7 h-2 w-28 rounded-full bg-linear-to-r from-[#FDB813] to-[#F59E0B]" />
      </div>
    </main>
  )
}
