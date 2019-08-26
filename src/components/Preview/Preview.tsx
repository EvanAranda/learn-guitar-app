import React, { useEffect } from "react";
import { store } from "../../store/Store";
import { Project, Point } from "paper";
import { Guitar } from "./Guitar";

const handleMouseClickAndDrag = (
  element: HTMLElement,
  onDrag: (e: MouseEvent) => void
) => {
  let isMouseDown = false;
  const handler = (e: MouseEvent) => {
    switch (e.type) {
      case "mousedown":
        isMouseDown = true;
        break;
      case "mouseup":
        isMouseDown = false;
        break;
      case "mousemove":
        isMouseDown && onDrag(e);
        break;
    }
  };

  element.addEventListener("mousedown", handler);
  element.addEventListener("mouseup", handler);
  element.addEventListener("mousemove", handler);

  return () => {
    element.removeEventListener("mousedown", handler);
    element.removeEventListener("mouseup", handler);
    element.removeEventListener("mousemove", handler);
  };
};

const resizeCanvas = (canvas: HTMLCanvasElement) => {
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
};

export const Preview: React.FunctionComponent = props => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = store.useStateHook();
  let guitar: Guitar;

  /**
   * Initialize
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      resizeCanvas(canvas);

      const scene = new Project(canvas);
      guitar = new Guitar(scene, state.preview);

      guitar.DisplayMode(state.controls.mode, state.controls.rootNote);

      const cleanupCanvasHandlers = handleMouseClickAndDrag(
        canvas,
        (e: MouseEvent) =>
          dispatch({ type: "MOVE_BY", delta: [e.movementX, 0] })
      );
      // canvas.parentElement &&
      //   canvas.parentElement.addEventListener("resize", e =>
      //     resizeCanvas(canvas)
      //   );

      /** in order to update guitar on state changes
       * we have to tap into the updates
       */
      const unsubscribeFromStore = store.subscribe({
        listener: (_, action, newState) => {
          switch (action.type) {
            case "MOVE_BY":
              scene.view.translate(new Point(action.delta));
              break;
            case "CHANGE_TUNNING":
            case "CHANGE_MODE":
            case "CHANGE_ROOT_NOTE":
              guitar.DisplayMode(
                newState.controls.mode,
                newState.controls.rootNote
              );
              break;
            case "CHANGE_COLOR":
              switch (action.object) {
                case "fretboard":
                  guitar.setFretboardColor(action.color);
                  break;
                case "rootNote":
                  guitar.setRootNoteColor(action.color);
                  break;
                case "note":
                  guitar.setNoteColor(action.color);
                  break;
              }
          }
        }
      });

      return () => {
        cleanupCanvasHandlers();
        scene.remove();
        unsubscribeFromStore();
        console.log("disposed");
      };
    }
  }, [canvasRef]);

  return <canvas ref={canvasRef} />;
};
