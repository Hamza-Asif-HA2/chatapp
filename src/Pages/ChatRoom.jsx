import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // Import Firebase configuration
import { toast } from "react-toastify";
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

const PuzzleRoom = () => {
  const [messages, setMessages] = useState([]); // To store puzzle signals
  const [currentMessage, setCurrentMessage] = useState(""); // For the message being typed
  const [roomNumber, setRoomNumber] = useState(null);
  const [userId, setUserId] = useState(null); // User ID
  const [decryptKey, setDecryptKey] = useState(""); // Key to decrypt messages
  const [decryptKeyDB, setDecryptKeyDB] = useState(""); // Key to decrypt messages DB
  const [isDecryptionKeyValid, setIsDecryptionKeyValid] = useState(false); // To track whether key is correct
  const [isKeyRevealed, setIsKeyRevealed] = useState(false);
  const [puzzleAnswers, setPuzzleAnswers] = useState({});
  const [solvedPuzzles, setSolvedPuzzles] = useState({});
  const [puzzleComplete, setPuzzleComplete] = useState(false);

  const puzzleQuestions = [
    { question: "7 + 5 = ?", answer: "12" },
    { question: "9 - 3 = ?", answer: "6" },
    { question: "4 x 2 = ?", answer: "8" },
  ];

  useEffect(() => {
    const isComplete = puzzleQuestions.every((_, index) => solvedPuzzles[index]);
    setPuzzleComplete(isComplete);
    if (!isComplete) {
      setIsKeyRevealed(false);
      setIsDecryptionKeyValid(false);
    }
  }, [solvedPuzzles]);

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
    if (puzzleComplete && inputKey === decryptKeyDB) {
      setIsDecryptionKeyValid(true);
      setIsKeyRevealed(true);
      toast.success("Game code accepted.");
    } else {
      setIsDecryptionKeyValid(false);
      setIsKeyRevealed(false);
    }
  };

  const handlePuzzleAnswerChange = (index, value) => {
    setPuzzleAnswers((current) => ({
      ...current,
      [index]: value,
    }));
  };

  const checkPuzzleAnswer = (index) => {
    const expectedAnswer = puzzleQuestions[index].answer;
    const userAnswer = (puzzleAnswers[index] || "").trim();

    if (userAnswer === expectedAnswer) {
      setSolvedPuzzles((current) => ({
        ...current,
        [index]: true,
      }));
      toast.success(`Challenge ${index + 1} solved.`);
    } else {
      setSolvedPuzzles((current) => ({
        ...current,
        [index]: false,
      }));
      toast.error(`Challenge ${index + 1} is not correct.`);
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
      toast.error("Please enter a valid move and game code.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#08111f_45%,_#111827_100%)] px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Game status</p>
              <h2 className="mt-2 text-xl font-bold text-white">Space {roomNumber}</h2>
            </div>
            <div className={`h-3 w-3 rounded-full ${isKeyRevealed ? 'bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]' : 'bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.8)]'}`} />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Player id</p>
            <p className="mt-2 break-all text-sm font-medium text-slate-100">{userId}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Game code</p>
            <input
              type="text"
              placeholder="Unlock the chamber"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300"
              value={decryptKey}
              onChange={handleDecryptKeyChange}
              disabled={!puzzleComplete}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            {isKeyRevealed ? (
              <p>The chamber is open. The hidden area is active.</p>
            ) : (
              <p>The chamber is locked. Solve the puzzle to reveal the hidden area.</p>
            )}
          </div>
        </aside>

        <main className="flex min-h-[70vh] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Encrypted arena</p>
                <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{isKeyRevealed ? 'Hidden Space' : 'Puzzle Game'}</h1>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                {isKeyRevealed ? 'Access granted' : 'Puzzle required'}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {!isKeyRevealed ? (
              <div className="grid min-h-[24rem] gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4 sm:grid-cols-3 sm:p-6">
                <div className="sm:col-span-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Puzzle challenge</p>
                  <h2 className="mt-2 text-lg font-bold text-white sm:text-2xl">Solve the challenges to open the hidden space</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    The space is disguised as a game until the puzzle is solved.
                  </p>
                </div>

                {puzzleQuestions.map((item, index) => (
                  <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-cyan-950/10 sm:p-5">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                      <span>Challenge {index + 1}</span>
                      <span>Math</span>
                    </div>
                    <div className="mt-4 text-xl font-black leading-tight text-white sm:text-2xl">{item.question}</div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Answer"
                        value={puzzleAnswers[index] || ""}
                        onChange={(e) => handlePuzzleAnswerChange(index, e.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-white placeholder:text-slate-500 outline-none focus:border-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => checkPuzzleAnswer(index)}
                        className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition sm:w-auto ${solvedPuzzles[index] ? 'bg-emerald-400 text-slate-950' : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'}`}
                      >
                        {solvedPuzzles[index] ? 'Solved' : 'Check'}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="sm:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Progress: {Object.values(solvedPuzzles).filter(Boolean).length}/{puzzleQuestions.length} solved
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[92%] rounded-[1.25rem] border px-4 py-3 text-sm sm:max-w-[75%] ${message.userId === userId ? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-50' : 'border-white/10 bg-slate-950/70 text-slate-100'}`}>
                        <div className={`mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] ${message.userId === userId ? 'justify-end text-cyan-100/80' : 'text-cyan-200/70'}`}>
                          <span className={`rounded-full px-2 py-1 ${message.userId === userId ? 'bg-cyan-300/20 text-cyan-50' : 'bg-cyan-400/20 text-cyan-100'}`}>
                            {message.userId === userId ? 'You' : message.userId.slice(0, 5)}
                          </span>
                          <span>{message.userId === userId ? 'Sender' : 'Receiver'}</span>
                        </div>
                        <div className={`${message.userId === userId ? 'text-right' : 'text-left'}`}>
                          {isDecryptionKeyValid ? decryptMessage(message.text, decryptKey) : <span className="text-slate-400">Encrypted signal</span>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[24rem] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/30 p-8 text-center text-slate-400">
                    No messages yet. The first signal will appear here.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-slate-950/50 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder={isKeyRevealed ? "Type your message..." : "Solve the puzzle first"}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isDecryptionKeyValid}
              />
              <button
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={sendMessage}
                disabled={!isDecryptionKeyValid}
              >
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PuzzleRoom;
