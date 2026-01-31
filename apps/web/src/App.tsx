import { useMemo, useState, useCallback } from 'react';
import { BillInput, MapView, Timeline } from './components';
import { useEvents, usePlayback, useBill, useEventActions } from './store';
import { analyzeBill, simulateImpacts } from './api';

export default function App() {
  const bill = useBill();
  const events = useEvents();
  const playback = usePlayback();
  const { addEvents, clearEvents } = useEventActions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter events to only show those up to the current playback date
  const visibleEvents = useMemo(() => {
    return events.filter((event) => new Date(event.date) <= playback.currentDate);
  }, [events, playback.currentDate]);

  // Start simulation: analyze bill and generate events
  const handleSimulationStart = useCallback(async () => {
    if (!bill) {
      setError('No bill loaded');
      return;
    }

    // Clear any previous simulation
    clearEvents();
    setError(null);
    setIsAnalyzing(true);

    try {
      // Analyze the bill
      const analysis = await analyzeBill(bill.content);

      // Generate simulation events
      const simulatedEvents = await simulateImpacts(analysis, {
        start: playback.startDate,
        end: playback.endDate,
      });

      // Add events to store
      addEvents(simulatedEvents);

      setIsAnalyzing(false);
    } catch (err) {
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Failed to analyze bill');
    }
  }, [bill, playback.startDate, playback.endDate, clearEvents, addEvents]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="eyebrow">Bill Effect</div>
        <h1>Model the ripple effects of a bill</h1>
      </header>

      <main className="main-layout">
        <aside className="left-panel">
          <BillInput />
          {error && (
            <div className="error-message" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}
        </aside>

        <section className="center-panel">
          <MapView events={visibleEvents} />
        </section>
      </main>

      <footer className="bottom-panel">
        <Timeline
          onSimulationStart={handleSimulationStart}
          isAnalyzing={isAnalyzing}
          hasBill={bill !== null}
          hasEvents={events.length > 0}
        />
      </footer>
    </div>
  );
}
