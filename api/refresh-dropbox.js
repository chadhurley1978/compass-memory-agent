export default async function handler(req, res) {
  const {
    DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET,
    DROPBOX_REFRESH_TOKEN
  } = process.env;

  if (!DROPBOX_CLIENT_ID || !DROPBOX_CLIENT_SECRET || !DROPBOX_REFRESH_TOKEN) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  try {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: DROPBOX_REFRESH_TOKEN,
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Dropbox API error',
        details: data,
      });
    }

    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      scope: data.scope,
      uid: data.uid,
      account_id: data.account_id
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal error calling Dropbox',
      message: err.message
    });
  }
}
