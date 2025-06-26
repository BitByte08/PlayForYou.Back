import { SocketServiceProps } from '@/interfaces/socket';
import {RoomState} from "@/sockets/room/room.types";

export const handleAddMusic = ({ connection, rooms }: SocketServiceProps) => {
	const { socket, io } = connection;

	socket.on('add_music', ({ roomId, musicInfo }) => {
		const addUserMusicInfo = {
			...musicInfo,
			add_user: socket.data.username,
		}
		rooms[roomId].musicQueue.push(addUserMusicInfo);
		if(rooms[roomId].state === null){
			const roomState:RoomState = {
				currentMusic: addUserMusicInfo,
				endCount: 0,
				startedAt: Date.now(),
			};
			rooms[roomId].state = {...roomState};
			console.log(addUserMusicInfo);
			io.to(roomId).emit('music_state', roomState);
		}
		io.to(roomId).emit('playlist', rooms[roomId].musicQueue);
	});
};

export const handleGetMusic = ({ connection, rooms }: SocketServiceProps) => {
	const { socket, io } = connection;
	socket.on('get_music', (roomId: string) => {
		if (!rooms[roomId]) {
			console.warn(`handleGetMusic: Room ${roomId} not found`);
			return;
		}
		io.to(socket.id).emit('music_state', rooms[roomId].state);
		io.to(socket.id).emit('playlist', rooms[roomId].musicQueue);
	});
};

export const handleEndMusic = ({ connection, rooms }: SocketServiceProps) => {
	const { socket, io } = connection;

	socket.on('end_music', (roomId: string) => {
		if (!rooms[roomId]) {
			console.warn(`handleEndMusic: Room ${roomId} not found`);
			return;
		}

		const room = rooms[roomId];
		const connectedUsersCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;

		if (room.users.has(socket.id)) {
			if (room.state !== null) {
				room.state.endCount += 1;

				if (room.state.endCount >= connectedUsersCount) {
					room.musicQueue.shift();

					if (room.musicQueue.length > 0) {
						const nextRoomState: RoomState = {
							currentMusic: room.musicQueue[0],
							endCount: 0,
							startedAt: Date.now(),
						};
						room.state = { ...nextRoomState };
					} else {
						room.state = null;
					}
				}
			}
			io.to(roomId).emit('music_state', room.state);
			io.to(roomId).emit('playlist', room.musicQueue);
		}
	});
};
