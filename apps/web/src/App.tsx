import { BillInput, MapView, Timeline } from './components';

export default function App() {
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
          <MapView />
        </section>
      </main>

      <footer className="bottom-panel">
        <Timeline />
      </footer>
    </div>
  );
}
