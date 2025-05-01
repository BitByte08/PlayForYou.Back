import {v4 as uuidv4} from "uuid";
import {Socket} from "socket.io";
import {SocketServiceProps} from "../interfaces";


const joinRoom = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const rooms = props.rooms;
    socket.on('join_room', (roomId: string) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            rooms[roomId].users.add(socket.id);
            socket.to(socket.id).emit('init_playlist', rooms[roomId].musicQueue);
            socket.emit('playback_started', rooms[roomId].state);
            console.log(`📥 ${socket.id} joined room ${roomId}`);
        } else {
            console.log("error: room does not exist");
        }
    });
}
const getRoom = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('get_rooms', () => {
        io?.to(socket.id).emit('room_list', Object.keys(rooms));
    });
}
const deleteRoom = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on("delete_room", (roomId) => {
        delete rooms[roomId];

        io?.to(roomId).emit("room_deleted");
        io?.emit('room_list', Object.keys(rooms));

        socket.leave(roomId);
    });
}

const createRoom = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const io = props.connection.io;
    const rooms = props.rooms;
    socket.on('create_room', () => {
        const newRoomId = uuidv4().slice(0, 6);
        rooms[newRoomId] = {
            musicQueue: [],
            state: null,
            users: new Set<string>()
        }
        console.log(rooms[newRoomId]);

        io.emit('room_list', Object.keys(rooms));
    });
}
const leaveRoom = (props: SocketServiceProps) => {
    const socket = props.connection.socket;
    const rooms = props.rooms;
    socket.on('leave_room', (roomId) => {
        try{
            console.log(`leave to room ${socket.id, roomId}, ${rooms[roomId].users}`);
            socket.leave(roomId);
            rooms[roomId].users.delete(socket.id);
        }catch (e) {
            console.log(e);
        }
    });
}
export {joinRoom, getRoom, deleteRoom, createRoom, leaveRoom};