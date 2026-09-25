import { useState, useEffect, useMemo } from 'react';
import useAuth from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DSAPreparation() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const [data, setData] = useState({
    topics: [],
    problems: [],
    progress: {
      solved: 0,
      total: 0,
      progressPercent: 0,
      solvedProblems: [],
      difficultyStats: { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } },
      score: { userScore: 0, maxScore: 0 },
    },
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDSAData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/dsa/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setData({
          topics: result.topics || [],
          problems: result.problems || [],
          progress: result.progress || {
            solved: 0,
            total: result.problems?.length || 0,
            progressPercent: 0,
            solvedProblems: [],
            difficultyStats: { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } },
            score: { userScore: 0, maxScore: 0 },
          },
        });
      } else {
        setDataError('Failed to load DSA data.');
      }
    } catch {
      setDataError('Failed to load DSA data.');
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDSAData();
    }
  }, [isAuthenticated]);

  const toggleProblemStatus = async (problemId, isSolved) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isSolved ? '/api/dsa/unsolve' : '/api/dsa/solve';

      // Optimistic UI update
      setData((prev) => {
        const solvedList = prev.progress.solvedProblems || [];
        const newSolvedProblems = isSolved
          ? solvedList.filter((id) => id !== problemId)
          : [...solvedList, problemId];

        const totalProbs = prev.problems.length;
        const newSolvedCount = newSolvedProblems.length;
        const newPercent = totalProbs > 0 ? Math.round((newSolvedCount / totalProbs) * 100) : 0;

        return {
          ...prev,
          progress: {
            ...prev.progress,
            solvedProblems: newSolvedProblems,
            solved: newSolvedCount,
            progressPercent: newPercent,
          },
        };
      });

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId }),
      });

      const result = await res.json();
      if (!result.success) {
        // Revert on failure
        fetchDSAData();
      } else {
        // Refresh accurate server state
        fetchDSAData();
      }
    } catch (error) {
      console.error('Error toggling problem status', error);
      fetchDSAData();
    }
  };

  const filteredProblems = useMemo(() => {
    const solvedList = data.progress.solvedProblems || [];
    return data.problems.filter((p) => {
      if (selectedTopic && p.topic !== selectedTopic) return false;
      if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;

      const isSolved = solvedList.includes(p.id);
      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Unsolved' && isSolved) return false;

      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [data.problems, data.progress.solvedProblems, selectedTopic, difficultyFilter, statusFilter, searchQuery]);

  // Guards
  if (isLoading || isDataLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading DSA Preparation...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }

  if (dataError) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to load DSA data.</h2>
        <p className="text-sm text-slate-600 mb-6">Please check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Try Again
        </button>
      </main>
    );
  }

  const totalProblems = data.problems.length;
  const solvedProblemsCount = data.progress.solved || 0;
  const overallProgressPercent = totalProblems > 0 ? Math.round((solvedProblemsCount / totalProblems) * 100) : 0;
  const userScore = data.progress.score?.userScore || 0;
  const maxScore = data.progress.score?.maxScore || 0;
  const difficultyStats = data.progress.difficultyStats || {
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 rounded-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">
                P
              </span>
              PrepMate
            </a>
            <span className="hidden sm:inline-block text-slate-300">/</span>
            <span className="hidden sm:inline-block text-sm font-medium text-slate-900">
              DSA Preparation
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 rounded-sm px-1"
            >
              Back to Dashboard
            </a>
            <div className="h-4 w-px bg-slate-200"></div>
            <button
              onClick={logout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 rounded-sm px-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Module Header & Progress Cards */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center border-b border-slate-100 pb-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 mb-2">Data Structures & Algorithms</h1>
              <p className="text-slate-600 text-sm leading-relaxed">
                Practice curated DSA problems directly on LeetCode. Track your progress, earn DSA points, and prepare for technical interviews.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Overall Progress */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Progress</span>
                  <span className="text-xl font-bold text-slate-950 tracking-tight">{overallProgressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden my-2">
                  <div className="h-full bg-slate-900 rounded-full transition-all duration-500" style={{ width: `${overallProgressPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>{solvedProblemsCount} Solved</span>
                  <span>{totalProblems - solvedProblemsCount} Remaining</span>
                </div>
              </div>

              {/* Card 2: DSA Score */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[200px]">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">DSA Score</div>
                <div className="flex items-baseline gap-1 text-slate-950">
                  <span className="text-2xl font-bold tracking-tight">{userScore}</span>
                  <span className="text-xs font-medium text-slate-500">/ {maxScore} pts</span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Easy = 1pt · Med = 2pts · Hard = 3pts
                </div>
              </div>

              {/* Card 3: Difficulty Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-w-[220px] space-y-1.5 text-xs">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Difficulty Solved</div>
                <div className="flex justify-between text-slate-700">
                  <span>Easy</span>
                  <span className="font-semibold text-slate-900">{difficultyStats.Easy?.solved || 0} / {difficultyStats.Easy?.total || 0}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Medium</span>
                  <span className="font-semibold text-slate-900">{difficultyStats.Medium?.solved || 0} / {difficultyStats.Medium?.total || 0}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Hard</span>
                  <span className="font-semibold text-slate-900">{difficultyStats.Hard?.solved || 0} / {difficultyStats.Hard?.total || 0}</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Topics Sidebar */}
          <aside className="lg:w-1/3 xl:w-1/4 space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-semibold text-slate-950">Topics ({data.topics.length})</h2>
              {selectedTopic && (
                <button 
                  onClick={() => setSelectedTopic(null)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400 rounded px-1 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {data.topics.map(topic => {
                const isSelected = selectedTopic === topic.id;
                const solvedCount = topic.solvedProblemsCount || 0;
                const totalCount = topic.totalProblems || 0;
                const progressVal = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
                
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(isSelected ? null : topic.id)}
                    className={`text-left p-3.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                      isSelected 
                        ? 'bg-slate-950 border-slate-950 text-white shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-900'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                        {topic.name}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
                        {solvedCount}/{totalCount}
                      </span>
                    </div>
                    <p className={`text-xs line-clamp-1 mb-2.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {topic.description}
                    </p>
                    <div className={`h-1 w-full rounded-full overflow-hidden ${isSelected ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-slate-900'}`} style={{ width: `${progressVal}%` }}></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Filter Bar & Problem Table */}
          <section className="lg:w-2/3 xl:w-3/4 flex flex-col space-y-4">
            
            {/* Filter Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors cursor-pointer"
                  aria-label="Filter by difficulty"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors cursor-pointer"
                  aria-label="Filter by status"
                >
                  <option value="All">All Status</option>
                  <option value="Solved">Solved</option>
                  <option value="Unsolved">Unsolved</option>
                </select>
              </div>
            </div>

            {/* Problem List */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-5">Problem Title</div>
                <div className="col-span-3">Topic & Difficulty</div>
                <div className="col-span-3 text-right">Action</div>
              </div>
              
              <ul className="divide-y divide-slate-100">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => {
                    const solvedList = data.progress.solvedProblems || [];
                    const isSolved = solvedList.includes(problem.id);
                    const topicName = data.topics.find((t) => t.id === problem.topic)?.name || problem.topic;

                    return (
                      <li
                        key={problem.id}
                        className="p-4 hover:bg-slate-50/80 transition-colors group flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center"
                      >
                        
                        {/* Solved Status Checkbox / Icon */}
                        <div className="col-span-1 flex justify-between sm:justify-center items-center mb-2 sm:mb-0">
                          <span className="sm:hidden text-xs font-medium text-slate-500">Status</span>
                          <button
                            onClick={() => toggleProblemStatus(problem.id, isSolved)}
                            className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
                              isSolved ? 'bg-slate-950 border-slate-950' : 'bg-white border-slate-300 hover:border-slate-500'
                            }`}
                            title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                            aria-label={isSolved ? `Mark ${problem.title} as unsolved` : `Mark ${problem.title} as solved`}
                          >
                            {isSolved && (
                              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        {/* Title & Topic */}
                        <div className="col-span-5 mb-2 sm:mb-0">
                          <span className="sm:hidden text-xs font-medium text-slate-500 block mb-1">Title</span>
                          <a
                            href={`/dsa/problem/${problem.id}`}
                            className={`text-sm font-semibold hover:underline transition-colors ${
                              isSolved ? 'text-slate-600 line-through' : 'text-slate-950'
                            }`}
                          >
                            {problem.title}
                          </a>
                          <span className="text-xs text-slate-500 block mt-0.5 sm:hidden">
                            {topicName} · {problem.difficulty}
                          </span>
                        </div>
                        
                        {/* Topic & Difficulty Badges */}
                        <div className="hidden sm:flex col-span-3 items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            problem.difficulty === 'Easy' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                            problem.difficulty === 'Medium' ? 'bg-slate-100 text-slate-900 border-slate-300' :
                            'bg-slate-900 text-white border-slate-950'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-slate-500 font-medium truncate">
                            {topicName}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="col-span-3 sm:text-right flex items-center justify-end gap-2 mt-2 sm:mt-0">
                          {isSolved ? (
                            <>
                              <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                Solved ✓
                              </span>
                              <a
                                href={`/dsa/problem/${problem.id}`}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-semibold rounded-md text-slate-800 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900 transition-colors"
                              >
                                View Details
                              </a>
                            </>
                          ) : (
                            <a
                              href={problem.leetcodeUrl || `/dsa/problem/${problem.id}`}
                              target={problem.leetcodeUrl ? "_blank" : undefined}
                              rel={problem.leetcodeUrl ? "noopener noreferrer" : undefined}
                              className="w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-1.5 border border-slate-950 shadow-sm text-xs font-semibold rounded-md text-white bg-slate-950 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-950 transition-colors"
                            >
                              Solve on LeetCode
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="p-8 text-center flex flex-col items-center justify-center">
                    <svg className="h-10 w-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-900">No problems found</p>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search query.</p>
                    {(searchQuery || difficultyFilter !== 'All' || statusFilter !== 'All' || selectedTopic) && (
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setDifficultyFilter('All');
                          setStatusFilter('All');
                          setSelectedTopic(null);
                        }}
                        className="mt-4 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </li>
                )}
              </ul>
            </div>
          </section>

        </div>
      </main>
      
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        PrepMate Placement Preparation Platform · Authenticated Session
      </footer>
    </div>
  );
}

export default DSAPreparation;
