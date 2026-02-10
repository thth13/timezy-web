interface StatsCardsProps {
  stats: {
    totalLessons: number;
    activeLessons: number;
    successRate: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100">
        <p className="text-blue-600 font-bold text-lg">{stats.totalLessons}+</p>
        <p className="text-blue-400 text-[10px] uppercase font-bold">Уроков</p>
      </div>
      <div className="bg-purple-50 p-3 rounded-2xl text-center border border-purple-100">
        <p className="text-purple-600 font-bold text-lg">{stats.activeLessons}</p>
        <p className="text-purple-400 text-[10px] uppercase font-bold">Активных</p>
      </div>
      <div className="bg-orange-50 p-3 rounded-2xl text-center border border-orange-100">
        <p className="text-orange-600 font-bold text-lg">{stats.successRate}%</p>
        <p className="text-orange-400 text-[10px] uppercase font-bold">Успех</p>
      </div>
    </div>
  );
}
