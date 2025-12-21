'use client';

import { Button } from '@/components/ui/button';
import { Download, FileCode2 } from 'lucide-react';

interface DownloadNotebookProps {
  notebookPath: string;
  title?: string;
}

export function DownloadNotebook({ notebookPath, title = 'Download Jupyter Notebook' }: DownloadNotebookProps) {
  const handleDownload = () => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = notebookPath;
    link.download = notebookPath.split('/').pop() || 'notebook.ipynb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="my-8 bg-gradient-to-r from-phthalo-500/10 to-blue-500/10 border border-phthalo-500/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-phthalo-500/20 rounded-lg">
          <FileCode2 className="w-6 h-6 text-phthalo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Take It Further</h3>
          <p className="text-sm text-zinc-400">Professional notebook with real market data</p>
        </div>
      </div>

      <p className="text-zinc-300 mb-4">
        Download the complete Jupyter notebook to run this analysis on your own machine.
        Includes real stock data, additional visualizations, and production-ready code.
      </p>

      <Button
        onClick={handleDownload}
        className="bg-gradient-to-r from-phthalo-600 to-phthalo-800 hover:from-phthalo-700 hover:to-phthalo-900"
      >
        <Download className="w-4 h-4 mr-2" />
        {title}
      </Button>
    </div>
  );
}
