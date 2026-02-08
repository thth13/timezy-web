import mongoose from 'mongoose';
import { connectMongo } from './mongo';
import { Booking, IBooking } from '@/models/Booking';
import { Teacher, ITeacher } from '@/models/Teacher';

export interface TeacherStatistics {
  totalBookings: number;
  completedLessons: number;
  upcomingLessons: number;
  cancelledBookings: number;
  uniqueStudents: number;
  totalHours: number;
  thisWeekLessons: number;
  thisMonthLessons: number;
  averageLessonsPerWeek: number;
}

export interface TopStudent {
  studentTelegramId: number;
  studentUsername?: string;
  studentFirstName?: string;
  lessonsCount: number;
}

export interface WeekdayStats {
  weekday: number;
  lessonsCount: number;
}

export interface TimeSlotStats {
  hour: number;
  lessonsCount: number;
}

export interface PeriodStats {
  totalLessons: number;
  uniqueStudents: number;
  totalHours: number;
  cancelledCount: number;
}

export interface UpcomingBooking {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  studentName: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface TeacherProfile {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  language?: 'uk' | 'en';
  workingDays: number[];
  timeRanges: { start: string; end: string }[];
  lessonDuration: number;
  slotInterval: number;
  breakDuration: number;
  bookingPeriodWeeks: number;
  customScheduleCount: number;
  weekdayScheduleCount: number;
  shareLink?: string;
  googleCalendarConnected: boolean;
  createdAt: Date;
}

export interface TeacherDashboardData {
  teacher: TeacherProfile;
  stats: TeacherStatistics;
  topStudents: TopStudent[];
  weekdayStats: WeekdayStats[];
  timeSlotStats: TimeSlotStats[];
  upcomingBookings: UpcomingBooking[];
  periodStats: {
    last7Days: PeriodStats;
    last30Days: PeriodStats;
  };
}

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getBookingDateTime(booking: Pick<IBooking, 'date' | 'startTime'>): Date {
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  const date = new Date(booking.date);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function toTeacherProfile(teacher: ITeacher): TeacherProfile {
  return {
    id: teacher._id.toString(),
    telegramId: teacher.telegramId,
    username: teacher.username,
    firstName: teacher.firstName,
    language: teacher.language,
    workingDays: teacher.workingDays || [],
    timeRanges: teacher.timeRanges || [],
    lessonDuration: teacher.lessonDuration || 0,
    slotInterval: teacher.slotInterval || 30,
    breakDuration: teacher.breakDuration || 0,
    bookingPeriodWeeks: teacher.bookingPeriodWeeks || 2,
    customScheduleCount: teacher.customSchedule?.length || 0,
    weekdayScheduleCount: teacher.weekdaySchedule?.length || 0,
    shareLink: teacher.shareLink,
    googleCalendarConnected: Boolean(teacher.googleCalendar?.accessToken),
    createdAt: teacher.createdAt
  };
}

function computePeriodStats(
  bookings: IBooking[],
  startDate: Date,
  endDate: Date,
  lessonDuration: number
): PeriodStats {
  const filtered = bookings.filter((booking) => {
    const date = new Date(booking.date);
    return date >= startDate && date <= endDate;
  });
  const active = filtered.filter((booking) => booking.status !== 'cancelled');
  const uniqueStudents = new Set(active.map((booking) => booking.studentTelegramId));
  const totalHours = Math.round((active.length * lessonDuration) / 60 * 10) / 10;
  const cancelledCount = filtered.filter((booking) => booking.status === 'cancelled').length;

  return {
    totalLessons: active.length,
    uniqueStudents: uniqueStudents.size,
    totalHours,
    cancelledCount
  };
}

export async function getTeacherDashboardData(teacherId: string): Promise<TeacherDashboardData | null> {
  await connectMongo();

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return null;
  }

  const teacher = await Teacher.findById(new mongoose.Types.ObjectId(teacherId));
  if (!teacher) {
    return null;
  }

  const bookings = await Booking.find({ teacherId: teacher._id });
  const now = startOfDay(new Date());

  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled');
  const completedLessons = activeBookings.filter((booking) => startOfDay(booking.date) < now).length;
  const upcomingLessons = activeBookings.filter((booking) => startOfDay(booking.date) >= now).length;
  const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled').length;

  const uniqueStudents = new Set(activeBookings.map((booking) => booking.studentTelegramId));

  const weekStart = startOfDay(new Date(now));
  const dayOfWeek = weekStart.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + diff);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekLessons = activeBookings.filter((booking) => startOfDay(booking.date) >= weekStart).length;
  const thisMonthLessons = activeBookings.filter((booking) => booking.date >= monthStart).length;

