'use server'

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export async function loginWithTelegramToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is missing on server');
    return { error: 'Server configuration error' };
  }

  try {
    // 1. Verify the short-term token
    const decoded = jwt.verify(token, secret) as any;

    if (!decoded.id || !decoded.role) {
      return { error: 'Invalid token structure' };
    }

    // 2. Create a long-term session token (30 days)
    const sessionPayload = {
      id: decoded.id,
      role: decoded.role,
      telegramId: decoded.telegramId
    };

    const sessionToken = jwt.sign(sessionPayload, secret, { expiresIn: '30d' });

    // 3. Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });

  } catch (err) {
    console.error('Token verification failed:', err);
    return { error: 'Invalid or expired token' };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}

export async function getTeacherProfile(teacherId: string) {
  try {
    const { connectToDatabase } = await import('@/lib/mongo');
    await connectToDatabase();
    
    const { Teacher } = await import('@/models/Teacher');
    const { Booking } = await import('@/models/Booking');
    
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      return { error: 'Teacher not found' };
    }

    // Получаем статистику
    const totalLessons = await Booking.countDocuments({ 
      teacherId,
      status: { $in: ['confirmed', 'pending'] }
    });

    const activeLessons = await Booking.countDocuments({
      teacherId,
      date: { $gte: new Date() },
      status: { $in: ['confirmed', 'pending'] }
    });

    // Получаем ближайшие доступные слоты
    const now = new Date();
    const upcomingBookings = await Booking.find({
      teacherId,
      date: { $gte: now },
      status: { $in: ['confirmed', 'pending'] }
    })
    .sort({ date: 1, startTime: 1 })
    .limit(20)
    .lean();

    // Получаем список студентов (уникальные)
    const studentBookings = await Booking.aggregate([
      { 
        $match: { 
          teacherId: teacher._id,
          status: { $in: ['confirmed', 'pending'] }
        } 
      },
      {
        $group: {
          _id: '$studentTelegramId',
          firstName: { $first: '$studentFirstName' },
          username: { $first: '$studentUsername' },
          totalLessons: { $sum: 1 },
          lastLesson: { $max: '$date' }
        }
      },
      { $sort: { totalLessons: -1 } },
      { $limit: 10 }
    ]);

    return {
      teacher: JSON.parse(JSON.stringify(teacher)),
      stats: {
        totalLessons,
        activeLessons,
        successRate: 98, // можно рассчитать на основе отмененных уроков
        rating: 4.9
      },
      upcomingBookings: JSON.parse(JSON.stringify(upcomingBookings)),
      students: JSON.parse(JSON.stringify(studentBookings))
    };
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return { error: 'Failed to fetch teacher profile' };
  }
}
