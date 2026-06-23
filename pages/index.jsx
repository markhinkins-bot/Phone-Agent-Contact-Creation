import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Layout>
        <div style={styles.successBox}>
          <h2 style={styles.successHeading}>Contact created!</h2>
          <p style={styles.successText}>
            The contact has been added to Rex with the enquiry source set to Phone Agent.
          </p>
          <button
            style={styles.button}
            onClick={() => {
              setForm({ firstName: "", lastName: "", phone: "", email: "", address: "", notes: "" });
              setStatus("idle");
            }}
          >
            Add another
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 style={styles.heading}>New Phone Enquiry</h1>
      <p style={styles.subheading}>Creates a contact in Rex with Enquiry Source set to Phone Agent.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <Field label="First name">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Jane"
              style={styles.input}
              required
            />
          </Field>
          <Field label="Last name">
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Smith"
              style={styles.input}
              required
            />
          </Field>
        </div>

        <div style={styles.row}>
          <Field label="Phone number">
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="07700 900000"
              style={styles.input}
              required
            />
          </Field>
          <Field label="Email address">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              style={styles.input}
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="12 High Street, Reading, RG1 1AA"
            style={styles.input}
          />
        </Field>

        <Field label="Notes" hint="optional">
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Anything relevant from the call…"
            rows={4}
            style={{ ...styles.input, resize: "vertical" }}
          />
        </Field>

        {status === "error" && <p style={styles.error}>{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          style={status === "submitting" ? { ...styles.button, opacity: 0.6 } : styles.button}
        >
          {status === "submitting" ? "Creating contact…" : "Create contact"}
        </button>
      </form>
    </Layout>
  );
}

function Layout({ children }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
               background: #ee028d; color: #1a1a1a; min-height: 100vh; }
      `}</style>
      <div style={styles.page}>
        <div style={styles.logoWrap}>
          <img src="/avocado-logo.png" alt="Avocado Property" style={styles.logo} />
        </div>
        <main style={styles.container}>{children}</main>
      </div>
    </>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {hint && <span style={styles.hint}> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ee028d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 16px 60px",
  },
  logoWrap: { marginBottom: 24 },
  logo: { height: 80, width: "auto", display: "block" },
  container: {
    width: "100%",
    maxWidth: 600,
    padding: "32px 28px",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  },
  heading: { fontSize: 22, fontWeight: 700, marginBottom: 6, color: "#1a1a1a" },
  subheading: { fontSize: 14, color: "#666", marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },
  hint: { fontWeight: 400, color: "#999" },
  input: {
    padding: "10px 12px",
    fontSize: 15,
    border: "1px solid #ddd",
    borderRadius: 8,
    outline: "none",
    width: "100%",
    background: "#fafafa",
  },
  button: {
    marginTop: 4,
    padding: "12px 24px",
    fontSize: 16,
    fontWeight: 600,
    background: "#ee028d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    width: "100%",
  },
  error: {
    fontSize: 14,
    color: "#c0392b",
    background: "#fdf0ef",
    padding: "10px 12px",
    borderRadius: 8,
  },
  successBox: { textAlign: "center", padding: "16px 0 8px" },
  successHeading: { fontSize: 22, fontWeight: 700, marginBottom: 10, color: "#1a1a1a" },
  successText: { fontSize: 15, color: "#555", marginBottom: 24 },
};
