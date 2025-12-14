import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fileService from '../services/fileService';
import api from '../services/api';

function FileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const metadata = await fileService.getFile(id);
        setFile(metadata);

        // Fetch content for viewable files
        if (metadata.viewable) {
          const isBinary = metadata.contentType.startsWith('image/') || 
                          metadata.contentType === 'application/pdf';
          
          const response = await api.get(`/files/${id}/download`, {
            responseType: isBinary ? 'blob' : 'text',
          });

          if (isBinary) {
            setContent(URL.createObjectURL(response.data));
          } else {
            setContent(response.data);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();

    return () => {
      // Cleanup blob URL
      if (content && typeof content === 'string' && content.startsWith('blob:')) {
        URL.revokeObjectURL(content);
      }
    };
  }, [id]);

  const handleDownload = async () => {
    if (file) {
      await fileService.downloadFile(file.id, file.name);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-emerald-500 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-white font-medium truncate max-w-md">{file?.name}</h1>
                <p className="text-sm text-slate-500">{formatSize(file?.size)}</p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {file?.contentType?.startsWith('image/') ? (
          <div className="flex justify-center">
            <img
              src={content}
              alt={file.name}
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
            />
          </div>
        ) : file?.contentType === 'application/pdf' ? (
          <div className="w-full h-[80vh] rounded-xl overflow-hidden">
            <iframe
              src={content}
              title={file.name}
              className="w-full h-full border-0"
            />
          </div>
        ) : file?.contentType === 'application/json' ? (
          <pre className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-auto max-h-[80vh] text-sm text-slate-300">
            {typeof content === 'string' 
              ? JSON.stringify(JSON.parse(content), null, 2)
              : content}
          </pre>
        ) : (
          <pre className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-auto max-h-[80vh] text-sm text-slate-300 whitespace-pre-wrap">
            {content}
          </pre>
        )}
      </main>
    </div>
  );
}

export default FileView;
