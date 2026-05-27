import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function MyListingsPage({ session }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchListings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', session.user.id)
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [])

  const markSold = async (id) => {
    await supabase.from('listings').update({ sold: true }).eq('id', id)
    fetchListings()
  }

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    fetchListings()
  }

  const typeColors = {
    notes:'#D4A017', tutoring:'#1A9E6E', snacks:'#E05252', textbooks:'#3A5FCD'
  }

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:24, fontFamily:"'Lora',serif" }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#1a1208', marginBottom:6 }}>📦 My Listings</h2>
      <p style={{ color:'#a08060', fontStyle:'italic', marginBottom:24 }}>Manage everything you've listed on CampusMart.</p>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#bbb', fontStyle:'italic' }}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:'#ccc' }}>No listings yet</div>
          <div style={{ fontStyle:'italic', color:'#bbb', marginTop:6 }}>Head to the marketplace and click "+ List Item"</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {listings.map(item => (
            <div key={item.id} style={{
              background:'#fff', borderRadius:16, border:'2px solid #f0ece4',
              padding:'18px 20px', display:'flex', alignItems:'center', gap:16,
              opacity: item.sold ? 0.6 : 1
            }}>
              {item.image_url
                ? <img src={item.image_url} alt={item.title} style={{ width:60, height:60, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                : <div style={{ width:60, height:60, borderRadius:10, background:'#f0ece4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
                    {{ notes:'📓', tutoring:'🧑‍🏫', snacks:'🍫', textbooks:'📚' }[item.type]}
                  </div>
              }
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#1a1208' }}>{item.title}</div>
                <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center' }}>
                  <span style={{ background: typeColors[item.type] + '22', color: typeColors[item.type], fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, fontFamily:"'Syne',sans-serif" }}>{item.type}</span>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color: typeColors[item.type], fontSize:15 }}>${item.price}</span>
                  {item.sold && <span style={{ fontSize:11, color:'#888', fontStyle:'italic' }}>• Marked as sold</span>}
                </div>
                {item.description && <div style={{ fontSize:12, color:'#aaa', marginTop:4 }}>{item.description.slice(0,80)}</div>}
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                {!item.sold && (
                  <button onClick={() => markSold(item.id)} style={{
                    padding:'8px 14px', borderRadius:10, background:'#f0fff4', color:'#1A9E6E',
                    border:'1.5px solid #1A9E6E', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, cursor:'pointer'
                  }}>Mark Sold ✓</button>
                )}
                <button onClick={() => deleteListing(item.id)} style={{
                  padding:'8px 14px', borderRadius:10, background:'#fff0f0', color:'#E05252',
                  border:'1.5px solid #E05252', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, cursor:'pointer'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
