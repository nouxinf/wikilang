export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, to } = req.body;

  try {
    const response = await fetch('https://lecto.ai/api/v1/translate/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LECTO_API_KEY}`,
      },
      body: JSON.stringify({
        texts: [text],
        to,
      }),
    });

    const data = await response.json();

    if (!data?.translations?.[0]?.text) {
      return res.status(500).json({ error: 'Invalid response from Lecto' });
    }

    res.status(200).json({ translation: data.translations[0].text });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed', details: err.message });
  }
}
