export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, toLanguages = [] } = req.body;

  if (!text || !toLanguages.length) {
    return res.status(400).json({ error: 'Missing text or toLanguages' });
  }

  try {
    const params = new URLSearchParams();
    params.append('from', 'en'); // set your source language or make dynamic

    toLanguages.forEach((lang) => {
      params.append('to', lang);
    });

    // Lecto expects multiple texts by repeating "texts" param
    // Here just sending one text but you can adapt for array
    params.append('texts', text);

    const response = await fetch('https://lecto-translation.p.rapidapi.com/v1/translate/text', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'lecto-translation.p.rapidapi.com',
        'x-rapidapi-key': process.env.LECTO_API_KEY,
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.translations) {
      return res.status(500).json({ error: 'Invalid response from Lecto', details: data });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}
