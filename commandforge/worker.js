/**
 * CommandForge — Cloudflare Worker proxy
 * Deploy this at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 * Then add an environment variable: ANTHROPIC_API_KEY = sk-ant-...
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://landon.cool',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad request', { status: 400, headers: CORS_HEADERS });
    }

    const upstream = await fetch(ANTHROPIC_URL, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    // Stream the response straight back to the browser
    const responseHeaders = new Headers(CORS_HEADERS);
    responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'text/event-stream');

    return new Response(upstream.body, {
      status:  upstream.status,
      headers: responseHeaders,
    });
  }
};
