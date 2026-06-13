import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';

function ChatBotWidget({ members = [], activeMemberId = '', monthlyStats = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages list changes or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Generate dynamic system prompt containing the latest dashboard data
  const generateSystemPrompt = () => {
    const basePrompt = "You are a carbon footprint advisor embedded in a family sustainability app. The app has three modules: Family Dashboard (tracks per-member emissions), Daily Tracker (logs transport, food, energy activities), and LCA (Life Cycle Assessment for products). Answer questions about carbon footprint, give personalized reduction tips, explain emissions data in simple language, and suggest eco-friendly swaps. Be concise, friendly, and data-aware.";

    if (!members || members.length === 0) {
      return basePrompt;
    }

    // Emission factors matching the app configurations
    const petrolCarFactor = 0.18;
    const dieselCarFactor = 0.20;
    const twoWheelerFactor = 0.05;
    const publicMetroFactor = 0.02;
    const gridFactor = 0.75;

    // Create string detailing current members logs
    const memberDetails = members.map(m => {
      const transportEmissions = 
        m.dailyLog.transport.petrolCar * petrolCarFactor +
        m.dailyLog.transport.dieselCar * dieselCarFactor +
        m.dailyLog.transport.twoWheeler * twoWheelerFactor +
        m.dailyLog.transport.publicMetro * publicMetroFactor;
      
      const applianceEmissions = Array.isArray(m.dailyLog.appliances)
        ? m.dailyLog.appliances.reduce((sum, app) => sum + ((app.wattage * app.hours) / 1000) * gridFactor, 0)
        : 0;

      const totalEmissionsToday = transportEmissions + applianceEmissions;

      return `- ${m.name} (${m.avatar}): Today's footprint is ${totalEmissionsToday.toFixed(2)} kg CO₂. Daily logs include transport (${m.dailyLog.transport.petrolCar} km petrol, ${m.dailyLog.transport.dieselCar} km diesel, ${m.dailyLog.transport.twoWheeler} km two-wheeler, ${m.dailyLog.transport.publicMetro} km metro) and appliances (${m.dailyLog.appliances.map(a => `${a.name}: ${a.hours}h`).join(', ')}). Consecutive zero-emission/unlogged days: ${m.consecutiveZeroDays}.`;
    }).join('\n');

    const activeMember = members.find(m => m.id === activeMemberId);
    const activeMemberName = activeMember ? activeMember.name : 'Priya';

    const monthlyEmissionsText = monthlyStats
      ? `Household Monthly emissions total: ${monthlyStats.current} kg CO₂ vs last month ${monthlyStats.previous} kg CO₂ (${monthlyStats.reduction}% reduction).`
      : 'Household monthly emissions totals are being calculated.';

    return `${basePrompt}

Current Active User Profile: ${activeMemberName}

Family Members Real-Time Dashboard Data:
${memberDetails}

${monthlyEmissionsText}

When answering, if the user asks about their own activities, family standings, how they can improve, or general app features (Dashboard, LCA, Daily Tracker), use the real-time context above to give highly specific, actionable, and personalized feedback.`;
  };

  const getSimulationResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('beef') || q.includes('diet') || q.includes('food') || q.includes('meat') || q.includes('eating')) {
      return "🥩 Beef production has a massive footprint (~60 kg CO2 per kg) due to methane emissions and land use. Swapping just one beef meal a week for plant-based alternatives cuts your food footprint by up to 20%!";
    }
    
    if (q.includes('water heater') || q.includes('appliances') || q.includes('heater') || q.includes('electricity') || q.includes('utility')) {
      return "🚿 Water heaters are heavy energy consumers. Setting the thermostat to 49°C (120°F) instead of higher defaults can save up to 10% on your monthly utility bill and keep verification parameters optimal!";
    }

    if (q.includes('transport') || q.includes('car') || q.includes('drive') || q.includes('petrol') || q.includes('diesel') || q.includes('vehicle') || q.includes('metro') || q.includes('ride')) {
      const activeMember = members.find(m => m.id === activeMemberId) || (members.length > 0 ? members[0] : null);
      let extra = "";
      if (activeMember && activeMember.dailyLog && activeMember.dailyLog.transport) {
        const trans = activeMember.dailyLog.transport;
        const totalKm = (trans.petrolCar || 0) + (trans.dieselCar || 0) + (trans.twoWheeler || 0) + (trans.publicMetro || 0);
        if (totalKm > 0) {
          extra = ` Today, you (${activeMember.name}) logged ${totalKm} km of travel.`;
        }
      }
      return `🚗 Transport is a major driver of footprint emissions. A petrol car emits ~0.18 kg CO₂ per km, while a metro trip emits just ~0.02 kg CO₂.${extra} Swapping just one drive for public transit, biking, or walking significantly shrinks your footprint!`;
    }

    if (q.includes('lca') || q.includes('life cycle') || q.includes('assess') || q.includes('product')) {
      return "🔍 LCA (Life Cycle Assessment) assesses a product's environmental footprint from cradle to grave—covering extraction, manufacturing, transport, usage, and disposal. Use our LCA tool to find low-impact alternatives for everyday purchases!";
    }

    if (q.includes('family') || q.includes('dashboard') || q.includes('member') || q.includes('standing') || q.includes('who') || q.includes('rank')) {
      if (members && members.length > 0) {
        const petrolCarFactor = 0.18;
        const dieselCarFactor = 0.20;
        const twoWheelerFactor = 0.05;
        const publicMetroFactor = 0.02;
        const gridFactor = 0.75;

        const memberStandings = members.map(m => {
          const transportEmissions = 
            (m.dailyLog?.transport?.petrolCar || 0) * petrolCarFactor +
            (m.dailyLog?.transport?.dieselCar || 0) * dieselCarFactor +
            (m.dailyLog?.transport?.twoWheeler || 0) * twoWheelerFactor +
            (m.dailyLog?.transport?.publicMetro || 0) * publicMetroFactor;
          
          const applianceEmissions = Array.isArray(m.dailyLog?.appliances)
            ? m.dailyLog.appliances.reduce((sum, app) => sum + (((app.wattage || 0) * (app.hours || 0)) / 1000) * gridFactor, 0)
            : 0;

          const totalEmissionsToday = transportEmissions + applianceEmissions;
          return { name: m.name, emissions: totalEmissionsToday };
        });

        memberStandings.sort((a, b) => a.emissions - b.emissions);
        const rankingStr = memberStandings.map((m, idx) => `${idx + 1}. ${m.name}: ${m.emissions.toFixed(2)} kg CO₂`).join('\n');
        return `📊 **Current Family Standings (Today's Footprint):**\n${rankingStr}\n\nKeep tracking and swapping high-impact activities to help the household lead the leaderboard!`;
      }
      return "📊 The Family Dashboard shows per-member emissions tracked in real time. Log your transport and appliance usage to see rankings and progress!";
    }

    // Default response
    const activeMember = members.find(m => m.id === activeMemberId);
    const activeName = activeMember ? activeMember.name : 'friend';
    return `🌱 Hello ${activeName}! I'm your Gemini-powered EcoTrace AI Advisor. I can help you understand and reduce your carbon footprint.

Here are some helpful things you can do:
• Ask me about "beef" or "diet" footprint
• Ask me about "water heater" or "appliances" settings
• Ask about "transport" or "car" travel comparison
• Ask "explain LCA" to understand product lifecycles
• Check family standings by asking about "family dashboard"`;
  };

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    if (!textToSend) {
      setInput('');
    }
    setIsLoading(true);

    // Add user message to conversation history
    const userMessage = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMessage]);

    // Simulate 1 second delay
    setTimeout(() => {
      const botReply = getSimulationResponse(queryText);
      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
      setIsLoading(false);
    }, 1000);
  };

  const starterQuestions = [
    "What's the carbon cost of eating beef?",
    "How do I optimize my water heater?",
    "Explain what LCA means in simple terms"
  ];

  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 cursor-pointer transform hover:scale-105 transition-all duration-300 text-white border border-emerald-400/20"
        title="EcoTrace AI Advisor"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>
        )}
      </button>

      {/* CHAT WIDGET WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl flex flex-col glass-panel border border-slate-700/60 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-sm shadow-indigo-500/5">
                <Sparkles className="h-5 w-5" style={{ stroke: 'url(#gemini-gradient)' }} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100 tracking-wide font-outfit">
                  EcoTrace AI Advisor • <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent font-black tracking-wider text-xs">POWERED BY GEMINI</span>
                </h3>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                    Gemini 1.5 Flash
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages View Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin">
            {messages.length === 0 && (
              <div className="space-y-4 my-auto py-4">
                <div className="text-center space-y-2 max-w-xs mx-auto">
                  <div className="inline-block p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-full">
                    <Sparkles className="h-6 w-6" style={{ stroke: 'url(#gemini-gradient)' }} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 font-outfit">Ask anything about your carbon impact</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    I can give footprint tips, explain Life Cycle Assessments, or suggest eco-swaps based on your family logs.
                  </p>
                </div>
                
                {/* Starter chips */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-1">
                    Starter Questions
                  </span>
                  <div className="flex flex-col space-y-2">
                    {starterQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="text-left text-xs bg-slate-800/40 hover:bg-emerald-950/20 border border-slate-700/60 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 p-3 rounded-xl transition-all duration-200 cursor-pointer font-semibold shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Flow */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Sparkles className="h-4 w-4" style={{ stroke: 'url(#gemini-gradient)' }} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none ml-auto'
                      : 'bg-slate-800/80 border border-slate-700/40 text-slate-100 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start items-center">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mr-2">
                  <Sparkles className="h-4 w-4" style={{ stroke: 'url(#gemini-gradient)' }} />
                </div>
                <div className="flex space-x-1.5 p-3.5 bg-slate-800/80 border border-slate-700/40 rounded-2xl rounded-tl-none w-16 items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form input controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a sustainability question..."
              disabled={isLoading}
              className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBotWidget;
