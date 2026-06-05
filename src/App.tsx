import { useMemo, useState } from 'react';
import './styles.css';
import { buildStarterPrompt, capabilityGroups, OWNER_EMAIL, sendChat, type AgentMode, type ChatMessage } from './agent';

const starterMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'HEYDUDE cloud console is online. Desktop-sensitive actions stay on your local runner; cloud chat and planning run through Cloudflare.',
  },
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<AgentMode>('cloud');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = useMemo(() => messages[messages.length - 1], [messages]);

  async function submit(message = draft) {
    const clean = message.trim();
    if (!clean || busy) return;
    setDraft('');
    setBusy(true);
    setError(null);
    const next = [...messages, { role: 'user' as const, content: clean }];
    setMessages(next);
    try {
      const reply = await sendChat(clean, messages);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'chat_failed';
      setError(reason);
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            'Cloud chat is not reachable from this browser session yet. Confirm Cloudflare Access and the Pages Function deployment.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="brandRow">
          <div className="brandMark">HD</div>
          <div>
            <p className="eyeline">Owner-only AI command center</p>
            <h1>HEYDUDE</h1>
          </div>
        </div>
        <p className="heroCopy">
          A controlled digital worker for desktop commands, cloud chat, Google Drive knowledge, website generation,
          code work, deployment support, and business automation.
        </p>
        <div className="ownerCard">
          <span>Creator</span>
          <strong>{OWNER_EMAIL}</strong>
        </div>
      </section>

      <section className="workspace">
        <aside className="controlPanel" aria-label="HEYDUDE modes">
          <h2>Mission Modes</h2>
          {(['cloud', 'desktop', 'drive', 'website'] as AgentMode[]).map((entry) => (
            <button
              type="button"
              className={entry === mode ? 'mode active' : 'mode'}
              onClick={() => {
                setMode(entry);
                setDraft(buildStarterPrompt(entry));
              }}
              key={entry}
            >
              <strong>{entry}</strong>
              <span>{buildStarterPrompt(entry)}</span>
            </button>
          ))}
        </aside>

        <section className="chatPanel" aria-label="HEYDUDE chat">
          <div className="chatHeader">
            <div>
              <h2>Command Channel</h2>
              <span>{busy ? 'Thinking...' : `Latest: ${latest?.role ?? 'assistant'}`}</span>
            </div>
            <div className="statusPill">Owner locked</div>
          </div>
          <div className="messages">
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </article>
            ))}
            {error ? <div className="errorBox">{error}</div> : null}
          </div>
          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label htmlFor="command">Command HEYDUDE</label>
            <textarea
              id="command"
              value={draft}
              placeholder="Tell HEYDUDE what to plan, build, save, check, or deploy..."
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
            <button type="submit" disabled={busy || draft.trim().length === 0}>
              {busy ? 'Running' : 'Send'}
            </button>
          </form>
        </section>
      </section>

      <section className="capabilities">
        {capabilityGroups.map((group) => (
          <article className="capability" key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
