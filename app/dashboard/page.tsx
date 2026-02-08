import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { logout } from '../actions';
import { getTeacherDashboardData } from '@/lib/teacherDashboard';

const StatsCharts = dynamic(() => import('./_components/StatsCharts'), { ssr: true });

const weekdayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(value);
}

function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/');
  }

  const secret = process.env.JWT_SECRET;
  let user = null;

  try {
    if (!secret) throw new Error('JWT_SECRET missing');
    user = jwt.verify(sessionCookie.value, secret) as any;
  } catch (e) {
    // If validation fails, force logout
    // redirect to home which is probably public
    // effectively this loop might occur if home checks session too, but assuming home is public
    redirect('/');
  }

  if (user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Дашборд доступен только для преподавателей</h1>
          <p className="mt-3 text-sm text-slate-500">Ваша роль: {user.role}</p>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    );
  }

  const data = await getTeacherDashboardData(user.id);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Профиль преподавателя не найден</h1>
          <p className="mt-3 text-sm text-slate-500">Проверьте, что ваш аккаунт существует в базе.</p>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { teacher, stats, topStudents, weekdayStats, timeSlotStats, upcomingBookings, periodStats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Teacher Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold">Дашборд преподавателя</h1>
            <p className="mt-2 text-sm text-slate-600">
              Профиль: {teacher.firstName || teacher.username || 'Без имени'} · Telegram ID: {teacher.telegramId}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {teacher.shareLink ? (
              <a
                href={teacher.shareLink}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300"
              >
                Ссылка для учеников
              </a>
            ) : null}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Выйти
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Всего записей', value: formatNumber(stats.totalBookings) },
            { label: 'Завершено уроков', value: formatNumber(stats.completedLessons) },
            { label: 'Предстоящие уроки', value: formatNumber(stats.upcomingLessons) },
            { label: 'Отменено', value: formatNumber(stats.cancelledBookings) },
            { label: 'Уникальных учеников', value: formatNumber(stats.uniqueStudents) },
            { label: 'Часы обучения', value: `${formatNumber(stats.totalHours)} ч` },
            { label: 'Уроков на этой неделе', value: formatNumber(stats.thisWeekLessons) },
            { label: 'Уроков в этом месяце', value: formatNumber(stats.thisMonthLessons) }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Динамика за периоды</h2>
              <p className="text-xs text-slate-500">Среднее: {formatNumber(stats.averageLessonsPerWeek)} урока в неделю</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Последние 7 дней</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Уроки</span>
                    <span className="font-semibold">{formatNumber(periodStats.last7Days.totalLessons)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ученики</span>
                    <span className="font-semibold">{formatNumber(periodStats.last7Days.uniqueStudents)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Часы</span>
                    <span className="font-semibold">{formatNumber(periodStats.last7Days.totalHours)} ч</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Отмены</span>
                    <span className="font-semibold">{formatNumber(periodStats.last7Days.cancelledCount)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Последние 30 дней</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Уроки</span>
                    <span className="font-semibold">{formatNumber(periodStats.last30Days.totalLessons)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ученики</span>
                    <span className="font-semibold">{formatNumber(periodStats.last30Days.uniqueStudents)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Часы</span>
                    <span className="font-semibold">{formatNumber(periodStats.last30Days.totalHours)} ч</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Отмены</span>
                    <span className="font-semibold">{formatNumber(periodStats.last30Days.cancelledCount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Следующие уроки</h2>
            <div className="mt-5 space-y-3">
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-slate-500">Нет запланированных уроков.</p>
              ) : (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{booking.studentName}</p>
                        <p className="text-xs text-slate-500">{formatDate(booking.date)}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {booking.startTime}–{booking.endTime}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <StatsCharts weekdayStats={weekdayStats} timeSlotStats={timeSlotStats} />

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Лучшие ученики</h2>
            <div className="mt-4 space-y-3">
              {topStudents.length === 0 ? (
                <p className="text-sm text-slate-500">Пока нет учеников в статистике.</p>
              ) : (
                topStudents.map((student) => (
                  <div key={student.studentTelegramId} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {student.studentFirstName || student.studentUsername || 'Student'}
                      </p>
                      <p className="text-xs text-slate-500">ID {student.studentTelegramId}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {formatNumber(student.lessonsCount)} уроков
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Расписание и настройки</h2>
            <div className="mt-4 grid gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">График работы</p>
                <p className="mt-2 text-sm text-slate-600">
                  Дни: {teacher.workingDays.length ? teacher.workingDays.map((day) => weekdayNames[day]).join(', ') : 'не указаны'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Время: {teacher.timeRanges.length ? teacher.timeRanges.map((range) => formatTimeRange(range.start, range.end)).join(', ') : 'не указано'}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { label: 'Длительность урока', value: `${teacher.lessonDuration} мин` },
                  { label: 'Интервал слотов', value: `${teacher.slotInterval} мин` },
                  { label: 'Перерыв после урока', value: `${teacher.breakDuration} мин` },
                  { label: 'Окно записи', value: `${teacher.bookingPeriodWeeks} недели` },
                  { label: 'Исключения в расписании', value: `${teacher.customScheduleCount} дней` },
                  { label: 'Переопределения по дням', value: `${teacher.weekdayScheduleCount} дней` }
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-500">Google Calendar</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {teacher.googleCalendarConnected ? 'Подключён' : 'Не подключён'}
                </p>
                <p className="mt-1 text-xs text-slate-500">Профиль создан {formatDate(teacher.createdAt)}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
