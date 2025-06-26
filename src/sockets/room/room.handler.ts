import { v4 as uuidv4 } from 'uuid';
import { SocketServiceProps } from '@/interfaces/socket';

export const handleCreateRoom = ({ connection, rooms }: SocketServiceProps) => {
	const { socket, io } = connection;
	socket.on('create_room', () => {
		const roomId = uuidv4().slice(0, 6);
		rooms[roomId] = {
			musicQueue: [],
			state: null,
			users: new Set<string>(),
		};
		io.emit('room_list', Object.keys(rooms));
		socket.emit('add_room', roomId);
	});
};

export const handleJoinRoom = ({ connection, rooms }: SocketServiceProps) => {
	const { socket } = connection;
	socket.on('join_room', (roomId: string) => {
		const room = rooms[roomId];
		if (room) {
			socket.join(roomId);
			room.users.add(socket.id);
			socket.emit('init_playlist', room.musicQueue);
			socket.emit('playback_started', room.state);
			console.log(`\u{1F4E5} ${socket.id} joined ${roomId}`);
		}
	});
};

export const handleLeaveRoom = ({ connection, rooms }: SocketServiceProps) => {
	const { socket } = connection;
	socket.on('leave_room', (roomId: string) => {
		socket.leave(roomId);
		rooms[roomId]?.users.delete(socket.id);
	});
};

export const handleDeleteRoom = ({ connection, rooms }: SocketServiceProps) => {
	const { socket, io } = connection;
	socket.on('delete_room', (roomId: string) => {
		delete rooms[roomId];
		io.to(roomId).emit('room_deleted');
		io.emit('room_list', Object.keys(rooms));
		socket.leave(roomId);
	});
};

export const handleGetRooms = ({ connection, rooms }: SocketServiceProps) => {
	const { socket, io } = connection;
	socket.on('get_rooms', () => {
		io.to(socket.id).emit('room_list', Object.keys(rooms));
	});
};