import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import MarketplacePage from './pages/MarketplacePage'
import MessagesPage from './pages/MessagesPage'
import MyListingsPage from './pages/MyListingsPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading]  = useState(true)
  const [page, setPage]        = useState('market')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    const check = async () => {
      const { data } = await supabase.from('messages').select('id').eq('receiver_id', session.user.id)
      setUnreadCount(data?.length || 0)
    }
    check()
    const t = setInterval(check, 15000)
    return () => clearInterval(t)
  }, [session])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#faf7f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, color:'#a08060' }}>Loading CampusMart...</div>
    </div>
  )

  if (!session) return <AuthPage />

  return (
    <div style={{ minHeight:'100vh', background:'#faf7f2', fontFamily:"'Lora',serif", paddingBottom:70 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
      {/* Top nav — desktop */}
      <DesktopNav page={page} setPage={setPage} session={session} unreadCount={unreadCount} />
      {/* Content */}
      {page === 'market'     && <MarketplacePage session={session} />}
      {page === 'messages'   && <MessagesPage   session={session} />}
      {page === 'mylistings' && <MyListingsPage  session={session} />}
      {/* Bottom nav — mobile */}
      <MobileNav page={page} setPage={setPage} unreadCount={unreadCount} />
    </div>
  )
}

function DesktopNav({ page, setPage, session, unreadCount }) {
  const signOut = () => supabase.auth.signOut()
  return (
    <header style={{
      background:'#1a1208', color:'#fff', padding:'0 24px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height:58, position:'sticky', top:0, zIndex:200,
      boxShadow:'0 2px 20px rgba(0,0,0,0.3)'
    }}>
      <style>{`
        @media (max-width: 600px) { .desktop-nav-links { display: none !important; } .desktop-nav-email { display: none !important; } }
      `}</style>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:22 }}>🎓</span>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17 }}>CampusMart</span>
      </div>

      <div className="desktop-nav-links" style={{ display:'flex', gap:4 }}>
        {[
          { key:'market',     label:'🏪 Market' },
          { key:'messages',   label:'💬 Messages',  badge: unreadCount },
          { key:'mylistings', label:'📦 My Listings' },
        ].map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{
            background: page===n.key ? '#D4A017' : 'transparent',
            color:'#fff', border:'none', padding:'6px 14px', borderRadius:8,
            fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13,
            cursor:'pointer', position:'relative'
          }}>
            {n.label}
            {n.badge > 0 && (
              <span style={{
                position:'absolute', top:2, right:2,
                background:'#E05252', color:'#fff', fontSize:9,
                fontWeight:700, padding:'1px 5px', borderRadius:20
              }}>{n.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="desktop-nav-email" style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:11, color:'#a08060' }}>{session.user.email}</span>
        <button onClick={signOut} style={{
          background:'transparent', color:'#a08060', border:'1px solid #3a2810',
          padding:'5px 12px', borderRadius:8, fontFamily:"'Syne',sans-serif",
          fontSize:11, cursor:'pointer'
        }}>Sign out</button>
      </div>
    </header>
  )
}

function MobileNav({ page, setPage, unreadCount }) {
  const signOut = () => supabase.auth.signOut()
  const items = [
    { key:'market',     label:'Market',  icon:'🏪' },
    { key:'messages',   label:'Messages', icon:'💬', badge: unreadCount },
    { key:'mylistings', label:'Listings', icon:'📦' },
  ]
  return (
    <>
      <style>{`
        .mobile-nav { display: none; }
        @media (max-width: 600px) { .mobile-nav { display: flex !important; } }
        @media (max-width: 600px) { .desktop-sign-out { display: none !important; } }
      `}</style>
      {/* Sign out button — mobile only, inside header gutter */}
      <div className="mobile-nav" style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:300,
        background:'#1a1208', borderTop:'2px solid #2e2010',
        display:'none', justifyContent:'space-around', alignItems:'center',
        height:64, paddingBottom:'env(safe-area-inset-bottom)'
      }}>
        {items.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{
            background:'none', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            padding:'8px 20px', position:'relative',
            opacity: page===n.key ? 1 : 0.5,
            borderTop: page===n.key ? '3px solid #D4A017' : '3px solid transparent',
          }}>
            <span style={{ fontSize:22 }}>{n.icon}</span>
            <span style={{
              fontFamily:"'Syne',sans-serif", fontSize:10, fontWeight:700,
              color: page===n.key ? '#D4A017' : '#fff'
            }}>{n.label}</span>
            {n.badge > 0 && (
              <span style={{
                position:'absolute', top:4, right:10,
                background:'#E05252', color:'#fff', fontSize:9,
                fontWeight:700, padding:'1px 5px', borderRadius:20
              }}>{n.badge}</span>
            )}
          </button>
        ))}
        <button onClick={signOut} style={{
          background:'none', border:'none', cursor:'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          padding:'8px 16px', opacity:0.4
        }}>
          <span style={{ fontSize:20 }}>🚪</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:10, fontWeight:700, color:'#fff' }}>Out</span>
        </button>
      </div>
    </>
  )
}
