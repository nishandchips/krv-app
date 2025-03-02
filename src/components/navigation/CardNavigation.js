export default function CardNavigation({ onPrev, onNext }) {
  return (
    <>
      <div className="flex-shrink-0">
        <button
          onClick={onPrev}
          className="text-white bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8 md:w-12 md:h-12 flex items-center justify-center shadow-lg"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      </div>
      {/* ... next button ... */}
    </>
  );
} 