// Cloudflare Worker: turns a feedback form post into a GitHub issue.
// Secrets: GITHUB_TOKEN (fine-grained, Issues: read/write on the feedback repo).
// Variables: REPO (owner/repo), ORIGIN (the site, e.g. https://qrkboard.github.io).
// Optional secret: TURNSTILE_SECRET (Cloudflare Turnstile) to block bots.
const LABELS = { bug: 'bug', feature: 'enhancement' };

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ORIGIN,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    const reply = (status, msg) => new Response(JSON.stringify({ ok: status === 200, message: msg }),
      { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return reply(405, 'POST only');
    if (req.headers.get('Origin') !== env.ORIGIN) return reply(403, 'Not allowed');

    let f;
    try { f = await req.json(); } catch { return reply(400, 'Bad request'); }
    if (f.website) return reply(200, 'Thanks'); // honeypot: bots fill it in
    const type = LABELS[f.type] ? f.type : 'bug';
    const title = String(f.title || '').trim().slice(0, 120);
    const a = String(f.a || '').trim().slice(0, 4000);
    const b = String(f.b || '').trim().slice(0, 4000);
    const device = String(f.device || '').trim().slice(0, 200);
    if (!title || !a) return reply(400, 'Add a summary and details');

    if (env.TURNSTILE_SECRET) {
      const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(f.token || '') }),
      });
      if (!(await r.json()).success) return reply(400, 'Check failed, try again');
    }

    const labels = type === 'bug' ? ['bug', 'from-website'] : ['enhancement', 'from-website'];
    const body = `### ${type === 'bug' ? 'What happened?' : 'What would you like?'}\n${a}\n\n` +
      `### ${type === 'bug' ? 'What did you expect?' : 'Why would it help?'}\n${b || '-'}\n\n` +
      `### Device and app version\n${device || '-'}\n`;
    const r = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'qrk-board-feedback',
      },
      body: JSON.stringify({ title, body, labels }),
    });
    return r.ok ? reply(200, 'Thanks, we got it') : reply(502, `Could not send, try again later (GitHub ${r.status})`);
  },
};
