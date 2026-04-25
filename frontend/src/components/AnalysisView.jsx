import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyzeFile } from '../api/client';
import { Loader2, Database, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalysisView = ({ file }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['analyze', file?.name],
    queryFn: () => analyzeFile(file),
    enabled: !!file,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg text-slate-300 animate-pulse">Analyzing dataset...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-lg">Error analyzing file: {error?.message}</p>
      </div>
    );
  }

  if (!data) return null;

  // Transform feature importance for chart
  const importanceData = data.feature_importance 
    ? Object.entries(data.feature_importance)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div className="flex items-center space-x-3 mb-8">
        <Database className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold">Dataset Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rows', value: data.summary?.rows || 0 },
          { label: 'Total Columns', value: data.summary?.columns || 0 },
          { label: 'Numeric Cols', value: data.numeric_columns?.length || 0 },
          { label: 'Categorical Cols', value: data.categorical_columns?.length || 0 },
        ].map((stat, i) => (
          <div key={i} className="bg-surface p-6 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-2 text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Column Types */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 lg:col-span-1 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              Numeric Columns
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.numeric_columns?.map((col) => (
                <span key={col} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                  {col}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Categorical Columns</h3>
            <div className="flex flex-wrap gap-2">
              {data.categorical_columns?.map((col) => (
                <span key={col} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                  {col}
                </span>
              ))}
            </div>
          </div>
          {data.datetime_columns?.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Datetime Columns</h3>
              <div className="flex flex-wrap gap-2">
                {data.datetime_columns.map((col) => (
                  <span key={col} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feature Importance */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 lg:col-span-2">
          <h3 className="font-semibold text-lg mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Feature Importance
          </h3>
          {importanceData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={importanceData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{fill: '#e2e8f0'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400">Not enough data to calculate feature importance.</p>
          )}
        </div>
      </div>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-surface p-6 rounded-xl border border-slate-700 mt-6">
          <h3 className="font-semibold text-lg mb-4">Key Insights</h3>
          <ul className="space-y-3">
            {data.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                <span className="text-slate-300 leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisView;
