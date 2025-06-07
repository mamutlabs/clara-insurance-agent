import React, { useState, useRef, useEffect } from 'react';

// --- Icon Components ---
const ClaraLogo = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6c0 5.55 3.58 10.43 8 11.92c4.42-1.49 8-6.37 8-11.92V5l-8-3z" fill="url(#logo-gradient)" /><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">C</text><defs><linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>);
const TrainIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 2.63 14 7l-1.5-1.5L16.5 2l-3-3L12 3.5 8.5 0 7 1.5 11 6l-4.37 4.37"/><path d="M14 7l-1.5-1.5"/></svg>);

// --- Training Modal Component ---
const TrainingModal = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) return null;
    const [text, setText] = useState('');
    const handleSave = () => { if (text.trim()) { onSave(text.trim()); setText(''); onClose(); } };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#1e1f20] rounded-xl shadow-lg p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold text-white mb-4">Añadir Conocimiento de Seguros</h2>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe aquí la información de seguros..." className="w-full h-48 bg-[#131314] rounded-lg p-3 text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y" />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500" disabled={!text.trim()}>Añadir</button>
                </div>
            </div>
        );
};

// --- Main App Component ---
function App() {
    const [messages, setMessages] = useState([{ role: 'model', content: 'Hola, soy Clara, tu agente de seguros experto. Trabajo para Corredores de seguros alba Cavagliano. ¿En qué puedo asesorarte hoy?', id: 'initial-message' }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userDocuments, setUserDocuments] = useState([]);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    const knowledgeBase = [
        { id: 'auto_insurance', keywords: ['auto', 'coche', 'vehículo'], content: "El seguro de auto protege contra pérdidas financieras en caso de accidente o robo. Las coberturas comunes incluyen responsabilidad civil, colisión, y completa." },
        { id: 'home_insurance', keywords: ['hogar', 'casa', 'vivienda'], content: "El seguro de hogar cubre la estructura de la vivienda y las pertenencias personales contra desastres como incendios o robos." },
        { id: 'life_insurance', keywords: ['vida', 'fallecimiento', 'beneficiarios'], content: "El seguro de vida es un contrato que paga una suma de dinero a los beneficiarios." }
    ];

    useEffect(() => {
        try {
            const savedDocs = localStorage.getItem('clara-userDocuments');
            if (savedDocs) setUserDocuments(JSON.parse(savedDocs));
        } catch (error) { console.error("Error loading docs:", error); }
    }, []);

    useEffect(() => {
        localStorage.setItem('clara-userDocuments', JSON.stringify(userDocuments));
    }, [userDocuments]);

    const callGeminiAPI = async (prompt) => {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        if (!apiKey) {
            return "Error: La API Key no está configurada en Vercel. Por favor, añádela en los ajustes del proyecto.";
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
              const errorBody = await response.json();
              console.error("API Error:", errorBody);
              throw new Error(`Error de la API: ${errorBody.error.message}`);
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            return "Lo siento, tuve un problema para conectarme con mis sistemas. Por favor, revisa la consola del navegador para más detalles.";
        }
    };

    const submitQuery = async (queryText) => {
        const userMessage = queryText.trim();
        if (!userMessage) return;

        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: userMessage, id: Date.now() }]);

        // Simple RAG logic
        const combinedKnowledge = [ ...knowledgeBase, ...userDocuments ];
        let finalPrompt = `Actuando como Clara, un agente experto en seguros de Corredores de seguros alba Cavagliano, responde la siguiente pregunta: "${userMessage}"`;

        const modelResponse = await callGeminiAPI(finalPrompt);
        setMessages(prev => [...prev, { role: 'model', content: modelResponse, id: Date.now() + 1 }]);
        setIsLoading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setUserDocuments(prev => [...prev, { id: `user-doc-${Date.now()}`, name: file.name, content: event.target.result }]);
            setMessages(prev => [...prev, { role: 'system', isSuccess: true, content: `Documento "${file.name}" cargado.` }]);
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const handleSaveTrainingText = (text) => {
        const newDoc = { id: `user-text-${Date.now()}`, name: `Info manual #${userDocuments.length + 1}`, content: text };
        setUserDocuments(prev => [...prev, newDoc]);
        setMessages(prev => [...prev, { role: 'system', isSuccess: true, content: `Nuevo conocimiento añadido.` }]);
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    return (
        <div className="bg-[#131314] text-white font-sans w-full h-screen flex flex-col antialiased">
            <TrainingModal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)} onSave={handleSaveTrainingText} />
            <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3"><ClaraLogo /><h1 className="text-xl font-semibold">Clara</h1></div>
                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md" style={{ display: 'none' }} />
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-600/70 text-sm"><UploadIcon /> <span className="hidden md:inline">Subir Póliza</span></button>
                        <button onClick={() => setIsTrainingModalOpen(true)} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-600/70 text-sm"><TrainIcon /> <span className="hidden md:inline">Añadir Info</span></button>
                    </div>
                </div>
                 {userDocuments.length > 0 && (
                    <div className="max-w-3xl mx-auto mt-4">
                        <p className="text-xs text-gray-400 mb-2">Conocimiento añadido:</p>
                        <div className="flex flex-wrap gap-2">{userDocuments.map(doc => (<span key={doc.id} className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md">{doc.name}</span>))}</div>
                    </div>
                )}
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6"><div className="max-w-3xl mx-auto">{messages.map((msg) => (
                <div key={msg.id} className={`mb-6 ${msg.role === 'system' ? 'text-center' : ''}`}>
                    {msg.role === 'system' ? (<div className={`text-sm ${msg.isSuccess ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'} inline-block px-3 py-1 rounded-full`}>{msg.content}</div>) : (
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-700/60 flex items-center justify-center mt-1">{msg.role === 'user' ? <UserIcon /> : <ClaraLogo />}</div>
                            <div className="flex-1"><p className="font-bold mb-2 capitalize text-gray-200">{msg.role === 'user' ? 'Tú' : 'Clara'}</p><div className="prose prose-invert prose-p:text-gray-300 text-base whitespace-pre-wrap">{msg.content}</div></div>
                        </div>
                    )}
                </div>
            ))}
            {isLoading && ( <div className="mb-6 flex items-start gap-4"> <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-700/60 flex items-center justify-center mt-1"> <ClaraLogo /> </div> <div className="flex-1 pt-2"> <div className="flex items-center gap-2"> <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div> <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div> <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div> </div> </div> </div> )}
            <div ref={chatEndRef} /></div></main>
             <footer className="p-4 md:p-6 flex-shrink-0"><div className="max-w-3xl mx-auto"><form onSubmit={(e) => { e.preventDefault(); submitQuery(inputValue); setInputValue(''); }} className="relative"><textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuery(inputValue); setInputValue(''); } }} placeholder="Pregúntame sobre tu póliza..." rows="1" className="w-full bg-[#1e1f20] rounded-2xl py-3 pr-16 pl-6 text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" style={{ minHeight: '52px', maxHeight: '200px' }} onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} /><button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600"><SendIcon /></button></form></div></footer>
        </div>
    );
}
export default App;
