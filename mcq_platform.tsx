import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_DATA = {
  users: [
    { id: "a1", name: "Super Admin", email: "admin@test.com", password: "test@admin", role: "admin" },
  ],
  tests: [], questions: [], assignments: [], submissions: [], otps: [],
};

const uid = () => Math.random().toString(36).slice(2, 10);
const nowStr = () => new Date().toISOString();
const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

function useStorage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/state");
        if (!r.ok) throw new Error("Failed to load state");
        const serverData = await r.json();
        setData(serverData || DEFAULT_DATA);
      } catch {
        setData(DEFAULT_DATA);
      }
      setLoading(false);
    })();
  }, []);
  const save = useCallback(async (nd) => {
    setData(nd);
    try {
      await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nd),
      });
    } catch {}
  }, []);
  return { data, save, loading };
}

const P = {
  lavender:"#ede9fe", lavenderD:"#7c3aed", lavenderM:"#a78bfa",
  mint:"#d1fae5", mintD:"#065f46", mintM:"#34d399",
  sky:"#e0f2fe", skyD:"#0369a1", skyM:"#38bdf8",
  rose:"#ffe4e6", roseD:"#9f1239", roseM:"#fb7185",
  peach:"#ffedd5", peachD:"#9a3412", peachM:"#fb923c",
  yellow:"#fef9c3", yellowD:"#854d0e", yellowM:"#facc15",
  lilac:"#f3e8ff", lilacD:"#6b21a8",
  white:"#ffffff", offwhite:"#f8f7ff",
  text:"#1e1b4b", textSub:"#6b7280", textLight:"#9ca3af",
  border:"#e5e7eb", borderFocus:"#a78bfa",
  shadow:"0 2px 12px rgba(139,92,246,0.08)",
  shadowHov:"0 4px 20px rgba(139,92,246,0.15)",
};

const ROLE_META = {
  admin:    { color: P.lilac,    dot: P.lilacD,  label: "Admin" },
  examiner: { color: P.sky,      dot: P.skyD,    label: "Examiner" },
  examinee: { color: P.mint,     dot: P.mintD,   label: "Examinee" },
};

const OPT_COLORS = [P.rose, P.sky, P.mint, P.peach];
const OPT_LABELS = ["A","B","C","D"];

const CSS = `
*{box-sizing:border-box;}
input,select,textarea{font-family:inherit;font-size:14px;background:${P.white};color:${P.text};border:1.5px solid ${P.border};border-radius:10px;padding:9px 13px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s;}
input::placeholder,textarea::placeholder{color:${P.textLight};font-style:italic;}
input:focus,select:focus,textarea:focus{border-color:${P.borderFocus};box-shadow:0 0 0 3px ${P.lavender};}
select{cursor:pointer;}
button{font-family:inherit;cursor:pointer;transition:all .18s;}
button:active{transform:scale(0.97);}
.card{background:${P.white};border:1.5px solid ${P.border};border-radius:16px;padding:1.4rem 1.6rem;margin-bottom:14px;box-shadow:${P.shadow};}
.card-flat{background:${P.white};border:1.5px solid ${P.border};border-radius:16px;padding:1.4rem 1.6rem;margin-bottom:14px;}
.btn-primary{background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border:none;border-radius:10px;padding:9px 20px;font-size:14px;font-weight:500;box-shadow:0 2px 8px rgba(124,58,237,0.25);}
.btn-primary:hover{box-shadow:0 4px 14px rgba(124,58,237,0.35);}
.btn-primary:disabled{opacity:.45;cursor:not-allowed;}
.btn-ghost{background:transparent;color:${P.text};border:1.5px solid ${P.border};border-radius:10px;padding:8px 16px;font-size:14px;}
.btn-ghost:hover{background:${P.lavender};border-color:${P.lavenderM};color:${P.lavenderD};}
.btn-danger{background:${P.rose};color:${P.roseD};border:1.5px solid #fecdd3;border-radius:10px;padding:6px 12px;font-size:12px;font-weight:500;}
.btn-danger:hover{background:#fecdd3;}
.btn-sm{padding:5px 12px;font-size:12px;border-radius:8px;}
.tag{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:500;}
.nav-pill{padding:7px 18px;border-radius:50px;border:1.5px solid transparent;font-size:14px;font-weight:500;background:transparent;color:${P.textSub};}
.nav-pill:hover{background:${P.lavender};color:${P.lavenderD};}
.nav-pill.active{background:${P.lavender};color:${P.lavenderD};border-color:${P.lavenderM};}
.check-row{display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:10px;border:1.5px solid ${P.border};margin-bottom:8px;background:${P.white};}
.check-row:hover{border-color:${P.lavenderM};background:${P.lavender};}
.check-row input[type=checkbox]{width:16px;height:16px;accent-color:${P.lavenderD};flex-shrink:0;}
.opt-row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;border:1.5px solid ${P.border};margin-bottom:10px;cursor:pointer;}
.opt-row:hover{border-color:${P.lavenderM};background:${P.lavender};}
.opt-row.sel{border-color:${P.lavenderD};background:${P.lavender};}
.sec-label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${P.textLight};margin:0 0 10px;}
.divider{border:none;border-top:1.5px solid ${P.border};margin:1.2rem 0;}
.q-tile{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;cursor:pointer;border:2px solid transparent;flex-shrink:0;}
.q-tile:hover{transform:scale(1.1);}
.toast{position:fixed;top:20px;right:20px;background:${P.white};border:1.5px solid ${P.border};border-radius:12px;padding:12px 18px;font-size:14px;box-shadow:${P.shadowHov};z-index:9999;animation:slideIn .3s ease;}
@keyframes slideIn{from{transform:translateX(60px);opacity:0;}to{transform:translateX(0);opacity:1;}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
.pulse{animation:pulse 1s infinite;}
::-webkit-scrollbar{width:6px;}
::-webkit-scrollbar-thumb{background:${P.lavenderM};border-radius:3px;}
`;

// ── Tiny shared components ──────────────────────────────────────────────────
function Badge({ type }) {
  const m = ROLE_META[type] || { color: "#f3f4f6", dot: "#6b7280", label: type };
  return (
    <span className="tag" style={{ background: m.color, color: m.dot }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot, display:"inline-block" }} />
      {m.label}
    </span>
  );
}

function Avatar({ name, size=38, bg=P.lavender, fg=P.lavenderD }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color:fg, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:600, fontSize:size*0.36, flexShrink:0 }}>
      {initials}
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background:P.rose, color:P.roseD, borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:10 }}>{msg}</div>;
}

function OkBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background:P.mint, color:P.mintD, borderRadius:8, padding:"8px 12px", fontSize:13, marginBottom:10 }}>✓ {msg}</div>;
}

function SelectAll({ items, selected, onToggle, label="Select all" }) {
  const all = items.length > 0 && items.every(i => selected.includes(i));
  const some = items.some(i => selected.includes(i)) && !all;
  return (
    <label className="check-row" style={{ background:P.lavender, borderColor:P.lavenderM, marginBottom:10, cursor:"pointer" }}>
      <input type="checkbox" checked={all}
        ref={el => { if (el) el.indeterminate = some; }}
        onChange={() => onToggle(all ? [] : items)}
        style={{ width:16, height:16, accentColor:P.lavenderD }} />
      <span style={{ fontSize:13, fontWeight:600, color:P.lavenderD }}>{label}</span>
      <span style={{ marginLeft:"auto", fontSize:12, color:P.textSub }}>{selected.length}/{items.length}</span>
    </label>
  );
}

