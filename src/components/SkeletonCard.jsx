function SkeletonCard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="animate-pulse">
        <div className="mb-4 h-10 w-10 rounded-md bg-slate-200" />
        <div className="mb-3 h-4 w-28 rounded bg-slate-200" />
        <div className="h-8 w-20 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default SkeletonCard
