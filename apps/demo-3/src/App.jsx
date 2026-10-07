import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Streamdown } from 'streamdown';
import 'streamdown/styles.css';
import { sampleMarkdown } from './sampleMarkdown';
import './App.css';

function App() {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(30);
  const intervalRef = useRef(null);

  const tokens = sampleMarkdown.split('');

  const startStream = () => {
    setStreamedText('');
    setTokenIndex(0);
    setIsStreaming(true);
  };

  const pauseStream = () => {
    setIsStreaming(false);
  };

  const resumeStream = () => {
    setIsStreaming(true);
  };

  useEffect(() => {
    if (isStreaming && tokenIndex < tokens.length) {
      const interval = 1000 / tokensPerSecond;
      intervalRef.current = setTimeout(() => {
        setStreamedText(prev => prev + tokens[tokenIndex]);
        setTokenIndex(prev => prev + 1);
      }, interval);
    } else if (tokenIndex >= tokens.length) {
      setIsStreaming(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isStreaming, tokenIndex, tokensPerSecond, tokens]);

  const naiveHtml = streamedText ? marked.parse(streamedText, { async: false }) : '';

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Streaming Markdown Rendering</h1>
          <p className="subtitle">
            Side-by-side comparison: naive re-render vs. Vercel's streamdown
          </p>
        </div>
      </header>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="speed">
            Stream Speed: {tokensPerSecond} tokens/sec
          </label>
          <input
            id="speed"
            type="range"
            min="5"
            max="100"
            value={tokensPerSecond}
            onChange={(e) => setTokensPerSecond(Number(e.target.value))}
            disabled={isStreaming}
          />
        </div>

        <div className="control-buttons">
          {!isStreaming || tokenIndex >= tokens.length ? (
            <button onClick={startStream} className="btn-primary">
              {tokenIndex >= tokens.length ? 'Replay' : 'Start'}
            </button>
          ) : (
            <button onClick={pauseStream} className="btn-secondary">
              Pause
            </button>
          )}
          {!isStreaming && tokenIndex > 0 && tokenIndex < tokens.length && (
            <button onClick={resumeStream} className="btn-primary">
              Resume
            </button>
          )}
        </div>

        <div className="progress">
          Progress: {tokenIndex} / {tokens.length} characters
          {tokenIndex >= tokens.length && tokenIndex > 0 && ' (Complete)'}
        </div>
      </div>

      <div className="panes">
        <div className="pane">
          <div className="pane-header">
            <h2>Naive re-render</h2>
            <span className="pane-label">marked.parse() on every token</span>
          </div>
          <div 
            className="pane-content naive-content"
            dangerouslySetInnerHTML={{ __html: naiveHtml }}
          />
        </div>

        <div className="pane">
          <div className="pane-header">
            <h2>Streamdown</h2>
            <span className="pane-label">Repairs incomplete markdown</span>
          </div>
          <div className="pane-content streamdown-content">
            <Streamdown animated isAnimating={isStreaming}>
              {streamedText}
            </Streamdown>
          </div>
        </div>
      </div>

      <footer className="footer">
        <a href="https://github.com/timrodz/tech-demos" target="_blank" rel="noopener noreferrer">
          View source on GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
