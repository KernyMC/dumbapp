const cache = new Map<string, ArrayBuffer>();

export async function tts(text: string, voice: "alarm" | "brenda") {
	const key = process.env.ELEVENLABS_API_KEY;
	const voiceId = voice === "brenda" ? process.env.ELEVENLABS_VOICE_BRENDA : process.env.ELEVENLABS_VOICE_ALARM;
	if (process.env.DEMO_MOCK === "true" || !key || !voiceId) {
		throw new Error("tts unavailable");
	}
	const cacheKey = `${voice}:${text}`;
	const hit = cache.get(cacheKey);
	if (hit) return hit.slice(0);
	const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
		method: "POST",
		headers: {
			"xi-api-key": key,
			"Content-Type": "application/json",
			Accept: "audio/mpeg",
		},
		body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
	});
	if (!res.ok) throw new Error(`elevenlabs ${res.status}`);
	const buf = await res.arrayBuffer();
	cache.set(cacheKey, buf);
	return buf.slice(0);
}
