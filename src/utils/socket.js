"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Global variable to hold the socket instance
let socket = null;

export default function SocketComponent() {
  const [inputValue, setInputValue] = useState("");
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");

  const [messages, setMessages] = useState([]);
  const isConnected = useRef(false);

  useEffect(() => {
    // Only connect if the socket hasn't been initialized yet
    if (!socket) {
      socket = io("http://localhost:8000");
    }

    // Event listeners should be added only once
    if (!isConnected.current) {
      socket.on("connect", () => {
        console.log("✅ Connected to backend:", socket?.id);
        setSocketId(socket.id);
        isConnected.current = true;
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from backend");
        isConnected.current = false;
      });
    }

    socket.on("msg", (message) => {
      console.log("Received message from server:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // The cleanup function is crucial for proper disconnection
    return () => {
      // Disconnect socket when the component is unmounted
      if (socket) {
        socket.disconnect();
        socket = null; // Clear the global variable
        isConnected.current = false;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  function handleMessage() {
    console.log(inputValue, room);
    if (socket && socket.connected) {
      socket.emit("msg", { inputValue, room });
      console.log("Sent message:", inputValue);
      setInputValue("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (socket && socket.connected) {
      socket.emit("join", { room });
      console.log("Joined room:", room);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Next.js + Socket.IO</h1>
      <p className="mt-4">Socket ID: {socketId}</p>

      <form onSubmit={handleSubmit}>
        <h1>Select a room to join</h1>
        <div className="flex gap-5">
          <div
            className="border border-gray-300 cursor-pointer p-3"
            onClick={() => setRoom("General")}
          >
            General
          </div>
          <div
            className="border border-gray-300 cursor-pointer p-3"
            onClick={() => setRoom("Vip")}
          >
            Vip
          </div>
          <div
            className="border border-gray-300 cursor-pointer p-3"
            onClick={() => setRoom("Jhola Gang")}
          >
            Jhola Gang
          </div>
        </div>
        {room && (
          <>
            <p className="mt-4">Selected Room : {room}</p>
            <button
              type="submit"
              className="mt-2 p-2 bg-green-500 text-gray-100 rounded"
            >
              Join Room
            </button>

            <p className="mt-4">Your Room : {room}</p>
          </>
        )}
      </form>

      <input
        type="text"
        placeholder="Type a message"
        className="mt-4 p-2 border rounded"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      <button
        onClick={handleMessage}
        className="mt-2 p-2 bg-blue-500 text-gray-100 rounded"
      >
        Send
      </button>

      {messages.length > 0 &&
        messages.map((msg, index) => (
          <div key={index} className="mt-2 p-2 border rounded">
            {msg}
          </div>
        ))}
    </main>
  );
}
