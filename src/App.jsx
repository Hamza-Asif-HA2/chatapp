import React from "react";
import './App.css';
import LandingPage from './Pages/LandingPage';
import ChatRoom from './Pages/ChatRoom';
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the toast CSS

function App() {
  return (
    <>
      <LandingPage />
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={true} />
    </>
  );
}

export default App;
