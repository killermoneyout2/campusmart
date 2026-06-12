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
  const [listings, setListings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [category, setCategory]     = useState('all')
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [contactItem, setContact]   = useState(null)

  const fetchListings = async () => {
    setLoading(true)
    let q = supabase.from('listings').select('*, profiles(full_name)')
      .eq('sold', false).order('created_at', { ascending: false })
    if (category !== 'all') q = q.eq('type', category)
    if (search) q = q.ilike('title', `%${search}%`)
    const { data, error } = await q
    if (!error) setListings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [category, search])

  return (
    <div>
      <style>{`
        .hero-title { font-size: clamp(22px, 6vw, 38px); }
        .hero-sub { font-size: 14px; }
        .hero-padding { padding: 32px 20px 24px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 16px; }
        .list-btn { display: flex; }
        @media (max-width: 600px) {
          .hero-padding { padding: 24px 16px 20px; }
          .grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .list-btn { display: none; }
        }
        @media (max-width: 380px) {
          .grid { grid-template-columns: 1fr; }
        }
        .tab-bar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1a1208,#2e2010,#3d2a10)' }} className="hero-padding">
        <h1 className="hero-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', margin:'0 0 6px', lineHeight:1.1, textAlign:'center' }}>
          Your Campus. <span style={{ color:'#D4A017' }}>Your Market.</span>
        </h1>
        <p className="hero-sub" style={{ color:'#a08060', fontStyle:'italic', margin:'0 0 18px', textAlign:'center' }}>
          Notes · Tutoring · Snacks · Textbooks
        </p>
        <div style={{ position:'relative', maxWidth:480, margin:'0 auto' }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..."
            style={{
              width:'100%', padding:'12px 14px 12px 40px', borderRadius:12,
              border:'1.5px solid rgba(212,160,23,0.3)', background:'rgba(255,255,255,0.07)',
              color:'#fff', fontSize:15, fontFamily:"'Lora',serif", outline:'none',
              boxSizing:'border-box'
            }} />
        </div>
      </div>

      {/* Tabs + List button */}
      <div style={{ background:'#fff', borderBottom:'2px solid #f0ece4', display:'flex', alignItems:'center' }}>
        <div className="tab-bar" style={{ display:'flex', overflowX:'auto', flex:1, scrollbarWidth:'none' }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding:'12px 14px', border:'none', background:'none', whiteSpace:'nowrap',
              fontFamily:"'Syne',sans-serif", fontWeight: category===c.key ? 700 : 500,
              color: category===c.key ? '#D4A017' : '#888', cursor:'pointer', fontSize:13,
              borderBottom: category===c.key ? '3px solid #D4A017' : '3px solid transparent',
              marginBottom:-2, flexShrink:0
            }}>{c.emoji} {c.label}</button>
          ))}
        </div>
        <button className="list-btn" onClick={() => setShowForm(true)} style={{
          padding:'8px 16px', background:'#D4A017', color:'#fff', border:'none',
          borderRadius:8, fontFamily:"'Syne',sans-serif", fontWeight:700,
          fontSize:12, cursor:'pointer', margin:'0 12px', whiteSpace:'nowrap', alignItems:'center'
        }}>+ List Item</button>
      </div>

      {/* Mobile FAB — list item button */}
      <style>{`
        .fab { display: none; }
        @media (max-width: 600px) { .fab { display: flex !important; } }
      `}</style>
      <button className="fab" onClick={() => setShowForm(true)} style={{
        position:'fixed', bottom:74, right:16, zIndex:250,
        background:'#D4A017', color:'#fff', border:'none',
        width:52, height:52, borderRadius:'50%',
        fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26,
        cursor:'pointer', boxShadow:'0 4px 20px rgba(212,160,23,0.5)',
        alignItems:'center', justifyContent:'center', display:'none'
      }}>+</button>

      {/* Grid */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 14px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#bbb', fontStyle:'italic' }}>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🔦</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#ccc' }}>No listings yet</div>
            <div style={{ fontStyle:'italic', color:'#bbb', marginTop:4, fontSize:13 }}>Be the first to list something!</div>
          </div>
        ) : (
          <div className="grid">
            {listings.map(item => (
              <Card key={item.id} item={item} session={session} onContact={() => setContact(item)} />
            ))}
          </div>
        )}
      </div>

      {showForm   && <ListingForm  session={session} onClose={() => { setShowForm(false); fetchListings() }} />}
      {contactItem && <ContactModal listing={contactItem} session={session} onClose={() => setContact(null)} />}
    </div>
  )
}

function Card({ item, session, onContact }) {
  const colors = typeColors[item.type] || typeColors.notes
  const isOwn  = item.seller_id === session.user.id
  const emoji  = { notes:'📓', tutoring:'🧑‍🏫', snacks:'🍫', textbooks:'📚' }[item.type]

  return (
    <div style={{
      background:'#fff', borderRadius:16, border:'2px solid #f0ece4',
      overflow:'hidden', display:'flex', flexDirection:'column',
      boxShadow:'0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Image / emoji header */}
      <div style={{ background:colors.bg, height:100, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', flexShrink:0 }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontSize:42 }}>{emoji}</span>
        }
        <span style={{
          position:'absolute', top:8, left:8, background:colors.accent, color:'#fff',
          fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20,
          fontFamily:"'Syne',sans-serif", textTransform:'uppercase'
        }}>{item.type}</span>
      </div>

      {/* Body */}
      <div style={{ padding:'10px 12px 12px', display:'flex', flexDirection:'column', gap:4, flex:1 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#1a1208', lineHeight:1.3 }}>
          {item.title}
        </div>
        <div style={{ fontSize:12, color:'#aaa', fontStyle:'italic' }}>
          {item.profiles?.full_name || 'Student'}
        </div>
        {item.description && (
          <div style={{ fontSize:11, color:'#888', lineHeight:1.4 }}>
            {item.description.slice(0,60)}{item.description.length>60?'…':''}
          </div>
        )}
        <div style={{ marginTop:'auto', paddingTop:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:colors.accent }}>
            ${item.price}{item.type==='tutoring' ? <span style={{ fontSize:10, color:'#aaa' }}>/hr</span> : ''}
          </span>
        </div>
        {!isOwn && (
          <button onClick={onContact} style={{
            padding:'8px 0', borderRadius:10, background:colors.accent, color:'#fff',
            border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12,
            cursor:'pointer', marginTop:4, width:'100%'
          }}>Contact</button>
        )}
        {isOwn && (
          <div style={{ textAlign:'center', fontSize:11, color:'#ccc', fontStyle:'italic', paddingTop:4 }}>Your listing</div>
        )}
      </div>
    </div>
  )
}

function ListingForm({ session, onClose }) {
  const [form, setForm]     = useState({ title:'', type:'notes', price:'', description:'' })
  const [image, setImage]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const submit = async () => {
    if (!form.title || !form.price) { setError('Title and price are required'); return }
    setLoading(true); setError('')
    let image_url = null
    if (image) {
      const ext = image.name.split('.').pop()
      const fn  = `${session.user.id}-${Date.now()}.${ext}`
      const { error: ue } = await supabase.storage.from('listing-images').upload(fn, image)
      if (ue) { setError('Image upload failed'); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(fn)
      image_url = publicUrl
    }
    await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
      email: session.user.email
    })
    const { error: ie } = await supabase.from('listings').insert({
      ...form, price: parseFloat(form.price), seller_id: session.user.id, image_url, sold: false
    })
    if (ie) setError(ie.message)
    else onClose()
    setLoading(false)
  }

  return (
    <Modal onClose={onClose} title="📦 List Something">
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
          placeholder="Title" style={inp} />
        <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} style={inp}>
          <option value="notes">📓 Notes</option>
          <option value="tutoring">🧑‍🏫 Tutoring</option>
          <option value="snacks">🍫 Snacks / Crafts</option>
          <option value="textbooks">📚 Textbook</option>
        </select>
        <input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))}
          placeholder="Price ($)" style={inp} />
        <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
          placeholder="Describe your listing..." rows={3} style={{ ...inp, resize:'none' }} />
        <div>
          <label style={{ fontSize:12, color:'#888', display:'block', marginBottom:6 }}>Photo (optional)</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
            style={{ fontSize:13, color:'#555', width:'100%' }} />
        </div>
        {error && <div style={{ background:'#fff0f0', color:'#c0392b', padding:'10px 14px', borderRadius:10, fontSize:13 }}>⚠️ {error}</div>}
        <button onClick={submit} disabled={loading} style={submitBtn(loading)}>
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </div>
    </Modal>
  )
}

function ContactModal({ listing, session, onClose }) {
  const [msg, setMsg]     = useState('')
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!msg.trim()) return
    setLoading(true)
    await supabase.from('messages').insert({
      listing_id: listing.id, sender_id: session.user.id,
      receiver_id: listing.seller_id, content: msg
    })
    setSent(true); setLoading(false)
  }

  return (
    <Modal onClose={onClose} title={`💬 ${listing.title}`}>
      {!sent ? (
        <>
          <div style={{ fontSize:13, color:'#888', fontStyle:'italic', marginBottom:12 }}>
            Meet in person to exchange 💰
          </div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="Hi! I'm interested..." rows={4}
            style={{ ...inp, resize:'none', width:'100%', boxSizing:'border-box' }} />
          <button onClick={send} disabled={loading} style={{ ...submitBtn(loading), marginTop:12 }}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </>
      ) : (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#1A9E6E' }}>Message sent!</div>
          <div style={{ fontSize:13, color:'#888', fontStyle:'italic', marginTop:6 }}>Meet in person to finalize.</div>
          <button onClick={onClose} style={{ ...submitBtn(false), marginTop:16, background:'#1a1208' }}>Close</button>
        </div>
      )}
    </Modal>
  )
}

function Modal({ onClose, title, children }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(20,14,0,0.65)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      zIndex:1000, backdropFilter:'blur(3px)'
    }} onClick={onClose}>
      <style>{`
        .modal-sheet { border-radius: 22px 22px 0 0 !important; max-height: 92vh; }
        @media (min-width: 600px) { .modal-sheet { border-radius: 22px !important; max-width: 420px; margin: auto; } }
      `}</style>
      <div className="modal-sheet" style={{
        background:'#fff', padding:24, width:'100%',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.2)', position:'relative', overflowY:'auto'
      }} onClick={e=>e.stopPropagation()}>
        {/* Drag handle */}
        <div style={{ width:40, height:4, background:'#e0d9cc', borderRadius:2, margin:'0 auto 16px' }} />
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:'#1a1208', marginBottom:18 }}>{title}</div>
        {children}
        <div style={{ height:16 }} />
      </div>
    </div>
  )
}

const inp = {
  padding:'11px 14px', borderRadius:10, border:'1.5px solid #e0d9cc',
  fontFamily:"'Lora',serif", fontSize:14, outline:'none',
  color:'#333', background:'#faf7f2', width:'100%', boxSizing:'border-box'
}
const submitBtn = (loading) => ({
  padding:'13px 0', borderRadius:12, background:'#D4A017', color:'#fff', border:'none',
  fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14,
  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, width:'100%'
})
