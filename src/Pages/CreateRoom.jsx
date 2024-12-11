import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify"; // Importing Toastify
function CreateRoom() {
    const [roomNumber, setRoomNumber] = useState("");
    const [encryptKey, setencryptKey] = useState("");
    
    const navigate = useNavigate();
    
    // Function to create a room
    const handleCreateRoom = async () => {
      const newRoomNumber = Math.floor(1000 + Math.random() * 9000).toString();
      await setDoc(doc(db, "rooms", newRoomNumber), { createdAt: new Date(), "encryptionKey" : encryptKey });
      localStorage.setItem("roomNumber", newRoomNumber);
      navigate(`/chat/${newRoomNumber}`); // Ensure the correct path format for dynamic room number
    };
    
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
      <h1 className="text-2xl font-bold mb-6">Welcome to ChatApp</h1>
      <label htmlFor='key' className='font-mono flex p-2 '>Make Encryption Key:</label>
      
      <input
      id = "keys"
        type="text"
        placeholder="Enter Encryption Key"
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        value={encryptKey}
        onChange={(e) => setencryptKey(e.target.value)}
      />
      <div className="flex justify-between gap-x-2">
        <button
          className="px-6 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
          onClick={handleCreateRoom}
        >
          Create Room
        </button>
      </div>
    </div>
  </div>
  )
}

export default CreateRoom