export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AgentMode = 'desktop' | 'cloud' | 'drive' | 'website';

export const OWNER_EMAIL =
  import.meta.env.VITE_OWNER_ADMIN_EMAIL?.toString() || 'mr.jwswain@gmail.com';

export const API_BASE = import.meta.env.VITE_API_BASE_URL?.toString() || '/api';

export const capabilityGroups = [
  {
    title: 'Desktop Runner',
    items: ['Voice wake word', 'Local app control', 'File operations', 'Terminal commands', 'Screenshots', 'Approval gates'],
  },
  {
    title: 'Cloud Agent',
    items: ['Owner-only chat', 'Workers AI', 'Cloudflare Pages', 'D1 memory', 'Access policies', 'Audit-ready routes'],
  },
  {
    title: 'Google Drive',
    items: ['Knowledge base', 'Chat exports', 'Project archives', 'Generated reports', 'Timestamped backups'],
  },
  {
    title: 'Website Builder',
    items: ['Landing pages', 'SEO metadata', 'Responsive UI', 'Cloudflare deploys', 'Approval before production'],
  },
];

export function buildStarterPrompt(mode: AgentMode): string {
  const labels: Record<AgentMode, string> = {
    desktop: 'Check my local DUDE desktop runner health and next actions.',
    cloud: 'Summarize the HEYDUDE cloud deployment status.',
    drive: 'Save this as durable DUDE knowledge: 3000 Studios uses Google Drive for archives.',
    website: 'Plan a premium local service landing page and list the files you would create.',
  };
  return labels[mode];
}

export async function sendChat(message: string, history: ChatMessage[]): Promise<string> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-owner-email': OWNER_EMAIL,
    },
    body: JSON.stringify({ message, history: history.slice(-10) }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `chat_failed_${response.status}`);
  }
  const body = (await response.json()) as { reply?: string };
  return body.reply || 'No reply returned.';
}
