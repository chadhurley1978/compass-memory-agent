export default async function handler(req, res) {
  const {
    DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET,
    DROPBOX_REFRESH_TOKEN,
  } = process.env;

  if (!DROPBOX_CLIENT_ID || !DROPBOX_CLIENT_SECRET || !DROPBOX_REFRESH_TOKEN) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: DROPBOX_REFRESH_TOKEN,
    client_id: DROPBOX_CLIENT_ID,
    client_secret: DROPBOX_CLIENT_SECRET,
  });

  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({
      error: 'Dropbox token refresh failed',
      details: data,
    });
  }

  return res.status(200).json({
    access_token: data.access_token,
    expires_in: data.expires_in,
    account_id: data.account_id,
    uid: data.uid,
    scope: data.scope,
    token_type: data.token_type,
  });
}


