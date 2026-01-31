export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="eyebrow">Bill Effect</div>
        <h1>Model the ripple effects of a bill.</h1>
        <p>
          Prototype a simulation loop: propose a bill, generate predicted
          reactions, then chain the consequences.
        </p>
        <div className="pill-row">
          <span className="pill">Model: Grok</span>
          <span className="pill">Backend: Opencode</span>
          <span className="pill">Mode: Ralph Loop</span>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>1. Seed bill</h2>
          <p>Describe the bill and the initial political context.</p>
          <div className="placeholder">Policy prompt goes here</div>
        </section>

        <section className="card">
          <h2>2. Predict effects</h2>
          <p>Generate immediate reactions and measurable outcomes.</p>
          <div className="placeholder">Short-term outcomes</div>
        </section>

        <section className="card">
          <h2>3. Branch scenarios</h2>
          <p>Each effect becomes a new node in the chain.</p>
          <div className="placeholder">Scenario tree</div>
        </section>

        <section className="card">
          <h2>4. Iterate</h2>
          <p>Run the loop, add one step per iteration.</p>
          <div className="placeholder">Ralph step output</div>
        </section>
      </main>
    </div>
  );
}
