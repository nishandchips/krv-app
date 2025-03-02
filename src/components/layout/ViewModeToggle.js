export default function ViewModeToggle({ viewMode, onToggle }) {
  return (
    <div className="flex justify-center gap-4 py-2 bg-black/20">
      <button
        onClick={() => onToggle('tiled')}
        className={`p-2 rounded-lg transition-all ${
          viewMode === 'tiled' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Tiled View"
      >
        <div className="grid grid-cols-2 gap-1 w-6 h-6">
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
        </div>
      </button>
      
      <button
        onClick={() => onToggle('oneCard')}
        className={`p-2 rounded-lg transition-all ${
          viewMode === 'oneCard' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Single Card View"
      >
        <div className="w-6 h-6 bg-current rounded-sm"></div>
      </button>
    </div>
  );
} 