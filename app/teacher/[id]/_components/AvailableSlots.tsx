'use client';

import { useState } from 'react';

interface AvailableSlotsProps {
  teacherId: string;
  teacher: {
    lessonDuration: number;
    slotInterval: number;
    breakDuration: number;
    timeRanges: { start: string; end: string }[];
    workingDays: number[];
  };
  upcomingBookings: any[];
}

export default function AvailableSlots({ teacher, upcomingBookings }: AvailableSlotsProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  
  // Генерируем следующие 7 дней
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  // Генерируем временные слоты на основе расписания учителя
  const generateTimeSlots = () => {
    const slots = [];
    if (teacher.timeRanges && teacher.timeRanges.length > 0) {
      const range = teacher.timeRanges[0];
      const [startHour] = range.start.split(':').map(Number);
      const [endHour] = range.end.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour += 2) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const isBooked = Math.random() > 0.7; // Временная логика
        slots.push({ time, isBooked });
      }
    } else {
      // Дефолтные слоты если расписание не установлено
      ['09:00', '11:30', '14:00', '16:30', '18:00'].forEach((time, idx) => {
        slots.push({ time, isBooked: idx === 3 });
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="px-4 mt-2">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <i className="far fa-calendar-check text-blue-500"></i> Свободные слоты
      </h3>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`flex-shrink-0 w-14 py-3 rounded-xl text-center transition ${
                selectedDay === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className={`block text-xs ${selectedDay === idx ? 'opacity-80' : 'opacity-60'}`}>
                {weekDays[date.getDay()]}
              </span>
              <span className="text-lg font-bold">{date.getDate()}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {timeSlots.map((slot, idx) => (
            <button
              key={idx}
              disabled={slot.isBooked}
              className={`py-2 px-1 rounded-lg text-sm font-medium transition ${
                slot.isBooked
                  ? 'border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed line-through'
                  : 'border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
