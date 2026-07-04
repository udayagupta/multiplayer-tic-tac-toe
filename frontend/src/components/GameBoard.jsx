import React from 'react'
import { Omark, Xmark, Mark } from './Marks'

const Cell = ({ value, handleCellClick, index }) => (
  <button
    className={`cell `}
    disabled={value !== null}
    onClick={() => handleCellClick(index)}
  >
    {value === 'X' ? <Xmark /> : value === 'O' ? <Omark /> : ""}
  </button>
);


const GameBoard = ({ board, currentTurn, mySymbol, status, winner, onCellClick }) => {
  return (
    <div className=''>
      <div className='flex flex-col items-center justify-center'>
        <div className='uppercase text-2xl'>
          <p>{currentTurn === mySymbol ? `Your Turn` : `Opponent's Turn`}</p>
        </div>

        <ul className='game-board mt-5'>
          {board.map((value, index) => (
            <li key={index} className='flex justify-center items-center'>
              <Cell handleCellClick={onCellClick} index={index} key={index} value={value}/>
            </li>
          ))}
        </ul>
      </div>
      
    </div>
  )
}

export default GameBoard