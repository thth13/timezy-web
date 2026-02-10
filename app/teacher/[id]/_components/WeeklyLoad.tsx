export default function WeeklyLoad() {
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const loads = [
    { height: 'h-2/3', hours: 18, color: 'bg-blue-100' },
    { height: 'h-3/4', hours: 21, color: 'bg-blue-200' },
    { height: 'h-full', hours: 28, color: 'bg-blue-400' },
    { height: 'h-5/6', hours: 24, color: 'bg-blue-600' },
    { height: 'h-1/2', hours: 14, color: 'bg-blue-300' },
    { height: 'h-1/4', hours: 7, color: 'bg-blue-100' },
    { height: 'h-1/3', hours: 9, color: 'bg-slate-100' },
  ];

  return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-bold mb-3">Нагрузка (ч/нед)</h3>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-32 flex items-end justify-between gap-2">
        {loads.map((load, idx) => (
          <div 
            key={idx}
            className={`flex-1 ${load.color} rounded-t-lg ${load.height} relative group cursor-pointer transition-all hover:opacity-80`}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
              {load.hours}ч
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-1 text-[10px] text-slate-400 font-medium">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}
