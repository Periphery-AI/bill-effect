import { useMemo } from 'react';
import { BillInput, MapView, Timeline } from './components';
import { useEvents, usePlayback } from './store';

export default function App() {
  const events = useEvents();
  const playback = usePlayback();

  // Filter events to only show those up to the current playback date
  const visibleEvents = useMemo(() => {
    return events.filter((event) => new Date(event.date) <= playback.currentDate);
  }, [events, playback.currentDate]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="eyebrow">Bill Effect</div>
        <h1>Model the ripple effects of a bill</h1>
      </header>

      <main className="main-layout">
        <aside className="left-panel">
          <BillInput />
        </aside>

        <section className="center-panel">
          <MapView events={visibleEvents} />
        </section>
      </main>

      <footer className="bottom-panel">
        <Timeline />
      </footer>
    </div>
  );
}
