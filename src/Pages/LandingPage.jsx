import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify"; // Importing Toastify

const LandingPage = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const navigate = useNavigate();

  // Function to create a room
  const handleCreateRoom = async () => {
    navigate('/createRoom'); // Ensure the correct path format for dynamic room number
  };
  

  // Function to join a room
  // In handleJoinRoom, check if decryption key is stored or set during room creation
const handleJoinRoom = async () => {
  if (roomNumber.trim() !== "") {
    const roomDoc = await getDoc(doc(db, "rooms", roomNumber));

    if (roomDoc.exists()) {
      localStorage.setItem("roomNumber", roomNumber);

      // Check if the decryption key is available
      const decryptKey = roomDoc.data().decryptKey || "";

      localStorage.setItem("decryptKey", decryptKey); // Store decryption key

      toast.success("Room Number: " + roomNumber);
      navigate(`/chat/${roomNumber}`); // Navigate to chatroom
    } else {
      // Show a "Room Not Found" toast message
      toast.error("Room not found!");
    }
  } else {
    toast.error("Please enter a room number.");
  }
};


  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to ChatApp</h1>
        <input
          type="text"
          placeholder="Enter Room Number"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />
        <div className="flex justify-between gap-x-2">
          <button
            className="px-6 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
          <button
            className="px-6 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
