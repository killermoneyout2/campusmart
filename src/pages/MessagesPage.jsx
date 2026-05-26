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
    const { data } = await supabase
      .from('messages')
      .select('*, listings(title), sender:profiles!messages_sender_id_fkey(full_name), receiver:profiles!messages_receiver_id_fkey(full_name)')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })
    if (!data) return setLoading(false)
    const seen = new Set()
    const unique = []
    for (const m of data) {
      const otherId = m.sender_id === session.user.id ? m.receiver_id : m.sender_id
      const key = `${m.listing_id}-${otherId}`
      if (!seen.has(key)) { seen.add(key); unique.push({ ...m, otherId }) }
    }
    setThreads(unique)
    setLoading(false)
  }

  const fetchMessages = async (thread) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
      .eq('listing_id', thread.listing_id)
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${thread.otherId}),and(sender_id.eq.${thread.otherId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  useEffect(() => { fetchThreads() }, [])

  useEffect(() => {
    if (!selected) return
    fetchMessages(selected)
    const sub = supabase.channel('messages')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, () => fetchMessages(selected))
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [selected])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    await supabase.from('messages').insert({
      listing_id: selected.listing_id, sender_id: session.user.id,
      receiver_id: selected.otherId, content: reply
    })
    setReply('')
    fetchMessages(selected)
    fetchThreads()
  }

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:24, fontFamily:"'Lora',serif" }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#1a1208', marginBottom:20 }}>💬 Messages</h2>
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#bbb', fontStyle:'italic' }}>Loading messages...</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns: selected ? '280px 1fr' : '1fr', gap:20, minHeight:500 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {threads.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#bbb' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>💭</div>
                <div style={{ fontStyle:'italic' }}>No messages yet</div>
              </div>
            ) : threads.map(t => {
              const otherName = t.sender_id === session.user.id ? t.receiver?.full_name : t.sender?.full_name
              const isSelected = selected?.listing_id === t.listing_id && selected?.otherId === t.otherId
              return (
                <div key={`${t.listing_id}-${t.otherId}`} onClick={() => setSelected(t)} style={{
                  padding:'14px 16px', borderRadius:14, cursor:'pointer',
                  background: isSelected ? '#1a1208' : '#fff',
                  color: isSelected ? '#fff' : '#1a1208',
                  border:'2px solid ' + (isSelected ? '#1a1208' : '#f0ece4')
                }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{otherName || 'Student'}</div>
                  <div style={{ fontSize:12, opacity:0.7, marginTop:3 }}>re: {t.listings?.title || 'listing'}</div>
                  <div style={{ fontSize:12, opacity:0.6, marginTop:4, fontStyle:'italic' }}>{t.content.slice(0,50)}…</div>
                </div>
              )
            })}
          </div>

          {selected && (
            <div style={{ background:'#fff', borderRadius:18, border:'2px solid #f0ece4', display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:'2px solid #f0ece4', background:'#faf7f2' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#1a1208' }}>
                  {selected.sender_id === session.user.id ? selected.receiver?.full_name : selected.sender?.full_name}
                </div>
                <div style={{ fontSize:12, color:'#a08060', fontStyle:'italic' }}>re: {selected.listings?.title}</div>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:10, maxHeight:360 }}>
                {messages.map(m => {
                  const isMe = m.sender_id === session.user.id
                  return (
                    <div key={m.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth:'70%', padding:'10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? '#1a1208' : '#f0ece4',
                        color: isMe ? '#fff' : '#1a1208', fontSize:14
                      }}>{m.content}</div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding:16, borderTop:'2px solid #f0ece4', display:'flex', gap:10 }}>
                <input value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Type a message..." style={{
                    flex:1, padding:'10px 14px', borderRadius:10,
                    border:'1.5px solid #e0d9cc', fontFamily:"'Lora',serif", fontSize:14, outline:'none'
                  }} />
                <button onClick={sendReply} style={{
                  padding:'10px 18px', borderRadius:10, background:'#D4A017', color:'#fff',
                  border:'none', fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:'pointer'
                }}>Send</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
