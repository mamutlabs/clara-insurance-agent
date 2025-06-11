import React, { useState, useRef, useEffect } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// PDF.js Imports
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// --- Icon Components (sin cambios) ---
const ClaraLogo = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6c0 5.55 3.58 10.43 8 11.92c4.42-1.49 8-6.37 8-11.92V5l-8-3z" fill="url(#logo-gradient)" /><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">C</text><defs><linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>);
const GoogleIcon = () => (<svg className="w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 261.8 0 127.2 97.5 14.7 225.4 3.4c18.3-1.6 34.6 12.1 34.6 31v58.5c0 15.3-11.5 27.9-26.8 29.8-38.9 4.7-69.3 38.2-69.3 78.3 0 42.8 33.7 77.5 75.5 77.5 42.1 0 76.5-35.1 76.5-78.2 0-20.2-7.6-38.4-20.2-52.5-12.7-14.2-29.3-22.4-47.5-22.4-19.6 0-37.8 9-50.2 23.6-11.9 14.1-18.4 31.9-18.4 51.1 0 16.9 13.8 30.7 30.7 30.7H442.2c16.9 0 30.7-13.8 30.7-30.7 0-14.8-10.5-27.4-24.6-30.1-16.7-3.2-34.1-5.4-52.6-5.4-38.1 0-73.4 15.2-98.6 39.9-24.8 24.3-39.7 57.8-39.7 94.2 0 66.4 54.1 120.5 120.5 120.5 66.4 0 120.5-54.1 120.5-120.5 0-21.7-5.7-42-16.1-59.5-10.4-17.5-24.6-32.3-41.3-43.5-16.9-11.2-36.2-18.7-56.4-22.3-22.8-4-46.7-2.9-69.3 3.4-12.7 3.5-22.5 14.8-22.5 28.1v60.9c0 19.3 15.6 34.9 34.9 34.9 10.3 0 20-4.2 26.8-11.1 13.5-13.8 21.1-31.9 21.1-51.1 0-35.3-28.7-64-64-64-35.3 0-64 28.7-64 64 0 35.3 28.7 64 64 64 35.3 0 64-28.7 64-64 0-16.9-13.8-30.7-30.7-30.7H189.4c-16.9 0-30.7 13.8-30.7 30.7 0 16.9 13.8 30.7 30.7 30.7h252.8c16.9 0 30.7-13.8 30.7-30.7z"></path></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);

// --- Main App Component ---
function App() {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([{ role: 'model', content: 'Hola, soy Clara. Mi cerebro RAG está listo. Sube un documento o hazme una pregunta.', id: 'initial-message' }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => { onAuthStateChanged(auth, setUser); }, []);
    
    // Firebase Functions calls
    const processDocumentFunc = httpsCallable(functions, 'processDocumentForRAGV2');
    const analyzeDocumentFunc = httpsCallable(functions, 'analyzeDocument');
    
    const submitQuery = async (queryText) => {
        const userMessage = queryText.trim();
        if (!userMessage) return;
        
        setMessages(prev => [...prev, { role: 'user', content: userMessage, id: Date.now() }]);
        setIsLoading(true);
        
        try {
            // Llamar a Firebase Function
            const result = await processDocumentFunc({
                prompt: userMessage,
                documentText: null // Para consultas generales sin documento específico
            });
            
            if (result.data.success) {
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    content: result.data.response, 
                    id: Date.now() + 1 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: 'system', 
                    isSuccess: false, 
                    content: `Error: ${result.data.error}` 
                }]);
            }
        } catch (error) {
            console.error('Error calling Firebase Function:', error);
            setMessages(prev => [...prev, { 
                role: 'system', 
                isSuccess: false, 
                content: `Error: ${error.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) {
            if(!user) alert("Por favor, inicia sesión para subir documentos.");
            return;
        };
        
        setMessages(prev => [...prev, { role: 'system', isSuccess: true, content: `Procesando ${file.name}... Esto puede tardar.` }]);
        setIsLoading(true);
        
        try {
            let fileContent = '';
            if (file.type === 'application/pdf') {
                const typedarray = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(new Uint8Array(typedarray)).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fileContent += textContent.items.map(item => item.str).join(' ') + '\n';
                }
            } else {
                fileContent = await file.text();
            }
            
            // Analizar el documento usando Firebase Function
            const result = await analyzeDocumentFunc({
                documentText: fileContent,
                analysisType: "summary"
            });
            
            if (result.data.success) {
                setMessages(prev => [...prev, { 
                    role: 'system', 
                    isSuccess: true, 
                    content: `¡Éxito! Documento "${file.name}" procesado. Resumen: ${result.data.analysis}` 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: 'system', 
                    isSuccess: false, 
                    content: `Error procesando documento: ${result.data.error}` 
                }]);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            setMessages(prev => [...prev, { 
                role: 'system', 
                isSuccess: false, 
                content: `Error: ${error.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };
        
    useEffect(() => { if(chatEndRef.current) { chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); } }, [messages, isLoading]);

    return (
        <div className="bg-[#131314] text-white font-sans w-full h-screen flex flex-col antialiased">
            <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3"><ClaraLogo /><h1 className="text-2xl font-semibold">Clara</h1></div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
                            <button onClick={() => signOut(auth)} className="flex items-center gap-2 bg-red-800/50 px-3 py-2 rounded-lg hover:bg-red-700/70 text-sm text-red-300"><LogoutIcon /> <span className="hidden md:inline">Salir</span></button>
                        </div>
                    ) : (
                        <button onClick={() => signInWithPopup(auth, googleProvider)} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 text-sm">
                            <GoogleIcon />
                            <span>Iniciar sesión con Google</span>
                        </button>
                    )}
                </div>
                 {user && (
                    <div className="max-w-3xl mx-auto mt-4">
                         <div className="flex items-center gap-2">
                             <p className="text-xs text-gray-400">Panel de Administrador:</p>
                             <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-600/70 text-sm"><UploadIcon /> <span className="hidden md:inline">Subir documentos</span></button>
                             <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".txt,.md,.pdf" />
                         </div>
                    </div>
                )}
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                 <div className="max-w-3xl mx-auto">{messages.map((msg, index) => (
                    <div key={msg.id || index} className={`mb-6 ${msg.role === 'system' ? 'text-center' : ''}`}>
                        {msg.role === 'system' ? (<div className={`text-sm ${msg.isSuccess ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'} inline-block px-3 py-1 rounded-full`}>{msg.content}</div>) : (
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-700/60 flex items-center justify-center mt-1">{msg.role === 'user' ? <UserIcon /> : <ClaraLogo />}</div>
                                <div className="flex-1"><p className="font-bold mb-2 capitalize text-gray-200">{msg.role === 'user' ? 'Tú' : 'Clara'}</p><div className="prose prose-invert prose-p:text-gray-300 text-base whitespace-pre-wrap">{msg.content}</div></div>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && ( <div className="mb-6 flex items-start gap-4"> <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-700/60 flex items-center justify-center mt-1"> <ClaraLogo /> </div> <div className="flex-1 pt-2"> <div className="flex items-center gap-2"> <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div> <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div> <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div> </div> </div> </div> )}
                <div ref={chatEndRef} /></div>
            </main>
            
             <footer className="p-4 md:p-6 flex-shrink-0">
                <div className="max-w-3xl mx-auto"><form onSubmit={(e) => { e.preventDefault(); submitQuery(inputValue); setInputValue(''); }} className="relative"><textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuery(inputValue); setInputValue(''); } }} placeholder="Escribe tu consulta sobre seguros..." rows="1" className="w-full bg-[#1e1f20] rounded-2xl py-3 pr-16 pl-6 text-base text-gray-200 placeholder-gray-500 focus:outline-none" /><button type="submit" disabled={!inputValue.trim() || isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600"><SendIcon /></button></form></div>
            </footer>
        </div>
    );
}
export default App;
