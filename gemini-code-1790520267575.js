import React, { useState, useEffect } from 'react';

// ==========================================
// 1. MOCK / LOCAL STORAGE INITIAL DATA
// ==========================================
const DEFAULT_DECKS = [
  {
    id: 'deck-1',
    title: 'Medical Terminology - OB/GYN',
    description: 'Essential high-yield clinical terms and definitions.',
    cards: [
      { id: 'c1', front: 'Gravida vs Para', back: 'Gravida refers to total number of pregnancies. Para refers to pregnancies reaching viable gestational age.', difficulty: 'easy' },
      { id: 'c2', front: 'Preeclampsia Triad', back: 'Hypertension, Proteinuria, and Edema (after 20 weeks gestational age).', difficulty: 'medium' },
      { id: 'c3', front: 'Apgar Score Timing', back: 'Evaluated at 1 minute and 5 minutes after birth.', difficulty: 'hard' }
    ]
  },
  {
    id: 'deck-2',
    title: 'General Pharmacology',
    description: 'Mechanism of action & drug classes revision.',
    cards: [
      { id: 'c4', front: 'ACE Inhibitors Mechanism', back: 'Inhibit Angiotensin-Converting Enzyme, preventing conversion of Angiotensin I to II.', difficulty: 'easy' },
      { id: 'c5', front: 'Beta Blockers Side Effects', back: 'Bradycardia, fatigue, bronchospasm (non-selective), hypotension.', difficulty: 'medium' }
    ]
  }
];

