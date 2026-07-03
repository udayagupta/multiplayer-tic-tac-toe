import React from 'react';

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

const GameOverModal = () => {
  return (
    <div>GameOverModal</div>
  )
}

export default GameOverModal