// ── OTP Modal ────────────────────────────────────────────────────────────────
function OtpEmailModal({ email, otp, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(30,27,75,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(2px)" }}>
      <div style={{ background:P.white, borderRadius:20, padding:"2rem", maxWidth:400, width:"90%", boxShadow:"0 20px 60px rgba(124,58,237,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ width:56, height:56, background:P.lavender, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26 }}>✉️</div>
          <p style={{ fontWeight:600, fontSize:17, color:P.text, margin:"0 0 4px" }}>Simulated Email</p>
          <p style={{ fontSize:13, color:P.textSub, margin:0 }}>To: <strong>{email}</strong></p>
        </div>
        <div style={{ background:P.lavender, borderRadius:14, padding:"1.25rem", marginBottom:"1.25rem", border:`1.5px solid ${P.lavenderM}` }}>
          <p style={{ margin:"0 0 6px", fontWeight:600, color:P.lavenderD }}>Password Reset OTP</p>
          <p style={{ margin:"0 0 14px", fontSize:13, color:P.textSub }}>Valid for 10 minutes.</p>
          <div style={{ textAlign:"center", fontSize:36, fontWeight:700, letterSpacing:12, padding:"14px 0", borderRadius:10, background:P.white, color:P.lavenderD }}>{otp}</div>
        </div>
        <button className="btn-primary" style={{ width:"100%", padding:11 }} onClick={onClose}>I have my OTP →</button>
      </div>
    </div>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ data, save, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [np, setNp] = useState("");
  const [cp, setCp] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [showOtp, setShowOtp] = useState(null);

  const login = () => {
    const u = data.users.find(u => u.email === email && u.password === password);
    if (!u) { setErr("Invalid email or password"); return; }
    onLogin(u);
  };

  const sendOtp = () => {
    const u = data.users.find(u => u.email === fEmail);
    if (!u) { setErr("No account with that email"); return; }
    const code = genOtp();
    const expiry = new Date(Date.now() + 600000).toISOString();
    const otps = [...(data.otps || []).filter(o => o.email !== fEmail), { email: fEmail, code, expiry }];
    save({ ...data, otps });
    setShowOtp({ email: fEmail, otp: code });
    setErr("");
  };

  const verifyOtp = () => {
    const r = (data.otps || []).find(o => o.email === fEmail);
    if (!r) { setErr("No OTP found"); return; }
    if (new Date(r.expiry) < new Date()) { setErr("OTP expired"); return; }
    if (r.code !== otp.trim()) { setErr("Incorrect OTP"); return; }
    setErr("");
    setMode("reset");
  };

  const resetPass = () => {
    if (np.length < 6) { setErr("Min 6 characters"); return; }
    if (np !== cp) { setErr("Passwords don't match"); return; }
    const users = data.users.map(u => u.email === fEmail ? { ...u, password: np } : u);
    const otps = (data.otps || []).filter(o => o.email !== fEmail);
    save({ ...data, users, otps });
    setOk("Password reset! Please sign in.");
    setMode("login");
    setEmail(fEmail);
    setFEmail(""); setOtp(""); setNp(""); setCp("");
  };

  const steps = { forgot:1, otp:2, reset:3 };
  return (
    <>
      <style>{CSS}</style>
      {showOtp && <OtpEmailModal email={showOtp.email} otp={showOtp.otp} onClose={() => { setShowOtp(null); setMode("otp"); }} />}
      <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,${P.lavender} 0%,${P.sky} 50%,${P.mint} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ width:64, height:64, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:30, boxShadow:"0 8px 24px rgba(124,58,237,0.3)" }}>📝</div>
            <h1 style={{ fontSize:26, fontWeight:700, color:P.text, margin:"0 0 4px" }}>MCQ Platform</h1>
            <p style={{ color:P.textSub, margin:0, fontSize:14 }}>Assessments made simple</p>
          </div>

          <div className="card-flat" style={{ borderRadius:20, boxShadow:"0 8px 32px rgba(124,58,237,0.12)" }}>
            {mode !== "login" && (
              <div style={{ display:"flex", gap:6, marginBottom:"1.5rem" }}>
                {["Request OTP","Verify OTP","New Password"].map((lbl, i) => (
                  <div key={lbl} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background: steps[mode] > i ? P.lavenderD : steps[mode] === i+1 ? P.lavenderM : P.border, color: steps[mode] >= i+1 ? P.white : P.textLight, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 4px" }}>{i+1}</div>
                    <p style={{ fontSize:10, color: steps[mode] === i+1 ? P.lavenderD : P.textLight, margin:0, fontWeight:500 }}>{lbl}</p>
                  </div>
                ))}
              </div>
            )}

            {mode === "login" && (
              <div>
                <h2 style={{ fontSize:20, fontWeight:600, color:P.text, margin:"0 0 1.25rem" }}>Welcome back</h2>
                <OkBox msg={ok} />
                <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom:12 }} />
                <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && login()} />
                <ErrBox msg={err} />
                <button className="btn-primary" style={{ width:"100%", padding:11, marginTop:16 }} onClick={login}>Sign in</button>
                <button onClick={() => { setMode("forgot"); setErr(""); setOk(""); }} style={{ background:"none", border:"none", color:P.lavenderD, fontSize:13, marginTop:10, padding:0, textDecoration:"underline", cursor:"pointer" }}>Forgot password?</button>
              </div>
            )}

            {mode === "forgot" && (
              <div>
                <h2 style={{ fontSize:18, fontWeight:600, color:P.text, margin:"0 0 6px" }}>Reset password</h2>
                <p style={{ fontSize:13, color:P.textSub, margin:"0 0 16px" }}>Enter your email and we'll send an OTP.</p>
                <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Registered email</label>
                <input value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="you@example.com" />
                <ErrBox msg={err} />
                <button className="btn-primary" style={{ width:"100%", padding:11, marginTop:14 }} onClick={sendOtp}>Send OTP →</button>
                <button onClick={() => { setMode("login"); setErr(""); }} style={{ background:"none", border:"none", color:P.textSub, fontSize:13, marginTop:10, padding:0, cursor:"pointer" }}>← Back to sign in</button>
              </div>
            )}

            {mode === "otp" && (
              <div>
                <h2 style={{ fontSize:18, fontWeight:600, color:P.text, margin:"0 0 6px" }}>Enter OTP</h2>
                <p style={{ fontSize:13, color:P.textSub, margin:"0 0 16px" }}>6-digit code sent to <strong>{fEmail}</strong></p>
                <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="000000"
                  style={{ textAlign:"center", fontSize:28, letterSpacing:10, fontWeight:600, background:P.lavender, borderColor:P.lavenderM, color:P.lavenderD }} />
                <ErrBox msg={err} />
                <button className="btn-primary" style={{ width:"100%", padding:11, marginTop:14 }} onClick={verifyOtp}>Verify OTP →</button>
                <button onClick={sendOtp} style={{ background:"none", border:"none", color:P.lavenderD, fontSize:13, marginTop:10, padding:0, textDecoration:"underline", cursor:"pointer" }}>Resend OTP</button>
              </div>
            )}

            {mode === "reset" && (
              <div>
                <h2 style={{ fontSize:18, fontWeight:600, color:P.text, margin:"0 0 6px" }}>New password</h2>
                <input type="password" value={np} onChange={e => setNp(e.target.value)} placeholder="At least 6 characters" style={{ marginBottom:12 }} />
                <input type="password" value={cp} onChange={e => setCp(e.target.value)} placeholder="Repeat your new password" />
                <ErrBox msg={err} />
                <button className="btn-primary" style={{ width:"100%", padding:11, marginTop:14 }} onClick={resetPass}>Reset & Sign in →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Admin App ────────────────────────────────────────────────────────────────
function AdminApp({ data, save, user }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"examinee" });
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const resetForm = () => { setForm({ name:"", email:"", password:"", role:"examinee" }); setEditId(null); setErr(""); };

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) { setErr("Name and email required"); return; }
    if (form.role === "admin") { setErr("Only one admin account is allowed"); return; }
    if (!editId && !form.password) { setErr("Password required"); return; }
    if (!editId && data.users.find(u => u.email === form.email)) { setErr("Email already in use"); return; }
    if (form.password && form.password.length < 6) { setErr("Min 6 characters"); return; }
    let users;
    if (editId) {
      users = data.users.map(u => u.id === editId ? { ...u, name:form.name, email:form.email, role:form.role, ...(form.password ? { password:form.password } : {}) } : u);
    } else {
      users = [...data.users, { id:uid(), ...form, createdAt:nowStr() }];
    }
    save({ ...data, users });
    setToast(editId ? "User updated" : "User created");
    resetForm();
  };

  const stats = [
    ["Total", data.users.length, P.lavender, P.lavenderD],
    ["Admins", data.users.filter(u => u.role === "admin").length, P.lilac, P.lilacD],
    ["Examiners", data.users.filter(u => u.role === "examiner").length, P.sky, P.skyD],
    ["Examinees", data.users.filter(u => u.role === "examinee").length, P.mint, P.mintD],
  ];

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:"1.75rem" }}>
        {stats.map(([l, v, bg, fg]) => (
          <div key={l} style={{ borderRadius:14, padding:"1rem 1.25rem", background:bg }}>
            <p style={{ fontSize:12, fontWeight:600, color:fg, margin:"0 0 4px", opacity:.8 }}>{l.toUpperCase()}</p>
            <p style={{ fontSize:28, fontWeight:700, color:fg, margin:0 }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"1.5rem", alignItems:"start" }}>
        <div className="card-flat">
          <h3 style={{ fontSize:16, fontWeight:600, color:P.text, margin:"0 0 1.1rem" }}>{editId ? "✏️ Edit user" : "➕ Create user"}</h3>
          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Full name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Jane Doe" style={{ marginBottom:12 }} />
          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Email address</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} placeholder="jane@company.com" style={{ marginBottom:12 }} />
          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>{editId ? "New password (leave blank to keep)" : "Password"}</label>
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password:e.target.value }))} placeholder="Min 6 characters" style={{ marginBottom:12 }} />
          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Role</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role:e.target.value }))} style={{ marginBottom:14 }}>
            <option value="examiner">Examiner</option>
            <option value="examinee">Examinee</option>
          </select>
          <ErrBox msg={err} />
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-primary" style={{ flex:1 }} onClick={submit}>{editId ? "Update" : "Create"} user</button>
            {editId && <button className="btn-ghost" onClick={resetForm}>Cancel</button>}
          </div>
        </div>

        <div>
          <p className="sec-label">All users — {data.users.length} total</p>
          {data.users.map(u => {
            const rm = ROLE_META[u.role] || {};
            return (
              <div key={u.id} className="card" style={{ padding:"0.9rem 1.25rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar name={u.name} bg={rm.color || P.lavender} fg={rm.dot || P.lavenderD} />
                    <div>
                      <p style={{ margin:"0 0 2px", fontWeight:600, fontSize:14, color:P.text }}>
                        {u.name}
                        {u.id === user.id && <span className="tag" style={{ background:P.yellow, color:P.yellowD, fontSize:11, marginLeft:6 }}>you</span>}
                      </p>
                      <p style={{ margin:0, fontSize:12, color:P.textSub }}>{u.email}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <Badge type={u.role} />
                    {u.role !== "admin" && <button className="btn-ghost btn-sm" onClick={() => { setEditId(u.id); setForm({ name:u.name, email:u.email, password:"", role:u.role }); setErr(""); }}>Edit</button>}
                    {u.role !== "admin" && u.id !== user.id && (
                      <button className="btn-danger" onClick={() => { if (confirm("Delete user?")) save({ ...data, users: data.users.filter(x => x.id !== u.id) }); }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Examiner App ─────────────────────────────────────────────────────────────
function ExaminerApp({ data, save }) {
  const [tab, setTab] = useState("tests");
  const tabs = [["tests","📋 Tests"], ["questions","❓ Questions"], ["assign","📤 Assign"], ["results","📊 Results"]];
  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:"1.75rem", background:P.white, borderRadius:14, padding:6, border:`1.5px solid ${P.border}`, boxShadow:P.shadow }}>
        {tabs.map(([k, v]) => (
          <button key={k} className={`nav-pill${tab === k ? " active" : ""}`} style={{ flex:1 }} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>
      {tab === "tests"     && <TestManager     data={data} save={save} />}
      {tab === "questions" && <QuestionManager data={data} save={save} />}
      {tab === "assign"    && <AssignManager   data={data} save={save} />}
      {tab === "results"   && <ResultManager   data={data} save={save} />}
    </div>
  );
}

function AdminPortal({ data, save, user }) {
  const [tab, setTab] = useState("users");
  const tabs = [
    ["users", "👥 Users"],
    ["tests", "📋 Tests"],
    ["questions", "❓ Questions"],
    ["assign", "📤 Assign"],
    ["results", "📊 Results"],
  ];

  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:"1.75rem", background:P.white, borderRadius:14, padding:6, border:`1.5px solid ${P.border}`, boxShadow:P.shadow }}>
        {tabs.map(([k, v]) => (
          <button key={k} className={`nav-pill${tab === k ? " active" : ""}`} style={{ flex:1 }} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>
      {tab === "users" && <AdminApp data={data} save={save} user={user} />}
      {tab === "tests" && <TestManager data={data} save={save} />}
      {tab === "questions" && <QuestionManager data={data} save={save} />}
      {tab === "assign" && <AssignManager data={data} save={save} />}
      {tab === "results" && <ResultManager data={data} save={save} />}
    </div>
  );
}

// ── Test Manager ─────────────────────────────────────────────────────────────
function TestManager({ data, save }) {
  const [form, setForm] = useState({ name:"", description:"", duration:30, negativeMarkingPct:0 });
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const add = () => {
    if (!form.name.trim()) { setErr("Test name required"); return; }
    if (form.negativeMarkingPct < 0 || form.negativeMarkingPct > 100) { setErr("Negative marking must be 0–100"); return; }
    save({ ...data, tests: [...data.tests, { id:uid(), ...form, createdAt:nowStr() }] });
    setForm({ name:"", description:"", duration:30, negativeMarkingPct:0 });
    setErr("");
    setToast("Test created!");
  };

  const deleteTest = (id) => {
    if (!confirm("Delete test and all its data?")) return;
    save({
      ...data,
      tests: data.tests.filter(t => t.id !== id),
      questions: data.questions.filter(q => q.testId !== id),
      assignments: data.assignments.filter(a => a.testId !== id),
    });
  };

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="card-flat" style={{ background:`linear-gradient(135deg,${P.lavender},${P.sky})`, border:`1.5px solid ${P.lavenderM}` }}>
        <h3 style={{ fontSize:16, fontWeight:600, color:P.lavenderD, margin:"0 0 1rem" }}>➕ Create new test</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:P.lavenderD, display:"block", marginBottom:5 }}>Test name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Biology Midterm 2025" />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:P.lavenderD, display:"block", marginBottom:5 }}>Duration (minutes)</label>
            <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration:+e.target.value }))} placeholder="30" />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:P.lavenderD, display:"block", marginBottom:5 }}>Negative marking (%)</label>
            <input type="number" min={0} max={100} value={form.negativeMarkingPct} onChange={e => setForm(f => ({ ...f, negativeMarkingPct:+e.target.value }))} placeholder="0 = no negative marking" />
            <p style={{ fontSize:11, color:P.lavenderD, margin:"4px 0 0", opacity:.8 }}>% of question weightage deducted per wrong answer</p>
          </div>
        </div>
        <label style={{ fontSize:13, fontWeight:500, color:P.lavenderD, display:"block", marginBottom:5 }}>Description</label>
        <input value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Optional — briefly describe this test" style={{ marginBottom:12 }} />
        <ErrBox msg={err} />
        <button className="btn-primary" onClick={add}>Create test</button>
      </div>

      <p className="sec-label">Your tests — {data.tests.length}</p>
      {!data.tests.length && (
        <div className="card" style={{ textAlign:"center", padding:"2.5rem", color:P.textLight }}>
          <p style={{ fontSize:32, margin:"0 0 8px" }}>📋</p>
          <p style={{ margin:0 }}>No tests yet. Create your first one above.</p>
        </div>
      )}
      {data.tests.map(t => {
        const qc = data.questions.filter(q => q.testId === t.id).length;
        const ac = data.assignments.filter(a => a.testId === t.id).length;
        const maxScore = data.questions.filter(q => q.testId === t.id).reduce((s, q) => s + (q.weightage || 1), 0);
        return (
          <div key={t.id} className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <p style={{ margin:"0 0 6px", fontWeight:600, fontSize:15, color:P.text }}>{t.name}</p>
                <p style={{ margin:"0 0 10px", fontSize:13, color:P.textSub }}>{t.description || "No description"}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span className="tag" style={{ background:P.lavender, color:P.lavenderD }}>❓ {qc} questions</span>
                  <span className="tag" style={{ background:P.sky, color:P.skyD }}>⏱ {t.duration} min</span>
                  <span className="tag" style={{ background:P.mint, color:P.mintD }}>👥 {ac} assigned</span>
                  <span className="tag" style={{ background:P.peach, color:P.peachD }}>⭐ Max {maxScore} pts</span>
                  {t.negativeMarkingPct > 0 && <span className="tag" style={{ background:P.rose, color:P.roseD }}>➖ {t.negativeMarkingPct}% negative</span>}
                </div>
              </div>
              <button className="btn-danger" onClick={() => deleteTest(t.id)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Question Manager ─────────────────────────────────────────────────────────
function QuestionManager({ data, save }) {
  const [selTest, setSelTest] = useState("");
  const [form, setForm] = useState({ text:"", options:["","","",""], correct:0, weightage:1 });
  const [bulkText, setBulkText] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const qs = data.questions.filter(q => q.testId === selTest);

  const setOpt = (i, v) => setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options:o }; });

  const add = () => {
    if (!selTest) { setErr("Select a test first"); return; }
    if (!form.text.trim() || form.options.some(o => !o.trim())) { setErr("Fill all fields"); return; }
    if (!form.weightage || form.weightage <= 0) { setErr("Weightage must be > 0"); return; }
    save({ ...data, questions: [...data.questions, { id:uid(), testId:selTest, ...form, weightage:parseFloat(form.weightage) || 1, createdAt:nowStr() }] });
    setForm({ text:"", options:["","","",""], correct:0, weightage:1 });
    setErr("");
    setToast("Question added!");
  };

  const bulkAdd = () => {
    if (!selTest) { setErr("Select a test first"); return; }
    if (!bulkText.trim()) { setErr("Paste at least one question block"); return; }

    const blocks = bulkText.trim().split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
    const parsed = [];

    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks[bi];
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;

      let answerToken = "";
      let weightage = 1;
      const contentLines = [];

      lines.forEach((line) => {
        const ansMatch = line.match(/^(answer|correct)\s*[:\-]\s*([A-Da-d]|[1-4])$/i);
        if (ansMatch) {
          answerToken = ansMatch[2].toUpperCase();
          return;
        }
        const wtMatch = line.match(/^weight(age)?\s*[:\-]\s*(\d+(\.\d+)?)$/i);
        if (wtMatch) {
          weightage = parseFloat(wtMatch[2]) || 1;
          return;
        }
        contentLines.push(line);
      });

      if (!answerToken) {
        setErr(`Block ${bi + 1}: missing "Answer: A/B/C/D" line`);
        return;
      }

      const questionTextRaw = contentLines[0] || "";
      const questionText = questionTextRaw.replace(/^\d+[\).:\-]\s*/, "").trim();
      const optionLines = contentLines.slice(1);
      if (!questionText) {
        setErr(`Block ${bi + 1}: missing question text`);
        return;
      }

      const options = ["", "", "", ""];
      let hasLabeledOptions = false;
      optionLines.forEach((line) => {
        const m = line.match(/^([A-Da-d])[\).:\-]\s*(.+)$/);
        if (m) {
          hasLabeledOptions = true;
          const idx = "ABCD".indexOf(m[1].toUpperCase());
          if (idx >= 0) options[idx] = m[2].trim();
        }
      });

      if (!hasLabeledOptions) {
        const plainOptions = optionLines
          .map(l => l.replace(/^[-*]\s*/, "").trim())
          .filter(Boolean)
          .slice(0, 4);
        plainOptions.forEach((opt, i) => { options[i] = opt; });
      }

      if (options.some(o => !o)) {
        setErr(`Block ${bi + 1}: exactly 4 options are required`);
        return;
      }

      const correct = /^[1-4]$/.test(answerToken)
        ? Number(answerToken) - 1
        : "ABCD".indexOf(answerToken);
      if (correct < 0 || correct > 3) {
        setErr(`Block ${bi + 1}: answer must be A-D or 1-4`);
        return;
      }
      if (weightage <= 0) {
        setErr(`Block ${bi + 1}: weightage must be > 0`);
        return;
      }

      parsed.push({
        id: uid(),
        testId: selTest,
        text: questionText,
        options,
        correct,
        weightage,
        createdAt: nowStr(),
      });
    }

    if (!parsed.length) {
      setErr("No valid questions found");
      return;
    }

    save({ ...data, questions: [...data.questions, ...parsed] });
    setBulkText("");
    setErr("");
    setToast(`${parsed.length} question${parsed.length === 1 ? "" : "s"} imported!`);
  };

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", alignItems:"start" }}>
        <div className="card-flat">
          <h3 style={{ fontSize:16, fontWeight:600, color:P.text, margin:"0 0 1rem" }}>Add question</h3>
          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Test</label>
          <select value={selTest} onChange={e => setSelTest(e.target.value)} style={{ marginBottom:14 }}>
            <option value="">— Select a test —</option>
            {data.tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Question text *</label>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text:e.target.value }))} placeholder="Type your question here…" style={{ minHeight:80, resize:"vertical", marginBottom:14 }} />

          <div style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-end" }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Weightage (marks)</label>
              <input type="number" min={0.5} step={0.5} value={form.weightage} onChange={e => setForm(f => ({ ...f, weightage:parseFloat(e.target.value) || 1 }))} placeholder="Default: 1" />
            </div>
            <div style={{ background:P.lavender, borderRadius:10, padding:"9px 14px", fontSize:12, color:P.lavenderD, fontWeight:500, whiteSpace:"nowrap" }}>
              ⭐ {form.weightage} mark{form.weightage !== 1 ? "s" : ""}
            </div>
          </div>

          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:8 }}>Options — click the letter to mark correct</label>
          {form.options.map((o, i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
              <div onClick={() => setForm(f => ({ ...f, correct:i }))}
                style={{ width:32, height:32, borderRadius:"50%", background: form.correct === i ? P.lavenderD : OPT_COLORS[i], color: form.correct === i ? P.white : P.text, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, cursor:"pointer", flexShrink:0, border:`2px solid ${form.correct === i ? P.lavenderD : "transparent"}` }}>
                {OPT_LABELS[i]}
              </div>
              <input value={o} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${OPT_LABELS[i]} — type here`}
                style={{ flex:1, borderColor: form.correct === i ? P.lavenderM : P.border }} />
              {form.correct === i && <span style={{ fontSize:11, color:P.lavenderD, fontWeight:600, whiteSpace:"nowrap" }}>✓ Correct</span>}
            </div>
          ))}
          <ErrBox msg={err} />
          <button className="btn-primary" onClick={add} style={{ marginTop:4 }}>Add question</button>

          <hr className="divider" />
          <h3 style={{ fontSize:15, fontWeight:600, color:P.text, margin:"0 0 8px" }}>Bulk import questions</h3>
          <p style={{ margin:"0 0 8px", fontSize:12, color:P.textSub }}>
            Paste multiple blocks separated by a blank line. Include 4 options and an answer line.
          </p>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={`Question text
A) Option 1
B) Option 2
C) Option 3
D) Option 4
Answer: B
Weightage: 1

