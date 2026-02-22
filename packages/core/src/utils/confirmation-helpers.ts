const SERIAL_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateSerialId(): string {
	let result = '';
	for (let i = 0; i < 8; i++) {
		result += SERIAL_CHARS.charAt(
			Math.floor(Math.random() * SERIAL_CHARS.length),
		);
	}
	return result;
}

export function generatePin(): string {
	let pin = '';
	for (let i = 0; i < 8; i++) {
		pin += Math.floor(Math.random() * 10).toString();
	}
	return pin;
}
