import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  teacherId: mongoose.Types.ObjectId;
  studentTelegramId: number;
  studentUsername?: string;
  studentFirstName?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  googleCalendarEventId?: string;
  notificationSent60?: boolean;
  notificationSent10?: boolean;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  studentTelegramId: { type: Number, required: true },
  studentUsername: { type: String },
  studentFirstName: { type: String },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  googleCalendarEventId: { type: String },
  notificationSent60: { type: Boolean, default: false },
  notificationSent10: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ teacherId: 1, date: 1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
