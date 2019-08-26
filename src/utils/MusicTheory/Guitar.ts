import { note, Note } from "@tonaljs/tonal";
import { toMidi, midiToNoteName } from "@tonaljs/midi";

export type guitarTuning = "open";

interface OpenStringsConfig {
  tuning: guitarTuning;
  strings?: number;
}

interface FretboardSettings extends OpenStringsConfig {}

export function openStrings({ tuning, strings }: OpenStringsConfig): Note[] {
  switch (tuning) {
    case "open":
      return [
        note("E4") as Note,
        note("B3") as Note,
        note("G3") as Note,
        note("D3") as Note,
        note("A2") as Note,
        note("E2") as Note
      ];
    default:
      throw new Error();
  }
}

export interface Fretboard {
  notes: Note[][];
  midi: number[][];
}

export function generateFretboard(config: FretboardSettings): Fretboard {
  const notes = openStrings(config).map(s => [s]);
  const asMidi = notes.map(([n]) => [toMidi(n.name)!]);

  for (let iString = 0; iString < notes.length; iString++) {
    for (let iFret = 1; iFret < 24; iFret++) {
      let nextMidi = asMidi[iString][iFret - 1] + 1;
      let nextNote = midiToNoteName(nextMidi, { sharps: true });
      asMidi[iString].push(nextMidi);
      notes[iString].push(note(nextNote) as Note);
    }
  }

  return {
    notes,
    midi: asMidi
  };
}
