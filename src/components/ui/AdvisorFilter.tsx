import React from 'react';
import { Users, Filter } from 'lucide-react';

interface AdvisorFilterProps {
  selectedAdvisor: string | null;
  onAdvisorChange: (advisor: string | null) => void;
  advisors: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  isAdmin: boolean;
}

const AdvisorFilter: React.FC<AdvisorFilterProps> = ({
  selectedAdvisor,
  onAdvisorChange,
  advisors,
  isAdmin
}) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="advisor-filter">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrar por Asesor
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onAdvisorChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedAdvisor === null
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Users className="w-3 h-3 inline mr-1" />
          Todos
        </button>
        
        {advisors.map((advisor) => (
          <button
            key={advisor.id}
            onClick={() => onAdvisorChange(advisor.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedAdvisor === advisor.id
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {advisor.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdvisorFilter;
