// Reducto API client for PDF text extraction
// https://docs.reducto.ai

const REDUCTO_API_KEY = import.meta.env.VITE_REDUCTO_API_KEY || '';
const REDUCTO_API_URL = 'https://platform.reducto.ai';

export interface ReductoExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extract text from a PDF using Reducto's API
 * @param file The PDF file to extract text from
 * @returns Promise<ReductoExtractionResult> The extracted text and metadata
 */
export async function extractPdfText(file: File): Promise<ReductoExtractionResult> {
  if (!REDUCTO_API_KEY) {
    throw new Error('Reducto API key not configured. Set VITE_REDUCTO_API_KEY in your .env file.');
  }

  // Step 1: Upload the file
  const formData = new FormData();
  formData.append('file', file);

  const uploadResponse = await fetch(`${REDUCTO_API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REDUCTO_API_KEY}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
  }

  const { file_id } = await uploadResponse.json();

  // Step 2: Parse the uploaded file
  const parseResponse = await fetch(`${REDUCTO_API_URL}/parse`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REDUCTO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: file_id,
    }),
  });

  if (!parseResponse.ok) {
    const errorText = await parseResponse.text();
    throw new Error(`Reducto parse failed: ${parseResponse.status} - ${errorText}`);
  }

  const parseResult = await parseResponse.json();

  // Extract text from the result
  let fullText = '';
  let pageCount = parseResult.usage?.num_pages || 0;

  // Handle the result - can be inline (FullResult) or a URL (UrlResult)
  let chunks = [];

  if (parseResult.result?.type === 'url' && parseResult.result?.url) {
    // Large documents return a presigned URL - fetch the full result
    const fullResultResponse = await fetch(parseResult.result.url);
    if (!fullResultResponse.ok) {
      throw new Error(`Failed to fetch full result: ${fullResultResponse.status}`);
    }
    const fullResult = await fullResultResponse.json();
    chunks = fullResult.chunks || [];
  } else if (parseResult.result?.chunks) {
    // Inline result
    chunks = parseResult.result.chunks;
  } else if (parseResult.result?.type === 'full' && parseResult.result?.chunks) {
    chunks = parseResult.result.chunks;
  }

  // Extract text from chunks
  for (const chunk of chunks) {
    if (chunk.content) {
      fullText += chunk.content + '\n\n';
    } else if (chunk.embed) {
      // Fallback to embed field if content is empty
      fullText += chunk.embed + '\n\n';
    } else if (chunk.blocks) {
      // Extract from blocks if no chunk-level content
      for (const block of chunk.blocks) {
        if (block.content) {
          fullText += block.content + '\n';
        }
      }
      fullText += '\n';
    }
  }

  if (!fullText.trim()) {
    throw new Error('No text could be extracted from the PDF');
  }

  return {
    text: fullText.trim(),
    pageCount: pageCount || 1,
  };
}

/**
 * Check if Reducto API is configured
 */
export function isReductoConfigured(): boolean {
  return !!REDUCTO_API_KEY;
}
