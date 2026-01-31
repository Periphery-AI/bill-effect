import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useBill, useBillActions } from '../store';
import type { Bill } from '../types';

interface ParsedBill {
  title: string;
  content: string;
  filename?: string;
}

export function BillInput() {
  const storedBill = useBill();
  const { setBill: setStoreBill, clearBill } = useBillActions();
  const [localBill, setLocalBill] = useState<ParsedBill | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use stored bill if available, otherwise use local bill
  const bill = storedBill ? {
    title: storedBill.title,
    content: storedBill.content,
    filename: undefined,
  } : localBill;

  // Helper to save bill to store
  const saveBillToStore = useCallback((parsedBill: ParsedBill) => {
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      title: parsedBill.title,
      content: parsedBill.content,
      uploadedAt: new Date(),
    };
    setStoreBill(newBill);
  }, [setStoreBill]);

  const extractTitle = (content: string): string => {
    // Try to extract title from common bill formats
    const lines = content.trim().split('\n');

    // Look for a line that starts with "H.R.", "S.", or contains "ACT" or "BILL"
    for (const line of lines.slice(0, 10)) {
      const trimmed = line.trim();
      if (trimmed.match(/^(H\.R\.|S\.|H\.J\.Res\.|S\.J\.Res\.)/i)) {
        return trimmed.slice(0, 100);
      }
      if (trimmed.match(/(ACT|BILL)/i) && trimmed.length > 10 && trimmed.length < 150) {
        return trimmed;
      }
    }

    // Fallback: use first non-empty line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5) {
        return trimmed.slice(0, 100) + (trimmed.length > 100 ? '...' : '');
      }
    }

    return 'Untitled Bill';
  };

  const parseTextContent = useCallback((content: string, filename?: string) => {
    if (!content.trim()) {
      setError('The file appears to be empty');
      return;
    }

    const title = extractTitle(content);
    const parsedBill = {
      title,
      content: content.trim(),
      filename,
    };
    setLocalBill(parsedBill);
    saveBillToStore(parsedBill);
    setError(null);
  }, [saveBillToStore]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    if (file.type === 'application/pdf') {
      // For PDFs, we'd need a PDF parsing library
      // For now, show a message that PDF support is coming
      setError('PDF support coming soon. Please paste the bill text directly for now.');
      return;
    }

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      try {
        const content = await file.text();
        parseTextContent(content, file.name);
      } catch {
        setError('Failed to read the file. Please try pasting the content instead.');
      }
      return;
    }

    // Try to read as text anyway
    try {
      const content = await file.text();
      if (content && content.trim()) {
        parseTextContent(content, file.name);
      } else {
        setError('Could not read file content. Please paste the bill text directly.');
      }
    } catch {
      setError('Unsupported file format. Please use .txt files or paste text directly.');
    }
  }, [parseTextContent]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content.trim()) {
      parseTextContent(content);
    } else {
      setLocalBill(null);
      clearBill();
      setError(null);
    }
  }, [parseTextContent, clearBill]);

  const handleReset = useCallback(() => {
    setLocalBill(null);
    clearBill();
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearBill]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Show summary view when bill is loaded
  if (bill) {
    return (
      <div className="bill-input">
        <h2>Bill Loaded</h2>
        <div className="bill-summary">
          <div className="bill-title">{bill.title}</div>
          {bill.filename && (
            <div className="bill-filename">Source: {bill.filename}</div>
          )}
          <div className="bill-stats">
            {bill.content.length.toLocaleString()} characters
            {' • '}
            {bill.content.split(/\s+/).length.toLocaleString()} words
          </div>
          <div className="bill-preview">
            {bill.content.slice(0, 300)}
            {bill.content.length > 300 && '...'}
          </div>
          <button className="reset-button" onClick={handleReset}>
            Load Different Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bill-input">
      <h2>Bill Input</h2>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📄</div>
          <p>Drag & drop a bill file here</p>
          <p className="file-types">.txt, .md files supported</p>
          <button type="button" className="browse-button" onClick={handleBrowseClick}>
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,text/plain"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <p className="or-divider">or paste text below</p>

      <textarea
        ref={textareaRef}
        className="bill-textarea"
        placeholder="Paste bill text here..."
        rows={8}
        onChange={handleTextChange}
      />

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}