export default function App() {
  // --- STATE ---
  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem('flashcard_decks');
    return saved ? JSON.parse(saved) : DEFAULT_DECKS;
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('flashcard_stats');
    return saved ? JSON.parse(saved) : { streak: 5, studiedToday: 14, accuracy: 88, totalMastered: 12 };
  });

  const [user, setUser] = useState({
    name: 'Medical Student',
    email: 'user@example.com',
    isLoggedIn: true
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'decks' | 'study' | 'profile'
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // Study session states
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Deck / Card Modals & Forms
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [showDeckModal, setShowDeckModal] = useState(false);
  
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('flashcard_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('flashcard_stats', JSON.stringify(stats));
  }, [stats]);

  // --- HANDLERS ---
  const handleCreateDeck = (e) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    const newDeck = {
      id: `deck-${Date.now()}`,
      title: newDeckTitle,
      description: newDeckDesc,
      cards: []
    };
    setDecks([...decks, newDeck]);
    setNewDeckTitle('');
    setNewDeckDesc('');
    setShowDeckModal(false);
  };

  const handleDeleteDeck = (deckId) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      setDecks(decks.filter(d => d.id !== deckId));
      if (selectedDeck?.id === deckId) setSelectedDeck(null);
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim() || !selectedDeck) return;
    
    const newCard = {
      id: `card-${Date.now()}`,
      front: cardFront,
      back: cardBack,
      difficulty: 'medium'
    };

    const updatedDecks = decks.map(d => {
      if (d.id === selectedDeck.id) {
        return { ...d, cards: [...d.cards, newCard] };
      }
      return d;
    });

    setDecks(updatedDecks);
    setSelectedDeck(updatedDecks.find(d => d.id === selectedDeck.id));
    setCardFront('');
    setCardBack('');
    setShowCardModal(false);
  };

  const startStudySession = (deck) => {
    if (!deck.cards || deck.cards.length === 0) {
      alert('This deck has no cards yet. Add some cards first!');
      return;
    }
    setSelectedDeck(deck);
    setCurrentCardIdx(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setActiveTab('study');
  };

  const handleCardRate = (rating) => {
    setIsFlipped(false);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      studiedToday: prev.studiedToday + 1,
      totalMastered: rating === 'easy' ? prev.totalMastered + 1 : prev.totalMastered
    }));

    setTimeout(() => {
      if (currentCardIdx + 1 < selectedDeck.cards.length) {
        setCurrentCardIdx(prev => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#121212] font-sans flex flex-col">
      {/* Inject 3D Card Style */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* HEADER / NAVIGATION */}
      <header className="bg-[#FFFFFF] border-b border-[#EFE6DD] sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-[#800020] flex items-center justify-center text-white font-bold text-xl shadow-md">
              🎴
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#800020]">
              FlashCard Pro
            </span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'decks', label: 'My Decks', icon: '📚' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedDeck(null); }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#800020] text-white shadow'
                    : 'text-gray-600 hover:bg-[#EFE6DD] hover:text-[#121212]'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}

            {user.isLoggedIn ? (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#EFE6DD]">
                <div className="w-8 h-8 rounded-full bg-[#800020] text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={() => setUser({ ...user, isLoggedIn: false })}
                  className="text-xs text-gray-500 hover:text-[#800020] font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setUser({ ...user, isLoggedIn: true })}
                className="ml-4 px-3 py-1.5 bg-[#800020] text-white text-xs font-semibold rounded-lg hover:bg-[#5A0016]"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero / Welcome */}
            <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EFE6DD] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121212]">
                  Welcome back, <span className="text-[#800020]">{user.name}</span> 👋
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Ready to boost your memory? Keep up your daily streak!
                </p>
              </div>
              <button
                onClick={() => { setActiveTab('decks'); }}
                className="px-5 py-2.5 bg-[#800020] hover:bg-[#5A0016] text-white font-semibold rounded-xl shadow transition-all flex items-center gap-2"
              >
                <span>🚀</span> Start Learning
              </button>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Daily Streak" value={`${stats.streak} Days`} icon="🔥" highlight />
              <StatBox label="Cards Studied" value={stats.studiedToday} icon="📖" />
              <StatBox label="Average Accuracy" value={`${stats.accuracy}%`} icon="🎯" />
              <StatBox label="Mastered Cards" value={stats.totalMastered} icon="✅" />
            </div>

            {/* Quick Access Decks */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#121212]">Recent Decks</h2>
                <button
                  onClick={() => setActiveTab('decks')}
                  className="text-xs font-semibold text-[#800020] hover:underline"
                >
                  View All ({decks.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {decks.map(deck => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onStudy={() => startStudySession(deck)}
                    onOpen={() => { setSelectedDeck(deck); setActiveTab('decks'); }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= DECKS TAB ================= */}
        {activeTab === 'decks' && !selectedDeck && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#121212]">Flashcard Decks</h1>
                <p className="text-sm text-gray-600">Create, edit, and organize your study materials.</p>
              </div>
              <button
                onClick={() => setShowDeckModal(true)}
                className="px-4 py-2 bg-[#800020] text-white font-semibold rounded-xl shadow hover:bg-[#5A0016] flex items-center gap-2 text-sm"
              >
                <span>+</span> Create New Deck
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {decks.map(deck => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onStudy={() => startStudySession(deck)}
                  onOpen={() => setSelectedDeck(deck)}
                  onDelete={() => handleDeleteDeck(deck.id)}
                  showDelete
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= SINGLE DECK VIEW ================= */}
        {activeTab === 'decks' && selectedDeck && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedDeck(null)}
              className="text-sm font-semibold text-gray-600 hover:text-[#800020] flex items-center gap-1"
            >
              ← Back to Decks
            </button>

            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#EFE6DD] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#800020]">{selectedDeck.title}</h1>
                <p className="text-sm text-gray-600 mt-1">{selectedDeck.description}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-[#FAF6F0] text-xs font-semibold rounded-md border border-[#EFE6DD]">
                  {selectedDeck.cards.length} Cards
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCardModal(true)}
                  className="px-4 py-2 bg-[#FAF6F0] hover:bg-[#EFE6DD] text-[#121212] border border-[#EFE6DD] font-semibold text-sm rounded-xl"
                >
                  + Add Card
                </button>
                <button
                  onClick={() => startStudySession(selectedDeck)}
                  className="px-5 py-2 bg-[#800020] hover:bg-[#5A0016] text-white font-semibold text-sm rounded-xl shadow"
                >
                  ▶ Study Now
                </button>
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#121212]">Deck Cards</h2>
              {selectedDeck.cards.length === 0 ? (
                <div className="p-8 text-center bg-[#FFFFFF] rounded-2xl border border-dashed border-[#EFE6DD] text-gray-500">
                  No cards in this deck yet. Click "+ Add Card" to start building!
                </div>
              ) : (
                selectedDeck.cards.map((card, idx) => (
                  <div key={card.id} className="bg-[#FFFFFF] p-4 rounded-xl border border-[#EFE6DD] flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#800020]"># {idx + 1}</p>
                      <p className="font-semibold text-sm text-[#121212]">{card.front}</p>
                      <p className="text-xs text-gray-600">{card.back}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= STUDY MODE ================= */}
        {activeTab === 'study' && selectedDeck && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveTab('decks')}
                className="text-xs font-bold text-gray-500 hover:text-[#800020]"
              >
                ✕ Exit Session
              </button>
              <span className="text-xs font-bold text-[#800020] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#EFE6DD]">
                {selectedDeck.title}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                {currentCardIdx + 1} / {selectedDeck.cards.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#EFE6DD] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#800020] transition-all duration-300"
                style={{ width: `${((currentCardIdx + 1) / selectedDeck.cards.length) * 100}%` }}
              ></div>
            </div>

            {!sessionCompleted ? (
              <div className="space-y-6">
                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="perspective-1000 w-full h-80 cursor-pointer select-none"
                >
                  <div
                    className={`relative w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d shadow-md border border-[#EFE6DD] ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* FRONT SIDE */}
                    <div className="absolute inset-0 w-full h-full bg-[#FFFFFF] rounded-2xl p-8 flex flex-col justify-between items-center text-center backface-hidden">
                      <span className="text-xs font-bold tracking-wider text-[#800020] uppercase">Front</span>
                      <p className="text-xl font-bold text-[#121212]">
                        {selectedDeck.cards[currentCardIdx]?.front}
                      </p>
                      <span className="text-xs text-gray-400">Click card to flip 🔄</span>
                    </div>

                    {/* BACK SIDE */}
                    <div className="absolute inset-0 w-full h-full bg-[#800020] text-white rounded-2xl p-8 flex flex-col justify-between items-center text-center rotate-y-180 backface-hidden">
                      <span className="text-xs font-bold tracking-wider text-amber-200 uppercase">Answer</span>
                      <p className="text-lg font-medium leading-relaxed">
                        {selectedDeck.cards[currentCardIdx]?.back}
                      </p>
                      <span className="text-xs text-red-200">Rate difficulty below 👇</span>
                    </div>
                  </div>
                </div>

                {/* Rating Controls */}
                {isFlipped ? (
                  <div className="grid grid-cols-3 gap-3 animate-fade-in">
                    <button
                      onClick={() => handleCardRate('hard')}
                      className="py-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-sm border border-red-200 transition"
                    >
                      🔴 Hard
                    </button>
                    <button
                      onClick={() => handleCardRate('medium')}
                      className="py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl text-sm border border-amber-200 transition"
                    >
                      🟠 Medium
                    </button>
                    <button
                      onClick={() => handleCardRate('easy')}
                      className="py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl text-sm border border-emerald-200 transition"
                    >
                      🟢 Easy
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-500">Tap the card above to reveal the answer.</p>
                )}
              </div>
            ) : (
              /* Session Complete Card */
              <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#EFE6DD] text-center space-y-4 shadow-sm">
                <div className="text-4xl">🎉</div>
                <h2 className="text-2xl font-extrabold text-[#800020]">Session Completed!</h2>
                <p className="text-sm text-gray-600">Great job! You've reviewed all cards in this deck.</p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-4 px-6 py-2.5 bg-[#800020] text-white font-bold rounded-xl shadow hover:bg-[#5A0016]"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}
      {/* Create Deck Modal */}
      {showDeckModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EFE6DD] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#800020]">Create New Deck</h3>
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deck Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EFE6DD] rounded-xl text-sm focus:outline-none focus:border-[#800020]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Brief description..."
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EFE6DD] rounded-xl text-sm focus:outline-none focus:border-[#800020] h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeckModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#5A0016]"
                >
                  Save Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EFE6DD] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#800020]">Add New Card</h3>
            <form onSubmit={handleAddCard} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Front (Question / Term)</label>
                <textarea
                  required
                  placeholder="e.g. What is the capital of France?"
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EFE6DD] rounded-xl text-sm focus:outline-none focus:border-[#800020] h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Back (Answer / Definition)</label>
                <textarea
                  required
                  placeholder="e.g. Paris"
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EFE6DD] rounded-xl text-sm focus:outline-none focus:border-[#800020] h-24"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#5A0016]"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatBox({ label, value, icon, highlight }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      highlight ? 'bg-[#800020] text-white border-[#800020]' : 'bg-[#FFFFFF] text-[#121212] border-[#EFE6DD]'
    }`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold tracking-wide opacity-80">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function DeckCard({ deck, onStudy, onOpen, onDelete, showDelete }) {
  return (
    <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#EFE6DD] shadow-sm hover:shadow-md transition flex flex-col justify-between h-48">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-extrabold text-[#800020] text-lg leading-snug line-clamp-1">{deck.title}</h3>
          {showDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-gray-400 hover:text-red-600 text-xs font-bold p-1"
            >
              🗑️
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{deck.description || 'No description provided.'}</p>
      </div>

      <div className="pt-4 border-t border-[#FAF6F0] flex justify-between items-center">
        <span className="text-xs font-bold text-gray-600 bg-[#FAF6F0] px-2.5 py-1 rounded-md border border-[#EFE6DD]">
          {deck.cards.length} Cards
        </span>
        <div className="flex gap-2">
          <button
            onClick={onOpen}
            className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#EFE6DD] text-[#121212] text-xs font-bold rounded-lg"
          >
            Manage
          </button>
          <button
            onClick={onStudy}
            className="px-3 py-1.5 bg-[#800020] hover:bg-[#5A0016] text-white text-xs font-bold rounded-lg shadow"
          >
            Study
          </button>
        </div>
      </div>
    </div>
  );
}