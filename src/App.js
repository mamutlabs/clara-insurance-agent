import React, { useState, useRef, useEffect } from 'react';

// --- Icon Components ---
const ClaraLogo = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 5v6c0 5.55 3.58 10.43 8 11.92c4.42-1.49 8-6.37 8-11.92V5l-8-3z" fill="url(#logo-gradient)" /><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" dy=".3em">C</text><defs><linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#3b82f6"/></linearGradient></defs></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></svg>);

// --- Main App Component ---
function App() {
    // NOTE: The full functional code will be added in a subsequent step 
    // once the base deployment is successful.
    return (
        <div className="bg-[#131314] text-white font-sans w-full h-screen flex flex-col antialiased">
            <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <ClaraLogo />
                        <h1 className="text-xl font-semibold">Clara</h1>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                   <div className="text-center text-gray-400">¡El despliegue base ha funcionado! La funcionalidad completa se añadirá a continuación.</div>
                </div>
            </main>
        </div>
    );
}
export default App;
