interface TeacherHeaderProps {
  teacher: {
    firstName?: string;
    username?: string;
  };
  stats: {
    rating: number;
  };
}

export default function TeacherHeader({ teacher, stats }: TeacherHeaderProps) {
  const name = teacher.firstName || teacher.username || 'Учитель';
  
  return (
    <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-slate-200">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`}
            alt="Teacher" 
            className="w-20 h-20 rounded-2xl object-cover"
          />
          <span className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-6 h-6 rounded-full"></span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{name}</h1>
          <p className="text-slate-500 text-sm">Преподаватель Mathematics & Physics</p>
          <div className="flex items-center mt-1 text-yellow-500 text-sm">
            <i className="fas fa-star mr-1"></i>
            <span className="font-semibold text-slate-700">{stats.rating}</span>
            <span className="text-slate-400 ml-1">(124 отзыва)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
