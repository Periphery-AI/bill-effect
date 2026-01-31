export function Timeline() {
  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button className="play-btn" aria-label="Play">
          ▶
        </button>
        <div className="timeline-track">
          <div className="timeline-progress" />
          <div className="timeline-scrubber" />
        </div>
        <span className="current-date">Jan 30, 2026</span>
      </div>
      <div className="speed-controls">
        <button className="speed-btn active">1x</button>
        <button className="speed-btn">2x</button>
        <button className="speed-btn">5x</button>
      </div>
    </div>
  );
}
