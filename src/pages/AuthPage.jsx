import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setError(''); setMessage(''); setLoading(true)
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', background:'#1a1208',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Lora',serif", padding:20
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Lora&display=swap');
        * { box-sizing: border-box; }
        .auth-card { width: 100%; max-width: 380px; }
        @media (max-width: 420px) { .auth-card { padding: 28px 20px !important; } }
      `}</style>

      <div className="auth-card" style={{
        background:'#fff', borderRadius:24, padding:'36px 32px',
        boxShadow:'0 24px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{
            width:72, height:72, background:'#D4A017', borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:34, margin:'0 auto 12px',
            boxShadow:'0 6px 20px rgba(212,160,23,0.4)'
          }}>🎓</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:'#1a1208' }}>CampusMart</div>
          <div style={{ fontStyle:'italic', color:'#a08060', fontSize:13, marginTop:3 }}>your school marketplace</div>
        </div>

        {/* Toggle */}
        <div style={{ display:'flex', background:'#f0ece4', borderRadius:12, padding:4, marginBottom:22 }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
              flex:1, padding:'10px 0', borderRadius:9, border:'none',
              background: mode===m ? '#1a1208' : 'transparent',
              color: mode===m ? '#fff' : '#888',
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer',
              transition:'all 0.2s'
            }}>{m === 'login' ? 'Log In' : 'Sign Up'}</button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {mode === 'signup' && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name" style={inp} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="School email address" type="email" style={inp} />
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" type="password" style={inp} />

          {error   && <div style={{ background:'#fff0f0', color:'#c0392b', padding:'10px 14px', borderRadius:10, fontSize:13 }}>⚠️ {error}</div>}
          {message && <div style={{ background:'#f0fff4', color:'#1a9e6e', padding:'10px 14px', borderRadius:10, fontSize:13 }}>✅ {message}</div>}

          <button onClick={handle} disabled={loading} style={{
            padding:'14px 0', borderRadius:12, background:'#D4A017', color:'#fff',
            border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop:4
          }}>{loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}</button>
        </div>

        <div style={{ textAlign:'center', marginTop:18, fontSize:12, color:'#bbb', fontStyle:'italic' }}>
          Use your school email to join 🏫
        </div>
      </div>
    </div>
  )
}

const inp = {
  padding:'12px 14px', borderRadius:10, border:'1.5px solid #e0d9cc',
  fontFamily:"'Lora',serif", fontSize:15, outline:'none',
  color:'#333', background:'#faf7f2', width:'100%'
}
