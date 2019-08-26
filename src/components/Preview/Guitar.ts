import {
  Project,
  Layer,
  Point,
  Shape,
  Size,
  Color,
  Group,
  Path,
  PointText
} from "paper";
import * as Tonal from "@tonaljs/tonal";
import * as Modes from "@tonaljs/mode";
import * as Note from "@tonaljs/note";

import { PreviewState } from "../../store/PreviewStore";
import {
  generateFretboard,
  Fretboard,
  guitarTuning
} from "../../utils/MusicTheory/Guitar";

const GUITAR_W = 200;
const FRET_W = 5;
const GUITAR_AR = 10;
const GUITAR_L = GUITAR_W * GUITAR_AR;
const STRING_W = 5;

interface FretData {
  spaceToNextFret: number;
  number: number;
}

interface GuitarNotePosition {
  noteText: PointText;
  noteShape: Shape.Circle;
  note: Tonal.Note;
  /** String 1-based */
  string: number;
  /** Fret 1-based. 0 is the open string */
  fret: number;
}

/** For each note, this store a list of the position on the fretboard where that
 * note exists
 */
interface GuitarNotes {
  [scientificNotation: string]: GuitarNotePosition[];
}

export class Guitar {
  private layer: Layer;
  private fretboardShape: Shape.Rectangle;
  private fretsGroup: Group;
  private fretNumbersGroup: Group;
  private stringsGroup: Group;
  private notesGroup: Group;
  private rootNotesGroup: Group;
  private noteTextGroup: Group;
  private rootNoteTextGroup: Group;

  /** Contains information about the frets such as pixel spacing */
  private fretData: FretData[] = [];

  /** Aggregates each note (C4) to a list of all positions on the fretboard for
   * that note
   */
  private positions: GuitarNotes = {};

  /** Represents the physical layout of the fretboard */
  private fretboard!: Fretboard;

