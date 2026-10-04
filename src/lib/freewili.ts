import { execFile } from "node:child_process";
import { join } from "node:path";

export type WiliAction = "ring" | "stop";

let queue: Promise<unknown> = Promise.resolve();

function run(action: WiliAction) {
	const [cmd, ...args] = (process.env.FREEWILI_PYTHON || "py -3.12").split(" ");
	const script = join(process.cwd(), "scripts", "freewili.py");
	return new Promise<void>((resolve) => {
		execFile(cmd, [...args, script, action], { timeout: 20000, windowsHide: true }, (error, _out, stderr) => {
			if (error) console.error(`Free-WiLi ${action} failed`, stderr || error.message);
			resolve();
		});
	});
}

export function wili(action: WiliAction) {
	if (process.env.FREEWILI_ENABLED !== "true") return false;
	queue = queue.then(() => run(action));
	return true;
}
