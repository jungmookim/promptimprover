'use client';

import { useState, useEffect } from 'react';
import PromptCard from '@/components/PromptCard';
import HistorySection from '@/components/HistorySection';

interface PromptVersion {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
  thumbsUp?: boolean | null;
}

export default function Home() {
  const [initialPrompt, setInitialPrompt] = useState('');
  const [currentVersion, setCurrentVersion] = useState<PromptVersion | null>(null);
  const [improvedVersion, setImprovedVersion] = useState<PromptVersion | null>(null);
  const [feedback, setFeedback] = useState('');
  const [history, setHistory] = useState<PromptVersion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showEmptyPromptError, setShowEmptyPromptError] = useState(false);
  const [currentModel] = useState('gpt-3.5-turbo');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [changesAnalysis, setChangesAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editedImprovedPrompt, setEditedImprovedPrompt] = useState('');
  const [isPromptEdited, setIsPromptEdited] = useState(false);

  const loadingMessages = [
    'Improving...',
    'Reticulating splines...',
    'Optimizing entropy buffers...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating || isImproving) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isImproving, loadingMessages.length]);

  const handleStartOver = () => {
    setInitialPrompt('');
    setCurrentVersion(null);
    setImprovedVersion(null);
    setFeedback('');
    setHistory([]);
    setHasStarted(false);
    setShowEmptyPromptError(false);
  };

  const generateResponse = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate response');
    }
    
    const data = await response.json();
    return data.response;
  };

  const improvePrompt = async (currentPrompt: string, feedback: string, thumbsUp?: boolean): Promise<string> => {
    const response = await fetch('/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPrompt, feedback, thumbsUp }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to improve prompt');
    }
    
    const data = await response.json();
    return data.improvedPrompt;
  };

  const analyzeChanges = async (originalPrompt: string, improvedPrompt: string): Promise<string> => {
    const response = await fetch('/api/analyze-changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalPrompt, improvedPrompt }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze changes');
    }
    
    const data = await response.json();
    return data.analysis;
  };

  const handleStartGeneration = async () => {
    if (!initialPrompt.trim()) {
      setShowEmptyPromptError(true);
      setTimeout(() => setShowEmptyPromptError(false), 300);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate both original response and improved prompt in parallel
      const [response, improvedPrompt] = await Promise.all([
        generateResponse(initialPrompt),
        improvePrompt(initialPrompt, '')
      ]);

      // Generate response for the improved prompt
      const improvedResponse = await generateResponse(improvedPrompt);

      // Only set state once ALL API calls are complete
      const baseId = Date.now();
      const newVersion: PromptVersion = {
        id: `${baseId}-current`,
        prompt: initialPrompt,
        response,
        timestamp: new Date(),
      };
      
      const newImprovedVersion: PromptVersion = {
        id: `${baseId}-improved`,
        prompt: improvedPrompt,
        response: improvedResponse,
        timestamp: new Date(),
      };
      
      // Analyze changes before showing the interface
      setIsAnalyzing(true);
      let analysis = '';
      try {
        analysis = await analyzeChanges(initialPrompt, improvedPrompt);
      } catch (error) {
        console.error('Error analyzing changes:', error);
      }

      // Set everything at once for snappy transition - ALL API calls complete
      setCurrentVersion(newVersion);
      setImprovedVersion(newImprovedVersion);
      setChangesAnalysis(analysis);
      
      // Initialize edit state
      setEditedImprovedPrompt(improvedPrompt);
      setIsPromptEdited(false);
      
      // All API calls are complete, show the interface
      setIsGenerating(false);
      setIsAnalyzing(false);
      setHasStarted(true);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
      setIsGenerating(false);
    }
  };


  const handleGenerateImprovement = async () => {
    if (!currentVersion) return;
    
    setIsImproving(true);
    setImprovedVersion(null);
    
    try {
      const improved = await improvePrompt(currentVersion.prompt, feedback, currentVersion.thumbsUp ?? undefined);
      const response = await generateResponse(improved);
      
      const newImprovedVersion: PromptVersion = {
        id: `${Date.now()}-improved`,
        prompt: improved,
        response,
        timestamp: new Date(),
      };
      
      // Set state after both API calls complete
      setImprovedVersion(newImprovedVersion);
      setIsImproving(false);
      
      // Initialize edit state
      setEditedImprovedPrompt(improved);
      setIsPromptEdited(false);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
      setIsImproving(false);
    }
  };

  const handleAcceptRevision = async (feedbackText?: string) => {
    // If no improved version exists, generate one (this handles the empty state case)
    if (!improvedVersion && currentVersion) {
      setIsImproving(true);
      setIsAnalyzing(true);
      try {
        // Complete all API calls before showing anything
        const improved = await improvePrompt(currentVersion.prompt, feedbackText || '');
        const [response, analysis] = await Promise.all([
          generateResponse(improved),
          analyzeChanges(currentVersion.prompt, improved)
        ]);
        
        const newImprovedVersion: PromptVersion = {
          id: `${Date.now()}-improved`,
          prompt: improved,
          response,
          timestamp: new Date(),
        };

        // All API calls complete, set everything atomically
        setImprovedVersion(newImprovedVersion);
        setChangesAnalysis(analysis);
        setEditedImprovedPrompt(improved);
        setIsPromptEdited(false);
        setIsImproving(false);
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Error:', error);
        alert(error instanceof Error ? error.message : 'An error occurred');
        setIsImproving(false);
        setIsAnalyzing(false);
      }
      setFeedback('');
      return;
    }

    // Normal flow when improved version exists
    if (!improvedVersion || !currentVersion) return;
    
    // If the prompt was edited or there's feedback, generate improvement first
    if (isPromptEdited || feedbackText?.trim()) {
      setIsImproving(true);
      try {
        // Use edited prompt if available, otherwise use current improved prompt
        const promptToImprove = isPromptEdited ? editedImprovedPrompt : improvedVersion.prompt;
        const improved = await improvePrompt(promptToImprove, feedbackText || '');
        const response = await generateResponse(improved);
        
        const newImprovedVersion: PromptVersion = {
          id: `${Date.now()}-improved`,
          prompt: improved,
          response,
          timestamp: new Date(),
        };
        
        // Update everything at once after API calls complete
        setHistory(prev => [currentVersion, ...prev]);
        setCurrentVersion({
          ...improvedVersion,
          prompt: promptToImprove // Use the edited prompt as the new current version
        });
        setImprovedVersion(newImprovedVersion);
        setIsImproving(false);
        
        // Initialize edit state for new improved version
        setEditedImprovedPrompt(improved);
        setIsPromptEdited(false);
      } catch (error) {
        console.error('Error:', error);
        alert(error instanceof Error ? error.message : 'An error occurred');
        setIsImproving(false);
      }
    } else {
      // No feedback and no edits - just accept immediately
      setHistory(prev => [currentVersion, ...prev]);
      setCurrentVersion(improvedVersion);
      setImprovedVersion(null);
    }
    
    setFeedback('');
  };

  const handleRejectRevision = () => {
    if (!improvedVersion) return;
    
    // Check if there are unsaved edits
    if (isPromptEdited) {
      const confirmed = window.confirm("You'll lose your edits if you continue.");
      if (!confirmed) {
        return; // User cancelled, don't reject
      }
    }
    
    // Move improved version to history
    setHistory(prev => [improvedVersion, ...prev]);
    setImprovedVersion(null);
    setFeedback('');
    
    // Reset edit state
    setIsPromptEdited(false);
    setEditedImprovedPrompt('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Prompt Improver
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your prompts with AI-powered suggestions and real-time improvements
          </p>
        </div>

        {!hasStarted && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="initial-prompt" className="block text-lg font-semibold text-gray-900 mb-3">
                    Enter your prompt
                  </label>
                  <textarea
                    id="initial-prompt"
                    value={initialPrompt}
                    onChange={(e) => {
                      setInitialPrompt(e.target.value);
                      if (showEmptyPromptError) setShowEmptyPromptError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleStartGeneration();
                      }
                    }}
                    placeholder="Write your prompt here... (Ctrl+Enter to improve)"
                    className={`w-full h-48 p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 transition-all duration-200 ${
                      showEmptyPromptError 
                        ? 'border-gray-400 bg-gray-100 placeholder-gray-400' 
                        : 'border-gray-200 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-xs text-gray-400">
                    Model: {currentModel}
                  </div>
                  <button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    className={`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg ${
                      showEmptyPromptError ? 'animate-rubber-band' : ''
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="w-44 overflow-hidden">
                          <span className={`inline-block whitespace-nowrap ${
                            loadingMessages[loadingMessageIndex].length > 25 ? 'animate-rubber-band-scroll' : ''
                          }`}>
                            {loadingMessages[loadingMessageIndex]}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Improve Prompt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasStarted && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleStartOver}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/70 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Start Over</span>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {currentVersion && (
                <PromptCard
                  title="Current Version"
                  prompt={currentVersion.prompt}
                  response={currentVersion.response}
                  isLoading={isGenerating}
                />
              )}

              <PromptCard
                title="Improved Version"
                prompt={isPromptEdited ? editedImprovedPrompt : (improvedVersion?.prompt || '')}
                response={improvedVersion?.response || ''}
                isLoading={isImproving}
                isImproved={true}
                onAccept={handleAcceptRevision}
                onReject={handleRejectRevision}
                feedback={feedback}
                onFeedbackChange={setFeedback}
                changesAnalysis={changesAnalysis}
                isAnalyzing={isAnalyzing}
                onPromptEdit={(editedPrompt) => {
                  setEditedImprovedPrompt(editedPrompt);
                  // Check if the edited prompt is different from the original
                  setIsPromptEdited(editedPrompt !== (improvedVersion?.prompt || ''));
                }}
                isPromptEdited={isPromptEdited}
                loadingMessageIndex={loadingMessageIndex}
              />
            </div>

            <div className="text-center mb-6">
              <div className="text-xs text-gray-400">
                Model: {currentModel}
              </div>
            </div>



            <HistorySection history={history} />
          </>
        )}
      </div>
    </div>
  );
}