'use client';

export default function BookingButton() {
  const handleBooking = () => {
    alert('Функция записи будет реализована');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
      <div className="max-w-md mx-auto">
        <button 
          onClick={handleBooking}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <i className="fas fa-plus"></i>
          Записаться на урок
        </button>
      </div>
    </div>
  );
}
