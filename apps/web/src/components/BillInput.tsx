export function BillInput() {
  return (
    <div className="bill-input">
      <h2>Bill Input</h2>
      <div className="drop-zone">
        <p>Drag & drop a bill (PDF/TXT)</p>
        <p className="or-divider">or</p>
        <textarea
          placeholder="Paste bill text here..."
          rows={8}
        />
      </div>
    </div>
  );
}
