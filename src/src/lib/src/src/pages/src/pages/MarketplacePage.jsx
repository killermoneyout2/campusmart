import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { key:'all',       label:'All',             emoji:'🏪' },
  { key:'notes',     label:'Notes',           emoji:'📓' },
  { key:'tutoring',  label:'Tutoring',        emoji:'🧑‍🏫' },
  { key:'snacks',    label:'Snacks & Crafts', emoji:'🍫' },
  { key:'textbooks', label:'Textbooks',       emoji:'📚' },
]

const typeColors = {
  notes:     { bg:'#FFF3CD', accent:'#D4A017', text:'#7A5C00' },
  tutoring:  { bg:'#D1F0E5', accent:'#1A9E6E', text:'#0A5C3E' },
  snacks:    { bg:'#FFE4E4', accent:'#E05252', text:'#8B1A1A' },
  textbooks: { bg:'#DDE8FF', accent:'#3A5FCD', text:'#1A2E7A' },
}

export default function MarketplacePage({ session }) {
  const [listings, setListings]      = useState([])
  const [loading, setLoading]        = useState(true)
  const [category, setCategory]      = useState('all')
  const [search, setSearch]          = useState('')
  const [showForm, setShowForm]      = useState(false)
  const [contactListing, setContact] = useState(null)

  const fetchListings = async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, profiles(full_name)')
      .eq('sold', false)
      .order('created_at', { ascending: false })
    if (category !== 'all') query = query.eq('type', category)
    if (search) query = query.ilike('title', `%${search}%`)
    const { data, error } = await query
    if (!error) setListings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [category, search])

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#1a1208,#2e2010,#3d2a10)', padding:'40px 24px 32px', textAlign:'center' }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,5vw,40px)', color:'#fff', margin:'0 0 8px' }}>
          Your Campus. <span style={{ color:'#D4A017' }}>Your Marketplace.</span>
        </h1>
        <p style={{ color:'#a08060', fontStyle:'italic', margin:'0 0 24px' }}>Notes · Tutoring · Snacks · Textbooks</p>
        <div style={{ maxWidth:500, margin:'0 auto', position:'relative' }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..." style={{
              width:'100%', padding:'13px 14px 13px 42px', borderRadius:12,
              border:'2px solid rgba(212,160,23,0.3)', background:'rgba(255,255,255,0.07)',
              color:'#fff', fontSize:15, fontFamily:"'Lora',serif", outline:'none', boxSizing:'border-box'
            }} />
        </div>
      </div>

      <div style={{ background:'#fff', borderBottom:'2px solid #f0ece4', padding:'0 16px', display:'flex', overflowX:'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)} style={{
            padding:'13px 16px', border:'none', background:'none', whiteSpace:'nowrap',
            fontFamily:"'Syne',sans-serif", fontWeight: category===c.key ? 700 : 500,
            color: category===c.key ? '#D4A017' : '#888', cursor:'pointer',
            borderBottom: category===c.key ? '3px solid #D4A017' : '3px solid transparent',
            marginBottom:-2, fontSize:14
          }}>{c.emoji} {c.label}</button>
        ))}
        <button onClick={() => setShowForm(true)} style={{
          marginLeft:'auto', padding:'10px 18px', background:'#D4A017', color:'#fff',
          border:'none', borderRadius:10, fontFamily:"'Syne',sans-serif", fontWeight:700,
          fontSize:13, cursor:'pointer', alignSelf:'center', whiteSpace:'nowrap'
        }}>+ List Item</button>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 20px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#bbb', fontStyle:'italic' }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔦</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:'#ccc' }}>No listings yet</div>
            <div style={{ fontStyle:'italic', marginTop:6, color:'#bbb' }}>Be the first to list something!</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:20 }}>
            {listings.map(item => (
              <ListingCard key={item.id} item={item} session={session} onContact={() => setContact(item)} />
            ))}
          </div>
        )}
      </div>

      {showForm && <ListingForm
