import { useState, useEffect, useRef } from 'react';
import { Renderer, JSONUIProvider } from '@json-render/react';
import { registry } from './registry';
import { validSpec, invalidComponentSpec } from './spec';
import './App.css';

function App() {
  const [streamedJson, setStreamedJson] = useState('');
  const [parsedSpec, setParsedSpec] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(30);
  const [injectInvalid, setInjectInvalid] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [elementKeys, setElementKeys] = useState([]);
  const intervalRef = useRef(null);

  const fullJson = JSON.stringify(validSpec, null, 2);
  const chars = fullJson.split('');

  const startStream = () => {
    setStreamedJson('');
    setParsedSpec(null);
    setCharIndex(0);
    setIsStreaming(true);
    setRejectionNote('');
    setElementKeys([]);
  };

  useEffect(() => {
    if (isStreaming && charIndex < chars.length) {
      const interval = 1000 / tokensPerSecond;
      intervalRef.current = setTimeout(() => {
        const nextChar = chars[charIndex];
        const newJson = streamedJson + nextChar;
        setStreamedJson(newJson);
        setCharIndex(prev => prev + 1);

        const builtSpec = {
          root: 'dashboard',
          elements: {}
        };
        
        const allKeys = Object.keys(validSpec.elements);
        const progressRatio = charIndex / chars.length;
        const numKeysToShow = Math.max(2, Math.ceil(progressRatio * allKeys.length * 1.2));
        const currentKeys = allKeys.slice(0, Math.min(numKeysToShow, allKeys.length));
        
        currentKeys.forEach(key => {
          const element = { ...validSpec.elements[key] };
          
          if (element.children) {
            element.children = element.children.filter(childKey => 
              currentKeys.includes(childKey)
            );
          }
          
          builtSpec.elements[key] = element;
        });

        if (injectInvalid && progressRatio >= 0.6 && progressRatio < 0.65) {
          builtSpec.elements.invalidComponent = invalidComponentSpec;
          if (builtSpec.elements.dashboard) {
            builtSpec.elements.dashboard = {
              ...builtSpec.elements.dashboard,
              children: [...builtSpec.elements.dashboard.children, 'invalidComponent']
            };
          }
          setRejectionNote('⚠️ Guardrail active: InvalidWidget component rejected (not in catalog)');
        }

        setParsedSpec(builtSpec);
        setElementKeys(currentKeys);
      }, interval);
    } else if (charIndex >= chars.length) {
      setIsStreaming(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isStreaming, charIndex, tokensPerSecond, streamedJson, chars, injectInvalid]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Guardrailed Generative UI</h1>
          <p className="subtitle">
            Watch AI-style JSON stream into a live dashboard—catalog-constrained components only
          </p>
        </div>
      </header>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="speed">
            Stream Speed: {tokensPerSecond} chars/sec
          </label>
          <input
            id="speed"
            type="range"
            min="10"
            max="100"
            value={tokensPerSecond}
            onChange={(e) => setTokensPerSecond(Number(e.target.value))}
            disabled={isStreaming}
          />
        </div>

        <div className="control-buttons">
          <button 
            onClick={startStream} 
            className="btn-primary"
            disabled={isStreaming}
          >
            {charIndex >= chars.length && charIndex > 0 ? 'Replay' : 'Start Stream'}
          </button>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={injectInvalid}
              onChange={(e) => setInjectInvalid(e.target.checked)}
              disabled={isStreaming}
            />
            <span>Inject invalid component (test guardrail)</span>
          </label>
        </div>

        <div className="progress">
          {charIndex > 0 && (
            <>
              Progress: {charIndex} / {chars.length} characters
              {charIndex >= chars.length && ' (Complete)'}
            </>
          )}
        </div>
      </div>

      {rejectionNote && (
        <div className="rejection-note">{rejectionNote}</div>
      )}

      <div className="demo-container">
        <div className="panel rendered-panel">
          <div className="panel-header">
            <h2>Rendered UI</h2>
            <span className="panel-label">Progressive rendering from streaming JSON</span>
          </div>
          <div className="panel-content">
            {parsedSpec ? (
              <JSONUIProvider registry={registry}>
                <Renderer spec={parsedSpec} registry={registry} />
              </JSONUIProvider>
            ) : (
              <div className="placeholder">Stream will appear here...</div>
            )}
          </div>
        </div>

        <div className="panel json-panel">
          <div className="panel-header">
            <h2>Streaming JSON</h2>
            <span className="panel-label">Raw specification as it arrives</span>
          </div>
          <div className="panel-content">
            <pre className="json-display">
              <code>{streamedJson || '// Waiting for stream...'}</code>
            </pre>
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
