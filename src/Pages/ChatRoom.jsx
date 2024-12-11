import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // Import Firebase configuration
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import { v4 as uuidv4 } from 'uuid';

// Function to encrypt messages using Vigenere Cipher
const encryptMessage = (message, key) => {
  const A = 65; // ASCII value of 'A'
  const n = 26; // Alphabet count
  const messageUpper = message.toUpperCase();
  const keyUpper = key.toUpperCase();
  let encrypted = "";

  for (let i = 0, j = 0; i < messageUpper.length; i++) {
    const char = messageUpper[i];
    if (/[A-Z]/.test(char)) { // Check if char is an alphabet
      const shift = keyUpper[j % keyUpper.length].charCodeAt(0) - A;
      const newChar = String.fromCharCode(((char.charCodeAt(0) - A + shift) % n) + A);
      encrypted += newChar;
      j++;
    } else {
      encrypted += char; // Keep non-alphabet characters as is
    }
  }
  return encrypted;
};

// Function to decrypt messages using Vigenere Cipher
const decryptMessage = (message, key) => {
  const A = 65; // ASCII value of 'A'
  const n = 26; // Alphabet count
  const messageUpper = message.toUpperCase();
  const keyUpper = key.toUpperCase();
  let decrypted = "";

  for (let i = 0, j = 0; i < messageUpper.length; i++) {
    const char = messageUpper[i];
    if (/[A-Z]/.test(char)) { // Check if char is an alphabet
      const shift = keyUpper[j % keyUpper.length].charCodeAt(0) - A;
      const newChar = String.fromCharCode(((char.charCodeAt(0) - A - shift + n) % n) + A);
      decrypted += newChar;
      j++;
    } else {
      decrypted += char; // Keep non-alphabet characters as is
    }
  }
  return decrypted;
};

const ChatRoom = () => {
  const [messages, setMessages] = useState([]); // To store chat messages
  const [currentMessage, setCurrentMessage] = useState(""); // For the message being typed
  const [roomNumber, setRoomNumber] = useState(null);
  const [userId, setUserId] = useState(null); // User ID
  const [decryptKey, setDecryptKey] = useState(""); // Key to decrypt messages
  const [decryptKeyDB, setDecryptKeyDB] = useState(""); // Key to decrypt messages DB
  const [isDecryptionKeyValid, setIsDecryptionKeyValid] = useState(false); // To track whether key is correct

  // Assign a unique user ID and set room number on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRoomNumber = localStorage.getItem("roomNumber");

    if (!storedUserId) {
      const newUserId = uuidv4();
      setUserId(newUserId);
      localStorage.setItem("userId", newUserId);
    } else {
      setUserId(storedUserId);
    }

    if (!storedRoomNumber) {
      const newRoomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4-digit room number
      setRoomNumber(newRoomNumber);
      localStorage.setItem("roomNumber", newRoomNumber);
    } else {
      setRoomNumber(storedRoomNumber);
    }
  }, []);

  // Fetch messages in real-time
  useEffect(() => {
    if (roomNumber) {
      const q = query(collection(db, `rooms/${roomNumber}/messages`), orderBy("timestamp"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [roomNumber]);

  // Fetch encryption key from Firebase
  useEffect(() => {
    const fetchEncryptionKey = async () => {
      try {
        const roomDoc = await getDoc(doc(db, "rooms", roomNumber));
        if (roomDoc.exists()) {
          const encryptionKeyFromDB = roomDoc.data().encryptionKey;
          if (typeof encryptionKeyFromDB === "string") {
            setDecryptKeyDB(encryptionKeyFromDB);
            localStorage.setItem("decryptKey", encryptionKeyFromDB);  // Save it in localStorage
          } else {
            toast.error("Invalid encryption key format from DB.");
          }
        } else {
          toast.error("Room not found or encryption key not set.");
        }
      } catch (error) {
        toast.error("Error fetching encryption key.");
      }
    };
  
    if (roomNumber) {
      fetchEncryptionKey();
    }
  }, [roomNumber]);

  // Function to handle decryption key input
  const handleDecryptKeyChange = (e) => {
    const inputKey = e.target.value;
    setDecryptKey(inputKey);
    
    // Check if the decryption key entered matches the key stored in Firebase
    if (inputKey === decryptKeyDB) {
      setIsDecryptionKeyValid(true);
      toast.success("Decryption Key Correct!");
    } else {
      setIsDecryptionKeyValid(false);
      toast.info("Enter the correct decryption key.");
    }
  };
  

  // Function to handle sending a message
  const sendMessage = async () => {
    if (currentMessage.trim() !== "" && decryptKeyDB) {
      console.log("Sending Message..........");
      console.log("with Encryption key in DB:" + decryptKeyDB);
      
      // Use the decryption key from Firebase (decryptKeyDB)
      const encryptionKey = decryptKeyDB; 
      const encryptedMessage = encryptMessage(currentMessage, encryptionKey);
  
      try {
        // Add the encrypted message to Firestore
        await addDoc(collection(db, `rooms/${roomNumber}/messages`), {
          text: encryptedMessage,
          userId: userId,
          timestamp: new Date(),
          encryptionKey: encryptionKey
        });
        setCurrentMessage(""); // Clear the message input
      } catch (error) {
        toast.error("Failed to send message.");
      }
    } else {
      toast.error("Please enter a valid message and decryption key.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-x-4">
      <Sidebar />
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">Chat Room</h1>
          <p className="text-center text-gray-600 mb-4">Room Number: <span className="font-semibold">{roomNumber}</span></p>
          <p className="text-center text-gray-600 mb-4">Your User ID: <span className="font-semibold">{userId}</span></p>

          {/* Decrypt Key Input */}
          <input
            type="text"
            placeholder="Enter Decrypt Key"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            value={decryptKey}
            onChange={handleDecryptKeyChange}
          />

          {/* Message Display Area */}
          <div className="border rounded-md h-80 overflow-y-scroll p-4 mb-4 bg-gray-50">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="mb-2">
                  <span className="block px-3 py-2 bg-blue-100 rounded-lg text-gray-800">
                    <span className="rounded-full px-2 bg-red-500">
                      {message.userId.slice(0, 5)}
                    </span>
                    
                    {/* Display decrypted message if the decryption key is correct */}
                    {isDecryptionKeyValid ? (
                      decryptMessage(message.text, decryptKey)
                    ) : (
                      <span>Encrypted Message</span> // Display this if the key is incorrect
                    )}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
            )}
          </div>

          {/* Input Field and Send Button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message here..."
              className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
