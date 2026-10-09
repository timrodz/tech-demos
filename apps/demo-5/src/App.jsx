import { useCallback, useEffect, useRef, useState } from 'react';
import { FIELD_KEYS, FIELD_META, hydratePartial } from './schema';
import { itinerary, recordedJson } from './itinerary';
import { streamObject } from './stream';
import './App.css';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function formatDate(value) {
  if (typeof value !== 'string' || value.length < 10) return value ?? '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return value;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function formatPrice(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return value == null ? '' : String(value);
  }
  return `NZ$${value.toLocaleString('en-NZ')}`;
}

function FieldValue({ arrived, children }) {
  if (!arrived) {
    return <span className="slot-pending" aria-hidden="true">—</span>;
  }
  return <span className="slot-live">{children}</span>;
}

function App() {
  const [mode, setMode] = useState('char');
  const [speed, setSpeed] = useState(36);
  const [rawJson, setRawJson] = useState('');
  const [partial, setPartial] = useState({});
  const [status, setStatus] = useState('idle');
  const [runId, setRunId] = useState(0);
  const abortRef = useRef(null);
  const speedRef = useRef(speed);
  const modeRef = useRef(mode);
  const autoStarted = useRef(false);

  speedRef.current = speed;
  modeRef.current = mode;

  const resetView = useCallback(() => {
    setRawJson('');
    setPartial({});
  }, []);

  const startStream = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    resetView();
    setStatus('streaming');
    setRunId((id) => id + 1);

    const getIntervalMs = () => {
      const current = speedRef.current;
      if (modeRef.current === 'key') {
        return Math.round(1400 / Math.max(1, current / 8));
      }
      return Math.round(1000 / Math.max(4, current));
    };

    try {
      await streamObject({
        source: itinerary,
        recordedJson,
        mode: modeRef.current,
        getIntervalMs,
        signal: controller.signal,
        onPartial: ({ object, text }) => {
          setPartial(hydratePartial(object));
          setRawJson(text);
        }
      });
      if (!controller.signal.aborted) {
        setStatus('complete');
        setPartial(hydratePartial(itinerary));
        setRawJson(JSON.stringify(itinerary, null, 2));
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setStatus('idle');
      }
    }
  }, [resetView]);

  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    startStream();
    return () => abortRef.current?.abort();
  }, [startStream]);

  const fields = hydratePartial(partial);
  const arrivedCount = FIELD_KEYS.filter((key) => fields[key] != null && fields[key] !== '').length;
  const destinationArrived = Boolean(fields.destination);
  const outboundArrived = Boolean(fields.outboundDate);
  const returnArrived = Boolean(fields.returnDate);
  const cabinArrived = Boolean(fields.cabinClass);
  const passengersArrived = fields.passengers != null;
  const seatArrived = Boolean(fields.seatPreference);
  const priceArrived = fields.totalPriceNzd != null;
  const codeArrived = Boolean(fields.confirmationCode);

  const speedLabel = mode === 'key'
    ? `${Math.max(1, Math.round(speed / 8))} keys/s`
    : `${speed} chars/s`;

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <a className="back" href="/">Tech Demos</a>
          <p className="header-note">Client-only streamObject · no API keys</p>
        </div>
        <h1>Progressive structured object streaming</h1>
        <p className="lede">
          A Zod-shaped itinerary arrives as partial JSON. The typed card hydrates
          field by field — reserved slots wait for keys that have not landed yet.
        </p>
      </header>

      <section className="controls" aria-label="Stream controls">
        <div className="control">
          <label htmlFor="speed">Stream speed · {speedLabel}</label>
          <input
            id="speed"
            type="range"
            min={8}
            max={80}
            step={1}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </div>

        <div className="control control-actions">
          <button type="button" className="btn-primary" onClick={startStream}>
            {status === 'idle' ? 'Start' : 'Replay'}
          </button>
        </div>

        <fieldset className="control control-mode">
          <legend>Chunking</legend>
          <label>
            <input
              type="radio"
              name="chunking"
              value="char"
              checked={mode === 'char'}
              disabled={status === 'streaming'}
              onChange={() => setMode('char')}
            />
            Character stream
          </label>
          <label>
            <input
              type="radio"
              name="chunking"
              value="key"
              checked={mode === 'key'}
              disabled={status === 'streaming'}
              onChange={() => setMode('key')}
            />
            Key at a time
          </label>
        </fieldset>

        <p className="meter" aria-live="polite">
          {status === 'idle' && 'Ready'}
          {status === 'streaming' && `${arrivedCount} / ${FIELD_KEYS.length} fields · streaming`}
          {status === 'complete' && `${FIELD_KEYS.length} / ${FIELD_KEYS.length} fields · complete`}
        </p>
      </section>

      <main className="stage">
        <article className="pass" aria-live="polite" key={runId}>
          <div className="pass-main">
            <h2 className="destination">
              <FieldValue arrived={destinationArrived}>{fields.destination}</FieldValue>
            </h2>
            <p className="dates">
              <span>
                <span className="field-label">{FIELD_META.outboundDate.label}</span>
                <FieldValue arrived={outboundArrived}>{formatDate(fields.outboundDate)}</FieldValue>
              </span>
              <span>
                <span className="field-label">{FIELD_META.returnDate.label}</span>
                <FieldValue arrived={returnArrived}>{formatDate(fields.returnDate)}</FieldValue>
              </span>
            </p>
            <dl className="facts">
              <div>
                <dt>{FIELD_META.cabinClass.label}</dt>
                <dd><FieldValue arrived={cabinArrived}>{fields.cabinClass}</FieldValue></dd>
              </div>
              <div>
                <dt>{FIELD_META.passengers.label}</dt>
                <dd><FieldValue arrived={passengersArrived}>{fields.passengers}</FieldValue></dd>
              </div>
              <div>
                <dt>{FIELD_META.seatPreference.label}</dt>
                <dd><FieldValue arrived={seatArrived}>{fields.seatPreference}</FieldValue></dd>
              </div>
              <div>
                <dt>{FIELD_META.totalPriceNzd.label}</dt>
                <dd className="price">
                  <FieldValue arrived={priceArrived}>{formatPrice(fields.totalPriceNzd)}</FieldValue>
                </dd>
              </div>
            </dl>
          </div>
          <div className="pass-stub">
            <p className="stub-label">{FIELD_META.confirmationCode.label}</p>
            <p className="stub-code">
              <FieldValue arrived={codeArrived}>{fields.confirmationCode}</FieldValue>
            </p>
          </div>
        </article>

        <aside className="json-panel">
          <h2>Partial object</h2>
          <pre className="json-display">
            <code>{rawJson || '{\n  \n}'}</code>
          </pre>
        </aside>
      </main>

      <footer className="footer">
        <a href="https://github.com/timrodz/tech-demos" target="_blank" rel="noopener noreferrer">
          View source on GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
