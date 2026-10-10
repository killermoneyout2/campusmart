// Every TTR Enterprises venture links back to the studio hub.
export default function StudioCredit({ dark = false }) {
  return (
    <div style={{ textAlign:'center', padding:'18px 0', fontSize:12, fontFamily:"'Lora',serif" }}>
      <a href="https://ttrenterprises.com" target="_blank" rel="noopener"
        style={{ color: dark ? '#a08060' : '#9a8a74', textDecoration:'none' }}>
        A TTR Enterprises company
      </a>
    </div>
  )
}
