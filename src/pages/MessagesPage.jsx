import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function MessagesPage({ session }) {
  const [threads, setThreads]   = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply]       = useState('')
  const [loading, setLoading]   = useState(true)
  const bottomRef = useRef(null)

  const fetchThreads = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, listings(title, seller_id)')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })
    if (error || !data) { setLoading(false); return }

    const userIds = [...new Set(data.flatMap(m => [m.sender_id, m.receiver_id]))]
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    const pm = {}
    profiles?.forEach(p => { pm[p.id] = p.full_name || p.email?.split('@')[0] || 'Student' })

    const seen = new Set(); const unique = []
    for (const m of data) {
      const otherId = m.sender_id === session.user.id ? m.receiver_id : m.sender_id
      const key = `${m.listing_id}-${otherId}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push({ ...m, otherId, otherName: pm[otherId] || 'Student' })
      }
    }
    setThreads(unique); setLoading(false)
  }

  const fetchMessages = async (thread) => {
    const { data } = await supabase.from('messages').select('*')
      .eq('listing_id', thread.listing_id)
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${thread.otherId}),and(sender_id.eq.${thread.otherId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true })
    setMessages((data || []).map(m => ({ ...m, senderName: m.sender_id === session.user.id ? 'You' : thread.otherName })))
  }

  useEffect(() => { fetchThreads() }, [])

  useEffect(() => {
    if (!selected) return
    fetchMessages(selected)
    const ch = supabase.channel(`msg-${selected.listing_id}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, () => {
        fetchMessages(selected); fetchThreads()
      }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [selected])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    await supabase.from('messages').insert({
      listing_id: selected.listing_id, sender_id: session.user.id,
      receiver_id: selected.otherId, content: reply.trim()
    })
    setReply(''); fetchMessages(selected); fetchThreads()
  }

  // On mobile: if a thread is selected, show chat fullscreen
  // On desktop: show side by side
  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'20px 14px', fontFamily:"'Lora',serif" }}>
      <style>{`
        .msg-layout { display: grid; grid-template-columns: 260px 1fr; gap: 16px; min-height: 500px; }
        .thread-list { display: flex; }
        .chat-window { display: flex; }
        .back-btn { display: none !important; }
        @media (max-width: 600px) {
          .msg-layout { grid-template-columns: 1fr; }
          .thread-list-mobile-hidden { display: none !important; }
          .chat-window-mobile-hidden { display: none !important; }
          .back-btn { display: flex !important; }
          .msg-title { font-size: 18px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        {selected && (
          <button className="back-btn" onClick={() => setSelected(null)} style={{
            background:'#f0ece4', border:'none', borderRadius:10,
            padding:'8px 14px', fontFamily:"'Syne',sans-serif",
            fontWeight:700, fontSize:13, cursor:'pointer', color:'#1a1208',
            display:'none', alignItems:'center', gap:6
          }}>← Back</button>
        )}
        <h2 className="msg-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#1a1208', margin:0 }}>
          {selected ? `💬 ${selected.otherName}` : '💬 Messages'}
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#bbb', fontStyle:'italic' }}>Loading...</div>
      ) : (
        <div className="msg-layout">

          {/* Thread list */}
          <div className={selected ? 'thread-list-mobile-hidden' : ''} style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {threads.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#bbb' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>💭</div>
                <div style={{ fontStyle:'italic', fontSize:14 }}>No messages yet</div>
              </div>
            ) : threads.map(t => {
              const isMe = t.sender_id === session.user.id
              const isSel = selected?.listing_id===t.listing_id && selected?.otherId===t.otherId
              return (
                <div key={`${t.listing_id}-${t.otherId}`} onClick={() => setSelected(t)} style={{
                  padding:'14px 16px', borderRadius:14, cursor:'pointer',
                  background: isSel ? '#1a1208' : '#fff',
                  color: isSel ? '#fff' : '#1a1208',
                  border:`2px solid ${isSel ? '#1a1208' : !isMe ? '#D4A017' : '#f0ece4'}`,
                  transition:'all 0.15s'
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{t.otherName}</div>
                    {!isMe && !isSel && (
                      <span style={{ background:'#D4A017', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>NEW</span>
                    )}
                  </div>
                  <div style={{ fontSize:11, opacity:0.65, marginTop:3 }}>re: {t.listings?.title || 'listing'}</div>
                  <div style={{ fontSize:11, opacity:0.55, marginTop:3, fontStyle:'italic' }}>
                    {t.content?.slice(0,45)}…
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chat window */}
          {selected ? (
            <div className={!selected ? 'chat-window-mobile-hidden' : ''} style={{
              background:'#fff', borderRadius:18, border:'2px solid #f0ece4',
              display:'flex', flexDirection:'column', overflow:'hidden',
              minHeight: 420
            }}>
              <div style={{ padding:'14px 18px', borderBottom:'2px solid #f0ece4', background:'#faf7f2' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#1a1208' }}>{selected.otherName}</div>
                <div style={{ fontSize:12, color:'#a08060', fontStyle:'italic' }}>re: {selected.listings?.title}</div>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10, maxHeight:360 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign:'center', color:'#ccc', fontStyle:'italic', fontSize:13, paddingTop:20 }}>No messages yet</div>
                )}
                {messages.map(m => {
                  const isMe = m.sender_id === session.user.id
                  return (
                    <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize:10, color:'#aaa', marginBottom:3 }}>{isMe ? 'You' : selected.otherName}</div>
                      <div style={{
                        maxWidth:'78%', padding:'10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? '#1a1208' : '#f0ece4',
                        color: isMe ? '#fff' : '#1a1208', fontSize:14, lineHeight:1.5
                      }}>{m.content}</div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding:12, borderTop:'2px solid #f0ece4', display:'flex', gap:8 }}>
                <input value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && sendReply()}
                  placeholder="Type a message..."
                  style={{
                    flex:1, padding:'10px 14px', borderRadius:10,
                    border:'1.5px solid #e0d9cc', fontFamily:"'Lora',serif",
                    fontSize:14, outline:'none'
                  }} />
                <button onClick={sendReply} style={{
                  padding:'10px 16px', borderRadius:10, background:'#D4A017',
                  color:'#fff', border:'none', fontFamily:"'Syne',sans-serif",
                  fontWeight:700, cursor:'pointer', fontSize:14
                }}>Send</button>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontStyle:'italic', fontSize:14 }}
              className="chat-window-mobile-hidden">
              Select a conversation to read messages
            </div>
          )}
        </div>
      )}
    </div>
  )
}
