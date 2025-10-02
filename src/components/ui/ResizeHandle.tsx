import React from 'react';
import { GripVertical } from 'lucide-react';

interface ResizeHandleProps {
  resizer: 'left-middle' | 'middle-right';
  onMouseDown: (resizer: 'left-middle' | 'middle-right', e: React.MouseEvent) => void;
  isActive: boolean;
  className?: string;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ resizer, onMouseDown, isActive, className = '' }) => {
  return (
    <div
      className={`
        relative flex items-center justify-center cursor-col-resize 
        bg-gray-200 dark:bg-gray-700 
        hover:bg-blue-400 dark:hover:bg-blue-600 
        transition-colors duration-200
        ${isActive ? 'bg-blue-500 dark:bg-blue-600' : ''}
        ${className}
      `}
      style={{ width: '4px', minWidth: '4px' }}
      onMouseDown={(e) => onMouseDown(resizer, e)}
      title="Arrastra para redimensionar"
    >
      <div className={`
        absolute inset-y-0 left-1/2 transform -translate-x-1/2
        flex items-center justify-center
        opacity-0 hover:opacity-100 transition-opacity duration-200
        ${isActive ? 'opacity-100' : ''}
      `}>
        <GripVertical 
          size={16} 
          className="text-white drop-shadow-md"
        />
      </div>
    </div>
  );
};

export default ResizeHandle;

