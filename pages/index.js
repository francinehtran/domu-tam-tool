import { useState } from 'react';
import Head from 'next/head';

const TABS = [
  { id: 'script', label: 'Script Builder', icon: '📄' },
  { id: 'qa', label: 'QA Reviewer', icon: '🔍' },
  { id: 'prompt', label: 'Prompt Fixer', icon: '🔧' },
  { id: 'ticket', label: 'Eng Ticket', icon: '🎫' },
  { id: 'compliance', label: 'Compliance', icon: '🛡️' },
  { id: 'performance', label: 'Performance', icon: '📊' },
];

const CLIENTS = [
  'First National Bank', 'Meridian Credit Union', 'Capitol Finance',
  'Apex Lending', 'Summit Collections', 'Liberty Servicing', 'Harbor Financial'
];

async function callClaude(system, user) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data.text;
}

function OutputBox({ text, placeholder }) {
  return (
    <div className="output-box">
      {text ? text : <span className="placeholder">{placeholder}</span>}
    </div>
  );
}

function RunButton({ loading, onClick, label }) {
  return (
    <button className="btn" onClick={onClick} disabled={loading}>
      {loading ? <><div className="spinner" /> Thinking...</> : label}
    </button>
  );
}

function ScriptPanel() {
  const [input, setInput] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('Collections / Payment reminder');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!input.trim()) return alert('Please paste a script first.');
    setLoading(true);
    try {
      const sys = `You are an expert voice AI prompt engineer for Domu, a company that runs enterprise voicebots for financial companies. Convert raw client call scripts into structured, production-ready voice agent prompts.

Format your output as:
1. AGENT PERSONA & TONE (2-3 sentences)
2. CALL OBJECTIVE
3. STRUCTURED CALL FLOW (step-by-step with branching logic)
4. KEY OBJECTION HANDLERS
5. COMPLIANCE & REQUIRED DISCLOSURES
6. CALL ENDINGS (success, failure, callback)

Be specific, concise, and use natural spoken language — this is for a voice bot, not a chatbot.`;
      const text = await callClaude(sys, `Client: ${client || 'the client'}\nCall Type: ${type}\n\nRaw script:\n${input}`);
      setOutput(text);
    } catch(e) { setOutput('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="panel active">
      <div className="field-group">
        <div className="field-label">Client script / raw call flow</div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={"Paste the client's existing script here — rough notes, bullet points, anything works.\n\nExample:\n- Greet customer\n- Ask about outstanding balance of $X\n- If they can't pay, offer payment plan\n- Take payment over phone..."} />
      </div>
      <div className="two-col">
        <div className="field-group">
          <div className="field-label">Client name</div>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. First National Bank" />
        </div>
        <div className="field-group">
          <div className="field-label">Call type</div>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option>Collections / Payment reminder</option>
            <option>Payment confirmation</option>
            <option>Account verification</option>
            <option>Appointment scheduling</option>
            <option>General outreach</option>
          </select>
        </div>
      </div>
      <RunButton loading={loading} onClick={run} label="✨ Generate voice agent prompt" />
      <OutputBox text={output} placeholder="Structured prompt will appear here — persona, call flow, objection handlers, and compliance disclosures..." />
    </div>
  );
}

