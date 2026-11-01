module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const { COUNTERAPI_TOKEN, COUNTERAPI_WORKSPACE } = process.env;

  if (!COUNTERAPI_TOKEN || !COUNTERAPI_WORKSPACE) {
    console.error('Visitor counter is not configured. Set COUNTERAPI_TOKEN and COUNTERAPI_WORKSPACE.');
    return response.status(503).json({ error: 'Visitor counter is not configured.' });
  }

  const endpoint = `https://api.counterapi.dev/v2/${encodeURIComponent(COUNTERAPI_WORKSPACE)}/first-counter-6106/up`;

  try {
    const counterResponse = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${COUNTERAPI_TOKEN}`
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!counterResponse.ok) {
      console.error(`CounterAPI request failed with status ${counterResponse.status}.`);
      return response.status(502).json({
        error: 'CounterAPI rejected the visitor-count request.',
        upstreamStatus: counterResponse.status
      });
    }

    const result = await counterResponse.json();
    const value = result.data?.up_count;

    if (!Number.isSafeInteger(value) || value < 0) {
      console.error('CounterAPI returned an invalid visitor count.');
      return response.status(502).json({ error: 'CounterAPI returned an invalid visitor count.' });
    }

    return response.status(200).json({ value });
  } catch (error) {
    console.error('CounterAPI request failed.', error);
    return response.status(502).json({ error: 'Unable to reach CounterAPI.' });
  }
};
