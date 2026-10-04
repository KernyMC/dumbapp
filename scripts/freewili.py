"""Drive a connected FREE-WiLi. Usage: python freewili.py ring|stop|setup"""
import faulthandler
import io
import json
import pathlib
import sys
import time
import urllib.request
import wave

import onewili
import serial

LEDS = range(7)
FLASH = 1
WAKE_LINE = "Good morning! Your free trial of being awake has ended."
WAKE_FILE = "/sounds/wake.wav"
SAMPLE_RATE = 8000


def ring(dev):
	for led in LEDS:
		dev.gui.set_led_color(led, 255, 0, 0, 60000, FLASH)
	dev.io.audio.play_audio_file("wake")


def stop(dev):
	for led in LEDS:
		dev.gui.set_led_color(led, 0, 0, 0, 0, 0)


def wake_wav():
	env_file = pathlib.Path(__file__).resolve().parent.parent / ".env.local"
	env = dict(line.split("=", 1) for line in env_file.read_text().splitlines() if "=" in line)
	req = urllib.request.Request(
		f"https://api.elevenlabs.io/v1/text-to-speech/{env['ELEVENLABS_VOICE_ALARM']}?output_format=pcm_{SAMPLE_RATE}",
		data=json.dumps({"text": WAKE_LINE, "model_id": "eleven_multilingual_v2"}).encode(),
		headers={"xi-api-key": env["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
	)
	pcm = urllib.request.urlopen(req).read()
	buf = io.BytesIO()
	with wave.open(buf, "wb") as out:
		out.setnchannels(1)
		out.setsampwidth(2)
		out.setframerate(SAMPLE_RATE)
		out.writeframes(pcm)
	return buf.getvalue()


def setup(dev):
	data = wake_wav()
	dev.hardware.file_system.create_directory("/sounds")
	dev.hardware.file_system.remove_file_or_directory(WAKE_FILE)
	dev.files.put(WAKE_FILE, data)
	if len(dev.files.get(WAKE_FILE)) != len(data):
		sys.exit("upload did not verify")
	print(f"uploaded {WAKE_FILE} ({len(data)} bytes)")


def connect(attempts=6):
	for attempt in range(attempts):
		try:
			return onewili.connect()
		except serial.SerialException:
			if attempt == attempts - 1:
				raise
			time.sleep(0.5)


ACTIONS = {"ring": ring, "stop": stop, "setup": setup}


def main():
	action = ACTIONS.get(sys.argv[1] if len(sys.argv) > 1 else "")
	if not action:
		sys.exit("usage: freewili.py ring|stop|setup")
	faulthandler.dump_traceback_later(60 if action is setup else 15, exit=True)
	dev = connect()
	try:
		action(dev)
	finally:
		dev.close()


if __name__ == "__main__":
	main()
