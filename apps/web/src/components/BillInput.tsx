import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useBill, useBillActions } from '../store';
import { extractPdfText, isReductoConfigured } from '../api/reducto';
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
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      if (!isReductoConfigured()) {
        setError('PDF processing requires a Reducto API key. Set VITE_REDUCTO_API_KEY in your .env file.');
        return;
      }

      setIsProcessingPdf(true);
      try {
        const result = await extractPdfText(file);
        parseTextContent(result.text, file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract text from PDF');
      } finally {
        setIsProcessingPdf(false);
      }
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

  const handleReset = useCallback(() => {
    setLocalBill(null);
    clearBill();
    setError(null);
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
        <div className="bill-summary">
          <div className="bill-loaded-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="bill-loaded-message">PDF contents extracted</div>
          <div className="bill-title">{bill.title}</div>
          {bill.filename && (
            <div className="bill-filename">{bill.filename}</div>
          )}
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
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isProcessingPdf ? 'processing' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          {isProcessingPdf ? (
            <>
              <div className="processing-spinner">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <p>Extracting text from PDF...</p>
              <p className="file-types">This may take a moment for large documents</p>
            </>
          ) : (
            <>
              <div className="drop-icon">📄</div>
              <p>Drag & drop a bill file here</p>
              <p className="file-types">.pdf, .txt, .md files supported</p>
              <button type="button" className="browse-button" onClick={handleBrowseClick}>
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,text/plain,application/pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}
