export default async function handler(req, res) {
  const DROPBOX_REFRESH_TOKEN = process.env.DROPBOX_REFRESH_TOKEN;
  const CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
  const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: DROPBOX_REFRESH_TOKEN,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({ error: 'Token refresh failed', details: data });
  }

  res.status(200).json({ access_token: data.access_token });
}

