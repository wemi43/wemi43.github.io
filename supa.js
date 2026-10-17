// Conexión a Supabase + login de dueño (compartido por las 3 páginas)
const SUPABASE_URL = 'https://hkwhkgrlzxsfeonmhevd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fpKAPtkhRsGJBkjtpvX5vQ_WM08Gbrg';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Quien no inició sesión solo mira: se ocultan los controles de edición
const style = document.createElement('style');
style.textContent = `
body:not(.is-owner) .add-note-box, body:not(.is-owner) .delete-note, body:not(.is-owner) .delete-btn,
body:not(.is-owner) .delete-photo-btn, body:not(.is-owner) label[for="audio-input"], body:not(.is-owner) #youtube-url,
body:not(.is-owner) #add-youtube, body:not(.is-owner) label[for="foto-input"] { display: none !important; }
#owner-btn { position: fixed; bottom: 14px; right: 14px; z-index: 9999; width: 40px; height: 40px; border-radius: 50%;
  border: none; background: rgba(255,255,255,.25); backdrop-filter: blur(6px); font-size: 18px; cursor: pointer; opacity: .6; }
#owner-btn:hover { opacity: 1; }
#owner-modal { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,.6); display: none; align-items: center; justify-content: center; }
#owner-modal.open { display: flex; }
#owner-modal form { background: #fff; color: #333; padding: 24px; border-radius: 16px; width: 90%; max-width: 320px; display: flex; flex-direction: column; gap: 10px; font-family: sans-serif; }
#owner-modal input { padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; }
#owner-modal button { padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
`;
document.head.appendChild(style);

const ownerBtn = document.createElement('button');
ownerBtn.id = 'owner-btn';
const modal = document.createElement('div');
modal.id = 'owner-modal';
modal.innerHTML = `<form><strong>Iniciar sesión</strong>
  <input type="email" id="owner-email" placeholder="Email" required>
  <input type="password" id="owner-pass" placeholder="Contraseña" required>
  <button type="submit" style="background:#3a98b9;color:#fff">Entrar</button>
  <button type="button" id="owner-cancel" style="background:#eee">Cancelar</button></form>`;
document.body.append(ownerBtn, modal);

function setOwner(on) {
    document.body.classList.toggle('is-owner', on);
    ownerBtn.textContent = on ? '🔓' : '🔒';
    ownerBtn.title = on ? 'Cerrar sesión' : 'Iniciar sesión';
}

ownerBtn.onclick = async () => {
    if (document.body.classList.contains('is-owner')) {
        if (confirm('¿Cerrar sesión?')) await sb.auth.signOut();
    } else {
        modal.classList.add('open');
        document.getElementById('owner-email').focus();
    }
};
document.getElementById('owner-cancel').onclick = () => modal.classList.remove('open');
modal.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({
        email: document.getElementById('owner-email').value.trim(),
        password: document.getElementById('owner-pass').value
    });
    if (error) { alert('Email o contraseña incorrectos.'); return; }
    document.getElementById('owner-pass').value = '';
    modal.classList.remove('open');
};

sb.auth.getSession().then(({ data }) => setOwner(!!data.session));
sb.auth.onAuthStateChange((_e, s) => setOwner(!!s));
