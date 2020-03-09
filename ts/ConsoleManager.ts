import Renderer from './Renderer';
import PopupManager from './PopupManager';
import TodoManager from './TodoManager';
import { STATE, EMPTY, POPUP, RENDER } from "./Common";

class ConsoleManager {
  private _todoManager: TodoManager;
  private _popupManager: PopupManager;
  private _renderer: Renderer;

  constructor(
    todoManager: TodoManager,
    renderer: Renderer,
    popupManager: PopupManager
  ) {
    this._todoManager = todoManager;
    this._renderer = renderer;
    this._popupManager = popupManager;

    this._registerEnter();
    this._registerFilter();
  }

  private _registerEnter() {
    // console
    const consoleEnter: HTMLElement | null = document.getElementById(
      "console__enter"
    );
    if (!consoleEnter) console.error("Console enter element is not found");

    consoleEnter!.addEventListener("click", (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      const contentElement: HTMLElement | null = document.getElementById(
        "console__content"
      );
      if (!contentElement) return console.error("Console element is not found");

      const text: string = contentElement.textContent as string;

      // Fixme. Error modal
      // textContent is empty;
      if (EMPTY.STRING === text) {
        this._popupManager.pop(POPUP.EMPTY);
        return;
      }

      const todoId = this._todoManager.set(
        STATE.TODO,
        this._todoManager.make(STATE.TODO, text)
      );

      this._renderer.render(
        STATE.TODO,
        RENDER.TODO,
        this._todoManager.get(STATE.TODO, todoId)
      );

      contentElement.textContent = "";
    });
  }

  private _registerFilter() {
    const todoFilter: HTMLElement | null = document.getElementById(
      "console__filter-todo"
    );
    if (!todoFilter) console.error("Console filter todo element is not found");

    todoFilter!.addEventListener("click", (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      this._renderer.filter(RENDER.TODO_LIST);
    });

    const doneFilter: HTMLElement | null = document.getElementById(
      "console__filter-done"
    );
    if (!doneFilter) console.error("Console filter done element is not found");

    doneFilter!.addEventListener("click", (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      this._renderer.filter(RENDER.DONE_LIST);
    });

    const removeFilter: HTMLElement | null = document.getElementById(
      "console__filter-remove"
    );
    if (!removeFilter)
      console.error("Console filter remove element is not found");

    removeFilter!.addEventListener("click", (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      this._renderer.filter(RENDER.ALL);
    });
  }
}

export default ConsoleManager;