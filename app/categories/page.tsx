export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Problem Categories</h1>
          <p className="text-white/60 text-lg">
            Explore problems by category and difficulty
          </p>
        </div>

        {/* Placeholder for categories list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[
            { name: "Arrays", count: 45 },
            { name: "Linked Lists", count: 32 },
            { name: "Trees", count: 38 },
            { name: "Graphs", count: 28 },
            { name: "Dynamic Programming", count: 55 },
            { name: "Strings", count: 42 },
            { name: "Sorting", count: 25 },
            { name: "Recursion", count: 20 },
          ].map((category) => (
            <div
              key={category.name}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/10 cursor-pointer group"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-white/60 text-sm mt-2">
                {category.count} problems
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
