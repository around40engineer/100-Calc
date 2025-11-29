import React from 'react';

interface HeaderCellProps {
  value: number;
  testId?: string;
}

export const HeaderCell: React.FC<HeaderCellProps> = ({ value, testId = 'header-cell' }) => {
  return (
    <div
      data-testid={testId}
      data-header="true"
      className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 border-3 border-blue-700 flex items-center justify-center font-bold text-xl sm:text-2xl md:text-3xl text-white rounded-lg shadow-lg"
    >
      {value}
    </div>
  );
};
