export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Programming Questions
          </h1>
          <p className="text-white/60 text-lg">
            Practice coding problems and improve your skills
          </p>
        </div>

        {/* Placeholder for questions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors"
            >
              <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-white/10 rounded w-full mb-3"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
