export default async function handler(req, res) {
  const url = process.env.REX_API_URL;
  const email = process.env.REX_EMAIL;
  const password = process.env.REX_PASSWORD;
  const accountId = process.env.REX_ACCOUNT_ID;

  const envCheck = {
    REX_API_URL: url || "MISSING",
    REX_EMAIL: email || "MISSING",
    REX_PASSWORD: password ? "SET" : "MISSING",
    REX_ACCOUNT_ID: accountId || "MISSING",
  };

  if (!url || !email || !password) {
    return res.status(200).json({ status: "env_missing", envCheck });
  }

  try {
    const loginRes = await fetch(`${url}/Authentication/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        account_id: accountId ? Number(accountId) : undefined,
      }),
    });
    const json = await loginRes.json();
    return res.status(200).json({
      status: loginRes.ok ? "ok" : "rex_error",
      envCheck,
      rexStatus: loginRes.status,
      rexResult: json.result ? "token_received" : null,
      rexError: json.error || null,
    });
  } catch (err) {
    return res.status(200).json({
      status: "network_error",
      envCheck,
      error: err.message,
    });
  }
}
