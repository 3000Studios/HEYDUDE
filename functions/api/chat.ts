type Env = {
  AI?: Ai;
  OWNER_ADMIN_EMAIL?: string;
  ACCESS_REQUIRED?: string;
};

type IncomingMessage = {
  role?: string;
  content?: string;
};

type ChatBody = {
  message?: string;
  history?: IncomingMessage[];
};

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, cf-access-jwt-assertion, x-owner-email',
};

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null, { headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ownerEmail = env.OWNER_ADMIN_EMAIL || 'mr.jwswain@gmail.com';
  const accessRequester =
    request.headers.get('cf-access-authenticated-user-email') ||
    request.headers.get('cf-access-user-email');
  const requester =
    env.ACCESS_REQUIRED === '1' ? accessRequester : accessRequester || request.headers.get('x-owner-email');

  if (requester?.trim().toLowerCase() !== ownerEmail.toLowerCase()) {
    return json({ error: 'owner_email_required' }, 403);
  }

  const body = (await request.json().catch(() => null)) as ChatBody | null;
  const message = body?.message?.trim();
  if (!message) return json({ error: 'message_required' }, 400);
  if (message.length > 2000) return json({ error: 'message_too_long' }, 400);

  const messages = [
    {
      role: 'system',
      content:
        `You are HEYDUDE, a private owner-only AI command center for ${ownerEmail}. ` +
        'Be direct, production-minded, safe, and honest about which actions require the local desktop runner. ' +
        'Never expose secrets. Never claim destructive or production actions happened unless a tool result proves it.',
    },
    ...(body?.history ?? [])
      .slice(-10)
      .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
      .map((entry) => ({ role: entry.role, content: String(entry.content || '').slice(0, 2000) })),
    { role: 'user', content: message },
  ];

  if (!env.AI) {
    return json({
      reply:
        'HEYDUDE Pages Function is live, but Workers AI is not bound on this environment yet. The UI and owner gate are working.',
    });
  }

  const ai = env.AI as unknown as {
    run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string } | string>;
  };
  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages,
    max_tokens: 700,
  });
  const reply = typeof result === 'string' ? result : result.response;
  return json({ reply: reply || 'No response returned from Workers AI.' });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders },
  });
}
