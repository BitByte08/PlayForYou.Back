"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveRoom = exports.createRoom = exports.deleteRoom = exports.getRoom = exports.joinRoom = void 0;
const uuid_1 = require("uuid");
const joinRoom = (props) => {
    const socket = props.connection.socket;
    const rooms = props.rooms;
    socket.on('join_room', (roomId) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            rooms[roomId].users.add(socket.id);
            socket.to(socket.id).emit('init_playlist', rooms[roomId].musicQueue);
            socket.emit('playback_started', rooms[roomId].state);
            console.log(`📥 ${socket.id} joined room ${roomId}`);
        }
        else {
            console.log("error: room does not exist");
        }
    });
};
exports.joinRoom = joinRoom;
const getRoom = (props) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('get_rooms', () => {
        io === null || io === void 0 ? void 0 : io.to(socket.id).emit('room_list', Object.keys(rooms));
    });
};
exports.getRoom = getRoom;
const deleteRoom = (props) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on("delete_room", (roomId) => {
        delete rooms[roomId];
        io === null || io === void 0 ? void 0 : io.to(roomId).emit("room_deleted");
        io === null || io === void 0 ? void 0 : io.emit('room_list', Object.keys(rooms));
        socket.leave(roomId);
    });
};
exports.deleteRoom = deleteRoom;
const createRoom = (props) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('create_room', () => {
        const newRoomId = (0, uuid_1.v4)().slice(0, 6);
        rooms[newRoomId] = {
            musicQueue: [],
            state: null,
            users: new Set()
        };
        console.log(rooms[newRoomId]);
        io.emit('room_list', Object.keys(rooms));
    });
};
exports.createRoom = createRoom;
const leaveRoom = (props) => {
    const socket = props.connection.socket;
    const rooms = props.rooms;
    socket.on('leave_room', (roomId) => {
        try {
            console.log(`leave to room ${socket.id, roomId}, ${rooms[roomId].users}`);
            socket.leave(roomId);
            if (rooms[roomId] !== undefined)
                rooms[roomId].users.delete(socket.id);
        }
        catch (e) {
            console.log(e);
        }
    });
};
exports.leaveRoom = leaveRoom;
