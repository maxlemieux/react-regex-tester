import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchType, setMatchType] = useState('match');
  const [examples, setExamples] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Load example patterns
    setExamples([
      { 
        name: 'Email validation', 
        pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`,
        text: 'test@example.com\ninvalid-email\nanother.valid@email.co.uk' 
      },
      { 
        name: 'URL parsing', 
        pattern: `https?://(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)`,
        text: 'https://golang.org\nhttp://www.example.com/path?query=value\nnot-a-url' 
      },
      { 
        name: 'Capturing groups', 
        pattern: `(\\d{4})-(\\d{2})-(\\d{2})`,
        text: 'Date: 2023-09-15\nAnother date: 2022-01-30' 
      },
      { 
        name: 'Word boundaries', 
        pattern: `\\bgo\\b`,
        text: 'go golang going ego go' 
      },
      { 
        name: 'Named capture groups', 
        pattern: `(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})`,
        text: '2023-09-15' 
      }
    ]);
  }, []);

  const testRegex = async () => {
    if (!pattern.trim()) {
      toast.error('Please enter a regex pattern');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/test-regex', {
        pattern,
        text,
        matchType
      });
      setResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example) => {
    setPattern(example.pattern);
    setText(example.text);
    setMatchType('findAllSubmatch');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
      <header className={`py-4 ${darkMode ? 'bg-gray-800' : 'bg-blue-600 text-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Go Regex Tester</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <a 
                href="https://golang.org/pkg/regexp/syntax/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-sm ${darkMode ? 'text-blue-300 hover:text-blue-200' : 'text-white hover:text-blue-100'}`}
              >
                Go Regex Syntax Reference
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with examples */}
          <div className={`col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
            <h2 className="text-xl font-semibold mb-4">Examples</h2>
            <ul className="space-y-2">
              {examples.map((example, index) => (
                <li key={index}>
                  <button 
                    onClick={() => loadExample(example)}
                    className={`w-full text-left p-2 rounded text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 focus:bg-gray-700' 
                        : 'hover:bg-gray-100 focus:bg-gray-100'
                    }`}
                  >
                    {example.name}
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Match Type</h2>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="matchType" 
                    value="match" 
                    checked={matchType === 'match'} 
                    onChange={() => setMatchType('match')}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  />
                  <span>Simple Match</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="matchType" 
                    value="findSubmatch" 
                    checked={matchType === 'findSubmatch'} 
                    onChange={() => setMatchType('findSubmatch')}
                  />
                  <span>Find Submatch</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="matchType" 
                    value="findAllSubmatch" 
                    checked={matchType === 'findAllSubmatch'} 
                    onChange={() => setMatchType('findAllSubmatch')}
                  />
                  <span>Find All Submatches</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="col-span-1 md:col-span-3 space-y-6">
<textarea
  className="w-full h-16 p-2 border rounded"
  value={pattern}
  onChange={(e) => setPattern(e.target.value)}
  placeholder="Enter regex pattern here"
/>

<textarea
  className="w-full h-48 p-2 border rounded" 
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Enter test text here"
/>
            <div className="flex justify-center">
              <button
                onClick={testRegex}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  loading 
                    ? (darkMode ? 'bg-gray-600' : 'bg-gray-400') 
                    : (darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700 text-white')
                }`}
              >
                {loading ? 'Testing...' : 'Test Regex'}
              </button>
            </div>

            {/* Results */}
            {(result || error) && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                
                {error && (
                  <div className={`p-4 rounded ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} text-red-600`}>
                    <pre className="whitespace-pre-wrap">{error}</pre>
                  </div>
                )}
                
                {result && (
                  <div className="space-y-4">
                    <div className={`p-3 rounded ${
                      result.matches 
                        ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') 
                        : (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                    }`}>
                      <span className="font-medium">Pattern {result.matches ? 'matches' : 'does not match'} the text</span>
                    </div>
                    
                    {result.allMatches && result.allMatches.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">All Matches:</h3>
                        <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <ul className="list-disc list-inside space-y-1">
                            {result.allMatches.map((match, i) => (
                              <li key={i}><code>{match}</code></li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {result.subMatches && result.subMatches.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Submatches:</h3>
                        <div className={`p-3 rounded overflow-x-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <table className="w-full table-auto">
                            <thead>
                              <tr className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                <th className="px-2 py-1 text-left">Match</th>
                                <th className="px-2 py-1 text-left">Capturing Groups</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.subMatches.map((matchGroup, i) => (
                                <tr key={i} className={`${darkMode ? 'border-gray-600' : 'border-gray-200'} border-b`}>
                                  <td className="px-2 py-2">
                                    <code>{matchGroup[0]}</code>
                                  </td>
                                  <td className="px-2 py-2">
                                    {matchGroup.slice(1).map((group, j) => (
                                      <div key={j} className="mb-1">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mr-2`}>
                                          Group {j+1}:
                                        </span> 
                                        <code>{group}</code>
                                      </div>
                                    ))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`py-4 mt-8 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Go Regex Tester - A tool for testing Go-flavored regular expressions</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

