import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify"; // Importing Toastify

const LandingPage = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const navigate = useNavigate();

  // Function to create a room
  const handleCreateRoom = async () => {
    navigate('/createRoom');
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
      navigate(`/puzzle/${roomNumber}`);
    } else {
      // Show a "Room Not Found" toast message
      toast.error("Room not found!");
    }
  } else {
    toast.error("Please enter a room number.");
  }
};


  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(135deg,_#07111f_0%,_#0f172a_45%,_#020617_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-10">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
              Private relay
            </span>
            <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              Step into a locked game space, share a code, and start the puzzle.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              No public listings. No browsing. Enter a room id you already know or create a new game space and share it directly.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-2xl font-bold text-white">01</div>
                <div className="mt-2 text-sm text-slate-300">Create a private game space</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-2xl font-bold text-white">02</div>
                <div className="mt-2 text-sm text-slate-300">Share the room id and game code</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-2xl font-bold text-white">03</div>
                <div className="mt-2 text-sm text-slate-300">Unlock the puzzle</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              <span>Access panel</span>
              <span className="rounded-full border border-cyan-400/20 px-3 py-1 text-[10px] tracking-[0.3em] text-cyan-100/80">Encrypted</span>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="roomNumber">
              Room number
            </label>
            <input
              id="roomNumber"
              type="text"
              placeholder="Enter the game room code"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300 focus:bg-white/10"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 active:scale-[0.99]"
                onClick={handleJoinRoom}
              >
                Join room
              </button>
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.99]"
                onClick={handleCreateRoom}
              >
                Create room
              </button>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Access stays private by design. Game spaces are not discoverable from this screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
