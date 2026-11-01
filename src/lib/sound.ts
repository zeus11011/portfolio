// Synthesized with Web Audio: no sound files to download.
let ctx: AudioContext | undefined;
let hum: OscillatorNode | undefined;

const enabled = () => document.documentElement.dataset.sound === "on";

function audio() {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Short filtered noise burst. */
function burst(seconds: number, freq: number, volume: number, delay = 0) {
  const c = audio();
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
  const src = c.createBufferSource();
  const filter = new BiquadFilterNode(c, { type: "bandpass", frequency: freq });
  const gain = new GainNode(c, { gain: volume });
  src.buffer = buf;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(c.currentTime + delay);
}

/** Starts or stops the CRT hum to match the sound flag. */
export function syncHum() {
  if (enabled() && !hum) {
    const c = audio();
    hum = new OscillatorNode(c, { type: "sawtooth", frequency: 60 });
    hum.connect(new GainNode(c, { gain: 0.006 })).connect(c.destination);
    hum.start();
  } else if (!enabled() && hum) {
    hum.stop();
    hum = undefined;
  }
}

export function keyClick() {
  if (!enabled()) return;
  syncHum();
  burst(0.02, 3500, 0.15);
}

export function relay() {
  if (!enabled()) return;
  syncHum();
  burst(0.06, 250, 0.6);
  burst(0.03, 2000, 0.3, 0.04);
}
