'use client';

import { useState } from 'react';

interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
  thumbsUp?: boolean | null;
}

interface HistorySectionProps {
  history: HistoryItem[];
}

export default function HistorySection({ history }: HistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border rounded-lg bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-800">
          History ({history.length} versions)
        </h3>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="border-t">
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {history.map((item, index) => (
              <div key={item.id} className="border rounded p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Version {history.length - index}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {item.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-medium text-gray-600">Prompt:</h5>
                      <button
                        onClick={() => copyToClipboard(item.prompt, item.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
                      >
                        {copiedId === item.id ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 bg-white p-2 rounded text-ellipsis overflow-hidden">
                      {item.prompt.length > 200 
                        ? `${item.prompt.substring(0, 200)}...` 
                        : item.prompt
                      }
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1">Response:</h5>
                    <p className="text-sm text-gray-800 bg-white p-2 rounded">
                      {item.response.length > 200 
                        ? `${item.response.substring(0, 200)}...` 
                        : item.response
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}