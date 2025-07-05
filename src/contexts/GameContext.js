import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useSocket } from "./SocketContext";
import api from '../services/api';

const GameContext = createContext(undefined);

export function GameProvider({ children }) {
  const [gamePin, setGamePin] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answerResult, setAnswerResult] = useState(null);
  const [gamePhase, setGamePhase] = useState('waiting');
  
 
  const [myNickname, setMyNickname] = useState(null);
  
  const { socket } = useSocket();
  const gamePinRef = useRef(gamePin);

  useEffect(() => {
    gamePinRef.current = gamePin;
  }, [gamePin]);

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
      
      const executeJoin = () => {
        socket.emit('player_join', { pin, nickname, isHost }, (response) => {
          if (response?.success) {
            console.log(`[CONTEXT-SUCCESS] Joined game ${pin} successfully.`);
            setGamePin(pin);
            setGamePhase('waiting');
           
            setMyNickname(nickname);
            
            if (response.players) {
              setPlayers(response.players);
            }
            resolve(response);
          } else {
            reject(new Error(response?.message || "The server rejected the join request."));
          }
        });
      };

      if (isHost) { setTimeout(executeJoin, 250); } 
      else { executeJoin(); }
    });
  }, [socket]);

  const startGame = useCallback(() => {
    if (socket && gamePinRef.current) {
      console.log(`[CONTEXT-EMIT] Emitting 'start_game' for PIN ${gamePinRef.current}`);
      socket.emit('start_game', { pin: gamePinRef.current });
    }
  }, [socket]);

  const submitAnswer = useCallback((optionId) => {
    if (socket && gamePinRef.current && currentQuestion?.id) {
      const payload = {
        pin: gamePinRef.current,
        questionId: currentQuestion.id,
        optionId
      };
      console.log('[CONTEXT-EMIT] Emitting "submit_answer":', payload);
      socket.emit('submit_answer', payload);
    }
  }, [socket, currentQuestion]);


  const leaveGame = useCallback(() => {
    console.trace("leaveGame was called from:"); 
    const currentPin = gamePinRef.current;
    if (socket && currentPin) {
      socket.emit('leave_game', { pin: currentPin });
    }
    
    console.log('[CONTEXT] Leaving game and resetting all state.');
    setGamePin(null);
    setPlayers([]);
    setCurrentQuestion(null);
    setLeaderboard([]);
    setAnswerResult(null);
    setGamePhase('waiting');
    
 
    setMyNickname(null);

  }, [socket]);

  const value = {
    gamePin,
    players,
    currentQuestion,
    leaderboard,
    answerResult,
    gamePhase,
    myNickname, 
    
    setPlayers,
    setCurrentQuestion,
    setLeaderboard,
    setAnswerResult,
    setGamePhase,

   
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