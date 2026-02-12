import { type Player } from "./players";

export interface Court {
	name: string;
	players: Player[];
	isSingle: boolean;
	id: string;
}
