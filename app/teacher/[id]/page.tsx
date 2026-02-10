import { getTeacherProfile } from '@/app/actions';
import { notFound } from 'next/navigation';
import TeacherHeader from './_components/TeacherHeader';
import StatsCards from './_components/StatsCards';
import AvailableSlots from './_components/AvailableSlots';
import StudentsList from './_components/StudentsList';
import WeeklyLoad from './_components/WeeklyLoad';
import BookingButton from './_components/BookingButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherProfilePage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTeacherProfile(id);

  if ('error' in result || !result.teacher) {
    notFound();
  }

  const { teacher, stats, upcomingBookings, students } = result;

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen">
      <div className="max-w-md mx-auto min-h-screen pb-20">
        <TeacherHeader teacher={teacher} stats={stats} />
        <StatsCards stats={stats} />
        <AvailableSlots 
          teacherId={id}
          teacher={teacher}
          upcomingBookings={upcomingBookings}
        />
        <StudentsList students={students} />
        <WeeklyLoad />
        <BookingButton />
      </div>
    </div>
  );
}