function QAPanel() {
  const [transcript, setTranscript] = useState('');
  const [expected, setExpected] = useState('Payment collected');
  const [actual, setActual] = useState('Payment collected');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const outcomes = ['Payment collected','Payment plan set up','Callback scheduled','No contact / voicemail','Customer refused','Dispute raised'];

  async function run() {
    if (!transcript.trim()) return alert('Please paste a transcript first.');
    setLoading(true);
    try {
      const sys = `You are a QA analyst for Domu reviewing voice agent calls for enterprise financial companies.

Always output in this format:
OUTCOME ACCURACY: [Match / Mismatch — explain briefly]
ISSUE CATEGORIES DETECTED: [list any of: Wrong outcome recorded | Agent said something incorrect | Call dropped too early | Compliance risk | Objection handling failure | None]
SEVERITY: [Critical / High / Medium / Low]
SPECIFIC ISSUES: [bullet list of exact problems with timestamps if available]
RECOMMENDED ACTION: [what should be done — prompt fix, retraining, escalation, or no action]
SUMMARY: [2-sentence plain-English summary for the client]`;
      const text = await callClaude(sys, `Expected outcome: ${expected}\nRecorded outcome: ${actual}\n\nTranscript:\n${transcript}`);
      setOutput(text);
    } catch(e) { setOutput('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="panel active">
      <div className="field-group">
        <div className="field-label">Call transcript</div>
        <textarea style={{minHeight:130}} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder={"Paste the call transcript here.\n\nExample:\n[00:00] Agent: Hello, may I speak with John Smith?\n[00:04] Customer: Yes, this is John.\n[00:06] Agent: Great, I'm calling about your account balance of $450..."} />
      </div>
      <div className="two-col">
        <div className="field-group">
          <div className="field-label">Expected outcome</div>
          <select value={expected} onChange={e => setExpected(e.target.value)}>
            {outcomes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="field-group">
          <div className="field-label">Recorded outcome in system</div>
          <select value={actual} onChange={e => setActual(e.target.value)}>
            {outcomes.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <RunButton loading={loading} onClick={run} label="🔍 Analyze call quality" />
      <OutputBox text={output} placeholder="QA analysis will appear here — issue categorization, severity rating, and recommendations..." />
    </div>
  );
}

function PromptPanel() {
  const [issue, setIssue] = useState('');
  const [current, setCurrent] = useState('');
  const [transcript, setTranscript] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!issue.trim()) return alert('Please describe the issue first.');
    setLoading(true);
    try {
      const sys = `You are a senior voice AI engineer at Domu. You diagnose why voice agents underperform and rewrite prompts to fix specific issues.

Output format:
ROOT CAUSE: [what is causing the problem]
WHAT THE AGENT IS DOING WRONG: [specific behavior]
UPDATED PROMPT SECTION: [rewritten prompt — ready to use]
WHAT CHANGED: [brief explanation of changes and why they fix the issue]
TEST SUGGESTION: [how to verify the fix on live calls]`;
      const text = await callClaude(sys, `Issue: ${issue}\n\nCurrent prompt:\n${current || '(not provided)'}\n\nFlagged transcript:\n${transcript || '(not provided)'}`);
      setOutput(text);
    } catch(e) { setOutput('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="panel active">
      <div className="field-group">
        <div className="field-label">Client complaint / issue description</div>
        <textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe what the client reported. E.g.: 'The agent gives up too quickly when the customer says they can't pay today. It should offer more options before ending the call.'" />
      </div>
      <div className="field-group">
        <div className="field-label">Current agent prompt (relevant section)</div>
        <textarea value={current} onChange={e => setCurrent(e.target.value)} placeholder="Paste the relevant part of the current prompt here..." />
      </div>
      <div className="field-group">
        <div className="field-label">Example flagged transcript (optional)</div>
        <textarea style={{minHeight:80}} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Paste a call where this went wrong (optional but helps)..." />
      </div>
      <RunButton loading={loading} onClick={run} label="🔧 Diagnose & fix prompt" />
      <OutputBox text={output} placeholder="Diagnosis + updated prompt will appear here..." />
    </div>
  );
}

function TicketPanel() {
  const [client, setClient] = useState('');
  const [priority, setPriority] = useState('P2 — High (within 24h)');
  const [request, setRequest] = useState('');
  const [currentBehavior, setCurrentBehavior] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!request.trim()) return alert('Please describe the change request first.');
    setLoading(true);
    try {
      const sys = `You are a Technical Account Manager at Domu creating engineering tickets. Write clear, developer-ready tickets.

Use this exact format:
TICKET TITLE: [concise action title]
CLIENT: [client name]
PRIORITY: [priority level]
DESCRIPTION: [2-3 sentence context]
CURRENT BEHAVIOR: [what happens today]
DESIRED BEHAVIOR: [what should happen after the change]
ACCEPTANCE CRITERIA:
- [ ] criterion 1
- [ ] criterion 2
- [ ] criterion 3
TECHNICAL NOTES: [implementation hints, edge cases, constraints]
ESTIMATED IMPACT: [how many calls/week affected, what metric improves]`;
      const text = await callClaude(sys, `Client: ${client || 'Client'}\nPriority: ${priority}\nChange requested: ${request}\nCurrent behavior: ${currentBehavior || 'not specified'}`);
      setOutput(text);
    } catch(e) { setOutput('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="panel active">
      <div className="two-col">
        <div className="field-group">
          <div className="field-label">Client</div>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Meridian Credit Union" />
        </div>
        <div className="field-group">
          <div className="field-label">Priority</div>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>P1 — Critical (same day)</option>
            <option>P2 — High (within 24h)</option>
            <option>P3 — Medium (this sprint)</option>
            <option>P4 — Low (backlog)</option>
          </select>
        </div>
      </div>
      <div className="field-group">
        <div className="field-label">Change requested by client</div>
        <textarea value={request} onChange={e => setRequest(e.target.value)} placeholder="Describe what the client wants in plain language. E.g.: 'Add ACH bank transfer as a new payment option. The agent should collect routing number and account number when customer selects bank transfer.'" />
      </div>
      <div className="field-group">
        <div className="field-label">Current behavior (if relevant)</div>
        <input type="text" value={currentBehavior} onChange={e => setCurrentBehavior(e.target.value)} placeholder="e.g. Currently only credit/debit card payment is supported" />
      </div>
      <RunButton loading={loading} onClick={run} label="🎫 Generate engineering ticket" />
      <OutputBox text={output} placeholder="A structured engineering ticket with acceptance criteria will appear here..." />
    </div>
  );
}

function CompliancePanel() {
  const [transcript, setTranscript] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('FDCPA violation (collections)');
  const [escalated, setEscalated] = useState('Client compliance team');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!transcript.trim()) return alert('Please paste the flagged transcript first.');
    setLoading(true);
    try {
      const sys = `You are a compliance specialist at Domu reviewing voice agent calls for regulatory violations in financial services (FDCPA, TCPA, CFPB guidelines).

Output format:
VIOLATION ASSESSMENT: [Confirmed violation | Potential violation | No violation found]
SPECIFIC PROBLEMATIC STATEMENT(S): [quote exact lines from the transcript]
APPLICABLE REGULATION: [which law or rule was potentially violated]
RISK LEVEL: [Critical / High / Medium / Low]
INVESTIGATION FINDINGS: [3-5 bullet summary]
RECOMMENDED IMMEDIATE ACTIONS: [what needs to happen now]
CLIENT RESPONSE DRAFT: [ready-to-send email addressing the concern professionally]`;
      const text = await callClaude(sys, `Client/Region: ${client || 'not specified'}\nConcern type: ${type}\nEscalated by: ${escalated}\n\nTranscript:\n${transcript}`);
      setOutput(text);
    } catch(e) { setOutput('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="panel active">
      <div className="field-group">
        <div className="field-label">Flagged call transcript</div>
        <textarea style={{minHeight:120}} value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Paste the transcript of the call that raised the compliance concern..." />
      </div>
      <div className="two-col">
        <div className="field-group">
          <div className="field-label">Client / region</div>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Capitol Finance — Texas" />
        </div>
        <div className="field-group">
          <div className="field-label">Concern type</div>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option>FDCPA violation (collections)</option>
            <option>TCPA violation (calling hours/consent)</option>
            <option>Misrepresentation</option>
            <option>Disclosure not given</option>
            <option>Threatening or abusive language</option>
            <option>Other / unknown</option>
          </select>
        </div>
      </div>
      <div className="field-group">
        <div className="field-label">Who escalated this?</div>
        <select value={escalated} onChange={e => setEscalated(e.target.value)}>
          <option>Client compliance team</option>
          <option>End customer complaint</option>
          <option>Internal QA flag</option>
          <option>Regulatory inquiry</option>
        </select>
      </div>
      <RunButton loading={loading} onClick={run} label="🛡️ Investigate & draft response" />
      <OutputBox text={output} placeholder="Compliance investigation summary and client response draft will appear here..." />
    </div>
  );
}

function PerformancePanel() {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [total, setTotal] = useState('');
  const [answered, setAnswered] = useState('');
  const [payments, setPayments] = useState('');
  const [failed, setFailed] = useState('');
  const [notes, setNotes] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!total && !answered) return alert('Please enter at least some call data.');
    setLoading(true);
    try {
      const sys = `You are a Technical Account Manager at Domu preparing a weekly performance summary for an enterprise financial client. Be analytical, data-driven, and action-oriented.

Output format:
WEEKLY SNAPSHOT: [3-sentence executive summary with the most important numbers]
KEY METRICS:
- Answer rate: X%
- Payment conversion rate: X% (of answered calls)
- Drop/failure rate: X%
- Overall conversion rate: X% (of all attempts)
PERFORMANCE VS BENCHMARK: [strong / average / below target — with context]
INSIGHTS: [2-3 bullet observations]
RECOMMENDED ACTIONS: [1-3 specific things to do this week]
CLIENT-READY SUMMARY: [3-4 sentences to send directly to the client contact]`;
      const week = new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
      const text = await callClaude(sys, `Client: ${selectedClient}\nWeek: ${week}\n\nCall data:\n- Total attempts: ${total || 'not provided'}\n- Answered/connected: ${answered || 'not provided'}\n- Payments collected: ${payments || 'not provided'}\n- Failed/dropped: ${failed || 'not provided'}\n\nContext: ${notes || 'none'}`);
      setOutput(text);
    } catch(e) { setOutput('Error: ' + e.message); }
    setLoading(false);
  }

  return (
    <div className="panel active">
      <div className="field-group">
        <div className="field-label">Select client</div>
        <div className="clients-row">
          {CLIENTS.map(c => (
            <div key={c} className={`client-pill${selectedClient === c ? ' active' : ''}`} onClick={() => setSelectedClient(c)}>{c}</div>
          ))}
        </div>
      </div>
      <div className="grid-2">
        <div className="metric-card">
          <div className="m-label">Total calls this week</div>
          <input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="e.g. 12400" />
        </div>
        <div className="metric-card">
          <div className="m-label">Answered / connected</div>
          <input type="number" value={answered} onChange={e => setAnswered(e.target.value)} placeholder="e.g. 5800" />
        </div>
        <div className="metric-card">
          <div className="m-label">Payments collected</div>
          <input type="number" value={payments} onChange={e => setPayments(e.target.value)} placeholder="e.g. 1240" />
        </div>
        <div className="metric-card">
          <div className="m-label">Failed / dropped calls</div>
          <input type="number" value={failed} onChange={e => setFailed(e.target.value)} placeholder="e.g. 340" />
        </div>
      </div>
      <div className="field-group">
        <div className="field-label">Context / notes</div>
        <textarea style={{minHeight:70}} value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g. Payment rate dropped vs last week. Holiday weekend. New script deployed Monday." />
      </div>
      <RunButton loading={loading} onClick={run} label="📊 Generate performance summary" />
      <OutputBox text={output} placeholder="Executive summary with insights and recommended actions will appear here..." />
    </div>
  );
}

const PANELS = { script: ScriptPanel, qa: QAPanel, prompt: PromptPanel, ticket: TicketPanel, compliance: CompliancePanel, performance: PerformancePanel };

export default function Home() {
  const [activeTab, setActiveTab] = useState('script');
  const ActivePanel = PANELS[activeTab];

  return (
    <>
      <Head>
        <title>Domu TAM Command Center</title>
        <meta name="description" content="Voice agent operations tool for Domu Technical Account Managers" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%231a1a2e'/><text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' fill='%237F77DD' font-size='14' font-weight='600' font-family='sans-serif'>DM</text></svg>" />
      </Head>
      <div className="app">
        <div className="header">
          <div className="logo"><span>DM</span></div>
          <div className="header-text">
            <h1>TAM Command Center</h1>
            <p>Domu — Voice Agent Operations</p>
          </div>
          <div className="status">
            <div className="dot" />
            <span className="status-label">7 clients live</span>
          </div>
        </div>
        <div className="tabs">
          {TABS.map(t => (
            <div key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </div>
          ))}
        </div>
        <ActivePanel />
      </div>
    </>
  );
}
