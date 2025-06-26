import { Server } from 'socket.io';
import { registerSocketHandlers } from './register';
import { RoomData } from './room/room.types';

export const initializeSocketServer = (io: Server, rooms: Record<string, RoomData>) => {
	io.on('connection', (socket) => {
		console.log(`\u{1F4AC} Socket connected: ${socket.id}`);

		registerSocketHandlers({
			connection: { socket, io },
			rooms,
		});
	});
};