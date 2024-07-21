import React from 'react';
import './Header.css'; // Assuming your MainContent component is now in a separate file
import { TCanvas } from './three/TCanvas';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <header className="header">
       
      </header>
      <TCanvas />
    </div>
  );
};

export default App;