export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Customer homepage
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Frontend da duoc doi sang cau truc customer, auth, admin ro rang hon.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Trang chu nay nam trong route group <code>(customer)</code>, dung chung header
            va footer, de sau nay gan san pham noi bat, banner va bo loc nhanh.
          </p>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-slate-950 p-6 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-sky-200">San sang mo rong</p>
            <p className="mt-2 text-2xl font-semibold">App Router structure</p>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            Cac route products, cart, checkout va profile da co scaffold rieng de tiep tuc phat trien.
          </p>
        </div>
      </section>
    </main>
  );
}