  const totalHours = Math.round((completedLessons * (teacher.lessonDuration || 0)) / 60 * 10) / 10;

  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const last4WeeksLessons = activeBookings.filter((booking) => {
    const date = startOfDay(booking.date);
    return date >= fourWeeksAgo && date < now;
  }).length;
  const averageLessonsPerWeek = Math.round((last4WeeksLessons / 4) * 10) / 10;

  const stats: TeacherStatistics = {
    totalBookings: bookings.length,
    completedLessons,
    upcomingLessons,
    cancelledBookings,
    uniqueStudents: uniqueStudents.size,
    totalHours,
    thisWeekLessons,
    thisMonthLessons,
    averageLessonsPerWeek
  };

  const studentMap = new Map<number, { count: number; username?: string; firstName?: string }>();
  for (const booking of activeBookings) {
    const existing = studentMap.get(booking.studentTelegramId) ?? {
      count: 0,
      username: booking.studentUsername,
      firstName: booking.studentFirstName
    };
    existing.count += 1;
    if (booking.studentUsername) existing.username = booking.studentUsername;
    if (booking.studentFirstName) existing.firstName = booking.studentFirstName;
    studentMap.set(booking.studentTelegramId, existing);
  }

  const topStudents: TopStudent[] = Array.from(studentMap.entries())
    .map(([id, data]) => ({
      studentTelegramId: id,
      studentUsername: data.username,
      studentFirstName: data.firstName,
      lessonsCount: data.count
    }))
    .sort((a, b) => b.lessonsCount - a.lessonsCount)
    .slice(0, 8);

  const weekdayMap = new Map<number, number>();
  for (let i = 0; i < 7; i += 1) {
    weekdayMap.set(i, 0);
  }
  for (const booking of activeBookings) {
    const weekday = new Date(booking.date).getDay();
    weekdayMap.set(weekday, (weekdayMap.get(weekday) || 0) + 1);
  }
  const weekdayStats: WeekdayStats[] = Array.from(weekdayMap.entries()).map(([weekday, count]) => ({
    weekday,
    lessonsCount: count
  }));

  const timeMap = new Map<number, number>();
  for (const booking of activeBookings) {
    const hour = Number.parseInt(booking.startTime.split(':')[0], 10);
    timeMap.set(hour, (timeMap.get(hour) || 0) + 1);
  }
  const timeSlotStats: TimeSlotStats[] = Array.from(timeMap.entries())
    .map(([hour, count]) => ({ hour, lessonsCount: count }))
    .sort((a, b) => a.hour - b.hour);

  const upcomingBookings: UpcomingBooking[] = activeBookings
    .filter((booking) => startOfDay(booking.date) >= now)
    .sort((a, b) => getBookingDateTime(a).getTime() - getBookingDateTime(b).getTime())
    .slice(0, 6)
    .map((booking) => ({
      id: booking._id.toString(),
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      studentName: booking.studentFirstName || booking.studentUsername || 'Student',
      status: booking.status
    }));

  const last7Start = new Date(now);
  last7Start.setDate(last7Start.getDate() - 6);
  const last30Start = new Date(now);
  last30Start.setDate(last30Start.getDate() - 29);
  const periodStats = {
    last7Days: computePeriodStats(bookings, last7Start, new Date(), teacher.lessonDuration || 0),
    last30Days: computePeriodStats(bookings, last30Start, new Date(), teacher.lessonDuration || 0)
  };

  return {
    teacher: toTeacherProfile(teacher),
    stats,
    topStudents,
    weekdayStats,
    timeSlotStats,
    upcomingBookings,
    periodStats
  };
}
