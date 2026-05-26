import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import MarketplacePage from './pages/MarketplacePage'
import MessagesPage from './pages/MessagesPage'
import MyListingsPage from './pages/MyListingsPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('market')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#faf7f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, color:'#a08060' }}>Loading CampusMart...</div>
    </div>
  )

  if (!session) return <AuthPage />

  return (
    <div style={{ minHeight:'100vh', background:'#faf7f2', fontFamily:"'Lora',serif" }}>
      <Nav page={page} setPage={setPage} session={session} />
      {page === 'market'     && <MarketplacePage session={session} />}
      {page === 'messages'   && <MessagesPage session={session} />}
      {page === 'mylistings' && <MyListingsPage session={session} />}
    </div>
  )
}

function Nav({ page, setPage, session }) {
  const signOut = () => supabase.auth.signOut()
  return (
    <header style={{
      background:'#1a1208', color:'#fff', padding:'0 24px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height:60, position:'sticky', top:0, zIndex:100,
      boxShadow:'0 2px 20px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:22 }}>🎓</span>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17 }}>CampusMart</span>
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {[
          { key:'market',     label:'🏪 Market' },
          { key:'messages',   label:'💬 Messages' },
          { key:'mylistings', label:'📦 My Listings' },
        ].map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{
            background: page===n.key ? '#D4A017' : 'transparent',
            color:'#fff', border:'none', padding:'6px 14px', borderRadius:8,
            fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13
