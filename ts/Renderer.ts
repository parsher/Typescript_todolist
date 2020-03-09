import TemplateStore from './TemplateStore';
import PopupManager from './PopupManager';
import TodoManager from './TodoManager';
import Util from './Util';
import { STATE, KEY, RENDER, Item, POPUP } from './Common';

class Renderer {
  private _todoManager: TodoManager;
  private _templateStore: TemplateStore;
  private _popupManager: PopupManager;
  private _INIT_GET_COUNT: number = 9;
  private _MORE_GET_COUNT: number = 3;

  constructor(
    todoManager: TodoManager,
    templateStore: TemplateStore,
    popupManager: PopupManager
  ) {
    this._todoManager = todoManager;
    this._templateStore = templateStore;
    this._popupManager = popupManager;

    this.render(STATE.TODO, RENDER.TODO_LIST);
    this.render(STATE.DONE, RENDER.DONE_LIST);
    this._attachMoreEvent(STATE.TODO);
    this._attachMoreEvent(STATE.DONE);
  }

  private _getKey(state: STATE): string {
    return state === STATE.TODO ? KEY.TODO : KEY.DONE;
  }

  private _attachMoreEvent(state: STATE) {
    const key: string = this._getKey(state);
    const moreElement: HTMLElement | null = document.getElementById(
      `todo-section__more-button--${key}`
    );
    if (!moreElement) return console.error("todo more element is not found");

    moreElement.addEventListener(
      "click",
      this._moreEventListener.bind(this, state)
    );
  }

  private _moreEventListener(state: STATE, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const key: string = this._getKey(state);
    const cardElements: HTMLCollectionOf<
      Element
    > | null = document.getElementsByClassName(`card--${key}`);
    if (!cardElements) return console.error("Todo card element is not found");

    const length = cardElements.length;
    if (length === 0) {
      this.render(
        state,
        state === STATE.TODO ? RENDER.TODO_LIST : RENDER.DONE_LIST
      );
    } else {
      const lastId: string = cardElements[length - 1].id.replace(
        KEY.CARD_PREFIX,
        ""
      );
      const todo: Item = this._todoManager.get(state, lastId);
      this.render(
        state,
        state === STATE.TODO ? RENDER.TODO_PARTIAL : RENDER.DONE_PARTIAL,
        todo
      );
    }
  }

  private _editEventListener(state: STATE, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const key: string = this._getKey(state);
    const targetElement = event.target as HTMLElement;
    const cardElement: HTMLElement | null = targetElement.closest(
      `.card--${key}`
    );
    if (!cardElement) return console.error("Todo card element is not found");

    const textElement: HTMLElement | null = document.querySelector(
      `#${cardElement.id} .card__content`
    );
    if (!textElement)
      return console.error("Todo card text element is not found");

    const id: string = cardElement.id.replace(KEY.CARD_PREFIX, "");
    const todo: Item = this._todoManager.get(state, id);

    // prevent update
    if (todo.content === textElement.textContent!.trim()) return;

    this._deleteWithDataAndEvent(state, id, cardElement);

    const todoId: string = this._todoManager.set(
      state,
      state === STATE.TODO
        ? this._todoManager.make(state, textElement.textContent as string)
        : this._todoManager.make(state, textElement.textContent as string, todo)
    );

    this.render(
      state,
      state === STATE.TODO ? RENDER.TODO : RENDER.DONE,
      this._todoManager.get(state, todoId)
    );
  }

  private _checkEventListener(state: STATE, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const key: string = this._getKey(state);
    const targetElement = event.target as HTMLElement;
    const cardElement: HTMLElement | null = targetElement.closest(
      `.card--${key}`
    );
    if (!cardElement) return console.error("Done card element is not found");

    const id: string = cardElement.id.replace(KEY.CARD_PREFIX, "");
    const todo: Item = this._todoManager.get(state, id);
    const oppositeState = state === STATE.TODO ? STATE.DONE : STATE.TODO;
    const todoId: string = this._todoManager.set(
      oppositeState,
      oppositeState === STATE.TODO
        ? this._todoManager.make(oppositeState, todo.content as string)
        : this._todoManager.make(oppositeState, todo.content as string, todo)
    );

    this._deleteWithDataAndEvent(state, id, cardElement);

    this.render(
      oppositeState,
      oppositeState === STATE.TODO ? RENDER.TODO : RENDER.DONE,
      this._todoManager.get(oppositeState, todoId)
    );
  }

