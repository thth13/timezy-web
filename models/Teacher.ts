import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeRange {
  start: string;
  end: string;
}

export interface ICustomSchedule {
  date: Date;
  isWorkingDay: boolean;
  timeRanges?: ITimeRange[];
}

export interface IWeekdaySchedule {
  weekday: number;
  isWorkingDay: boolean;
  timeRanges?: ITimeRange[];
}

export interface IGoogleCalendar {
  accessToken: string;
  refreshToken: string | null;
  expiryDate: number | null;
}

export interface ITeacher extends Document {
  telegramId: number;
  username?: string;
  firstName?: string;
  language?: 'uk' | 'en';
  lastRole?: 'teacher' | 'student';
  lastRoleAt?: Date;
  workingDays: number[];
  timeRanges: ITimeRange[];
  lessonDuration: number;
  slotInterval: number;
  breakDuration: number;
  bookingPeriodWeeks: number;
  customSchedule: ICustomSchedule[];
  weekdaySchedule: IWeekdaySchedule[];
  shareLink?: string;
  googleCalendar?: IGoogleCalendar;
  createdAt: Date;
}

const teacherSchema = new Schema<ITeacher>({
  telegramId: { type: Number, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  language: { type: String, enum: ['uk', 'en'], default: 'uk' },
  lastRole: { type: String, enum: ['teacher', 'student'] },
  lastRoleAt: { type: Date },
  workingDays: [{ type: Number }],
  timeRanges: [{
    start: { type: String, required: true },
    end: { type: String, required: true }
  }],
  lessonDuration: { type: Number },
  slotInterval: { type: Number, default: 30 },
  breakDuration: { type: Number, default: 0 },
  bookingPeriodWeeks: { type: Number, default: 2 },
  customSchedule: [{
    date: { type: Date, required: true },
    isWorkingDay: { type: Boolean, required: true },
    timeRanges: [{
      start: { type: String, required: true },
      end: { type: String, required: true }
    }]
  }],
  weekdaySchedule: [{
    weekday: { type: Number, required: true },
    isWorkingDay: { type: Boolean, required: true },
    timeRanges: [{
      start: { type: String, required: true },
      end: { type: String, required: true }
    }]
  }],
  shareLink: { type: String },
  googleCalendar: {
    accessToken: { type: String },
    refreshToken: { type: String },
    expiryDate: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

export const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', teacherSchema);
