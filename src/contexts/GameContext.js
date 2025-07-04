// contexts/GameContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { useSocket } from "./SocketContext";
import api from '../services/api';

const GameContext = createContext(undefined);

export function GameProvider({ children }) {
  
    const [gamePin, setGamePin] = useState(null);
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [answerResult, setAnswerResult] = useState(null);


    const { socket } = useSocket();

   
    const createGameSessionAPI = useCallback(async (quizId) => {
        try {
            const response = await api.post(`/games/${quizId}/start`);
            return response.data.pin; 
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to create game session.";
            
            throw new Error(msg);
        }
    }, []);


    
    const joinGame = useCallback((pin, nickname, isHost = false) => {
        return new Promise((resolve, reject) => {
            if (!socket || !socket.connected) {
                return reject(new Error("You are not connected to the server."));
            }

            const eventName = isHost ? 'player_join_room' : 'player_join';
            console.log(`[CONTEXT-EMIT] Emitting '${eventName}' for ${nickname} with PIN ${pin}`);

            socket.emit(eventName, { pin, nickname }, (response) => {
                if (response && response.success) {
                    console.log(`[CONTEXT-SUCCESS] Successfully joined game ${pin}.`);
                    setGamePin(pin); 
                    resolve(true);   
                } else {
                    console.error(`[CONTEXT-FAIL] Failed to join game:`, response?.message);
                    reject(new Error(response?.message || "The server rejected the join request."));
                }
            });
        });
    }, [socket]);


    
    const startGame = useCallback(() => {
        if (socket && gamePin) {
            console.log(`[CONTEXT-EMIT] Emitting 'start_game' for PIN ${gamePin}`);
            socket.emit('start_game', { pin: gamePin });
        }
    }, [socket, gamePin]);


    const submitAnswer = useCallback((optionId) => {
        if (socket && gamePin && currentQuestion?.id) {
            const payload = {
                pin: gamePin,
                questionId: currentQuestion.id,
                optionId
            };
            console.log('[CONTEXT-EMIT] Emitting "submit_answer":', payload);
            socket.emit('submit_answer', payload);
        }
    }, [socket, gamePin, currentQuestion]);


    
    
    const leaveGame = useCallback(() => {
        if (socket && gamePin) {
            console.log(`[CONTEXT-EMIT] Emitting 'leave_game' for PIN ${gamePin}`);
            socket.emit('leave_game', { pin: gamePin });
        }
        // Reset all local game state
        setGamePin(null);
        setPlayers([]);
        setCurrentQuestion(null);
        setLeaderboard([]);
        setAnswerResult(null);
    }, [socket, gamePin]);

    
    const value = {
        // State
        gamePin,
        players,
        currentQuestion,
        leaderboard,
        answerResult,

        
        setPlayers,
        setCurrentQuestion,
        setLeaderboard,
        setAnswerResult,

       
        createGameSessionAPI,
        joinGame,
        startGame,
        submitAnswer,
        leaveGame,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
}