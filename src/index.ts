import express from 'express';
import searchRouter from './routers/search';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {createRoom, deleteRoom, getRoom, joinRoom, leaveRoom} from "./socketServices/roomService";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// 서버 전역에 방 별 큐 저장
type RoomState = {
    currentMusicId: string;
    startedAt: number;
    endCount: number;
    users: Set<string>; // socket.id 모음
}

const roomStates: Record<string, RoomState> = {};
const roomQueues: Record<string, musicType[]> = {};
const roomPlaybackMap: Record<string, PlaybackState> = {};

app.use(cors());
app.use('/', searchRouter);

io.on('connection', (socket) => {
    console.log(`✅ ${socket.id} connected`);
    deleteRoom(socket, io, roomQueues, roomPlaybackMap);
    // 방 목록 요청 처리
    getRoom(socket,io,roomQueues);
    // 방 생성 요청 처리
    createRoom(socket, io, roomQueues, roomStates);
    // 방 참여 요청 처리
    joinRoom(socket,roomQueues,roomStates,roomPlaybackMap);
    // 방 나가기 처리
    leaveRoom(socket, roomStates);

    socket.on('get_playSing', (roomId: string) => {
        if (roomQueues[roomId].length >= 1) {
            if(roomPlaybackMap[roomId]==undefined) {
                const playbackState: PlaybackState = {
                    videoId: roomQueues[roomId][0].id,
                    startedAt: Date.now(),
                    isPlaying: true,
                };
                roomPlaybackMap[roomId] = playbackState;
            }
            io.to(roomId).emit('playback_state', roomPlaybackMap[roomId]);
            console.log(`🎵 재생 시작: ${roomQueues[roomId][0].id} in room ${roomId}`);
        }
    })
    // 음악이 끝났다고 클라이언트가 알려줌
    socket.on('music-ended', (roomId: string) => {

        const state = roomStates[roomId];
        console.log(state);
        if (!state) return;

        state.endCount++;

        // 모든 유저가 끝났을 경우
        if (state.endCount >= state.users.size) {
            const queue = roomQueues[roomId];
            if (queue && queue.length > 0) {
                queue.shift(); // 첫 곡 제거
                state.endCount = 0;
                const nextMusic = queue[0];
                if (nextMusic) {
                    state.currentMusicId = nextMusic.id;
                    state.startedAt = Date.now();
                    io.to(roomId).emit('play-music', nextMusic);
                    io.to(roomId).emit('queue-updated', queue);
                } else {
                    io.to(roomId).emit('queue-empty');
                }
            }
        }
    });
    // 영상 추가 요청 처리
    socket.on('add_video', (info: InfoType) => {
        console.log(info);
        if (!roomQueues[info.roomId]) {
            roomQueues[info.roomId] = [];
        }

        // 큐에 영상 추가
        roomQueues[info.roomId].push(info.musicInfo);

        // 첫 번째 영상이 추가되면 자동으로 재생 시작
        io.to(info.roomId).emit('video_added', info.musicInfo);
    });
    // 연결 해제
    socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} disconnected`);
    });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});