import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function MyListingsPage({ session }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('listings').select('*')
      .eq('seller_id', session.user.id)
      .order('created_at', { ascending: false })
    setListings(data || []); setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const markSold = async (id) => {
    await supabase.from('listings').update({ sold: true }).eq('id', id)
    fetch()
  }

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    fetch()
  }

  const colors = {
    notes:'#D4A017', tutoring:'#1A9E6E', snacks:'#E05252', textbooks:'#3A5FCD'
  }

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'20px 14px', fontFamily:"'Lora',serif" }}>
      <style>{`
        .listing-row { flex-direction: row; }
        .listing-actions { flex-direction: row; flex-shrink: 0; }
        @media (max-width: 600px) {
          .listing-row { flex-direction: column !important; }
          .listing-actions { flex-direction: row !important; width: 100%; }
          .listing-actions button { flex: 1; }
          .listing-img { width: 100% !important; height: 140px !important; border-radius: 12px 12px 0 0 !important; }
        }
      `}</style>

      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#1a1208', marginBottom:4 }}>
        📦 My Listings
      </h2>
      <p style={{ color:'#a08060', fontStyle:'italic', marginBottom:20, fontSize:14 }}>
        Manage everything you've listed
      </p>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#bbb', fontStyle:'italic' }}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#ccc' }}>No listings yet</div>
          <div style={{ fontStyle:'italic', color:'#bbb', marginTop:6, fontSize:13 }}>
            Go to the marketplace and tap + to list something
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {listings.map(item => {
            const accent = colors[item.type] || '#888'
            const emoji  = { notes:'📓', tutoring:'🧑‍🏫', snacks:'🍫', textbooks:'📚' }[item.type]
            return (
              <div key={item.id} className="listing-row" style={{
                background:'#fff', borderRadius:16, border:'2px solid #f0ece4',
                overflow:'hidden', display:'flex',
                opacity: item.sold ? 0.55 : 1,
                boxShadow:'0 2px 8px rgba(0,0,0,0.05)'
              }}>
                {/* Image / emoji */}
                <div className="listing-img" style={{
                  width:72, height:'auto', minHeight:72,
                  background: accent + '22',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:28, flexShrink:0
                }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : emoji
                  }
                </div>

                {/* Info */}
                <div style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#1a1208' }}>
                    {item.title}
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{
                      background: accent+'22', color: accent,
                      fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                      fontFamily:"'Syne',sans-serif"
                    }}>{item.type}</span>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color: accent, fontSize:15 }}>
                      ${item.price}
                    </span>
                    {item.sold && <span style={{ fontSize:11, color:'#bbb', fontStyle:'italic' }}>Sold</span>}
                  </div>
                  {item.description && (
                    <div style={{ fontSize:12, color:'#aaa' }}>{item.description.slice(0,70)}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="listing-actions" style={{ display:'flex', gap:8, padding:12, alignItems:'center' }}>
                  {!item.sold && (
                    <button onClick={() => markSold(item.id)} style={{
                      padding:'8px 12px', borderRadius:10, background:'#f0fff4', color:'#1A9E6E',
                      border:'1.5px solid #1A9E6E', fontFamily:"'Syne',sans-serif",
                      fontWeight:700, fontSize:12, cursor:'pointer', whiteSpace:'nowrap'
                    }}>✓ Sold</button>
                  )}
                  <button onClick={() => deleteListing(item.id)} style={{
                    padding:'8px 12px', borderRadius:10, background:'#fff0f0', color:'#E05252',
                    border:'1.5px solid #E05252', fontFamily:"'Syne',sans-serif",
                    fontWeight:700, fontSize:12, cursor:'pointer'
                  }}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
