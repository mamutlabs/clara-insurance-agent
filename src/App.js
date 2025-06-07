// ========================================================================
// ARCHIVO 1: package.json
// Reemplaza el contenido de tu archivo package.json con esto.
// ========================================================================
{
  "name": "clara-agent",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@tailwindcss/typography": "^0.5.13",
    "autoprefixer": "^10.4.19",
    "firebase": "^10.12.2",
    "postcss": "^8.4.38",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.4.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version"
    ]
  }
}
```javascript
// ========================================================================
// ARCHIVO 2: src/App.js
// Reemplaza el contenido de tu archivo src/App.js con esto.
// ========================================================================
import React, { useState, useRef, useEffect } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from "firebase/auth";

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


// --- Icon Components ---
const ClaraLogo = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path d="M12 2L4 5v6c0 5.55 3.58 10.43 8 11.92c4.42-1.49 8-6.37 8-11.92V5l-8-3z" fill="url(#logo-gradient)" /><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">C</text><defs><linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs></svg>);
const UserIcon = () => (<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SendIcon = () => (<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></svg>);
const UploadIcon = () => (<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>);
const TrainIcon = () => (<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 2.63 14 7l-1.5-1.5L16.5 2l-3-3L12 3.5 8.5 0 7 1.5 11 6l-4.37 4.37"/><path d="M14 7l-1.5-1.5"/></svg>);
const LoginIcon = () => (<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>);
const LogoutIcon = () => (<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);


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
        </div>
    );
};

// --- Login Modal Component ---
const LoginModal = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onLogin(email, password);
            onClose();
        } catch (err) {
            setError('Error en el inicio de sesión. Verifica tus credenciales.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <form onSubmit={handleLogin} className="bg-[#1e1f20] rounded-xl shadow-lg p-8 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center text-white mb-6">Acceso Administrador</h2>
                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">Correo Electrónico</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#131314] rounded-lg p-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#131314] rounded-lg p-3 text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" required />
                </div>
                <button type="submit" className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors">Iniciar Sesión</button>
            </form>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([{ role: 'model', content: 'Hola, soy Clara, tu agente de seguros experto. Trabajo para Corredores de seguros alba Cavagliano. ¿En qué puedo asesorarte hoy?', id: 'initial-message' }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userDocuments, setUserDocuments] = useState([]);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Firebase Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const handleLogout = () => {
        signOut(auth);
    };

    // ... other state and logic ...

    return (
        <div className="bg-[#131314] text-white font-sans w-full h-screen flex flex-col antialiased">
            <TrainingModal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)} onSave={() => {}} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />

            <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3"><ClaraLogo /><h1 className="text-xl font-semibold">Clara</h1></div>
                    
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
                            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-800/50 px-3 py-2 rounded-lg hover:bg-red-700/70 text-sm text-red-300">
                                <LogoutIcon />
                                <span className="hidden md:inline">Salir</span>
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-600/70 text-sm">
                            <LoginIcon />
                            <span className="hidden md:inline">Acceso Admin</span>
                        </button>
                    )}
                </div>
                
                 {user && (
                    <div className="max-w-3xl mx-auto mt-4 flex items-center gap-2">
                        <p className="text-xs text-gray-400">Panel de Administrador:</p>
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-600/70 text-sm"><UploadIcon /> <span className="hidden md:inline">Subir documentos</span></button>
                        <button onClick={() => setIsTrainingModalOpen(true)} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg hover:bg-gray-600/70 text-sm"><TrainIcon /> <span className="hidden md:inline">Añadir Texto</span></button>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} />
                    </div>
                )}
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                {/* Chat UI will go here */}
            </main>
            
             <footer className="p-4 md:p-6 flex-shrink-0">
                <div className="max-w-3xl mx-auto"><form className="relative"><textarea placeholder="Pregúntame sobre tu póliza..." rows="1" className="w-full bg-[#1e1f20] rounded-2xl py-3 pr-16 pl-6 text-base text-gray-200 placeholder-gray-500 focus:outline-none" /><button type="submit" disabled className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-600"><SendIcon /></button></form></div>
            </footer>
        </div>
    );
}
export default App;
