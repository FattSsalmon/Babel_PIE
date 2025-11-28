import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { Search, BookOpen, Star, X } from 'lucide-react'

const supabase = createClient(
  'https://ufvalieapeiiymnjphlg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdmFsaWVhcGVpaXltbmpwaGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMjQwMDksImV4cCI6MjA3OTgwMDAwOX0.Fpinld09JQZK1a5qUX3aQkaSO8NjVRChTU_tZ1GgCN4'
)

export default function Babel() {
  const [selectedRoot, setSelectedRoot] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [savedRoots, setSavedRoots] = useState([])
  const [activeTab, setActiveTab] = useState('roots')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [showPathPopup, setShowPathPopup] = useState(null)
  const [pieRoots, setPieRoots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoots = async () => {
      try {
        const { data, error } = await supabase.from('roots').select('*').order('id')
        if (error) throw error
        setPieRoots(data.map(root => ({
          id: root.id.toString(),
          pie: root.pie,
          meaning: root.meaning,
          semantic: root.semantic,
          derivatives: root.derivatives,
          descendants: root.descendants
        })))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoots()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('babel-saved-roots')
    if (saved) setSavedRoots(JSON.parse(saved))
  }, [])

  const toggleSaveRoot = (rootId) => {
    const newSaved = savedRoots.includes(rootId) ? savedRoots.filter(id => id !== rootId) : [...savedRoots, rootId]
    setSavedRoots(newSaved)
    localStorage.setItem('babel-saved-roots', JSON.stringify(newSaved))
  }

  const filteredRoots = pieRoots.filter(root => {
    const matchesSearch = root.pie.toLowerCase().includes(searchTerm.toLowerCase()) || root.meaning.toLowerCase().includes(searchTerm.toLowerCase()) || root.derivatives.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = filterLanguage === 'all' || root.descendants[filterLanguage]
    return matchesSearch && matchesLanguage
  })

  const displayRoots = activeTab === 'saved' ? pieRoots.filter(r => savedRoots.includes(r.id)) : filteredRoots

  if (loading) return <div style={{display:'flex',height:'100vh',background:'#fef3c7',alignItems:'center',justifyContent:'center'}}><div style={{color:'#78350f',fontSize:'20px'}}>Loading roots...</div></div>

  return (
    <div style={{display:'flex',height:'100vh',background:'#fef3c7'}}>
      <style jsx>{`
        .sidebar { width: 320px; background: #fefce8; borderRight: '1px solid #fcd34d'; display: flex; flexDirection: column; }
        .header { padding: 24px; borderBottom: 1px solid #fcd34d; }
        .title { fontSize: 30px; fontFamily: serif; color: #78350f; }
        .subtitle { fontSize: 14px; color: #a16207; marginTop: 4px; }
        .search-box { padding: 16px; borderBottom: 1px solid #fcd34d; }
        input, select { width: 100%; padding: 8px 12px; fontSize: 14px; background: white; border: 1px solid #fcd34d; borderRadius: 4px; }
        input { paddingLeft: 36px; }
        .nav { padding: 16px; borderBottom: 1px solid #fcd34d; }
        .nav button { width: 100%; display: flex; alignItems: center; gap: 8px; padding: 8px 12px; fontSize: 14px; background: none; border: none; borderRadius: 4px; cursor: pointer; color: #92400e; }
        .nav button:hover { background: #fef3c7; }
        .nav button.active { background: #fef3c7; color: #78350f; }
        .root-list { flex: 1; overflowY: auto; padding: 16px; }
        .root-item { width: 100%; textAlign: left; padding: 12px; background: white; border: 1px solid #fcd34d; borderRadius: 8px; marginBottom: 8px; cursor: pointer; }
        .root-item:hover { borderColor: #fbbf24; }
        .root-item.selected { background: #fef3c7; borderColor: #fbbf24; }
        .root-pie { fontSize: 18px; fontFamily: serif; color: #78350f; }
        .root-meaning { fontSize: 14px; color: #a16207; marginTop: 4px; }
        .main { flex: 1; overflowY: auto; }
        .welcome { height: 100%; display: flex; alignItems: center; justifyContent: center; textAlign: center; }
        .content { maxWidth: 1000px; margin: 0 auto; padding: 32px; }
        .card { background: white; borderRadius: 8px; border: 1px solid #fcd34d; padding: 32px; }
        .card h2 { fontSize: 36px; fontFamily: serif; color: #78350f; marginBottom: 8px; }
        .card p { fontSize: 20px; color: #a16207; }
        .tag { display: inline-block; marginTop: 8px; padding: 4px 12px; fontSize: 12px; background: #fef3c7; color: #92400e; borderRadius: 16px; }
        .tree-root { display: flex; flexDirection: column; alignItems: center; marginBottom: 32px; }
        .tree-node { padding: 12px 24px; background: #fcd34d; border: 2px solid #fbbf24; borderRadius: 8px; fontSize: 24px; fontFamily: serif; color: #78350f; }
        .tree-line { width: 2px; height: 32px; background: #fbbf24; }
        .branches { display: grid; gridTemplateColumns: repeat(3, 1fr); gap: 32px; }
        .branch { display: flex; flexDirection: column; alignItems: center; }
        .branch-label { padding: 8px 16px; background: #fef3c7; border: 1px solid #fbbf24; borderRadius: 4px; fontSize: 14px; fontWeight: 600; color: #78350f; marginBottom: 16px; }
        .lang-card { position: relative; padding: 12px; background: white; border: 1px solid #fcd34d; borderRadius: 8px; width: 100%; }
        .lang-name { fontSize: 12px; color: #a16207; marginBottom: 4px; }
        .lang-word { fontSize: 18px; fontFamily: serif; color: #78350f; }
        .help-btn { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; borderRadius: 50%; background: #fef3c7; color: #a16207; border: none; cursor: pointer; fontSize: 12px; fontWeight: bold; }
        .help-btn:hover { background: #fcd34d; }
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; alignItems: center; justifyContent: center; zIndex: 50; padding: 32px; }
        .modal-content { background: white; borderRadius: 8px; border: 2px solid #fbbf24; maxWidth: 800px; width: 100%; padding: 32px; position: relative; }
        .modal-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; borderRadius: 50%; background: #fef3c7; color: #a16207; border: none; cursor: pointer; display: flex; alignItems: center; justifyContent: center; }
        .modal-close:hover { background: #fcd34d; }
        .modal h3 { fontSize: 24px; fontFamily: serif; color: #78350f; marginBottom: 16px; textTransform: capitalize; }
        .path { color: #92400e; fontFamily: monospace; fontSize: 16px; lineHeight: 1.6; marginBottom: 16px; }
        .explanation { color: #a16207; fontSize: 14px; lineHeight: 1.6; paddingTop: 16px; borderTop: 1px solid #fcd34d; }
      `}</style>

      <div className="sidebar">
        <div className="header">
          <div className="title">Babel</div>
          <div className="subtitle">Proto-Indo-European</div>
        </div>
        <div className="search-box">
          <div style={{position:'relative'}}>
            <Search size={16} style={{position:'absolute',left:12,top:10,color:'#d97706'}} />
            <input type="text" placeholder="Search roots..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} style={{marginTop:8}}>
            <option value="all">All Languages</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="greek">Greek</option>
            <option value="russian">Russian</option>
            <option value="urdu">Urdu</option>
            <option value="latin">Latin</option>
            <option value="sanskrit">Sanskrit</option>
          </select>
        </div>
        <div className="nav">
          <button className={activeTab === 'roots' ? 'active' : ''} onClick={() => setActiveTab('roots')}>
            <BookOpen size={16} /> Roots
          </button>
          <button className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>
            <Star size={16} /> Saved ({savedRoots.length})
          </button>
        </div>
        <div className="root-list">
          {displayRoots.map(root => (
            <button key={root.id} className={`root-item ${selectedRoot?.id === root.id ? 'selected' : ''}`} onClick={() => setSelectedRoot(root)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                <div>
                  <div className="root-pie">{root.pie}</div>
                  <div className="root-meaning">{root.meaning}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleSaveRoot(root.id) }} style={{background:'none',border:'none',cursor:'pointer',marginTop:4}}>
                  <Star size={16} fill={savedRoots.includes(root.id) ? '#d97706' : 'none'} color={savedRoots.includes(root.id) ? '#d97706' : '#fcd34d'} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="main">
        {showPathPopup && (
          <div className="modal" onClick={() => setShowPathPopup(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPathPopup(null)}><X size={20} /></button>
              <h3>{showPathPopup}</h3>
              <div className="path">{selectedRoot?.descendants[showPathPopup]?.path}</div>
              <div className="explanation">{selectedRoot?.descendants[showPathPopup]?.explanation}</div>
            </div>
          </div>
        )}

        {!selectedRoot && (
          <div className="welcome">
            <div>
              <BookOpen size={64} color="#fcd34d" style={{margin:'0 auto 16px'}} />
              <h2 style={{fontSize:24,fontFamily:'serif',color:'#78350f',marginBottom:8}}>Welcome to Babel</h2>
              <p style={{color:'#a16207'}}>Select a root from the sidebar to explore its evolution.</p>
            </div>
          </div>
        )}

        {selectedRoot && (
          <div className="content">
            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
                <div>
                  <h2>{selectedRoot.pie}</h2>
                  <p>{selectedRoot.meaning}</p>
                  <span className="tag">{selectedRoot.semantic}</span>
                </div>
                <button onClick={() => setSelectedRoot(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#d97706'}}>
                  <X size={20} />
                </button>
              </div>

              <div style={{marginBottom:32}}>
                <h3 style={{fontSize:18,fontWeight:600,color:'#78350f',marginBottom:24}}>Evolutionary Tree</h3>
                <div className="tree-root">
                  <div className="tree-node">{selectedRoot.pie}</div>
                  <div className="tree-line"></div>
                </div>

                <div className="branches">
                  <div className="branch">
                    <div className="branch-label">Germanic</div>
                    <div className="tree-line" style={{height:24}}></div>
                    <div className="lang-card">
                      <div className="lang-name">English</div>
                      <div className="lang-word">{selectedRoot.descendants.english.word}</div>
                      <button className="help-btn" onClick={() => setShowPathPopup('english')}>?</button>
                    </div>
                  </div>

                  <div className="branch">
                    <div className="branch-label">Italic</div>
                    <div className="tree-line" style={{height:24}}></div>
                    <div style={{width:'100%'}}>
                      <div className="lang-card" style={{marginBottom:16}}>
                        <div className="lang-name">Latin</div>
                        <div className="lang-word">{selectedRoot.descendants.latin.word}</div>
                        <button className="help-btn" onClick={() => setShowPathPopup('latin')}>?</button>
                      </div>
                      <div className="lang-card" style={{marginLeft:24,background:'#fef3c7'}}>
                        <div className="lang-name">French</div>
                        <div className="lang-word">{selectedRoot.descendants.french.word}</div>
                        <button className="help-btn" onClick={() => setShowPathPopup('french')}>?</button>
                      </div>
                    </div>
                  </div>

                  <div className="branch">
                    <div className="branch-label">Hellenic</div>
                    <div className="tree-line" style={{height:24}}></div>
                    <div className="lang-card">
                      <div className="lang-name">Greek</div>
                      <div className="lang-word">{selectedRoot.descendants.greek.word}</div>
                      <button className="help-btn" onClick={() => setShowPathPopup('greek')}>?</button>
                    </div>
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:32,marginTop:32}}>
                  <div className="branch">
                    <div className="branch-label">Balto-Slavic</div>
                    <div className="tree-line" style={{height:24}}></div>
                    <div className="lang-card">
                      <div className="lang-name">Russian</div>
                      <div className="lang-word">{selectedRoot.descendants.russian.word}</div>
                      <button className="help-btn" onClick={() => setShowPathPopup('russian')}>?</button>
                    </div>
                  </div>

                  <div className="branch">
                    <div className="branch-label">Indo-Iranian</div>
                    <div className="tree-line" style={{height:24}}></div>
                    <div style={{width:'100%'}}>
                      <div className="lang-card" style={{marginBottom:16}}>
                        <div className="lang-name">Sanskrit</div>
                        <div className="lang-word">{selectedRoot.descendants.sanskrit.word}</div>
                        <button className="help-btn" onClick={() => setShowPathPopup('sanskrit')}>?</button>
                      </div>
                      <div className="lang-card" style={{marginLeft:24,background:'#fef3c7'}}>
                        <div className="lang-name">Urdu</div>
                        <div className="lang-word">{selectedRoot.descendants.urdu.word}</div>
                        <button className="help-btn" onClick={() => setShowPathPopup('urdu')}>?</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{paddingTop:24,borderTop:'1px solid #fcd34d'}}>
                <h3 style={{fontSize:14,fontWeight:600,color:'#78350f',marginBottom:8}}>Modern English Derivatives</h3>
                <p style={{color:'#92400e'}}>{selectedRoot.derivatives}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
