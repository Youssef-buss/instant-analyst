import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FileUploader = ({ file, setFile, onSuccess }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Upload your Dataset</h2>
          <p className="text-slate-400">Supported formats: CSV, Excel (.xlsx, .xls)</p>
        </div>

        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-colors duration-200 ease-in-out
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-600 bg-surface hover:border-slate-500'}
            ${isDragReject ? 'border-red-500 bg-red-500/5' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-slate-800'}`}>
              <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-sm text-slate-400 mt-1">or click to select a file</p>
            </div>
          </div>
        </div>

        {file && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-surface rounded-xl border border-slate-700 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <button 
                onClick={onSuccess}
                className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-medium transition-colors"
              >
                Start Analysis
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FileUploader;
