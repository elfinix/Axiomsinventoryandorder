import React from 'react';
import { Radio } from 'lucide-react';

export const LiveIndicator: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
      <div className="relative flex items-center justify-center">
        <Radio className="w-3.5 h-3.5 text-green-600" />
        <span className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
      </div>
      <span className="text-xs font-medium text-green-700">Live</span>
    </div>
  );
};
