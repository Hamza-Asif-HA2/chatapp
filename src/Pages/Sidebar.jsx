import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Sidebar = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-64 bg-gray-800 text-white p-4 rounded-xl">
      <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li
            key={room.id}
            className="p-2 hover:bg-gray-600 cursor-pointer"
            onClick={() => onJoinRoom(room.id)}
          >
            Room: {room.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
