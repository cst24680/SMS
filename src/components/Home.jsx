import { useState } from 'react';

const POPULAR_SUBJECTS = ['Mathematics', 'Programming', 'Languages', 'Physics', 'History', 'Biology'];

const MOCK_BUDDIES_POOL = [
  { id: 1, name: 'Emma Watson', age: 20, subject: 'Mathematics', mode: 'Online', institution: 'Oxford College', avatarColor: 'from-amber-400 to-orange-500', initials: 'EW', location: 'Remote', bio: 'Struggling with Calculus III. Let\'s prepare for midterms together!' },
  { id: 2, name: 'Lucas Scott', age: 21, subject: 'Programming', mode: 'In-Person', institution: 'Tree Hill Uni', avatarColor: 'from-blue-400 to-indigo-500', initials: 'LS', location: 'Nearby (0.8 km)', bio: 'Building a React project. Looking for a partner to review pull requests!' },
  { id: 3, name: 'Sophia Chen', age: 19, subject: 'Languages', mode: 'Online', institution: 'Global Languages Acad', avatarColor: 'from-fuchsia-400 to-pink-500', initials: 'SC', location: 'Remote', bio: 'Practice French conversation. Intermediate speaker, friendly and eager to learn.' },
  { id: 4, name: 'Liam Davis', age: 22, subject: 'Physics', mode: 'In-Person', institution: 'Action Science Institute', avatarColor: 'from-emerald-400 to-teal-500', initials: 'LD', location: 'Nearby (1.2 km)', bio: 'Quantum mechanics notes sharing. I have some great summary files!' }
];