  private readonly markedFrets = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21, 24]);

  private _defaultNoteColor: Color;
  private _rootNoteColor: Color;
  private textColor = new Color("white");

  public setFretboardColor(color: string) {
    this.fretboardShape.fillColor = new Color(color);
  }

  public setRootNoteColor(color: string) {
    this._rootNoteColor = new Color(color);
    this.rootNotesGroup.fillColor = this._rootNoteColor;
  }

  public setNoteColor(color: string) {
    this._defaultNoteColor = new Color(color);
    this.notesGroup.fillColor = this._defaultNoteColor;
    this.rootNotesGroup.fillColor = this._rootNoteColor;
  }

  constructor(scene: Project, config: PreviewState) {
    this._defaultNoteColor = new Color(config.colors.note);
    this._rootNoteColor = new Color(config.colors.rootNote);

    this.layer = new Layer();
    this.layer.name = "guitar";
    scene.addLayer(this.layer);

    const x0 = 100;
    const y0 = scene.view.bounds.center!.y! - GUITAR_W / 2;

    this.fretboardShape = new Shape.Rectangle(
      new Point(x0, y0),
      new Size(GUITAR_L, GUITAR_W)
    );

    this.layer.addChild(this.fretboardShape);
    this.fretboardShape.strokeColor = new Color(0.4);
    this.fretboardShape.fillColor = new Color(config.colors.fretboard);

    this.fretNumbersGroup = this.CreateGroup("fretNumbers");
    this.layer.addChild(this.fretNumbersGroup);

    this.fretsGroup = this.CreateGroup("frets");
    this.layer.addChild(this.fretsGroup);
    this.DrawFrets(config.guitar.fretboard.frets);

    this.stringsGroup = this.CreateGroup("strings");
    this.layer.addChild(this.stringsGroup);
    this.DrawStrings(config.guitar.strings);

    this.notesGroup = this.CreateGroup("notes");
    this.layer.addChild(this.notesGroup);

    this.rootNotesGroup = this.CreateGroup("rootNotes");
    this.layer.addChild(this.rootNotesGroup);

    this.noteTextGroup = this.CreateGroup("noteText");
    this.layer.addChild(this.noteTextGroup);

    this.rootNoteTextGroup = this.CreateGroup("rootNoteText");
    this.layer.addChild(this.rootNoteTextGroup);

    this.CreateFretboard(config.guitar.tuning);
  }

  private CreateGroup = (name: string): Group => {
    const g = new Group();
    g.name = name;
    return g;
  };

  public DisplayMode(mode: string, rootNote: string) {
    this.ClearAllDisplayed();
    if (!mode.length || !rootNote.length) {
      return;
    }

    const notes = Modes.mode(mode).intervals.map(interval => {
      const n = Tonal.transpose(rootNote, interval);
      if (n[1] === "b") {
        return Note.enharmonic(n);
      }
      return n;
    });

    for (let noteName in this.positions) {
      const note = Tonal.note(noteName).pc;

      let positions = this.positions[noteName];

      if (positions.length && notes.includes(note)) {
        for (let position of positions) {
          if (position.note.pc === rootNote) {
            this.setAsRootNote(position);
          }
          Guitar.setVisible(position, true);
        }
      }
    }
  }

  private ClearAllDisplayed() {
    this.rootNotesGroup.removeChildren();
    this.rootNoteTextGroup.removeChildren();
    for (let n in this.positions) {
      for (let p of this.positions[n]) {
        Guitar.setVisible(p, false);
        p.noteShape.fillColor = this._defaultNoteColor;
      }
    }
  }

  private static setVisible(p: GuitarNotePosition, visible: boolean): void {
    p.noteShape.visible = visible;
    p.noteText.visible = visible;
  }

  private setAsRootNote(p: GuitarNotePosition): void {
    p.noteShape.fillColor = this._rootNoteColor;
    this.rootNotesGroup.addChild(p.noteShape);
    this.rootNoteTextGroup.addChild(p.noteText);
  }

  /**
   * Calculatates all the notes at each position on the guitar for the given
   * tuning
   * @param tuning the tuning of the guitar
   */
  private CreateFretboard(tuning: guitarTuning) {
    /** Clear all related data structures */

    /** Rebuild */
    this.fretboard = generateFretboard({ tuning });
    const { notes: positions } = this.fretboard;
    const strings = this.stringsGroup.children!.reverse();
    for (let i = 0; i < positions.length; i++) {
      let string = positions[i];

      /** Beginning position of the string */
      let p = strings[i].bounds!.leftCenter!.clone();

      /** Start from the first fret */
      for (let j = 1; j < string.length; j++) {
        const note = string[j];
        let x = this.fretData[j - 1].spaceToNextFret;
        p.x! += x / 2;

        let noteShape = new Shape.Circle(p, 15);
        let noteText = new PointText(p);
        noteText.content = note.name;
        noteText.fillColor = this.textColor;
        noteText.visible = false;

        noteShape.fillColor = this._defaultNoteColor;
        noteShape.strokeColor = new Color("black");
        noteShape.visible = false;

        if (!(note.name in this.positions)) {
          this.positions[note.name] = [];
        }

        /**  */
        this.positions[note.name].push({
          noteShape,
          note,
          noteText,
          fret: j,
          string: i + 1
        });

        p.x! += x / 2;

        this.notesGroup.addChild(noteShape);
        this.noteTextGroup.addChild(noteText);
      }
    }
  }

  private DrawFrets(n: number): void {
    this.fretsGroup.removeChildren();
    this.fretNumbersGroup.removeChildren();
    this.fretData = [];
    const fretboardBounds = this.fretboardShape.bounds!;
    let p = fretboardBounds.topLeft!.clone();
    let remaining = fretboardBounds.right!;
    const f = 17.817;
    const s = new Size(FRET_W, GUITAR_W);
    const fretColor = new Color(0.2, 0.7);
    const markedFretColor = new Color("lightblue");
    for (let i = 0; i < n; i++) {
      let fret = new Shape.Rectangle(p, s);
      fret.strokeColor = new Color("black");
      fret.fillColor = this.markedFrets.has(i) ? markedFretColor : fretColor;

      if (this.markedFrets.has(i)) {
        fret.fillColor = markedFretColor;
        let textPosition = p.add(new Point(FRET_W / 2 - 5, GUITAR_W + 25));
        let fretNumberText = new PointText(textPosition);
        fretNumberText.content = i.toString();
        fretNumberText.fontSize = 20;
        fretNumberText.fillColor = new Color("black");
        this.fretNumbersGroup.addChild(fretNumberText);
      } else {
        fret.fillColor = fretColor;
      }

      this.fretsGroup.addChild(fret);
      let spacing = remaining / f;
      remaining -= spacing;
      p.x! += spacing;

      this.fretData.push({
        number: i + 1,
        spaceToNextFret: spacing
      });
    }
  }

  private DrawStrings(n: number): void {
    this.stringsGroup.removeChildren();
    const pi = this.fretboardShape.bounds!.bottomLeft!.clone();
    const pj = this.fretboardShape.bounds!.bottomRight!.clone();
    const w = this.fretboardShape.bounds!.height!;
    const useWidth = 0.95;
    const inset = (w * (1 - useWidth)) / 2;
    pi.y! -= inset;
    pj.y! -= inset;
    const stringSpacing = (w * useWidth) / (n - 1);
    for (let i = 0; i < n; i++) {
      let string = new Path.Line(pi, pj);
      string.strokeWidth = STRING_W * (1 - i * 0.07);
      string.strokeColor = new Color("black");
      this.stringsGroup.addChild(string);
      pi.y! -= stringSpacing;
      pj.y! -= stringSpacing;
    }
  }
}
