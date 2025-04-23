import express from 'express';
import searchRouter from './routers/search';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';


type InfoType = {
    roomId: string,
    videoUrl: string
}
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
// 서버 전역에 방 별 큐 저장
const roomQueues: Record<string, string[]> = {};

app.use(cors());
app.use('/search', searchRouter);
io.on('connection', (socket) => {
    console.log(`✅ ${socket.id} connected`);

    socket.on('get_rooms', ()=> {
        io.emit('room_list', Object.keys(roomQueues));
    })
    socket.on('create_room', () => {
        const newRoomId = uuidv4().slice(0, 6);
        if (!roomQueues[newRoomId]) {
            roomQueues[newRoomId] = [];
        }
        io.emit('room_list', Object.keys(roomQueues)); // 전체에 새 목록 전송
    });
    socket.on('join_room', (roomId: string) => {
        if(roomQueues[roomId]) {
            socket.join(roomId);
            console.log(`📥 ${socket.id} joined room ${roomId}`);
            socket.emit('init_playlist', roomQueues[roomId]);
        }else{
            console.log("error");
        }
    });
    socket.on('add_video', (info:InfoType)=>{
        console.log(info);
        if (!roomQueues[info.roomId]) {
            roomQueues[info.roomId] = [];
        }
        // 큐에 추가
        roomQueues[info.roomId].push(info.videoUrl);
        io.to(info.roomId).emit('video_added', info.videoUrl);
    });
    socket.on('disconnect', () => {
        console.log(`❌ ${socket.id} disconnected`);
    });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});