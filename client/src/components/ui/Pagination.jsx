import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center mt-4 gap-2">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-150
            ${currentPage === i + 1 ? 'text-blue-600 bg-blue-100' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
          onClick={() => onPageChange(i + 1)}
          disabled={currentPage === i + 1}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination; 