  private _deleteEventListener(state: STATE, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const targetElement = event.target as HTMLElement;

    const key: string = this._getKey(state);
    this._popupManager.pop(POPUP.DELETE, {
      action: () => {
        const cardElement = targetElement.closest(
          `.card--${key}`
        ) as HTMLElement;
        if (!cardElement)
          return console.error("Done card element is not found");

        const id: string = cardElement.id.replace(KEY.CARD_PREFIX, "");

        this._deleteWithDataAndEvent(state, id, cardElement);
      }
    });

    targetElement.removeEventListener(
      "click",
      this._deleteEventListener.bind(this, state)
    );
  }

  private _deleteWithDataAndEvent(
    state: STATE,
    id: string,
    cardElement: HTMLElement
  ) {
    this._todoManager.delete(state, id);

    this._dettachEvent(state, id);

    cardElement.remove();
  }

  private _attachEvent(state: STATE, id: string) {
    const key: string = this._getKey(state);
    const checkElement: HTMLElement | null = document.querySelector(
      `#${KEY.CARD_PREFIX}${id} .card__check--${key}`
    );
    if (!checkElement)
      return console.error(`${key} check element is not found`);

    checkElement.addEventListener(
      "click",
      this._checkEventListener.bind(this, state)
    );

    const editElement: HTMLElement | null = document.querySelector(
      `#${KEY.CARD_PREFIX}${id} .card__button--edit`
    );
    if (!editElement) return console.error(`${key} edit element is not found`);

    editElement.addEventListener(
      "click",
      this._editEventListener.bind(this, state)
    );

    if (state === STATE.DONE) {
      const deleteElement: HTMLElement | null = document.querySelector(
        `#${KEY.CARD_PREFIX}${id} .card__button--delete`
      );
      if (!deleteElement)
        return console.error("done delete element is not found");

      deleteElement.addEventListener(
        "click",
        this._deleteEventListener.bind(this, state)
      );
    }
  }

  private _dettachEvent(state: STATE, id: string) {
    const key: string = this._getKey(state);
    const checkElement: HTMLElement | null = document.querySelector(
      `#${KEY.CARD_PREFIX}${id} .card__check--${key}`
    );
    if (!checkElement) return console.error("done check element is not found");

    checkElement.removeEventListener(
      "click",
      this._checkEventListener.bind(this, state)
    );

    const editElement: HTMLElement | null = document.querySelector(
      `#${KEY.CARD_PREFIX}${id} .card__button--edit`
    );
    if (!editElement) return console.error("todo element is not found");

    editElement.removeEventListener(
      "click",
      this._editEventListener.bind(this, state)
    );

    if (state === STATE.DONE) {
      const deleteElement: HTMLElement | null = document.querySelector(
        `#${KEY.CARD_PREFIX}${id} .card__button--delete`
      );
      if (!deleteElement)
        return console.error("done delete element is not found");

      deleteElement.removeEventListener(
        "click",
        this._deleteEventListener.bind(this, state)
      );
    }
  }

  private _clearElementById(id: string) {
    const element: HTMLElement | null = document.getElementById(id);
    if (!element) return console.error(`${id} is not defined`);

    element.innerHTML = "";
  }

  filter(type: RENDER) {
    const bodyElement: HTMLElement | null = document.getElementById("body");
    if (!bodyElement) return console.error("Body element is not found");

    Util.removeClass(bodyElement, `todo-section-filter--${KEY.DONE}`);
    Util.removeClass(bodyElement, `todo-section-filter--${KEY.TODO}`);

    switch (type) {
      case RENDER.TODO_LIST: {
        Util.addClass(bodyElement, `todo-section-filter--${KEY.TODO}`);

        this._clearElementById(`todo-section__list--${KEY.TODO}`);
        this.render(STATE.TODO, type);
        break;
      }
      case RENDER.DONE_LIST: {
        Util.addClass(bodyElement, `todo-section-filter--${KEY.DONE}`);

        this._clearElementById(`todo-section__list--${KEY.DONE}`);
        this.render(STATE.DONE, type);
        break;
      }
      case RENDER.ALL: {
        this._clearElementById(`todo-section__list--${KEY.TODO}`);
        this._clearElementById(`todo-section__list--${KEY.DONE}`);

        this.render(STATE.TODO, RENDER.TODO_LIST);
        this.render(STATE.DONE, RENDER.DONE_LIST);
        break;
      }
    }
  }

