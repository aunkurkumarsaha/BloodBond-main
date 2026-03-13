import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [botData, setBotData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chatbot/data');
        const data = await response.json();
        setBotData(data);
      } catch (error) {
        console.error('Error fetching bot data:', error);
      }
    };

    fetchBotData();
  }, []);

  useEffect(() => {
    setMessages([
      {
        role: "bot",
        content: `Hello! 👋 I'm your BloodBond Assistant. I can help you with:

🩸 Blood availability (e.g., "Is A+ blood available?")
🏥 Hospital information (e.g., "How many hospitals are there?")
👥 Donor statistics (e.g., "How many donors are registered?")
🚨 Emergency info (e.g., "Show emergencies")
⭐ Hospital ratings (e.g., "What's the average rating?")

What would you like to know?`
      }
    ]);
  }, []);

  const processQuery = (query) => {
    query = query.toLowerCase().trim();

    // Greeting (no data needed)
    if (['hi', 'hello', 'hey', 'hii', 'hiii'].some(g => query === g || query.startsWith(g + ' '))) {
      return `Hello! 👋 How can I help you today? You can ask me about blood availability, hospitals, donors, or emergencies.`;
    }

    // Thank you (no data needed)
    if (query.includes('thank') || query.includes('thanks')) {
      return `You're welcome! 😊 Happy to help. Is there anything else you'd like to know?`;
    }

    // Blood compatibility queries (no data needed — static info)
    if (query.includes('compatib') || query.includes('donate to') || query.includes('receive from') || 
        query.includes('can i give') || query.includes('can i take') || query.includes('match')) {
      const compatibility = {
        'A+':  { donateTo: ['A+', 'AB+'], receiveFrom: ['A+', 'A-', 'O+', 'O-'] },
        'A-':  { donateTo: ['A+', 'A-', 'AB+', 'AB-'], receiveFrom: ['A-', 'O-'] },
        'B+':  { donateTo: ['B+', 'AB+'], receiveFrom: ['B+', 'B-', 'O+', 'O-'] },
        'B-':  { donateTo: ['B+', 'B-', 'AB+', 'AB-'], receiveFrom: ['B-', 'O-'] },
        'AB+': { donateTo: ['AB+'], receiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
        'AB-': { donateTo: ['AB+', 'AB-'], receiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
        'O+':  { donateTo: ['A+', 'B+', 'AB+', 'O+'], receiveFrom: ['O+', 'O-'] },
        'O-':  { donateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], receiveFrom: ['O-'] },
      };

      const bloodMatch = query.match(/\b(ab|a|b|o)[+-]/i);
      if (bloodMatch) {
        const type = bloodMatch[0].toUpperCase();
        const info = compatibility[type];
        if (info) {
          return `🩸 Blood Type Compatibility for ${type}:

✅ You can DONATE to:
${info.donateTo.map(t => `  • ${t}`).join('\n')}

✅ You can RECEIVE from:
${info.receiveFrom.map(t => `  • ${t}`).join('\n')}

💡 ${type === 'O-' ? 'O- is the universal donor — can donate to all types!' : 
     type === 'AB+' ? 'AB+ is the universal recipient — can receive from all types!' : 
     `Remember: O- can donate to everyone, AB+ can receive from everyone.`}`;
        }
      }

      return `🩸 Blood Type Compatibility Chart:

Type → Can Donate To → Can Receive From
${Object.entries(compatibility).map(([type, info]) => 
  `${type}  →  ${info.donateTo.join(', ')}  ←  ${info.receiveFrom.join(', ')}`
).join('\n')}

💡 O- = Universal Donor | AB+ = Universal Recipient
Ask about a specific type (e.g., "A+ compatibility")`;
    }

    // Donate / eligibility (no data needed — static info)
    if (query.includes('donate') || query.includes('eligib')) {
      return `🩸 Blood Donation Eligibility:
• Age: 18-65 years
• Weight: Above 50 kg
• Hemoglobin: ≥12.5 g/dL
• Last donation: At least 3 months ago
• No recent illness or surgery

💡 Tip: Ask me "A+ compatibility" to see who you can donate to and receive from!

Visit your nearest hospital to donate! 💪`;
    }

    // Help (no data needed)
    if (['help', 'support', 'what can you do', 'menu'].some(w => query.includes(w))) {
      return `I can help you with:
🩸 Blood availability — "Is B+ available?"
🏥 Hospital info — "List hospitals" or "hospitals in Mumbai"
👥 Donor stats — "How many donors?"
🚨 Emergencies — "Show emergencies"
⭐ Ratings — "Average rating"
💉 Eligibility — "Can I donate?"
🔄 Compatibility — "A+ compatibility"

Just type your question!`;
    }

    // --- Data-dependent queries below — need botData ---
    if (!botData) return "Sorry, I'm still loading data. Please try again in a moment.";
    if (query.includes('blood') || query.includes('inventory') || query.match(/\b(a|b|ab|o)[+-]\b/i)) {
      const bloodTypeMatch = query.match(/\b(ab|a|b|o)[+-]/i);
      if (bloodTypeMatch) {
        const raw = bloodTypeMatch[0].toUpperCase();
        const keyMap = {
          'A+': 'aPositive', 'A-': 'aNegative',
          'B+': 'bPositive', 'B-': 'bNegative',
          'AB+': 'abPositive', 'AB-': 'abNegative',
          'O+': 'oPositive', 'O-': 'oNegative'
        };
        const inventoryKey = keyMap[raw];
        if (inventoryKey) {
          const units = botData.statistics?.bloodInventory?.[inventoryKey] || 0;
          const status = units < 10 ? '🔴 Critical' : units < 20 ? '🟡 Moderate' : '🟢 Good';
          return `🩸 Blood Type: ${raw}
Available Units: ${units}
Status: ${status}

${units === 0 ? '⚠️ Not available! Consider an emergency request.' :
  units < 10 ? '⚠️ Running very low! Contact a nearby hospital.' :
  '✅ Available. Visit a hospital to request.'}`;
        }
      }

      // Show all blood inventory
      const bloodGroups = [
        ['A+', 'aPositive'], ['A-', 'aNegative'],
        ['B+', 'bPositive'], ['B-', 'bNegative'],
        ['AB+', 'abPositive'], ['AB-', 'abNegative'],
        ['O+', 'oPositive'], ['O-', 'oNegative']
      ].map(([display, key]) => {
        const units = botData.statistics?.bloodInventory?.[key] || 0;
        const icon = units < 10 ? '🔴' : units < 20 ? '🟡' : '🟢';
        return `${icon} ${display}: ${units} units`;
      }).join('\n');

      return `🏥 Blood Inventory Status:\n\n${bloodGroups}\n\n🟢 Good (20+) | 🟡 Moderate (10-19) | 🔴 Critical (<10)`;
    }

    // Emergency queries
    if (query.includes('emergency') || query.includes('urgent')) {
      const active = botData.statistics?.activeEmergencies || 0;
      const emergencyList = botData.emergencies?.length > 0
        ? '\n\nRecent emergencies:\n' + botData.emergencies.slice(0, 5).map(e =>
            `• ${e.bloodGroup} needed in ${e.location?.city || 'Unknown'} (${e.status})`
          ).join('\n')
        : '';
      return `🚨 Active emergency requests: ${active}\nAvg response time: ${botData.statistics?.emergencyResponseTime || 'N/A'}${emergencyList}`;
    }

    // Rating queries
    if (query.includes('rating') || query.includes('review')) {
      return `⭐ Average hospital rating: ${botData.statistics?.averageRating || 'N/A'}/5 stars across ${botData.statistics?.totalHospitals || 0} hospitals.`;
    }

    // City-specific queries
    if (botData.statistics?.cityWiseDistribution) {
      const cities = Object.keys(botData.statistics.cityWiseDistribution);
      const mentionedCity = cities.find(city => query.includes(city.toLowerCase()));
      if (mentionedCity) {
        const count = botData.statistics.cityWiseDistribution[mentionedCity];
        const cityHospitals = botData.hospitals?.filter(h =>
          h.location?.city?.toLowerCase() === mentionedCity.toLowerCase()
        ) || [];
        return `📍 ${mentionedCity}: ${count} hospital(s)\n\n${
          cityHospitals.map(h => `• ${h.name} (Rating: ${h.rating}⭐)`).join('\n') || 'No details available.'
        }`;
      }
    }

    // Hospital queries
    if (query.includes('hospital')) {
      if (query.includes('how many') || query.includes('total') || query.includes('count')) {
        return `🏥 There are ${botData.statistics?.totalHospitals || 0} hospitals registered in BloodBond.`;
      }
      if (query.includes('list') || query.includes('show') || query.includes('all')) {
        const list = botData.hospitals?.slice(0, 10).map(h =>
          `• ${h.name} — ${h.location?.city || 'Unknown'} (${h.rating}⭐)`
        ).join('\n') || 'No hospitals found.';
        return `🏥 Hospitals:\n\n${list}`;
      }
      return `🏥 We have ${botData.statistics?.totalHospitals || 0} hospitals. Ask me "list hospitals" or about a specific city!`;
    }

    // Donor queries
    if (query.includes('donor') || query.includes('user') || query.includes('registered')) {
      const total = botData.statistics?.totalUsers || 0;
      const bloodDist = botData.statistics?.bloodTypeDistribution || {};
      const dist = Object.entries(bloodDist)
        .map(([group, count]) => `• ${group}: ${count} donors`)
        .join('\n');
      return `👥 Registered donors: ${total}\n\n${dist || 'No distribution data available.'}`;
    }

    // Default
    return `I'm not sure about that. Try asking me about:
• Blood availability (e.g., "A+ blood")
• Hospitals (e.g., "list hospitals")
• Donors (e.g., "how many donors")
• Emergencies (e.g., "show emergencies")
• Donation eligibility (e.g., "can I donate?")`;
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate typing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = processQuery(input);
    setMessages((prev) => [...prev, { role: "bot", content: response }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const quickActions = [
    { label: "🩸 Blood Stock", query: "show blood inventory" },
    { label: "🏥 Hospitals", query: "list hospitals" },
    { label: "🔄 Compatibility", query: "blood compatibility" },
    { label: "🚨 Emergencies", query: "show emergencies" },
    { label: "💉 Can I Donate?", query: "can I donate blood" },
  ];

  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-50"
          onClick={toggleChat}
          title="Chat with BloodBond Assistant"
        >
          <MessageCircle size={24} />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-5 right-5 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="text-white" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-white">BloodBond Assistant</h2>
                <p className="text-blue-200 text-xs">Online • Ready to help</p>
              </div>
            </div>
            <X
              className="text-white cursor-pointer hover:bg-blue-800 rounded p-1 transition-colors"
              onClick={toggleChat}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start max-w-[85%] space-x-2">
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot size={16} className="text-blue-600" />
                </div>
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </motion.div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex flex-wrap gap-2 border-t bg-white">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(action.query);
                    setTimeout(() => {
                      const userMsg = { role: "user", content: action.query };
                      setMessages(prev => [...prev, userMsg]);
                      setLoading(true);
                      setTimeout(() => {
                        const response = processQuery(action.query);
                        setMessages(prev => [...prev, { role: "bot", content: response }]);
                        setLoading(false);
                      }, 500);
                    }, 100);
                    setInput("");
                  }}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 bg-white">
            <div className="flex space-x-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;