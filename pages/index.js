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
        const { data, error } = await supabase
          .from('roots')
          .select('*')
          .order('id')
        
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
    const newSaved = savedRoots.includes(rootId)
      ? savedRoots.filter(id => id !== rootId)
      : [...savedRoots, rootId]
    setSavedRoots(newSaved)
    localStorage.setItem('babel-saved-roots', JSON.stringify(newSaved))
  }

  const filteredRoots = pieRoots.filter(root => {
    const matchesSearch = root.pie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         root.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         root.derivatives.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = filterLanguage === 'all' || root.descendants[filterLanguage]
    return matchesSearch && matchesLanguage
  })

  const displayRoots = activeTab === 'saved' 
    ? pieRoots.filter(r => savedRoots.includes(r.id))
    : filteredRoots

  if (loading) {
    return (
      <div className="flex h-screen bg-amber-50 items-center justify-center">
        <div className="text-amber-900 text-xl">Loading roots...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-amber-50">
      <div className="w-80 bg-yellow-50 border-r border-amber-200 flex flex-col">
        <div className="p-6 border-b border-amber-200">
          <h1 className="text-3xl font-serif text-amber-900">Babel</h1>
          <p className="text-sm text-amber-700 mt-1">Proto-Indo-European</p>
        </div>

        <div className="p-4 border-b border-amber-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-amber-600" />
            <input
              type="text"
              placeholder="Search roots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-amber-200 rounded focus:outline-none focus:border-amber-400"
            />
          </div>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="w-full mt-2 px-3 py-2 text-sm bg-white border border-amber-200 rounded focus:outline-none focus:border-amber-400"
          >
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

        <div className="p-4 border-b border-amber-200 space-y-1">
          <button
            onClick={() => setActiveTab('roots')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
              activeTab === 'roots' ? 'bg-amber-100 text-amber-900' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Roots
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
              activeTab === 'saved' ? 'bg-amber-100 text-amber-900' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Star className="w-4 h-4" />
            Saved ({savedRoots.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayRoots.map(root => (
            <button
              key={root.id}
              onClick={() => setSelectedRoot(root)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                selectedRoot?.id === root.id ? 'bg-amber-100 border-amber-300' : 'bg-white border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-serif text-lg text-amber-900">{root.pie}</div>
                  <div className="text-sm text-amber-700 mt-0.5">{root.meaning}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleSaveRoot(root.id) }} className="mt-1">
                  <Star className={`w-4 h-4 ${savedRoots.includes(root.id) ? 'fill-amber-600 text-amber-600' : 'text-amber-300 hover:text-amber-400'}`} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showPathPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
            <div className="bg-white rounded-lg border-2 border-amber-300 shadow-2xl max-w-2xl w-full p-8 relative">
              <button onClick={() => setShowPathPopup(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-serif text-amber-900 mb-4 capitalize">{showPathPopup}</h3>
              <div className="text-amber-800 font-mono text-base leading-relaxed mb-4">
                {selectedRoot?.descendants[showPathPopup]?.path}
              </div>
              <div className="text-amber-700 text-sm leading-relaxed border-t border-amber-200 pt-4">
                {selectedRoot?.descendants[showPathPopup]?.explanation}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roots' && !selectedRoot && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <BookOpen className="w-16 h-16 mx-auto text-amber-300 mb-4" />
              <h2 className="text-2xl font-serif text-amber-900 mb-2">Welcome to Babel</h2>
              <p className="text-amber-700">Select a root from the sidebar to explore its evolution across Indo-European languages.</p>
            </div>
          </div>
        )}

        {activeTab === 'roots' && selectedRoot && (
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-4xl font-serif text-amber-900 mb-2">{selectedRoot.pie}</h2>
                  <p className="text-xl text-amber-700">{selectedRoot.meaning}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">{selectedRoot.semantic}</span>
                </div>
                <button onClick={() => setSelectedRoot(null)}>
                  <X className="w-5 h-5 text-amber-500 hover:text-amber-700" />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-amber-900 mb-6">Evolutionary Tree</h3>
                <div className="flex flex-col items-center mb-8">
                  <div className="px-6 py-3 bg-amber-200 border-2 border-amber-400 rounded-lg">
                    <span className="text-2xl font-serif text-amber-900">{selectedRoot.pie}</span>
                  </div>
                  <div className="w-0.5 h-8 bg-amber-300"></div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded text-sm font-semibold text-amber-900 mb-4">Germanic</div>
                    <div className="w-0.5 h-6 bg-amber-300"></div>
                    <div className="space-y-4 w-full">
                      <div className="p-3 bg-white border border-amber-200 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">English</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.english.word}</div>
                        <button onClick={() => setShowPathPopup('english')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded text-sm font-semibold text-amber-900 mb-4">Italic</div>
                    <div className="w-0.5 h-6 bg-amber-300"></div>
                    <div className="space-y-4 w-full">
                      <div className="p-3 bg-white border border-amber-200 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">Latin</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.latin.word}</div>
                        <button onClick={() => setShowPathPopup('latin')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                      <div className="ml-6 p-3 bg-amber-50 border border-amber-300 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">French</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.french.word}</div>
                        <button onClick={() => setShowPathPopup('french')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded text-sm font-semibold text-amber-900 mb-4">Hellenic</div>
                    <div className="w-0.5 h-6 bg-amber-300"></div>
                    <div className="space-y-4 w-full">
                      <div className="p-3 bg-white border border-amber-200 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">Greek</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.greek.word}</div>
                        <button onClick={() => setShowPathPopup('greek')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded text-sm font-semibold text-amber-900 mb-4">Balto-Slavic</div>
                    <div className="w-0.5 h-6 bg-amber-300"></div>
                    <div className="space-y-4 w-full">
                      <div className="p-3 bg-white border border-amber-200 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">Russian</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.russian.word}</div>
                        <button onClick={() => setShowPathPopup('russian')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded text-sm font-semibold text-amber-900 mb-4">Indo-Iranian</div>
                    <div className="w-0.5 h-6 bg-amber-300"></div>
                    <div className="space-y-4 w-full">
                      <div className="p-3 bg-white border border-amber-200 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">Sanskrit</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.sanskrit.word}</div>
                        <button onClick={() => setShowPathPopup('sanskrit')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                      <div className="ml-6 p-3 bg-amber-50 border border-amber-300 rounded relative">
                        <div className="text-xs text-amber-700 mb-1">Urdu</div>
                        <div className="font-serif text-lg text-amber-900">{selectedRoot.descendants.urdu.word}</div>
                        <button onClick={() => setShowPathPopup('urdu')} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center text-xs font-bold">?</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-amber-200">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">Modern English Derivatives</h3>
                <p className="text-amber-800">{selectedRoot.derivatives}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && savedRoots.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Star className="w-16 h-16 mx-auto text-amber-300 mb-4" />
              <h2 className="text-2xl font-serif text-amber-900 mb-2">No saved roots yet</h2>
              <p className="text-amber-700">Click the star icon on any root to save it for quick access.</p>
            </div>
          </div>
        )}

        {activeTab === 'saved' && savedRoots.length > 0 && !selectedRoot && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <p className="text-amber-700">Select a saved root to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
