/**
 * POST /api/submit
 * 1. Authenticate with Rex
 * 2. Create the Contact (names, phone, email, address, enquiry source)
 * 3. Add the notes as a stream note on the contact
 */
 
const REX_API_URL = process.env.REX_API_URL;
const REX_EMAIL = process.env.REX_EMAIL;
const REX_PASSWORD = process.env.REX_PASSWORD;
const REX_ACCOUNT_ID = process.env.REX_ACCOUNT_ID;
 
async function getRexToken() {
  const res = await fetch(`${REX_API_URL}/Authentication/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: REX_EMAIL,
      password: REX_PASSWORD,
      account_id: REX_ACCOUNT_ID ? Number(REX_ACCOUNT_ID) : undefined,
    }),
  });
  const json = await res.json();
  const token = json.result;
  if (!token) throw new Error("Rex login failed — check REX_EMAIL and REX_PASSWORD");
  return token;
}
 
async function rexPost(token, endpoint, body = {}) {
  const res = await fetch(`${REX_API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
 
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Rex API error on ${endpoint}: ${res.status} ${text}`);
  }
 
  const json = await res.json();
  if (json.error) {
    throw new Error(`Rex API error on ${endpoint}: ${json.error.message}`);
  }
 
  return json;
}
 
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
 
  const { firstName, lastName, phone, email, address, notes } = req.body;
 
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ error: "First name, last name and phone are required" });
  }
 
  // Verify env vars are present — missing vars cause silent "fetch failed" errors
  if (!REX_API_URL) return res.status(500).json({ error: "REX_API_URL is not set in environment variables" });
  if (!REX_EMAIL)   return res.status(500).json({ error: "REX_EMAIL is not set in environment variables" });
  if (!REX_PASSWORD) return res.status(500).json({ error: "REX_PASSWORD is not set in environment variables" });
 
  try {
    const token = await getRexToken();
 
    // 1. Create the Contact
    const contactResponse = await rexPost(token, "contacts/create", {
      data: {
        marketing_enquiry_source: "Phone Agent",
        address: address || null,
        _related: {
          contact_names: [
            {
              name_first: firstName,
              name_last: lastName,
            },
          ],
          contact_phones: [
            {
              phone_type: "mobile",
              phone_number: phone,
              phone_primary: true,
            },
          ],
          ...(email
            ? {
                contact_emails: [
                  {
                    email_address: email,
                    email_primary: true,
                  },
                ],
              }
            : {}),
        },
      },
    });
 
    const contactId = contactResponse.result?.id || contactResponse.result;
 
    // 2. Add note to the contact stream if notes were provided
    if (notes && contactId) {
      await rexPost(token, "notes/create", {
        data: {
          note: notes,
          note_type: "note",
          contact_id: Number(contactId),
        },
      });
    }
 
    return res.status(200).json({ success: true, contactId });
  } catch (err) {
    console.error("Contact creation error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
 
