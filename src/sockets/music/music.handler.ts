import { SocketServiceProps } from '@/interfaces/socket';

export const handleMusicEvents = ({ connection }: SocketServiceProps) => {
	const { socket } = connection;

	socket.on('add_music', ({ roomId, musicInfo }) => {
		console.log(`\u{1F3B5} Music added to ${roomId}: ${musicInfo.name}`);
		socket.to(roomId).emit('music_added', musicInfo);
	});
};
