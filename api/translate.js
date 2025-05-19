export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, to } = req.body;

  if (!text || !to) {
    return res.status(400).json({ error: 'Missing text or target language' });
  }

  try {
    const params = new URLSearchParams();
    params.append('from', 'en'); // Optional: make dynamic if needed
    params.append('to', to);
    params.append('texts', text);

    const response = await fetch('https://lecto-translation.p.rapidapi.com/v1/translate/text', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'lecto-translation.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_API_KEY,
      },
      body: params.toString(),
    });

    const data = await response.json();

    const translated = data?.translations?.[0]?.translated?.[0];

    if (!translated) {
      return res.status(500).json({ error: 'Translation missing or invalid', raw: data });
    }

    res.status(200).json({ translation: translated });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}
