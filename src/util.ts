export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export interface YetiFileInfo {
	n_lines: number,
	n_tl: number,
}

export interface YetiContext {
	files: { [key: string]: YetiFileInfo }
	aggregate: YetiFileInfo,
	version: string,
	script_dir: string | null | undefined,
	script_text_dir: string | null | undefined,
	output_dir: string | null | undefined,
	yeti_location: string | null | undefined,
}

export function isBlankOrNull(str: string | null | undefined) {
	return str === null || str === undefined || str.length === 0 || str.replaceAll(' ', '').length === 0;
}
