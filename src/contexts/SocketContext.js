// src/contexts/SocketContext.js

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SOCKET_URL = 'http://172.20.10.4:3000';


const socket = io(SOCKET_URL, {
  autoConnect: false, 
  transports: ['websocket'],
  reconnectionAttempts: 5,
});

socket.onAny((event, ...args) => {
 
  if (socket.listeners(event).length > 0) {
    console.log(`[SOCKET EVENT] ${event}`, args);
  }
});

const SocketContext = createContext(undefined);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { user } = useAuth();

  useEffect(() => {
   
    const onConnect = () => {
      console.log("[SOCKET] Connected with ID:", socket.id);
      setIsConnected(true);
    };

    const onDisconnect = (reason) => {
      console.log("[SOCKET] Disconnected:", reason);
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      console.error("[SOCKET] Connection Error:", err.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    if (!socket.connected) {
      console.log('[SocketContext] Attempting to connect socket...');
      socket.connect();
    }

    return () => {
      console.log("[SocketContext] Cleaning up listeners.");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []); 
  useEffect(() => {
    if (socket && isConnected && user) {
      console.log(`[SOCKET] Authenticating user: ${user.name} (ID: ${user.id})`);
      socket.emit('authenticate', user.id);
    }
  }, [user, isConnected]);

  const contextValue = {
    socket, 
    isConnected,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}