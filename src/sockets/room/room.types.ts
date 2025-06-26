import { MusicData } from '../music/music.types';

export interface RoomState {
	currentMusic: MusicData;
	startedAt: number;
	endCount: number;
}

export interface RoomData {
	users: Set<string>;
	musicQueue: MusicData[];
	state: RoomState | null;
}