function Home({ setView }) {
  const [step, setStep] = useState('input'); // 'input', 'scanning', 'results', 'chat'
  const [subject, setSubject] = useState('');
  const [studyMode, setStudyMode] = useState('Online');
  const [matches, setMatches] = useState([]);
  const [activeBuddy, setActiveBuddy] = useState(null);
  const [scanMessage, setScanMessage] = useState('Initializing search...');
  
  // Interactive Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const generateBuddy = (sub, mode) => {
    const firstNames = ['Sarah', 'David', 'Chloe', 'Ryan', 'Alex', 'Mia', 'Jason', 'Emma', 'Taylor', 'Jordan'];
    const lastNames = ['Miller', 'Johnson', 'Smith', 'Lee', 'Davis', 'Wilson', 'Gomez', 'Baker'];
    const avatarColors = [
      'from-amber-400 to-orange-500',
      'from-blue-400 to-indigo-500',
      'from-fuchsia-400 to-pink-500',
      'from-emerald-400 to-teal-500',
      'from-violet-400 to-purple-500'
    ];
    const institutions = ['State University', 'City Community College', 'Technical Academy', 'Ivy League School'];
    
    const randFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${randFirst} ${randLast}`;
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const inst = institutions[Math.floor(Math.random() * institutions.length)];
    
    return {
      id: Date.now() + Math.random(),
      name,
      age: Math.floor(Math.random() * 5) + 18,
      subject: sub || 'General Studies',
      mode: mode,
      institution: inst,
      avatarColor: color,
      initials: randFirst[0] + randLast[0],
      location: mode === 'In-Person' ? `Nearby (${(Math.random() * 2 + 0.2).toFixed(1)} km)` : 'Remote',
      bio: `Working on my study targets for ${sub || 'my coursework'}. Let's keep each other on track!`
    };
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setStep('scanning');
    
    // Simulate steps of search
    const messages = [
      'Accessing coordinates...',
      `Searching for partners in ${subject}...`,
      `Filtering for ${studyMode} sessions...`,
      'Compiling the best matches...'
    ];

    messages.forEach((msg, idx) => {
      setTimeout(() => {
        setScanMessage(msg);
      }, idx * 600);
    });

    setTimeout(() => {
      // Find matching buddies or generate
      const filtered = MOCK_BUDDIES_POOL.filter(
        b => b.subject.toLowerCase() === subject.trim().toLowerCase() && b.mode === studyMode
      );
      
      let finalMatches = [...filtered];
      while (finalMatches.length < 2) {
        finalMatches.push(generateBuddy(subject.trim(), studyMode));
      }
      
      setMatches(finalMatches);
      setStep('results');
    }, 2400);
  };

  const handleSayHello = (buddy) => {
    setActiveBuddy(buddy);
    setStep('chat');
    setChatMessages([
      { sender: 'user', text: `Hi ${buddy.name.split(' ')[0]}! I'm studying ${subject || 'this'} too. Would you be down to study together?` }
    ]);
    setIsTyping(true);

    // Simulate reply after 1.5s
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        { sender: 'buddy', text: `Hey! That sounds awesome. I'm actually working on some notes right now. Do you want to set up a shared schedule?` }
      ]);
    }, 1500);
  };

  return (
    <section id="home" className="hero-shell px-6 py-12 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column - Hero Pitch */}
        <div className="text-left">
          <span className="hero-badge shadow-sm">Trusted by 500+ students</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
            Find your next study partner <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">with confidence.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
            Meet local learners, build accountability, share reference notes, and turn your study sessions into focused, successful milestones.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => setView('signup')} className="btn btn-primary shadow-lg shadow-emerald-500/10">
              Get Started
            </button>
            <button onClick={() => setView('login')} className="btn btn-secondary">
              Log In
            </button>
          </div>
          
          {/* Subtle Stats Row for Landing */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200/60 pt-8">
            <div>
              <p className="text-2xl font-black text-slate-800">500+</p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Students</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">100+</p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Groups</p>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">50+</p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Subjects</p>
            </div>
          </div>
        </div>

        {/* Right Column - Interactive Matcher Widget */}
        <div className="hero-card rounded-3xl p-6 shadow-xl border border-slate-200/50 bg-white/95 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          
          {/* Decor background element */}
          <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-emerald-50/30 filter blur-xl pointer-events-none"></div>
          
          {step === 'input' && (
            <div className="flex flex-col justify-between h-full flex-1">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Interactive Match Preview</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-800">Find Your Study Buddy</h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Free Scanner</span>
                </div>

                <form onSubmit={handleScan} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject you want to study</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Mathematics, French, Programming"
                        className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm transition outline-none"
                        required
                      />
                      {subject.length === 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {POPULAR_SUBJECTS.map((sub) => (
                            <button 
                              key={sub}
                              type="button"
                              onClick={() => setSubject(sub)}
                              className="text-[10px] bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-md transition"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Study Mode Preference</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setStudyMode('Online')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition ${studyMode === 'Online' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        💻 Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudyMode('In-Person')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition ${studyMode === 'In-Person' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        📍 In-Person
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white py-3 rounded-xl font-bold transition duration-200 shadow-md shadow-emerald-500/10 text-sm flex items-center justify-center gap-2"
                  >
                    🔍 Find Partners
                  </button>
                </form>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-[10px] text-slate-400">Simply select details above to simulate nearby student search</p>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-12 flex-1">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Visual pulsating circles simulating radar */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
                <div className="absolute inset-4 rounded-full border border-emerald-500/10 animate-pulse"></div>
                <div className="absolute inset-8 rounded-full border border-indigo-500/15 animate-ping" style={{ animationDelay: '0.4s' }}></div>
                
                {/* Center graphic with cute smiley scanner */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/25">
                  🧐
                </div>
              </div>

              <h3 className="mt-8 text-lg font-bold text-slate-800 animate-pulse">Scanning Active Zones...</h3>
              <p className="mt-2 text-xs text-slate-500 text-center font-medium max-w-[220px]">{scanMessage}</p>
              
              {/* Spinning loading icons */}
              <div className="mt-6 flex gap-2 text-sm text-emerald-500">
                <span className="animate-bounce">💻</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📚</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🧠</span>
                <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>📝</span>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="flex flex-col justify-between h-full flex-1">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Matches spotted in {subject}</p>
                    <h2 className="text-lg font-bold text-slate-800">Spotted Learning Partners</h2>
                  </div>
                  <button 
                    onClick={() => { setStep('input'); setSubject(''); }}
                    className="text-[10px] text-slate-400 hover:text-emerald-600 underline font-semibold"
                  >
                    Scan Again
                  </button>
                </div>

                <div className="mt-4 space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {matches.map((buddy) => (
                    <div 
                      key={buddy.id} 
                      className="p-3 border border-slate-200/80 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300 rounded-2xl transition flex items-center justify-between gap-3 animate-fadeInUp"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br ${buddy.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shadow`}>
                          {buddy.initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-800 leading-tight truncate">{buddy.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{buddy.institution}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[8px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{buddy.mode}</span>
                            <span className="text-[8px] font-bold text-emerald-600">{buddy.location}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSayHello(buddy)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[10px] text-white font-bold rounded-lg transition shrink-0"
                      >
                        Say Hello 👋
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-center">
                <button 
                  onClick={() => setView('signup')} 
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition flex items-center gap-1 justify-center mx-auto"
                >
                  Join StudyBuddy to meet more students
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          {step === 'chat' && activeBuddy && (
            <div className="flex flex-col justify-between h-full flex-1">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeBuddy.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-sm`}>
                      {activeBuddy.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 leading-tight">{activeBuddy.name}</h4>
                      <p className="text-[8px] text-slate-400">{activeBuddy.institution}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep('results')}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Back to Matches
                  </button>
                </div>

                {/* Chat History Panel */}
                <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 text-xs">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                          <p className="leading-relaxed text-[11px]">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl rounded-tl-none px-3 py-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Popup overlay / Banner */}
              <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-emerald-800 font-bold leading-snug">
                  Want to coordinate a study session with {activeBuddy.name.split(' ')[0]}?
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">
                  Create your profile to message study partners, share notebooks, and organize milestones.
                </p>
                <div className="mt-3 flex gap-2 justify-center">
                  <button 
                    onClick={() => setView('signup')} 
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow shadow-emerald-500/10"
                  >
                    Sign Up Free
                  </button>
                  <button 
                    onClick={() => { setStep('input'); setSubject(''); }} 
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                  >
                    Scan Again
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

export default Home;
