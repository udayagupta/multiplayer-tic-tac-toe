import React from 'react';
import { GoCheckCircleFill } from "react-icons/go";

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

const GameOverModal = ({ winner, mySymbol, status, gameStatus }) => {
  const isWinner = winner === mySymbol;
  const isDraw = status === "draw";


  return (
    <div style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}} className='w-full h-screen fixed inset-0 z-[10] flex items-center justify-center'>
      <div className={`flex flex-col gap-3 bg-(--ink-soft) border border-(--line) p-6 sm:p-8 rounded w-[90%] max-w-[300px]`}>
        <div className='flex flex-col gap-3 text-(--o-teal) items-center justify-center'>
          <GoCheckCircleFill size={50}/>
          <p>Game Over</p>
        </div>
        <div className='font-semibold text-2xl'>
          {status === "draw" && <p>{RESULT_CONFIG.draw.text}</p>}
          {winner && <p className={`${isWinner ? "animate-bounce" : "animate-pulse"}`}>{isWinner ? RESULT_CONFIG.win.text : RESULT_CONFIG.lose.text}</p>}
          {status === "disconnected" && <p className='text-lg'>Opponent has disconnected</p>}
        </div>
        <div className='flex flex-col gap-2'>
          {/* Rematch button will emit "request_rematch" */}
          <button className='p-2 bg-(--o-teal) text-(--ink) hover:bg-(--ink) hover:text-(--o-teal) transition duration-300 cursor-pointer font-semibold border border-(--line) rounded-md '>Rematch</button>
          <a href='/' className='p-2 border font-semibold transition duration-300 hover:bg-(--o-teal) hover:text-(--ink) border-(--line) rounded-md '>Back to lobby</a>
        </div>
      </div>
    </div>
  )
}

export default GameOverModal