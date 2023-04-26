export const signalsCapture = (id, canvasId) => {
  // alert(id)
  const signals = useState('signals')
  signals.value.id = id;

  // fetching signals
  const audioContext = new AudioContext();
  const htmlAudioElement = document.getElementById(canvasId);
  const source = audioContext.createMediaElementSource(htmlAudioElement);
  const bufferSize = 256;
  source.connect(audioContext.destination);

  const analyzer = Meyda.createMeydaAnalyzer({
    audioContext: audioContext,
    source: source,
    bufferSize: bufferSize, // 256
    featureExtractors: ["powerSpectrum", "rms", "zcr", "energy", "perceptualSpread", "spectralSpread", "chroma"],
    callback: (features) => {
      signals.value.powerSpectrum = features.powerSpectrum;
      signals.value.rms = features.rms;
      signals.value.zcr = features.zcr / ((bufferSize / 2) - 1);
      signals.value.energy = features.energy / bufferSize;
      signals.value.perceptualSpread = features.perceptualSpread;
      signals.value.spectralSpread = features.spectralSpread / bufferSize / 2;
      signals.value.chroma = features.chroma.flatMap((x) => [x, x]);
    },
  });
  analyzer.start();

  return signals
}