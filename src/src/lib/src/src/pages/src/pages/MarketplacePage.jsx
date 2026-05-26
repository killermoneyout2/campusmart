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

      {showForm && <ListingForm session={session} onClose={() => { setShowForm(false); fetchListings() }} />}
      {contactListing && <ContactModal listing={contactListing} session={session} onClose={() => setContact(null)} />}
    </div>
  )
}

function ListingCard({ item, session, onContact }) {
  const colors = typeColors[item.type] || typeColors.notes
  const isOwn = item.seller_id === session.user.id
  return (
    <div style={{
      background:'#fff', borderRadius:18, border:'2px solid #f0ece4',
      overflow:'hidden', display:'flex', flexDirection:'column',
      boxShadow:'0 2px 10px rgba(0,0,0,0.06)', transition:'transform 0.18s,box-shadow 0.18s'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 30px rgba(0,0,0,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,0.06)' }}
    >
      <div style={{ background:colors.bg, height:120, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontSize:52 }}>{{ notes:'📓', tutoring:'🧑‍🏫', snacks:'🍫', textbooks:'📚' }[item.type]}</span>
        }
        <span style={{
          position:'absolute', top:10, left:10, background:colors.accent, color:'#fff',
          fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
          fontFamily:"'Syne',sans-serif", textTransform:'uppercase'
        }}>{item.type}</span>
      </div>
      <div style={{ padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:5, flex:1 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#1a1208', lineHeight:1.3 }}>{item.title}</div>
        <div style={{ fontSize:13, color:'#aaa', fontStyle:'italic' }}>by {item.profiles?.full_name || 'Student'}</div>
        {item.description && <div style={{ fontSize:12, color:'#888', lineHeight:1.5 }}>{item.description.slice(0,80)}{item.description.length>80?'…':''}</div>}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:10 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:colors.accent }}>${item.price}{item.type==='tutoring'?<span style={{ fontSize:12, color:'#aaa' }}>/hr</span>:''}</span>
        </div>
        {!isOwn && (
          <button onClick={onContact} style={{
            padding:'9px 0', borderRadius:10, background:colors.accent, color:'#fff',
            border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', marginTop:4
          }}>Contact Seller</button>
        )}
        {isOwn && <div style={{ textAlign:'center', fontSize:12, color:'#bbb', fontStyle:'italic', paddingTop:4 }}>Your listing</div>}
      </div>
    </div>
  )
}

function ListingForm({ session, onClose }) {
  const [form, setForm] = useState({ title:'', type:'notes', price:'', description:'' })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!form.title || !form.price) { setError('Title and price are required'); return }
    setLoading(true); setError('')
    let image_url = null
    if (image) {
      const ext = image.name.split('.').pop()
      const filename = `${session.user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(filename, image)
      if (uploadError) { setError('Image upload failed'); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(filename)
      image_url = publicUrl
    }
    await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
      email: session.user.email
    })
    const { error: insertError } = await supabase.from('listings').insert({
      ...form, price: parseFloat(form.price), seller_id: session.user.id, image_url, sold: false
    })
    if (insertError) setError(insertError.message)
    else onClose()
    setLoading(false)
  }

  return (
    <Modal onClose={onClose} title="📦 List Something">
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Title" style={inp} />
        <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} style={inp}>
          <option value="notes">📓 Notes</option>
          <option value="tutoring">🧑‍🏫 Tutoring</option>
          <option value="snacks">🍫 Snacks / Crafts</option>
          <option value="textbooks">📚 Textbook</option>
        </select>
        <input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="Price in $" style={inp} />
        <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Describe your listing..." rows={3} style={{ ...inp, resize:'none' }} />
        <div>
          <label style={{ fontSize:13, color:'#888', fontStyle:'italic', display:'block', marginBottom:6 }}>Photo (optional)</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ fontSize:13, color:'#555' }} />
        </div>
        {error && <div style={{ background:'#fff0f0', color:'#c0392b', padding:'10px 14px', borderRadius:10, fontSize:13 }}>⚠️ {error}</div>}
        <button onClick={submit} disabled={loading} style={submitBtn(loading)}>{loading ? 'Posting...' : 'Post Listing'}</button>
      </div>
    </Modal>
  )
}

function ContactModal({ listing, session, onClose }) {
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
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
    <Modal onClose={onClose} title={`Message about: ${listing.title}`}>
      {!sent ? (
        <>
          <div style={{ fontStyle:'italic', color:'#888', fontSize:13, marginBottom:12 }}>Meet in person to exchange 💰</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Hi! I'm interested..." rows={4} style={{ ...inp, resize:'none', width:'100%', boxSizing:'border-box' }} />
          <button onClick={send} disabled={loading} style={{ ...submitBtn(loading), marginTop:12 }}>{loading ? 'Sending...' : 'Send Message'}</button>
        </>
      ) : (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#1A9E6E' }}>Message sent!</div>
          <div style={{ fontStyle:'italic', color:'#888', fontSize:13, marginTop:6 }}>Meet in person to finalize.</div>
          <button onClick={onClose} style={{ ...submitBtn(false), marginTop:16, background:'#1a1208' }}>Close</button>
        </div>
      )}
    </Modal>
  )
}

function Modal({ onClose, title, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(20,14,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(3px)', padding:20 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:22, padding:32, maxWidth:420, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.2)', position:'relative', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'#f0ece4', border:'none', borderRadius:50, width:32, height:32, cursor:'pointer', fontSize:16, color:'#888' }}>✕</button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#1a1208', marginBottom:20 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

const inp = { padding:'11px 14px', borderRadius:10, border:'1.5px solid #e0d9cc', fontFamily:"'Lora',serif", fontSize:14, outline:'none', color:'#333', background:'#faf7f2', width:'100%', boxSizing:'border-box' }
const submitBtn = (loading) => ({ padding:'12px 0', borderRadius:12, background:'#D4A017', color:'#fff', border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, width:'100%' })
    
