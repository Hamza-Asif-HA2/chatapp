import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
function CreateRoom() {
    const [encryptKey, setencryptKey] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    
    const navigate = useNavigate();
    
    // Function to create a room
    const handleCreateRoom = async () => {
      if (!encryptKey.trim()) {
        toast.error("Add a code before creating the game space.");
        return;
      }

      setIsCreating(true);
      const newRoomNumber = Math.floor(1000 + Math.random() * 9000).toString();
      await setDoc(doc(db, "rooms", newRoomNumber), { createdAt: new Date(), encryptionKey: encryptKey.trim() });
      localStorage.setItem("roomNumber", newRoomNumber);
      toast.success(`Game space ${newRoomNumber} is ready.`);
      navigate(`/puzzle/${newRoomNumber}`);
      setIsCreating(false);
    };
    
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0b1120_50%,_#111827_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
    <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
          Game forge
        </span>
        <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Secure setup</span>
      </div>

      <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Create a game code your group can share privately.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
        The room id is generated for you. Pick the game code now, then send both values only to the people you trust.
      </p>

      <label htmlFor='key' className='mt-8 block text-sm font-medium text-slate-200'>Game code</label>
      
      <input
      id="keys"
        type="text"
        placeholder="Enter a private game code"
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300 focus:bg-slate-950/70"
        value={encryptKey}
        onChange={(e) => setencryptKey(e.target.value)}
      />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleCreateRoom}
          disabled={isCreating}
        >
          {isCreating ? "Building game space..." : "Create game space"}
        </button>
      </div>
    </div>
  </div>
  </div>
  )
}

export default CreateRoom