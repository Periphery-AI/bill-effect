// Grok API client for bill analysis and impact simulation
// Uses x.ai's Grok API for AI-powered analysis

import type { SimulationEvent } from '../types';

// Environment variable for API key
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY || '';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

// Use mock responses when no API key is configured
const USE_MOCK = !GROK_API_KEY;

// Types for bill analysis
export interface BillClause {
  id: string;
  title: string;
  summary: string;
  affectedStates: string[]; // State names that this clause affects
  category: 'healthcare' | 'economy' | 'environment' | 'education' | 'infrastructure' | 'defense' | 'social' | 'other';
}

export interface BillAnalysis {
  billId: string;
  title: string;
  summary: string;
  clauses: BillClause[];
  overallImpact: 'positive' | 'negative' | 'mixed' | 'neutral';
  estimatedTimeframe: {
    immediate: boolean;    // Effects within 30 days
    shortTerm: boolean;    // Effects within 1 year
    longTerm: boolean;     // Effects after 1 year
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

// API response types
interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Helper to call Grok API
async function callGrokAPI(messages: GrokMessage[]): Promise<string> {
  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-fast',
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
  }

  const data: GrokResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mock data for development
function getMockAnalysis(billText: string): BillAnalysis {
  // Extract a title from the bill text if possible
  const titleMatch = billText.match(/(?:H\.R\.|S\.|H\.J\.Res\.|S\.J\.Res\.)\s*\d+[:\s]+([^\n]+)/i)
    || billText.match(/(?:ACT|BILL)[:\s]+([^\n]+)/i);
  const title = titleMatch?.[1]?.trim() || 'Uploaded Bill';

  return {
    billId: generateId(),
    title,
    summary: 'This bill proposes changes to federal policy that will affect multiple states across the country. The legislation includes provisions for healthcare, infrastructure, and economic development.',
    clauses: [
      {
        id: generateId(),
        title: 'Healthcare Expansion',
        summary: 'Expands Medicare coverage to additional populations in underserved areas.',
        affectedStates: ['Texas', 'California', 'Florida', 'New York', 'Arizona'],
        category: 'healthcare',
      },
      {
        id: generateId(),
        title: 'Infrastructure Investment',
        summary: 'Allocates federal funds for highway and bridge repairs in rural states.',
        affectedStates: ['Montana', 'Wyoming', 'North Dakota', 'South Dakota', 'Nebraska', 'Kansas', 'Oklahoma'],
        category: 'infrastructure',
      },
      {
        id: generateId(),
        title: 'Clean Energy Initiative',
        summary: 'Provides tax incentives for renewable energy adoption.',
        affectedStates: ['California', 'Texas', 'Colorado', 'Washington', 'Oregon', 'Nevada'],
        category: 'environment',
      },
      {
        id: generateId(),
        title: 'Education Grants',
        summary: 'Creates new federal grant program for public schools.',
        affectedStates: ['Mississippi', 'Louisiana', 'Alabama', 'Arkansas', 'West Virginia', 'Kentucky'],
        category: 'education',
      },
    ],
    overallImpact: 'mixed',
    estimatedTimeframe: {
      immediate: true,
      shortTerm: true,
      longTerm: true,
    },
  };
}

function getMockEvents(analysis: BillAnalysis, dateRange: DateRange): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  const startTime = dateRange.start.getTime();
  const endTime = dateRange.end.getTime();
  const timeSpan = endTime - startTime;

  // Generate events for each clause
  analysis.clauses.forEach((clause, clauseIndex) => {
    clause.affectedStates.forEach((state, stateIndex) => {
      // Stagger events across the timeline
      const baseProgress = (clauseIndex * 0.2) + (stateIndex * 0.05);
      const eventTime = startTime + (timeSpan * Math.min(baseProgress + Math.random() * 0.1, 0.95));

      const impactTypes: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
      const impact = impactTypes[Math.floor(Math.random() * 3)];

      events.push({
        id: generateId(),
        state,
        date: new Date(eventTime),
        title: `${clause.category.charAt(0).toUpperCase() + clause.category.slice(1)} Impact in ${state}`,
        description: getEventDescription(clause, state, impact),
        impact,
      });
    });
  });

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
}

function getEventDescription(clause: BillClause, state: string, impact: 'positive' | 'negative' | 'neutral'): string {
  const descriptions: Record<string, Record<'positive' | 'negative' | 'neutral', string>> = {
    healthcare: {
      positive: `Healthcare coverage expanded in ${state}. Local hospitals report increased capacity to serve underserved communities.`,
      negative: `Healthcare providers in ${state} struggling to meet new requirements. Administrative costs increasing.`,
      neutral: `Healthcare policy changes taking effect in ${state}. Stakeholders monitoring implementation closely.`,
    },
    infrastructure: {
      positive: `Major highway repairs completed in ${state}. Commute times reduced and economic activity increasing.`,
      negative: `Infrastructure projects in ${state} facing delays and cost overruns. Traffic disruptions ongoing.`,
      neutral: `Infrastructure assessment underway in ${state}. State officials planning project priorities.`,
    },
    environment: {
      positive: `Renewable energy installations surge in ${state}. Solar and wind capacity expanding rapidly.`,
      negative: `Energy transition in ${state} causing short-term job losses in traditional sectors.`,
      neutral: `${state} evaluating clean energy options. Environmental impact studies in progress.`,
    },
    education: {
      positive: `Schools in ${state} receiving new federal funding. Teacher salaries and resources improving.`,
      negative: `Education mandates creating compliance burden for ${state} school districts.`,
      neutral: `${state} education department reviewing new grant requirements and eligibility.`,
    },
    economy: {
      positive: `Economic growth accelerating in ${state}. New businesses and jobs being created.`,
      negative: `Economic uncertainty in ${state} as businesses adapt to new regulations.`,
      neutral: `${state} businesses assessing impact of new federal policies on operations.`,
    },
    defense: {
      positive: `Defense contracts bringing jobs to ${state}. Military installations expanding.`,
      negative: `Defense budget changes affecting ${state} military communities.`,
      neutral: `${state} evaluating defense policy changes. Base assessments ongoing.`,
    },
    social: {
      positive: `Social programs in ${state} expanding services. More residents receiving assistance.`,
      negative: `Social program changes in ${state} causing adjustment challenges for beneficiaries.`,
      neutral: `${state} implementing new social program requirements. Outreach efforts underway.`,
    },
    other: {
      positive: `Policy changes bringing positive outcomes to ${state} residents.`,
      negative: `New federal requirements creating challenges for ${state} agencies.`,
      neutral: `${state} officials monitoring policy implementation and gathering feedback.`,
    },
  };

  return descriptions[clause.category]?.[impact] || descriptions.other[impact];
}

/**
 * Analyze a bill and extract its key clauses, affected states, and predicted impacts
 * @param billText The full text of the bill to analyze
 * @returns Promise<BillAnalysis> Structured analysis of the bill
 */
export async function analyzeBill(billText: string): Promise<BillAnalysis> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return getMockAnalysis(billText);
  }

  const systemPrompt = `You are an expert policy analyst. Analyze the provided congressional bill and extract structured information about its clauses, affected states, and potential impacts.

Return your analysis as a JSON object with this structure:
{
  "billId": "unique-id",
  "title": "Short title of the bill",
  "summary": "2-3 sentence summary of the bill's main purpose",
  "clauses": [
    {
      "id": "unique-id",
      "title": "Clause title",
      "summary": "Brief description of what this clause does",
      "affectedStates": ["State Name 1", "State Name 2"],
      "category": "healthcare|economy|environment|education|infrastructure|defense|social|other"
    }
  ],
  "overallImpact": "positive|negative|mixed|neutral",
  "estimatedTimeframe": {
    "immediate": true/false,
    "shortTerm": true/false,
    "longTerm": true/false
  }
}

Use full state names (e.g., "California" not "CA"). Be realistic about which states would be most affected by each clause based on the bill's provisions.`;

  const userPrompt = `Analyze this congressional bill:\n\n${billText}`;

  const response = await callGrokAPI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  // Parse the JSON response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse bill analysis response');
  }

  return JSON.parse(jsonMatch[0]) as BillAnalysis;
}

