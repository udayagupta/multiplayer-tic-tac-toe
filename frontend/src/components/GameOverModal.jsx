import React, { useEffect, useState } from 'react';
import { GoCheckCircleFill } from "react-icons/go";
import { socket } from '../lib/socket';

const RESULT_CONFIG = {
  win: {
    text: "You won!",
    accent: "var(--o-teal)",
    glow: "rgba(74,163,162,0.18)",
  },
  lose: {
    text: "You lost!",
    accent: "var(--x-red)",
    glow: "rgba(214,88,79,0.18)",
  },
  draw: {
    text: "Draw!",
    accent: "var(--paper-dim)",
    glow: "rgba(201,197,186,0.12)",
  },
};

const GameOverModal = ({ winner, mySymbol, status, gameStatus, room, isWaiting }) => {
  const isWinner = winner === mySymbol;
  const isDraw = status === "draw";
  const [hasDeclined, setHasDeclined] = useState(false);

  const handleAccept = (roomCode) => {
    socket.emit("request_rematch", { roomCode });
  };

  const handleDecline = (roomCode) => {
    socket.emit("rematch_declined", { roomCode });
    setHasDeclined(true);
  };

  const handleRematch = (roomCode) => {
    socket.emit("request_rematch", { roomCode });
  };

  useEffect(() => {
    console.log({ room, gameStatus, hasDeclined, socketId: socket.id, isWaiting });
  }, [room, gameStatus, hasDeclined])

  return (
    <div style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}} className='w-full h-screen fixed inset-0 z-[10] flex items-center justify-center'>
      <div className={`flex flex-col gap-3 bg-(--ink-soft) border border-(--line) p-6 sm:p-8 rounded w-[90%] max-w-[300px]`}>
        <div className='flex flex-col gap-3 text-(--o-teal) items-center justify-center'>
          <GoCheckCircleFill size={50}/>
          <p>Game Over</p>
        </div>
        <div className='font-semibold text-2xl'>
          {isDraw && <p>{RESULT_CONFIG.draw.text}</p>}
          
          {winner && <p className={`${isWinner ? "animate-bounce" : "animate-pulse"})`}>{isWinner ? RESULT_CONFIG.win.text : RESULT_CONFIG.lose.text}</p>}
          
          {status === "disconnected" && <p className='text-lg'>Opponent has disconnected</p>}
          
          {(status === "rematch_requested" && isWaiting) && (
            <div className='flex flex-col gap-2 mt-2 justify-between items-center'>
              <div className="w-8 h-8 rounded-full border-[3px] border-(--line) border-t-(--o-teal) animate-spin" />
              <p className='text-xl'>Waiting for Opponent to accept</p>
            </div>
          )}
          {(status === "rematch_requested" && !isWaiting && !hasDeclined) && (
            <div className=''>
              <p className='text-xl'>Your Opponent has asked for a <span className='text-(--o-teal) font-semibold'>rematch</span></p>
            </div>
          )}
          {(hasDeclined && !isWaiting) && (
            <p className='text-xl'>You have declined the offer</p>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          {(status === "won" || isDraw) && (
            <div className='flex gap-3'>
              <button 
                onClick={() => handleRematch(room.roomCode)} 
                className='p-2 flex-1 bg-(--o-teal) text-(--ink) hover:bg-(--ink) hover:text-(--o-teal) transition duration-300 cursor-pointer font-semibold border border-(--line) rounded-md '
              >
                Rematch
              </button>
              <a href='/' className='p-2 border font-semibold transition duration-300 border-(--line) rounded-md '>Back to lobby</a>
            </div>
          )}
          {(status === "rematch_requested" && !isWaiting && !hasDeclined) && (
          <div className='flex gap-5 font-semibold'>
            <button onClick={() => handleAccept(room.roomCode)} className='active:scale-[0.9] border border-transparent cursor-pointer flex-1 rounded p-3 bg-(--ink) text-(--o-teal)'>Accept</button>
            <button onClick={() => handleDecline(room.roomCode)} className='active:scale-[0.9] border border-(--line) text-(--o-teal) flex-1 cursor-pointer rounded p-3'>Decline</button>
          </div>
          )}
          {(hasDeclined || room.rematchStatus === "declined") && (
            <div>
              {isWaiting && <p className='text-xl font-semibold mb-4'>Your offer was declined</p>}
              <a href='/' className='p-2 border font-semibold transition duration-300 border-(--line) rounded-md '>Back to lobby</a>
            </div>            
          )}
        </div>
      </div>
    </div>
  )
}

export default GameOverModal