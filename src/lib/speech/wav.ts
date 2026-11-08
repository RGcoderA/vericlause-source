/** Wrap raw 16-bit mono PCM in a WAV header so the browser can play it. */
export function pcmToWav(pcm: Uint8Array, sampleRate = 24000): Uint8Array {
    const data = pcm.byteLength % 2 === 0 ? pcm : pcm.subarray(0, pcm.byteLength - 1);
    const buffer = new ArrayBuffer(44 + data.byteLength);
    const view = new DataView(buffer);
    const write = (offset: number, value: string) => {
        for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
    };
    write(0, "RIFF");
    view.setUint32(4, 36 + data.byteLength, true);
    write(8, "WAVE");
    write(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, "data");
    view.setUint32(40, data.byteLength, true);
    new Uint8Array(buffer).set(data, 44);
    return new Uint8Array(buffer);
}

export function pcmRate(mime: string): number {
    const match = /rate=(\d+)/i.exec(mime);
    const rate = match ? Number(match[1]) : 24000;
    return rate >= 8000 && rate <= 48000 ? rate : 24000;
}