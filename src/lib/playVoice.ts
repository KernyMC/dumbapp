export async function playVoice(text: string, voice: "alarm" | "brenda") {
	try {
		const res = await fetch("/api/speak", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text, voice }),
		});
		if (!res.ok) throw new Error(String(res.status));
		const blob = await res.blob();
		if (!blob.size) throw new Error("empty audio");
		const audio = new Audio(URL.createObjectURL(blob));
		await audio.play();
	} catch {
		const line = new SpeechSynthesisUtterance(text);
		line.rate = voice === "brenda" ? 0.92 : 1;
		line.pitch = voice === "brenda" ? 1.35 : 0.7;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(line);
	}
}
