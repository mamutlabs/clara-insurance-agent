import React, { useState, useRef, useEffect } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query } from "firebase/firestore";

// PDF.js Imports
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


// --- Icon Components ---
const ClaraLogo = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6c0 5.55 3.58 10.43 8 11.92c4.42-1.49 8-6.37 8-11.92V5l-8-3z" fill="url(#logo-gradient)" /><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">C</text><defs><linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>);
const TrainIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 2.63 14 7l-1.5-1.5L16.5 2l-3-3L12 3.5 8.5 0 7 1.5 11 6l-4.37 4.37"/><path d="M14 7l-1.5-1.5"/></svg>);
const LogoutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const GoogleIcon = () => (<svg className="w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 261.8 0 127.2 97.5 14.7 225.4 3.4c18.3-1.6 34.6 12.1 34.6 31v58.5c0 15.3-11.5 27.9-26.8 29.8-38.9 4.7-69.3 38.2-69.3 78.3 0 42.8 33.7 77.5 75.5 77.5 42.1 0 76.5-35.1 76.5-78.2 0-20.2-7.6-38.4-20.2-52.5-12.7-14.2-29.3-22.4-47.5-22.4-19.6 0-37.8 9-50.2 23.6-11.9 14.1-18.4 31.9-18.4 51.1 0 16.9 13.8 30.7 30.7 30.7H442.2c16.9 0 30.7-13.8 30.7-30.7 0-14.8-10.5-27.4-24.6-30.1-16.7-3.2-34.1-5.4-52.6-5.4-38.1 0-73.4 15.2-98.6 39.9-24.8 24.3-39.7 57.8-39.7 94.2 0 66.4 54.1 120.5 120.5 120.5 66.4 0 120.5-54.1 120.5-120.5 0-21.7-5.7-42-16.1-59.5-10.4-17.5-24.6-32.3-41.3-43.5-16.9-11.2-36.2-18.7-56.4-22.3-22.8-4-46.7-2.9-69.3 3.4-12.7 3.5-22.5 14.8-22.5 28.1v60.9c0 19.3 15.6 34.9 34.9 34.9 10.3 0 20-4.2 26.8-11.1 13.5-13.8 21.1-31.9 21.1-51.1 0-35.3-28.7-64-64-64-35.3 0-64 28.7-64 64 0 35.3 28.7 64 64 64 35.3 0 64-28.7 64-64 0-16.9-13.8-30.7-30.7-30.7H189.4c-16.9 0-30.7 13.8-30.7 30.7 0 16.9 13.8 30.7 30.7 30.7h252.8c16.9 0 30.7-13.8 30.7-30.7z"></path></svg>);

// --- Main App Component ---
function App() {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([{ role: 'model', content: 'Hola, soy Clara. He sido actualizada con una memoria conversacional mejorada. Sube un documento o hazme una pregunta.', id: 'initial-message' }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userDocuments, setUserDocuments] = useState([]);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
    const [lastUploadedDocId, setLastUploadedDocId] = useState(null); // <-- NEW: Memory of the last upload

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    
    // --- Components for Modals ---
    const TrainingModal = ({ isOpen, onClose, onSave }) => { /* ... code remains the same ... */ };

    // ... (Firebase Auth and Firestore Listeners remain the same) ...
    useEffect(() => { onAuthStateChanged(auth, setUser); }, []);
    useEffect(() => {
        const q = query(collection(db, "knowledge"));
        const unsub = onSnapshot(q, (snapshot) => {
            setUserDocuments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
        return unsub;
    }, []);

    const handleGoogleLogin = async () => { /* ... */ };
    const handleLogout = () => { /* ... */ };

    const callGeminiAPI = async (prompt) => {
        // ... (API call logic remains the same)
    };
    
    const submitQuery = async (queryText) => {
        const userMessage = queryText.trim();
        if (!userMessage) return;
    
        setIsLoading(true);
        const currentMessages = [...messages, { role: 'user', content: userMessage, id: Date.now() }];
        setMessages(currentMessages);
        
        // --- NEW: Enhanced RAG and Conversational Context ---
        const combinedKnowledge = [...userDocuments];
        let bestMatch = null;
        let maxScore = 0;

        combinedKnowledge.forEach(doc => {
            let score = 0;
            const contentLower = doc.content.toLowerCase();
            const queryWords = queryText.toLowerCase().split(/\s+/);
            queryWords.forEach(word => {
                if (contentLower.includes(word)) score++;
            });
            // **INTELLIGENT PRIORITIZATION**: Give a huge bonus to the most recently uploaded document
            if (doc.id === lastUploadedDocId) {
                score += 10; 
            }
            if (score > maxScore) {
                maxScore = score;
                bestMatch = doc;
            }
        });
        
        // --- NEW: Conversational History for the Prompt ---
        const conversationHistory = currentMessages
            .slice(-4) // Take last 4 messages for context
            .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Clara'}: ${msg.content}`)
            .join('\n');

        let finalPrompt;
        if (bestMatch) {
            console.log(`Best match found: ${bestMatch.name} with score ${maxScore}`);
            finalPrompt = `Como una experta en seguros llamada Clara, analiza el historial de la conversación y el contexto proporcionado para responder la última pregunta del usuario. Tu respuesta debe ser precisa y basarse únicamente en el contexto si es relevante.\n\n[HISTORIAL DE LA CONVERSACIÓN]\n${conversationHistory}\n\n[CONTEXTO RELEVANTE DEL DOCUMENTO: ${bestMatch.name}]\n"""${bestMatch.content}"""\n\n[PREGUNTA FINAL DEL USUARIO]\n${userMessage}`;
        } else {
            finalPrompt = `Como una experta en seguros llamada Clara, analiza el historial de la conversación para responder la última pregunta del usuario. Si no tienes información, indícalo amablemente.\n\n[HISTORIAL DE LA CONVERSACIÓN]\n${conversationHistory}\n\n[PREGUNTA FINAL DEL USUARIO]\n${userMessage}`;
        }
    
        const modelResponse = await callGeminiAPI(finalPrompt);
        setMessages(prev => [...prev, { role: 'model', content: modelResponse, id: Date.now() + 1 }]);
        setIsLoading(false);
    };
    
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMessages(prev => [...prev, { role: 'system', isSuccess: true, content: `Procesando archivo: ${file.name}...` }]);
        
        let textContent = '';
        let fileType = file.name.split('.').pop().toLowerCase();

        if (fileType === 'pdf') {
            try {
                const fileReader = new FileReader();
                fileReader.onload = async function() {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    saveDocument(file.name, fullText);
                };
                fileReader.readAsArrayBuffer(file);
            } catch (error) {
                setMessages(prev => [...prev, { role: 'system', isSuccess: false, content: `Error al leer el archivo PDF.` }]);
            }
        } else {
            const reader = new FileReader();
            reader.onload = (event) => saveDocument(file.name, event.target.result);
            reader.readAsText(file);
        }
        e.target.value = null;
    };
        
    const saveDocument = async (name, content) => {
        const newDoc = { name, content, addedBy: user?.email || 'unknown', timestamp: new Date() };
        try {
            const docRef = await addDoc(collection(db, "knowledge"), newDoc);
            setLastUploadedDocId(docRef.id); // <-- NEW: Remember the ID of the last uploaded doc
            setMessages(prev => [...prev, { role: 'system', isSuccess: true, content: `He leído y memorizado el documento "${name}". Ya puedes hacerme preguntas sobre su contenido.` }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'system', isSuccess: false, content: `Error al añadir el documento.` }]);
        }
    };
        
    const handleSaveTrainingText = async (text) => {
        const docName = `Info manual - ${new Date().toLocaleString()}`;
        saveDocument(docName, text);
    };
    
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    return (
        <div className="bg-[#131314] text-white font-sans w-full h-screen flex flex-col antialiased">
            <TrainingModal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)} onSave={handleSaveTrainingText} />
            <header>
                {/* ... (Header code remains the same) ... */}
            </header>
            <main>
                {/* ... (Main UI code remains the same) ... */}
            </main>
            <footer>
                {/* ... (Footer code remains the same) ... */}
            </footer>
        </div>
    );
}
export default App;
