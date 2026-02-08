import type { TimeSlotStats, WeekdayStats } from '@/lib/teacherDashboard';

interface StatsChartsProps {
  weekdayStats: WeekdayStats[];
  timeSlotStats: TimeSlotStats[];
}

const weekdayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function getMaxValue(values: number[]): number {
  return Math.max(1, ...values);
}

export default function StatsCharts({ weekdayStats, timeSlotStats }: StatsChartsProps) {
  const weekdayMax = getMaxValue(weekdayStats.map((item) => item.lessonsCount));
  const timeMax = getMaxValue(timeSlotStats.map((item) => item.lessonsCount));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Активность по дням</h3>
          <span className="text-xs text-slate-500">За всё время</span>
        </div>
        <div className="space-y-3">
          {weekdayStats.map((item) => {
            const width = Math.round((item.lessonsCount / weekdayMax) * 100);
            return (
              <div key={item.weekday} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium text-slate-600">
                  {weekdayLabels[item.weekday]}
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-semibold text-slate-700">
                  {item.lessonsCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Пиковые часы</h3>
          <span className="text-xs text-slate-500">По времени начала</span>
        </div>
        {timeSlotStats.length === 0 ? (
          <p className="text-sm text-slate-500">Пока нет данных для анализа времени.</p>
        ) : (
          <div className="space-y-3">
            {timeSlotStats.map((item) => {
              const width = Math.round((item.lessonsCount / timeMax) * 100);
              return (
                <div key={item.hour} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium text-slate-600">
                    {String(item.hour).padStart(2, '0')}:00
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-slate-700">
                    {item.lessonsCount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
