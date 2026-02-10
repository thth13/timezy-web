interface StudentsListProps {
  students: Array<{
    _id: number;
    firstName?: string;
    username?: string;
    totalLessons: number;
  }>;
}

export default function StudentsList({ students }: StudentsListProps) {
  // Генерируем инициалы
  const getInitials = (student: any) => {
    const name = student.firstName || student.username || 'Студент';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFullName = (student: any) => {
    return student.firstName || student.username || 'Студент';
  };

  const colors = [
    { bg: 'bg-indigo-100', text: 'text-indigo-600', progress: 'bg-indigo-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600', progress: 'bg-emerald-500' },
    { bg: 'bg-purple-100', text: 'text-purple-600', progress: 'bg-purple-500' },
    { bg: 'bg-rose-100', text: 'text-rose-600', progress: 'bg-rose-500' },
  ];

  const badges = [
    { bg: 'bg-green-100', text: 'text-green-600', label: 'Прогресс +15%' },
    { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Сложная тема' },
    { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Отличник' },
  ];

  const displayStudents = students.length > 0 
    ? students.slice(0, 2) 
    : [
        { _id: 1, firstName: 'Иван Котов', totalLessons: 8 },
        { _id: 2, firstName: 'Анна Сидорова', totalLessons: 12 },
      ];

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Статистика по ученикам</h3>
        <span className="text-blue-600 text-xs font-semibold">
          Все ({students.length || 32})
        </span>
      </div>

      <div className="space-y-3">
        {displayStudents.map((student, idx) => {
          const color = colors[idx % colors.length];
          const badge = badges[idx % badges.length];
          const progress = 66 + Math.random() * 30;

          return (
            <div key={student._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center ${color.text} font-bold`}>
                    {getInitials(student)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{getFullName(student)}</h4>
                    <p className="text-[10px] text-slate-400">
                      {idx === 0 ? 'Подготовка к ЕГЭ' : 'Высшая математика'}
                    </p>
                  </div>
                </div>
                <span className={`${badge.bg} ${badge.text} text-[10px] px-2 py-1 rounded-full font-bold`}>
                  {badge.label}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>{idx === 0 ? 'Пройдено тем' : 'Посещаемость'}</span>
                  <span>{idx === 0 ? `${student.totalLessons} / 12` : '95%'}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${color.progress} h-full transition-all`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
