import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import LandingPage from './Pages/LandingPage.jsx';  // Import your landing page component
import ChatRoom from './Pages/ChatRoom.jsx';  // Import your chatroom component
import CreateRoom from './Pages/CreateRoom.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat/:roomNumber" element={<ChatRoom />} />  {/* Updated to match the dynamic room number */}
        <Route path="createRoom" element={<CreateRoom />} />  
      </Routes>
    </Router>
  </StrictMode>,
);
