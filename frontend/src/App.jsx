import React, { useState } from 'react';
import { FileUp, BarChart3, MessageSquare, PieChart } from 'lucide-react';
import FileUploader from './components/FileUploader';
import AnalysisView from './components/AnalysisView';
import ChatView from './components/ChatView';
import ChartsView from './components/ChartsView';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);

  const tabs = [
    { id: 'upload', name: 'Upload', icon: FileUp },
    { id: 'analysis', name: 'Analysis', icon: BarChart3, disabled: !file },
    { id: 'ask', name: 'Ask Data', icon: MessageSquare, disabled: !file },
    { id: 'charts', name: 'Charts', icon: PieChart, disabled: !file },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface border-r border-slate-700">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Data Explorer
          </h1>
        </div>
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : tab.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full p-8">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'upload' && (
              <FileUploader 
                file={file} 
                setFile={setFile} 
                onSuccess={() => setActiveTab('analysis')} 
              />
            )}
            {activeTab === 'analysis' && <AnalysisView file={file} />}
            {activeTab === 'ask' && <ChatView file={file} />}
            {activeTab === 'charts' && <ChartsView file={file} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