  render(state: STATE, type: RENDER, item?: Item) {
    switch (type) {
      case RENDER.TODO:
      case RENDER.TODO_PARTIAL:
      case RENDER.TODO_LIST: {
        const todoSectionList: HTMLElement | null = document.getElementById(
          `todo-section__list--${KEY.TODO}`
        );
        if (!todoSectionList)
          return console.error("Todo section element is not found");

        switch (type) {
          case RENDER.TODO: {
            if (!item) console.error("Todo item is not provided");

            todoSectionList.insertAdjacentHTML(
              KEY.RENDER_LAST as InsertPosition,
              this._templateStore.getCardTemplate(state, item!)
            );
            this._attachEvent(state, item!.id as string);

            break;
          }
          case RENDER.TODO_PARTIAL: {
            if (!item) console.error("Todo item is not provided");

            this._todoManager
              .getListAfter(state, item!.id as string, this._MORE_GET_COUNT)
              .forEach((item: Item) => {
                todoSectionList.insertAdjacentHTML(
                  KEY.RENDER_FIRST as InsertPosition,
                  this._templateStore.getCardTemplate(state, item!)
                );
                this._attachEvent(state, item!.id as string);
              });

            break;
          }
          case RENDER.TODO_LIST: {
            const bodyElement = document.getElementById("body");
            if (!bodyElement)
              return console.error("Body element is not defined");

            const hasFilter =
              bodyElement.className.indexOf("todo-section-filter") >= 0;
            const count = hasFilter
              ? this._INIT_GET_COUNT * 2
              : this._INIT_GET_COUNT;

            this._todoManager.getList(state, count).forEach((item: Item) => {
              todoSectionList.insertAdjacentHTML(
                KEY.RENDER_FIRST as InsertPosition,
                this._templateStore.getCardTemplate(state, item!)
              );
              this._attachEvent(state, item!.id as string);
            });
            break;
          }
        }

        break;
      }
      case RENDER.DONE:
      case RENDER.DONE_PARTIAL:
      case RENDER.DONE_LIST: {
        const doneSectionList: HTMLElement | null = document.getElementById(
          `todo-section__list--${KEY.DONE}`
        );
        if (!doneSectionList)
          return console.error("Done section element is not found");

        switch (type) {
          case RENDER.DONE: {
            if (!item) console.error("Todo item is not provided");

            doneSectionList.insertAdjacentHTML(
              KEY.RENDER_LAST as InsertPosition,
              this._templateStore.getCardTemplate(STATE.DONE, item!)
            );

            this._attachEvent(STATE.DONE, item!.id as string);

            break;
          }
          case RENDER.DONE_PARTIAL: {
            if (!item) console.error("Todo item is not provided");

            this._todoManager
              .getListAfter(
                STATE.DONE,
                item!.id as string,
                this._MORE_GET_COUNT
              )
              .forEach((item: Item) => {
                doneSectionList.insertAdjacentHTML(
                  KEY.RENDER_FIRST as InsertPosition,
                  this._templateStore.getCardTemplate(STATE.DONE, item!)
                );
                this._attachEvent(STATE.DONE, item!.id as string);
              });

            break;
          }
          case RENDER.DONE_LIST: {
            const bodyElement = document.getElementById("body");
            if (!bodyElement)
              return console.error("Body element is not defined");

            const hasFilter =
              bodyElement.className.indexOf("todo-section-filter") >= 0;
            const count = hasFilter
              ? this._INIT_GET_COUNT * 2
              : this._INIT_GET_COUNT;

            this._todoManager
              .getList(STATE.DONE, count)
              .forEach((item: Item) => {
                doneSectionList.insertAdjacentHTML(
                  KEY.RENDER_FIRST as InsertPosition,
                  this._templateStore.getCardTemplate(STATE.DONE, item!)
                );
                this._attachEvent(STATE.DONE, item!.id as string);
              });

            break;
          }
        }

        break;
      }
    }
  }
}

export default Renderer;