Next question text
A) ...
B) ...
C) ...
D) ...
Answer: D`}
            style={{ minHeight:180, resize:"vertical", marginBottom:10, fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", fontSize:12 }}
          />
          <button className="btn-primary" onClick={bulkAdd}>Import pasted questions</button>
        </div>

        <div>
          <p className="sec-label">{selTest ? `${qs.length} question${qs.length !== 1 ? "s" : ""} in this test` : "Select a test to view questions"}</p>
          {!selTest && <div className="card" style={{ textAlign:"center", padding:"2rem", color:P.textLight }}>← Choose a test</div>}
          {qs.map((q, idx) => (
            <div key={q.id} className="card" style={{ padding:"1rem 1.25rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, gap:8 }}>
                <p style={{ margin:0, fontWeight:600, fontSize:14, color:P.text, flex:1 }}>Q{idx+1}. {q.text}</p>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                  <span className="tag" style={{ background:P.peach, color:P.peachD }}>⭐ {q.weightage || 1}pt</span>
                  <button className="btn-danger" onClick={() => save({ ...data, questions: data.questions.filter(x => x.id !== q.id) })}>✕</button>
                </div>
              </div>
              {q.options.map((o, i) => (
                <div key={i} style={{ display:"flex", gap:8, alignItems:"center", padding:"4px 0" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", background: i === q.correct ? P.lavenderD : OPT_COLORS[i], color: i === q.correct ? P.white : P.text, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{OPT_LABELS[i]}</span>
                  <span style={{ fontSize:13, color: i === q.correct ? P.lavenderD : P.text, fontWeight: i === q.correct ? 600 : 400 }}>{o}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Assign Manager ────────────────────────────────────────────────────────────
function AssignManager({ data, save }) {
  const [selTest, setSelTest] = useState("");
  const [selUsers, setSelUsers] = useState([]);
  const [mode, setMode] = useState("random");
  const [randomCount, setRandomCount] = useState(5);
  const [manualIds, setManualIds] = useState([]);
  const [resultRelease, setResultRelease] = useState("immediate");
  const [releaseAt, setReleaseAt] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const examinees = data.users.filter(u => u.role === "examinee");
  const testQs = data.questions.filter(q => q.testId === selTest);
  const examineeIds = examinees.map(u => u.id);
  const testQIds = testQs.map(q => q.id);
  const test = data.tests.find(t => t.id === selTest);

  const toggleUser = (id) => setSelUsers(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleManual = (id) => setManualIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const assign = () => {
    if (!selTest) { setErr("Select a test"); return; }
    if (!selUsers.length) { setErr("Select at least one examinee"); return; }
    if (mode === "random" && randomCount > testQs.length) { setErr(`Only ${testQs.length} questions available`); return; }
    if (mode === "manual" && !manualIds.length) { setErr("Select questions manually"); return; }
    if (resultRelease === "scheduled" && !releaseAt) { setErr("Set a release time"); return; }
    const qIds = mode === "random"
      ? [...testQs].sort(() => Math.random() - .5).slice(0, randomCount).map(q => q.id)
      : manualIds;
    const newA = selUsers.map(userId => ({
      id:uid(), testId:selTest, userId, questionIds:qIds, resultRelease,
      releaseAt: resultRelease === "scheduled" ? releaseAt : null,
      assignedAt: nowStr(),
    }));
    save({ ...data, assignments: [...data.assignments, ...newA] });
    setSelUsers([]); setManualIds([]); setErr("");
    setToast(`Assigned to ${newA.length} examinee(s)!`);
  };

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", alignItems:"start" }}>
        <div className="card-flat">
          <h3 style={{ fontSize:16, fontWeight:600, color:P.text, margin:"0 0 1rem" }}>New assignment</h3>

          <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Test</label>
          <select value={selTest} onChange={e => { setSelTest(e.target.value); setManualIds([]); }} style={{ marginBottom:14 }}>
            <option value="">— Choose a test —</option>
            {data.tests.map(t => {
              const qc = data.questions.filter(q => q.testId === t.id).length;
              return <option key={t.id} value={t.id}>{t.name} ({qc} Qs{t.negativeMarkingPct > 0 ? `, ${t.negativeMarkingPct}% neg` : ""})</option>;
            })}
          </select>

          {test && test.negativeMarkingPct > 0 && (
            <div style={{ background:P.rose, borderRadius:10, padding:"8px 12px", marginBottom:14, fontSize:12, color:P.roseD, fontWeight:500 }}>
              ⚠️ This test has {test.negativeMarkingPct}% negative marking for wrong answers
            </div>
          )}

          <p className="sec-label">Examinees</p>
          <SelectAll items={examineeIds} selected={selUsers} onToggle={setSelUsers} label="Select all examinees" />
          {examinees.map(u => (
            <label key={u.id} className="check-row" style={{ cursor:"pointer" }}>
              <input type="checkbox" checked={selUsers.includes(u.id)} onChange={() => toggleUser(u.id)} />
              <Avatar name={u.name} size={28} bg={P.mint} fg={P.mintD} />
              <span style={{ fontSize:14, color:P.text }}>{u.name}</span>
            </label>
          ))}

          <hr className="divider" />
          <p className="sec-label">Question selection</p>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {[["random","🎲 Random"], ["manual","✋ Manual pick"]].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)} style={{ flex:1, padding:"8px 12px", borderRadius:10, border:`1.5px solid ${mode === v ? P.lavenderM : P.border}`, background: mode === v ? P.lavender : "transparent", color: mode === v ? P.lavenderD : P.textSub, fontSize:13, fontWeight:500 }}>{l}</button>
            ))}
          </div>
          {mode === "random" && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:500, color:P.textSub, display:"block", marginBottom:5 }}>Number of questions (max {testQs.length})</label>
              <input type="number" value={randomCount} min={1} max={testQs.length} onChange={e => setRandomCount(+e.target.value)} placeholder={`1 – ${testQs.length}`} style={{ width:120 }} />
            </div>
          )}
          {mode === "manual" && selTest && (
            <div style={{ marginBottom:14 }}>
              <SelectAll items={testQIds} selected={manualIds} onToggle={setManualIds} label="Select all questions" />
              {testQs.map((q, i) => (
                <label key={q.id} className="check-row" style={{ cursor:"pointer" }}>
                  <input type="checkbox" checked={manualIds.includes(q.id)} onChange={() => toggleManual(q.id)} />
                  <span style={{ fontSize:13, flex:1 }}>Q{i+1}: {q.text.slice(0,50)}{q.text.length > 50 ? "…" : ""}</span>
                  <span className="tag" style={{ background:P.peach, color:P.peachD, flexShrink:0 }}>⭐{q.weightage || 1}</span>
                </label>
              ))}
            </div>
          )}

          <hr className="divider" />
          <p className="sec-label">Result release</p>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {[["immediate","⚡ Immediately"], ["scheduled","🕐 Scheduled"]].map(([v, l]) => (
              <button key={v} onClick={() => setResultRelease(v)} style={{ flex:1, padding:"8px 12px", borderRadius:10, border:`1.5px solid ${resultRelease === v ? P.lavenderM : P.border}`, background: resultRelease === v ? P.lavender : "transparent", color: resultRelease === v ? P.lavenderD : P.textSub, fontSize:13, fontWeight:500 }}>{l}</button>
            ))}
          </div>
          {resultRelease === "scheduled" && (
            <div style={{ marginBottom:14 }}>
              <input type="datetime-local" value={releaseAt} onChange={e => setReleaseAt(e.target.value)} />
            </div>
          )}

          <ErrBox msg={err} />
          <button className="btn-primary" style={{ width:"100%" }} onClick={assign}>Assign test →</button>
        </div>

        <div>
          <p className="sec-label">Existing assignments — {data.assignments.length}</p>
          {!data.assignments.length && (
            <div className="card" style={{ textAlign:"center", padding:"2rem", color:P.textLight }}>
              <p style={{ fontSize:32, margin:"0 0 8px" }}>📤</p>
              <p style={{ margin:0 }}>No assignments yet</p>
            </div>
          )}
          {data.assignments.map(a => {
            const t = data.tests.find(x => x.id === a.testId);
            const u = data.users.find(x => x.id === a.userId);
            const sub = data.submissions.find(s => s.assignmentId === a.id);
            return (
              <div key={a.id} className="card" style={{ padding:"0.9rem 1.25rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <p style={{ margin:"0 0 3px", fontWeight:600, fontSize:14 }}>{t?.name}</p>
                    <p style={{ margin:0, fontSize:12, color:P.textSub }}>→ {u?.name} · {a.questionIds.length} Qs · {a.resultRelease === "scheduled" ? `Release: ${new Date(a.releaseAt).toLocaleString()}` : "Immediate"}</p>
                  </div>
                  <span className="tag" style={{ background: sub ? P.mint : P.yellow, color: sub ? P.mintD : P.yellowD }}>{sub ? "submitted" : "pending"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Result Manager ────────────────────────────────────────────────────────────
function ResultManager({ data, save }) {
  const [selTest, setSelTest] = useState("");

  const subs = data.submissions.filter(s => {
    if (!selTest) return true;
    const a = data.assignments.find(a => a.id === s.assignmentId);
    return a?.testId === selTest;
  });

  const releaseNow = (subId) => {
    const sub = data.submissions.find(x => x.id === subId);
    const asgn = data.assignments.find(x => x.id === sub.assignmentId);
    save({ ...data, assignments: data.assignments.map(x => x.id === asgn.id ? { ...x, resultRelease:"immediate" } : x) });
  };

  return (
    <div>
      <select value={selTest} onChange={e => setSelTest(e.target.value)} style={{ marginBottom:20, maxWidth:280 }}>
        <option value="">All tests</option>
        {data.tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      {!subs.length && (
        <div className="card" style={{ textAlign:"center", padding:"2.5rem", color:P.textLight }}>
          <p style={{ fontSize:32, margin:"0 0 8px" }}>📊</p>
          <p style={{ margin:0 }}>No submissions yet</p>
        </div>
      )}

      {subs.map(sub => {
        const asgn = data.assignments.find(a => a.id === sub.assignmentId);
        const test = data.tests.find(t => t.id === asgn?.testId);
        const u = data.users.find(u => u.id === asgn?.userId);
        const isReleased = asgn?.resultRelease === "immediate" || (asgn?.releaseAt && new Date(asgn.releaseAt) <= new Date());
        const pct = sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : 0;
        const barColor = pct >= 70 ? P.mintM : pct >= 40 ? P.peachM : P.roseM;

        return (
          <div key={sub.id} className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <Avatar name={u?.name || "?"} bg={P.mint} fg={P.mintD} />
                <div>
                  <p style={{ margin:"0 0 2px", fontWeight:600, fontSize:14 }}>{u?.name}</p>
                  <p style={{ margin:0, fontSize:12, color:P.textSub }}>{test?.name} · {new Date(sub.submittedAt).toLocaleString()}</p>
                  {isReleased && (
                    <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                      <span className="tag" style={{ background:P.mint, color:P.mintD }}>✓ {sub.correctCount} correct</span>
                      <span className="tag" style={{ background:P.rose, color:P.roseD }}>✗ {sub.wrongCount} wrong</span>
                      <span className="tag" style={{ background:P.yellow, color:P.yellowD }}>— {sub.skippedCount} skipped</span>
                      {test?.negativeMarkingPct > 0 && <span className="tag" style={{ background:P.peach, color:P.peachD }}>➖ {test.negativeMarkingPct}% neg marking</span>}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                {isReleased ? (
                  <>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:20, color: pct >= 70 ? P.mintD : pct >= 40 ? P.peachD : P.roseD }}>{sub.score}/{sub.maxScore}</p>
                      <p style={{ margin:0, fontSize:12, color:P.textSub }}>pts · {pct}%</p>
                    </div>
                    <span className="tag" style={{ background:P.sky, color:P.skyD }}>Released</span>
                  </>
                ) : (
                  <>
                    <span className="tag" style={{ background:P.yellow, color:P.yellowD }}>Pending</span>
                    <button className="btn-ghost btn-sm" onClick={() => releaseNow(sub.id)}>Release now</button>
                  </>
                )}
              </div>
            </div>
            {isReleased && (
              <>
                <div style={{ background:P.offwhite, borderRadius:8, height:10, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:barColor, borderRadius:8, transition:"width 1s" }} />
                </div>
                <p style={{ margin:"4px 0 0", fontSize:11, color:P.textLight, textAlign:"right" }}>{pct}% of {sub.maxScore} marks</p>
              </>
            )}
            {!isReleased && asgn?.releaseAt && <p style={{ margin:"6px 0 0", fontSize:12, color:P.textSub }}>Scheduled: {new Date(asgn.releaseAt).toLocaleString()}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Examinee App ─────────────────────────────────────────────────────────────
function ExamineeApp({ data, save, user }) {
  const [view, setView] = useState("home");
  const [activeAsgn, setActiveAsgn] = useState(null);
  const [openReviews, setOpenReviews] = useState({});

  const mine = data.assignments.filter(a => a.userId === user.id);
  const done = mine.filter(a => data.submissions.find(s => s.assignmentId === a.id));
  const pending = mine.filter(a => !data.submissions.find(s => s.assignmentId === a.id));

  const finish = (score, maxScore, answers, correctCount, wrongCount, skippedCount) => {
    const sub = { id:uid(), assignmentId:activeAsgn.id, userId:user.id, score, maxScore, answers, correctCount, wrongCount, skippedCount, submittedAt:nowStr() };
    save({ ...data, submissions: [...data.submissions, sub] });
    setView("home");
    setActiveAsgn(null);
  };

  const toggleReview = (assignmentId) => {
    setOpenReviews(prev => ({ ...prev, [assignmentId]: !prev[assignmentId] }));
  };

  if (view === "taking") {
    return <TakeTest data={data} assignment={activeAsgn} onFinish={finish} onCancel={() => setView("home")} />;
  }

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1.75rem" }}>
        {[["Pending", pending.length, P.yellow, P.yellowD, "📋"], ["Completed", done.length, P.mint, P.mintD, "✅"]].map(([l, v, bg, fg, ic]) => (
          <div key={l} style={{ borderRadius:14, padding:"1rem 1.25rem", background:bg }}>
            <p style={{ fontSize:12, fontWeight:600, color:fg, margin:"0 0 2px", opacity:.8 }}>{ic} {l.toUpperCase()}</p>
            <p style={{ fontSize:32, fontWeight:700, color:fg, margin:0 }}>{v}</p>
          </div>
        ))}
      </div>

      <p className="sec-label">Pending tests — {pending.length}</p>
      {!pending.length && (
        <div className="card" style={{ textAlign:"center", padding:"2rem", color:P.textLight }}>
          <p style={{ fontSize:32, margin:"0 0 8px" }}>🎉</p>
          <p style={{ margin:0 }}>All caught up!</p>
        </div>
      )}
      {pending.map(a => {
        const test = data.tests.find(t => t.id === a.testId);
        const maxScore = a.questionIds.map(id => data.questions.find(q => q.id === id)).filter(Boolean).reduce((s, q) => s + (q.weightage || 1), 0);
        return (
          <div key={a.id} className="card" style={{ borderLeft:`4px solid ${P.lavenderM}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:"0 0 6px", fontWeight:600, fontSize:15 }}>{test?.name}</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span className="tag" style={{ background:P.lavender, color:P.lavenderD }}>❓ {a.questionIds.length} questions</span>
                  <span className="tag" style={{ background:P.sky, color:P.skyD }}>⏱ {test?.duration} min</span>
                  <span className="tag" style={{ background:P.peach, color:P.peachD }}>⭐ {maxScore} marks</span>
                  {test?.negativeMarkingPct > 0 && <span className="tag" style={{ background:P.rose, color:P.roseD }}>➖ {test.negativeMarkingPct}% neg</span>}
                </div>
              </div>
              <button className="btn-primary" onClick={() => { setActiveAsgn(a); setView("taking"); }}>Start test →</button>
            </div>
          </div>
        );
      })}

      <div style={{ height:"1.5rem" }} />
      <p className="sec-label">Completed tests — {done.length}</p>
      {!done.length && <div className="card" style={{ textAlign:"center", padding:"2rem", color:P.textLight }}>No completed tests yet.</div>}
      {done.map(a => {
        const test = data.tests.find(t => t.id === a.testId);
        const sub = data.submissions.find(s => s.assignmentId === a.id);
        const isReleased = a.resultRelease === "immediate" || (a.releaseAt && new Date(a.releaseAt) <= new Date());
        const pct = sub && sub.maxScore > 0 ? Math.round((sub.score / sub.maxScore) * 100) : 0;
        const reviewQuestions = a.questionIds.map(id => data.questions.find(q => q.id === id)).filter(Boolean);
        const isReviewOpen = !!openReviews[a.id];
        return (
          <div key={a.id} className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:"0 0 4px", fontWeight:600, fontSize:15 }}>{test?.name}</p>
                {isReleased && sub && (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:4 }}>
                    <span className="tag" style={{ background:P.mint, color:P.mintD }}>✓ {sub.correctCount}</span>
                    <span className="tag" style={{ background:P.rose, color:P.roseD }}>✗ {sub.wrongCount}</span>
                    <span className="tag" style={{ background:P.yellow, color:P.yellowD }}>— {sub.skippedCount} skipped</span>
                  </div>
                )}
                <p style={{ margin:0, fontSize:12, color:P.textSub }}>Submitted {new Date(sub?.submittedAt).toLocaleDateString()}</p>
              </div>
              {isReleased ? (
                <div style={{ textAlign:"right" }}>
                  <p style={{ margin:"0 0 2px", fontSize:24, fontWeight:700, color: pct >= 70 ? P.mintD : pct >= 40 ? P.peachD : P.roseD }}>{pct}%</p>
                  <p style={{ margin:0, fontSize:12, color:P.textSub }}>{sub.score}/{sub.maxScore} pts</p>
                </div>
              ) : (
                <span className="tag" style={{ background:P.yellow, color:P.yellowD }}>
                  {a.releaseAt ? `Result on ${new Date(a.releaseAt).toLocaleString()}` : "Result pending"}
                </span>
              )}
            </div>
            {isReleased && (
              <div style={{ marginTop:10, background:P.offwhite, borderRadius:8, height:8, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background: pct >= 70 ? P.mintM : pct >= 40 ? P.peachM : P.roseM, borderRadius:8 }} />
              </div>
            )}
            {isReleased && sub && (
              <div style={{ marginTop:10 }}>
                <button className="btn-ghost btn-sm" onClick={() => toggleReview(a.id)}>
                  {isReviewOpen ? "Hide review" : "Review answers"}
                </button>
              </div>
            )}
            {isReleased && sub && isReviewOpen && (
              <div style={{ marginTop:10, borderTop:`1.5px solid ${P.border}`, paddingTop:10 }}>
                {reviewQuestions.map((q, idx) => {
                  const markedIdx = sub.answers?.[q.id];
                  const correctIdx = q.correct;
                  const isSkipped = markedIdx === undefined;
                  const isCorrect = !isSkipped && markedIdx === correctIdx;
                  const statusBg = isSkipped ? P.yellow : isCorrect ? P.mint : P.rose;
                  const statusFg = isSkipped ? P.yellowD : isCorrect ? P.mintD : P.roseD;
                  return (
                    <div key={q.id} style={{ background:P.offwhite, border:`1px solid ${P.border}`, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                      <div style={{ display:"flex", gap:8, justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <p style={{ margin:0, fontSize:13, fontWeight:600, color:P.text, flex:1 }}>Q{idx + 1}. {q.text}</p>
                        <span className="tag" style={{ background:statusBg, color:statusFg }}>
                          {isSkipped ? "Skipped" : isCorrect ? "Correct" : "Wrong"}
                        </span>
                      </div>
                      <p style={{ margin:"0 0 3px", fontSize:12, color:P.textSub }}>
                        Your answer:{" "}
                        <span style={{ fontWeight:600, color:isSkipped ? P.textSub : isCorrect ? P.mintD : P.roseD }}>
                          {isSkipped ? "Not answered" : `${OPT_LABELS[markedIdx]}. ${q.options[markedIdx]}`}
                        </span>
                      </p>
                      <p style={{ margin:0, fontSize:12, color:P.mintD, fontWeight:600 }}>
                        Correct answer: {OPT_LABELS[correctIdx]}. {q.options[correctIdx]}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Take Test ─────────────────────────────────────────────────────────────────
function TakeTest({ data, assignment, onFinish, onCancel }) {
  const questions = assignment.questionIds.map(id => data.questions.find(q => q.id === id)).filter(Boolean);
  const test = data.tests.find(t => t.id === assignment.testId);
  const totalSecs = (test?.duration || 30) * 60;

  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [current, setCurrent] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    if (confirmed && questions[current]) {
      setVisited(v => ({ ...v, [questions[current].id]: true }));
    }
  }, [current, confirmed]);

  const doSubmit = useCallback((ans) => {
    clearInterval(timerRef.current);
    let score = 0, maxScore = 0, correctCount = 0, wrongCount = 0, skippedCount = 0;
    questions.forEach(q => {
      const w = q.weightage || 1;
      maxScore += w;
      if (ans[q.id] === undefined) { skippedCount++; return; }
      if (ans[q.id] === q.correct) { score += w; correctCount++; }
      else { score -= w * ((test?.negativeMarkingPct || 0) / 100); wrongCount++; }
    });
    score = Math.max(0, Math.round(score * 100) / 100);
    maxScore = Math.round(maxScore * 100) / 100;
    onFinish(score, maxScore, ans, correctCount, wrongCount, skippedCount);
  }, [questions, test, onFinish]);

  useEffect(() => {
    if (!confirmed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { doSubmit(answersRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [confirmed, doSubmit]);

  const fmt = (s) => { const m = Math.floor(s / 60), sec = s % 60; return `${m}:${sec.toString().padStart(2,"0")}`; };
  const pctTime = timeLeft / totalSecs;
  const timerColor = pctTime > 0.33 ? P.mintD : pctTime > 0.15 ? P.peachD : P.roseD;
  const timerBg = pctTime > 0.33 ? P.mint : pctTime > 0.15 ? P.peach : P.rose;
  const isUrgent = pctTime <= 0.15;

  const tileState = (q) => {
    if (answers[q.id] !== undefined) return "answered";
    if (visited[q.id]) return "visited";
    return "untouched";
  };

  const tileStyleFor = (q, i) => {
    const st = tileState(q);
    const isCur = i === current;
    const bg = st === "answered" ? "#bbf7d0" : st === "visited" ? "#fef08a" : "#f3f4f6";
    const fg = st === "answered" ? P.mintD : st === "visited" ? P.yellowD : P.textSub;
    return {
      background: bg, color: fg,
      border: `2px solid ${isCur ? P.lavenderD : st === "answered" ? P.mintM : st === "visited" ? P.yellowM : "#e5e7eb"}`,
      boxShadow: isCur ? `0 0 0 3px ${P.lavender}` : "none",
    };
  };

  const answeredCount = Object.keys(answers).length;
  const visitedUnanswered = Object.keys(visited).filter(id => answers[id] === undefined).length;
  const untouched = questions.length - Object.keys(visited).length;

  if (!confirmed) {
    const maxScore = questions.reduce((s, q) => s + (q.weightage || 1), 0);
    return (
      <div style={{ maxWidth:500, margin:"0 auto" }}>
        <div className="card-flat" style={{ textAlign:"center", padding:"2.5rem" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
          <h2 style={{ fontSize:20, fontWeight:700, color:P.text, margin:"0 0 8px" }}>{test?.name}</h2>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
            <span className="tag" style={{ background:P.lavender, color:P.lavenderD }}>❓ {questions.length} questions</span>
            <span className="tag" style={{ background:P.sky, color:P.skyD }}>⏱ {test?.duration} min</span>
            <span className="tag" style={{ background:P.peach, color:P.peachD }}>⭐ {maxScore} marks</span>
            {(test?.negativeMarkingPct || 0) > 0 && <span className="tag" style={{ background:P.rose, color:P.roseD }}>➖ {test.negativeMarkingPct}% negative marking</span>}
          </div>
          <p style={{ fontSize:13, color:P.textSub, margin:"0 0 20px" }}>Complete in one sitting. The timer starts when you begin.</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button className="btn-primary" style={{ padding:"10px 28px" }} onClick={() => setConfirmed(true)}>Begin test →</button>
            <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:"1.25rem", alignItems:"start" }}>
      {/* Main area */}
      <div>
        {/* Timer bar */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem", background:P.white, borderRadius:12, padding:"10px 16px", border:`1.5px solid ${P.border}`, boxShadow:P.shadow }}>
          <div className={isUrgent ? "pulse" : ""}
            style={{ background:timerBg, borderRadius:10, padding:"6px 14px", fontWeight:700, fontSize:18, color:timerColor, minWidth:80, textAlign:"center", fontFamily:"monospace" }}>
            ⏱ {fmt(timeLeft)}
          </div>
          <div style={{ flex:1, height:8, background:P.border, borderRadius:4, overflow:"hidden" }}>
            <div style={{ width:`${pctTime * 100}%`, height:"100%", background:timerColor, borderRadius:4, transition:"width 1s linear" }} />
          </div>
          <span style={{ fontSize:13, color:P.textSub, whiteSpace:"nowrap" }}>Q {current+1}/{questions.length}</span>
        </div>

        {/* Question card */}
        <div className="card-flat" style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <p style={{ fontSize:16, fontWeight:600, color:P.text, margin:0, lineHeight:1.5, flex:1, paddingRight:12 }}>Q{current+1}. {q.text}</p>
            <span className="tag" style={{ background:P.peach, color:P.peachD, flexShrink:0 }}>⭐ {q.weightage || 1} mark{(q.weightage || 1) !== 1 ? "s" : ""}</span>
          </div>
          {q.options.map((opt, i) => {
            const sel = answers[q.id] === i;
            return (
              <div key={i} className={`opt-row${sel ? " sel" : ""}`}
                onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                style={{ borderColor: sel ? P.lavenderD : P.border, background: sel ? P.lavender : P.white }}>
                <span style={{ width:32, height:32, borderRadius:"50%", background: sel ? P.lavenderD : OPT_COLORS[i], color: sel ? P.white : P.text, display:"inline-flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 }}>{OPT_LABELS[i]}</span>
                <span style={{ fontSize:14, color: sel ? P.lavenderD : P.text, fontWeight: sel ? 500 : 400 }}>{opt}</span>
                {sel && <span style={{ marginLeft:"auto", fontSize:12, color:P.lavenderD }}>✓ Selected</span>}
              </div>
            );
          })}
          {answers[q.id] !== undefined && (
            <button onClick={() => setAnswers(a => { const n = { ...a }; delete n[q.id]; return n; })}
              style={{ background:"none", border:"none", color:P.textSub, fontSize:12, padding:0, marginTop:4, textDecoration:"underline", cursor:"pointer" }}>
              Clear selection
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button className="btn-ghost" disabled={current === 0} onClick={() => setCurrent(c => c - 1)} style={{ opacity: current === 0 ? .4 : 1 }}>← Prev</button>
          <button className="btn-primary" onClick={() => { if (confirm(`Submit? ${questions.length - answeredCount} question(s) unanswered.`)) doSubmit(answers); }}>Submit ✓</button>
          <button className="btn-ghost" disabled={current === questions.length - 1} onClick={() => setCurrent(c => c + 1)} style={{ opacity: current === questions.length - 1 ? .4 : 1 }}>Next →</button>
        </div>
      </div>

      {/* Side panel */}
      <div style={{ position:"sticky", top:74 }}>
        <div className="card-flat" style={{ padding:"1rem" }}>
          <p style={{ fontWeight:600, fontSize:14, color:P.text, margin:"0 0 12px" }}>Question navigator</p>

          {/* Legend */}
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
            {[
              ["#bbf7d0", P.mintD, "Answered", answeredCount],
              ["#fef08a", P.yellowD, "Visited, unanswered", visitedUnanswered],
              ["#f3f4f6", P.textSub, "Not visited", untouched],
            ].map(([bg, fg, lbl, cnt]) => (
              <div key={lbl} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12 }}>
                <div style={{ width:14, height:14, borderRadius:4, background:bg, flexShrink:0, border:"1px solid #e5e7eb" }} />
                <span style={{ color:P.textSub, flex:1 }}>{lbl}</span>
                <span style={{ fontWeight:600, color:fg }}>{cnt}</span>
              </div>
            ))}
          </div>

          {/* Tile grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginBottom:14 }}>
            {questions.map((q, i) => (
              <div key={q.id} className="q-tile" style={tileStyleFor(q, i)} onClick={() => setCurrent(i)} title={`Q${i+1} · ${q.weightage || 1}pt`}>{i+1}</div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ background:P.offwhite, borderRadius:10, padding:"10px 12px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
              <span style={{ color:P.textSub }}>Answered</span>
              <span style={{ fontWeight:600, color:P.mintD }}>{answeredCount}/{questions.length}</span>
            </div>
            <div style={{ height:6, background:P.border, borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:`${(answeredCount / questions.length) * 100}%`, height:"100%", background:P.mintM, borderRadius:3 }} />
            </div>
          </div>

          <button className="btn-primary" style={{ width:"100%", fontSize:13 }}
            onClick={() => { if (confirm(`Submit? ${questions.length - answeredCount} question(s) unanswered.`)) doSubmit(answers); }}>
            Submit test ✓
          </button>
          {(test?.negativeMarkingPct || 0) > 0 && (
            <p style={{ fontSize:11, color:P.roseD, margin:"8px 0 0", textAlign:"center" }}>⚠️ Wrong answers: −{test.negativeMarkingPct}% per question</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { data, save, loading } = useStorage();
  const [user, setUser] = useState(null);

  const roleLabel = { admin:"Admin Control Center", examiner:"Examiner Dashboard", examinee:"My Tests" };

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${P.lavender},${P.sky},${P.mint})` }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>📝</div>
            <p style={{ color:P.textSub }}>Loading…</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return <Login data={data} save={save} onLogin={setUser} />;
  }

  const rm = ROLE_META[user.role] || {};

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:P.offwhite }}>
        <div style={{ background:P.white, borderBottom:`1.5px solid ${P.border}`, padding:"0 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", height:58, position:"sticky", top:0, zIndex:100, boxShadow:P.shadow }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>📝</span>
            <span style={{ fontWeight:700, fontSize:16, color:P.text }}>MCQ Platform</span>
            <span style={{ fontSize:13, color:P.textSub }}>/</span>
            <span style={{ fontSize:13, color:P.textSub }}>{roleLabel[user.role]}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Avatar name={user.name} size={32} bg={rm.color || P.lavender} fg={rm.dot || P.lavenderD} />
            <span style={{ fontSize:13, fontWeight:500, color:P.text }}>{user.name}</span>
            <Badge type={user.role} />
            <button className="btn-ghost btn-sm" onClick={() => setUser(null)}>Sign out</button>
          </div>
        </div>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"1.75rem 1.25rem" }}>
          {user.role === "admin"    && <AdminPortal data={data} save={save} user={user} />}
          {user.role === "examiner" && <ExaminerApp data={data} save={save} user={user} />}
          {user.role === "examinee" && <ExamineeApp data={data} save={save} user={user} />}
        </div>
      </div>
    </>
  );
}
