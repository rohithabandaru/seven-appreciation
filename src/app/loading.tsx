export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-zinc-100 bg-white/90 backdrop-blur-sm" />

      <main className="flex-1 py-4 sm:py-6 px-4">
        <div className="mx-auto w-full max-w-7xl animate-pulse">
          {/* Spotlight skeleton */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-rose-100/60" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded-full bg-rose-100" />
                  <div className="h-6 w-40 rounded-full bg-zinc-200" />
                  <div className="h-3 w-56 rounded-full bg-zinc-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Daily ENGENE skeleton */}
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-rose-50/50 to-purple-50/40 p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-amber-200" />
              <div className="h-4 w-48 rounded-full bg-amber-200/60" />
            </div>
            <div className="h-4 w-full rounded-full bg-amber-100/80 mb-2" />
            <div className="h-4 w-3/4 rounded-full bg-amber-100/60" />
          </div>

          {/* Heading skeleton */}
          <div className="py-3 text-center space-y-2 mb-4">
            <div className="h-8 w-80 mx-auto rounded-full bg-zinc-200" />
            <div className="h-3 w-96 mx-auto rounded-full bg-zinc-100" />
          </div>

          {/* Post cards skeleton */}
          <div className="mt-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-rose-100/70 bg-white/80 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-rose-200/60" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 rounded-full bg-zinc-200" />
                    <div className="h-2.5 w-20 rounded-full bg-zinc-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-zinc-200" />
                  <div className="h-3 w-5/6 rounded-full bg-zinc-100" />
                  <div className="h-3 w-4/6 rounded-full bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
