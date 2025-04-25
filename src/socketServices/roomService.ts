import {v4 as uuidv4} from "uuid";

const joinRoom = (socket, roomQueues, roomStates, roomPlaybackMap) => {
    socket.on('join_room', (roomId: string) => {
        if (roomQueues[roomId] && roomStates[roomId]) {
            socket.join(roomId);
            roomStates[roomId].users.add(socket.id);
            console.log(`📥 ${socket.id} joined room ${roomId}`);
            socket.emit('init_playlist', roomQueues[roomId]);

            // 재생 상태가 있으면 클라이언트에게 전달
            if (roomPlaybackMap[roomId]) {
                socket.emit('playback_started', roomPlaybackMap[roomId]);
            }
        } else {
            console.log("error: room does not exist");
        }
    });
}
const getRoom = (socket, io, roomQueues) => {
    socket.on('get_rooms', () => {
        io.emit('room_list', Object.keys(roomQueues));
    });
}
const deleteRoom = (socket, io,  roomQueues, roomPlaybackMap) => {
    return socket.on("delete-room", (roomId) => {
        // 방 삭제 처리 로직
        delete roomQueues[roomId];
        delete roomPlaybackMap[roomId];

        // 해당 방에 있는 클라이언트에게 알림

        io.to(roomId).emit("room-deleted");
        io.emit('room_list', Object.keys(roomQueues));
        // 해당 소켓도 방에서 나가게
        socket.leave(roomId);
    });
}
const createRoom = (socket, io, roomQueues, roomStates) => {
    socket.on('create_room', () => {
        const newRoomId = uuidv4().slice(0, 6);
        if (!roomQueues[newRoomId]) {
            roomQueues[newRoomId] = [];
        }
        if (!roomStates[newRoomId]) {
            roomStates[newRoomId] = {
                currentMusicId: '',
                startedAt: 0,
                endCount: 0,
                users: new Set()
            };
        }
        io.emit('room_list', Object.keys(roomQueues)); // 전체에 새 목록 전송
    });
}
const leaveRoom = (socket, roomStates) => {
    socket.on('leaveRoom', ({ roomId }) => {
        console.log(`leave to room ${socket.id, roomId}`);
        socket.leave(roomId);
        if(roomStates[roomId]) console.log(roomStates[roomId].users);
        if (roomStates[roomId]) {
            roomStates[roomId].users.delete(socket.id);

            // 인원이 0명일 경우 users만 비우고, endCount, currentMusicId는 유지
            if (roomStates[roomId].users.size === 0) {
                console.log(`모든 유저가 ${roomId}에서 나갔습니다.`);
                // roomStates[roomId].users = new Set(); // 이미 clear됨
                // 다른 값들은 유지됨
            }

            // 다른 사용자들에게 나감 알리기 (옵션)
            // socket.to(roomId).emit('userLeft', { userId: socket.id });
        }
    });
}
export {joinRoom, getRoom, deleteRoom, createRoom, leaveRoom};