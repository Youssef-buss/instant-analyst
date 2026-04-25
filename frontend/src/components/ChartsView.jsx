import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCharts } from '../api/client';
import { Loader2, AlertCircle, PieChart, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const ChartsView = ({ file }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['charts', file?.name],
    queryFn: () => getCharts(file),
    enabled: !!file,
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg text-slate-300 animate-pulse">Generating visualizations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-lg">Error generating charts: {error?.message}</p>
      </div>
    );
  }

  if (!data?.charts || data.charts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
        <PieChart className="w-12 h-12" />
        <p className="text-lg">No charts generated for this dataset.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div className="flex items-center space-x-3 mb-8">
        <PieChart className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Auto-Generated Visualizations</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {data.charts.map((chartPath, idx) => {
          // ensure correct path structure
          const imgUrl = chartPath.startsWith('http') ? chartPath : `${API_URL}/${chartPath}`;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-surface rounded-xl border border-slate-700 overflow-hidden group"
            >
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-medium text-slate-200 truncate pr-4">
                  {chartPath.split('/').pop().replace('.png', '').replace(/_/g, ' ').toUpperCase()}
                </h3>
                <a 
                  href={imgUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
              <div className="p-4 flex items-center justify-center bg-slate-900/50 min-h-[300px]">
                <img 
                  src={imgUrl} 
                  alt={`Chart ${idx}`} 
                  className="max-w-full h-auto max-h-[500px] object-contain rounded"
                  loading="lazy"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ChartsView;
