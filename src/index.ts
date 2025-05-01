import express from 'express';
import searchRouter from './routers/search';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {createRoom, deleteRoom, getRoom, joinRoom, leaveRoom} from "./socketServices/roomService";
import {RoomData, SocketServiceProps} from "./interfaces";
import {addMusic, endMusic, getMusic} from "./socketServices/musicService";
import dotenv from 'dotenv';
import * as process from "node:process";
import bodyParser from "body-parser";
dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "https://play4you.bitworkspace.xyz",
        methods: ["GET", "POST"]
    }
});
// 서버 전역에 방 별 큐 저장

const rooms: Record<string, RoomData> = {};

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/api', searchRouter);
io.on('connection', (socket) => {
    console.log(`✅ ${socket.id} connected`);
    const roomProps:SocketServiceProps = {
        connection: {
            io: io,
            socket: socket
        },
        rooms: rooms
    }
    deleteRoom(roomProps);
    // 방 목록 요청 처리
    getRoom(roomProps);
    // 방 생성 요청 처리
    createRoom(roomProps);
    // 방 참여 요청 처리
    joinRoom(roomProps);
    // 방 나가기 처리
    leaveRoom(roomProps);
    // 음악 추가 요청 처리
    addMusic(roomProps);
    // 음악 상태 요청 처리
    getMusic(roomProps);
    // 음악 종료 요청 처리
    endMusic(roomProps);

    socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} disconnected`);

        // 모든 방 순회하면서 해당 소켓이 있었던 곳에서 제거
        for (const roomId in rooms) {
            if (rooms[roomId].users.has(socket.id)) {
                rooms[roomId].users.delete(socket.id);

                // 유저 수가 0명이면 상태도 정리
                if (rooms[roomId].users.size === 0) {
                    rooms[roomId].state = null;
                    rooms[roomId].musicQueue = [];
                    console.log(`🧹 Room ${roomId} is now empty and has been reset.`);
                }

                // 변경사항 클라이언트에게도 알림
                io.to(roomId).emit('music_state', rooms[roomId].state);
                io.to(roomId).emit('playlist', rooms[roomId].musicQueue);
            }
        }
    });
});

const PORT = 3002;
httpServer.listen(PORT,'0.0.0.0', () => {
    console.log(process.env.BACKEND);
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
