import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DSAPractice() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Extract problemId from pathname: /dsa/problem/:problemId
  const pathParts = window.location.pathname.split('/');
  const problemId = pathParts[3] || null;

  const [problem, setProblem] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch problem data
  useEffect(() => {
    if (!isAuthenticated || !problemId) return;
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/dsa/problems/${problemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
          setIsSolved(data.isSolved);
        } else {
          setPageError(data.error || 'Failed to load problem.');
        }
      } catch {
        setPageError('Failed to load problem details.');
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchProblem();
  }, [isAuthenticated, problemId]);

  const handleMarkSolved = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/dsa/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSolved(true);
        setActionMessage('Marked as solved!');
      } else {
        setActionMessage(data.error || 'Failed to update status.');
      }
    } catch {
      setActionMessage('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnsolved = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/dsa/unsolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSolved(false);
        setActionMessage('Marked as unsolved.');
      } else {
        setActionMessage(data.error || 'Failed to update status.');
      }
    } catch {
      setActionMessage('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Guards ----
  if (isLoading || isPageLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading problem details...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }

  if (pageError || !problem) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{pageError || 'Problem not found.'}</h2>
        <p className="text-sm text-slate-500 mb-6">The requested problem could not be found or loaded.</p>
        <a
          href="/dsa"
          className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Back to DSA Module
        </a>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <a
              href="/dashboard"
              className="flex-shrink-0 inline-flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 rounded-md"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-bold text-white" aria-hidden="true">
                P
              </span>
              <span className="hidden sm:inline">PrepMate</span>
            </a>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <a
              href="/dsa"
              className="hidden sm:inline text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-sm"
            >
              DSA
            </a>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-sm font-medium text-slate-900 truncate max-w-[180px] sm:max-w-xs">
              {problem.title}
            </span>
            {isSolved && (
              <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                ✓ Solved
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dsa"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-sm px-1"
            >
              Back to Problems
            </a>
            <div className="h-4 w-px bg-slate-200"></div>
            <button
              onClick={logout}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-sm px-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title & Metadata Header */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                problem.difficulty === 'Easy'
                  ? 'bg-slate-50 text-slate-700 border-slate-300'
                  : problem.difficulty === 'Medium'
                  ? 'bg-slate-100 text-slate-900 border-slate-400'
                  : 'bg-slate-900 text-white border-slate-950'
              }`}
            >
              {problem.difficulty}
            </span>
            <span className="text-xs font-medium text-slate-500 capitalize bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {problem.topic}
            </span>
            {isSolved ? (
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Solved
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                Unsolved
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            {problem.title}
          </h1>
        </div>

        {/* Practice on LeetCode Banner / Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Practice on LeetCode</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Read the full question and solve it directly on LeetCode's official platform.
              </p>
            </div>
            {problem.leetcodeUrl ? (
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <span>Solve on LeetCode</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span className="text-xs font-medium text-slate-500 italic bg-white px-3 py-1.5 rounded-md border border-slate-200">
                LeetCode URL not available
              </span>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <p className="leading-relaxed max-w-xl">
              Coding and submission are handled by LeetCode. PrepMate tracks your progress after you mark the problem as solved.
            </p>
            <span className="text-[11px] font-medium text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap self-start sm:self-center">
              Not verified automatically by PrepMate
            </span>
          </div>
        </div>

        {/* Problem Statement & Description */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Problem Description</h2>
            <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed space-y-2">
              {problem.statement.split('\n').map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Examples</h2>
              <div className="space-y-3">
                {problem.examples.map((eg, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs sm:text-sm space-y-2">
                    <div className="font-mono text-slate-800">
                      <span className="font-semibold text-slate-500 font-sans mr-2">Input:</span>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{eg.input}</code>
                    </div>
                    <div className="font-mono text-slate-800">
                      <span className="font-semibold text-slate-500 font-sans mr-2">Output:</span>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{eg.output}</code>
                    </div>
                    {eg.explanation && (
                      <div className="text-slate-600 pt-1 border-t border-slate-200/60 text-xs">
                        <span className="font-semibold text-slate-500 mr-1">Explanation:</span>
                        {eg.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Constraints</h2>
              <ul className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5 text-xs text-slate-700 font-mono">
                {problem.constraints.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 select-none">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Solved Status & Action Controls */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Update Problem Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark your status after completing your solution on LeetCode.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isSolved ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                    <svg className="w-4 h-4 mr-1.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Solved ✓
                  </span>
                  <button
                    onClick={handleMarkUnsolved}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                  >
                    {actionLoading ? 'Updating...' : 'Mark as Unsolved'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleMarkSolved}
                  disabled={actionLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{actionLoading ? 'Updating...' : "I've Solved This"}</span>
                </button>
              )}
            </div>
          </div>

          {actionMessage && (
            <p className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              {actionMessage}
            </p>
          )}
        </div>

      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        PrepMate Placement Preparation Platform · Authenticated Session
      </footer>
    </div>
  );
}

export default DSAPractice;
