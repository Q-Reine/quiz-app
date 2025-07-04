// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";


const SOCKET_URL = 'http://192.168.18.77:3000'; 

const SocketContext = createContext(undefined);

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}

export function SocketProvider({ children }) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth(); 

    
    useEffect(() => {
        
        console.log("[SocketContext] Initializing socket connection...");
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'], 
            reconnectionAttempts: 5,
        });

        socketRef.current = newSocket;

       
        newSocket.on("connect", () => {
            console.log("[SocketContext] Socket connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("[SocketContext] Socket disconnected:", reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[SocketContext] Connection Error:', err.message);
        });

      
        return () => {
            console.log("[SocketContext] Cleaning up socket connection.");
            newSocket.disconnect();
        };
    }, []); 

    
    useEffect(() => {
        
        if (socketRef.current && isConnected && user) {
            console.log(`[SocketContext] Authenticating user: ${user.name} (ID: ${user.id})`);
            socketRef.current.emit('authenticate', user.id);
        }
       
    }, [user, isConnected]);

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