/**
 * Simulate the impacts of a bill over a date range
 * @param analysis The bill analysis from analyzeBill()
 * @param dateRange The date range to simulate
 * @returns Promise<SimulationEvent[]> Array of simulated events
 */
export async function simulateImpacts(
  analysis: BillAnalysis,
  dateRange: DateRange
): Promise<SimulationEvent[]> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getMockEvents(analysis, dateRange);
  }

  const systemPrompt = `You are an expert policy simulation engine. Based on the provided bill analysis, generate a series of realistic events that would occur as the bill takes effect across different states.

Return your simulation as a JSON array of events:
[
  {
    "id": "unique-id",
    "state": "State Name",
    "date": "YYYY-MM-DD",
    "title": "Brief event title",
    "description": "Detailed description of what happened",
    "impact": "positive|negative|neutral"
  }
]

Generate events distributed across the date range, with more events in states most affected by the bill. Events should be realistic and specific to each state's situation.`;

  const userPrompt = `Generate simulation events for this bill analysis over the period ${dateRange.start.toISOString().split('T')[0]} to ${dateRange.end.toISOString().split('T')[0]}:

${JSON.stringify(analysis, null, 2)}`;

  const response = await callGrokAPI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  // Parse the JSON response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse simulation response');
  }

  const rawEvents = JSON.parse(jsonMatch[0]) as Array<{
    id: string;
    state: string;
    date: string;
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;

  // Convert date strings to Date objects
  return rawEvents.map((event) => ({
    ...event,
    date: new Date(event.date),
  }));
}

/**
 * Check if the Grok API is configured
 * @returns boolean Whether the API key is set
 */
export function isApiConfigured(): boolean {
  return !USE_MOCK;
}
