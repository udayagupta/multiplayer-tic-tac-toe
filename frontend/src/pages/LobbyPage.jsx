import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { socket } from '../lib/socket';
import { MarkRowExample, Omark, Xmark } from '../components/Marks';


const LobbyPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  const handleJoin = () => {
    if (roomCode === "" || roomCode.length < 6) return;

    socket.off("game_start");
    socket.off("error");

    socket.on("error", (message) => {
      console.log("Join error:", message);
    });

    socket.on("game_start", (room) => {
      navigate(`/game/${roomCode}`, { state: { room } });
      console.log(room);
    });

    socket.emit("join_room", { roomCode });

  };

  const handleCreate = () => {
    socket.off("room_created");
    socket.off("game_start");

    socket.emit("create_room");

    socket.on("room_created", ({ roomCode }) => {
      navigate(`/game/${roomCode}`);
    });
  };

  const handleQuickPlay = () => {
    setIsSearching(true);
    socket.off("game_start");

    socket.emit("find_match");

    socket.on("game_start", (room) => {
      navigate(`/game/${room.roomCode}`, { state: { room } });
      console.log(room);
    });

  };

  // const handleLeave = () => { socket.emit("leave_room") };

  return (
    <div className={'lobby flex flex-col justify-center p-3 bg-[#12172B] items-center h-screen'}>
      <div className='lobby-content w-full max-w-[480px]'>

        <MarkRowExample />

        <div className='header text-center'>
          <h1 className='text-sm tracking-[0.28em] uppercase'>Multiplayer Lobby</h1>
          <p className='mt-1.5 text-4xl font-bold'>Start a match</p>
        </div>

        <div className='flex flex-col gap-5'>
          {isSearching && (
            <div className='flex flex-col mt-5 gap-2 justify-between items-center'>
              <div className="w-8 h-8 rounded-full border-[3px] border-(--line) border-t-(--o-teal) animate-spin" />
              <p>Finding Opponent...</p>
              <button className='cursor-pointer p-2 rounded bg-(--o-teal) text-(--ink) font-semibold border border-(--line)' onClick={() => socket.emit("cancel_match")}>Cancel</button>
            </div>
          )}

          {!isSearching && (
            <div>
              <div className='flex gap-5 flex-col'>
                <button onClick={handleCreate} className='mt-2 create-room-btn text-center flex items-center justify-center gap-2'>Create Room</button>
                <button onClick={handleQuickPlay} className=' quick-play-btn text-center flex items-center justify-center gap-2'>Quick Play</button>
              </div>

              <div className=' flex flex-row items-center gap-3.5 my-2'>
                <div className="line flex-1"></div>
                <span className='text-xs  tracking-widest text-'>OR</span>
                <div className="line flex-1"></div>
              </div>

              <div className='flex flex-col join-room'>
                <p className='text-left mb-2.5'>Have a room code ?</p>
                <div className='flex gap-2 items-center join-room-form'>
                  <input
                    placeholder="e.g. K7QX2P"
                    autoComplete="off"
                    type="text"
                    name="roomCode"
                    className='code-input rounded flex-1 border text-[15px] p-[14px_16px]'
                    id="roomCode"
                    maxLength={6}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  />
                  <button onClick={() => handleJoin()} className='join-btn flex items-center justify-center gap-2 p-[14px_20px] rounded border-[1.5px]'>Join</button>
                </div>
                <p className='text-[13px] mt-2 hint'>Ask the host for 6-digit room code.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default LobbyPage