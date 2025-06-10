'use client';

import { useEffect, useRef } from 'react';

interface PromptCardProps {
  title: string;
  prompt: string;
  response: string;
  isLoading?: boolean;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onAccept?: (feedback?: string) => void;
  onReject?: () => void;
  thumbsUp?: boolean | null;
  isImproved?: boolean;
  feedback?: string;
  onFeedbackChange?: (feedback: string) => void;
  changesAnalysis?: string;
  isAnalyzing?: boolean;
  onPromptEdit?: (editedPrompt: string) => void;
  isPromptEdited?: boolean;
  loadingMessageIndex?: number;
}

export default function PromptCard({
  title,
  prompt,
  response,
  isLoading = false,
  onThumbsUp,
  onThumbsDown,
  onAccept,
  onReject,
  thumbsUp,
  isImproved = false,
  feedback = '',
  onFeedbackChange,
  changesAnalysis,
  isAnalyzing = false,
  onPromptEdit,
  isPromptEdited = false,
  loadingMessageIndex = 0,
}: PromptCardProps) {
  const loadingMessages = [
    'Improving...',
    'Reticulating splines...',
    'Optimizing entropy buffers...'
  ];

  const promptSectionRef = useRef<HTMLDivElement>(null);
  const responseSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to prompt section when new content loads for improved version
  useEffect(() => {
    if (isImproved && !isLoading && prompt && promptSectionRef.current) {
      promptSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [isImproved, isLoading, prompt]);

  // Scroll response textbox to top when new response content loads
  useEffect(() => {
    if (!isLoading && response && responseSectionRef.current) {
      responseSectionRef.current.scrollTop = 0;
    }
  }, [isLoading, response]);
  return (
    <div className={`p-6 rounded-lg border-2 ${
      isImproved ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
    } shadow-sm flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isImproved ? 'text-blue-700' : 'text-gray-800'
        }`}>
          {title}
        </h3>
      </div>
      
      <div className="flex flex-col flex-1 space-y-4">
        {!prompt && isImproved && !isLoading ? (
          <div className="text-center py-12 flex-1 flex flex-col justify-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No improvement yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Add any feedback below and click "Improve Prompt" to create a better version of your prompt.
            </p>
          </div>
        ) : !prompt && isImproved && isLoading ? (
          <div className="text-center py-12 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Generating improvement...</h3>
          </div>
        ) : (
          <>
            <div ref={promptSectionRef}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Prompt:</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>{prompt.length} chars</span>
                  {prompt.length > 500 && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="relative mb-4">
                {isImproved && onPromptEdit ? (
                  <textarea
                    value={prompt}
                    onChange={(e) => onPromptEdit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        onAccept?.(feedback);
                      }
                    }}
                    className={`w-full overflow-y-auto p-3 bg-white rounded-lg text-sm text-gray-800 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
                      prompt.length < 100 ? 'min-h-[120px]' : 
                      prompt.length < 300 ? 'min-h-[140px] max-h-60' : 
                      'min-h-[160px] max-h-80'
                    }`}
                    placeholder="Edit your improved prompt..."
                  />
                ) : (
                  <div className={`overflow-y-auto p-3 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap border border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
                    prompt.length < 100 ? 'min-h-[60px]' : 
                    prompt.length < 300 ? 'min-h-[80px] max-h-32' : 
                    'min-h-[100px] max-h-40'
                  }`}>
                    {prompt}
                  </div>
                )}
                {prompt.length > 200 && !isImproved && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none rounded-b-lg"></div>
                )}
              </div>
              
              {isImproved && (changesAnalysis || isAnalyzing) && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">What changed:</h4>
                    {isAnalyzing && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                    )}
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-sm text-gray-700 border border-yellow-200">
                    {isAnalyzing ? (
                      <div className="text-gray-500">Analyzing improvements...</div>
                    ) : (
                      <div className="whitespace-pre-wrap">{changesAnalysis}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Response:</h4>
                <div className="text-xs text-gray-400">
                  <span>{response.length} chars</span>
                </div>
              </div>
              <div className="relative flex-1">
                <div ref={responseSectionRef} className={`overflow-y-auto p-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
                  isImproved ? 'h-48' : 
                  response.length < 200 ? 'min-h-[120px] max-h-48' :
                  response.length < 500 ? 'min-h-[160px] max-h-64' :
                  'min-h-[200px] max-h-80'
                }`}>
                  {isLoading && !isImproved ? (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{response}</div>
                  )}
                </div>
                {response.length > 300 && !isLoading && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none rounded-b-lg"></div>
                )}
              </div>
            </div>
          </>
        )}
        
        {isImproved && (onAccept || onReject) && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional feedback (optional):
              </label>
              <textarea
                value={feedback}
                onChange={(e) => onFeedbackChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    onAccept?.(feedback);
                  }
                }}
                placeholder="Describe how you'd like this prompt to be further improved... (Ctrl+Enter to submit)"
                className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onAccept?.(feedback)}
                disabled={isLoading}
                className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="w-32 overflow-hidden">
                      <span className={`inline-block whitespace-nowrap ${
                        loadingMessages[loadingMessageIndex].length > 15 ? 'animate-rubber-band-scroll' : ''
                      }`}>
                        {loadingMessages[loadingMessageIndex]}
                      </span>
                    </div>
                  </div>
                ) : (
                  !prompt ? 'Improve Prompt' : 
                  (isPromptEdited || feedback.trim()) ? 'Improve Prompt' : 'Accept Revision'
                )}
              </button>
              {prompt && (
                <button
                  onClick={onReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Reject Revision
                </button>
              )}
            </div>
          </div>
        )}
        {!isImproved && (onThumbsUp || onThumbsDown) && !isLoading && (
          <div className="flex space-x-2 pt-2">
            <button
              onClick={onThumbsUp}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                thumbsUp === true
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600'
              }`}
            >
              <span>👍</span>
              <span>Good</span>
            </button>
            <button
              onClick={onThumbsDown}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                thumbsUp === false
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600'
              }`}
            >
              <span>👎</span>
              <span>Poor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}