// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";


const SOCKET_URL = 'http://172.20.10.4:3000'; 

const SocketContext = createContext(undefined);

export function SocketProvider({ children }) {
    
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
   
        if (user && token) {
           
            if (!socketRef.current) {
                console.log("[SocketContext] Creating new socket connection...");
                socketRef.current = io(SOCKET_URL);

                socketRef.current.on("connect", () => {
                    console.log("[SocketContext] Socket connected:", socketRef.current.id);
                    setIsConnected(true);
                    if (user) {
                        socketRef.current.emit('authenticate', user.id);
                    }
                });

                socketRef.current.on("disconnect", () => {
                    console.log("[SocketContext] Socket disconnected.");
                    setIsConnected(false);
                });
            }
        } else {
           
            if (socketRef.current) {
                console.log("[SocketContext] Disconnecting socket...");
                socketRef.current.disconnect();
                socketRef.current = null; // Clean up the ref
                setIsConnected(false); // Ensure connected state is false
            }
        }
        
   
        return () => {
            if (socketRef.current) {
                console.log("[SocketContext] Cleaning up socket on provider unmount.");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, token]); 

    const contextValue = {
        socket: socketRef.current,
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