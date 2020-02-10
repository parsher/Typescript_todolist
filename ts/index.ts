const enum STATE {
  TODO,
  DONE
}

interface Object {
  [key: string]: any;
}

interface StringObject {
  [key: string]: string;
}

interface Item extends Object {
  id?: string;
  state?: STATE;
  modifiedDate?: string;
  finishedDate?: string;
  modifiedDatePresantation?: string;
  finishedDatePresantation?: string;
  content?: string;
}

interface Data {
  [key: string]: Item;
}

const KEY: StringObject = {
  ID: "id",
  TODO: "todo",
  DONE: "done",
  MODIFIED_DATE: "modifiedDate",
  FINISHED_DATE: "finishedDate",

  PRESENTATION: "Presantation",
  RENDER_LAST: "afterbegin",
  RENDER_FIRST: "beforeend",
  CARD_PREFIX: "card__"
};

const EMPTY: StringObject = {
  DATE: "",
  STRING: ""
};

enum RENDER {
  TODO_LIST,
  DONE_LIST,
  TODO_PARTIAL,
  DONE_PARTIAL,
  TODO,
  DONE,
  ALL
}

enum POPUP {
  EMPTY,
  DELETE
}

interface PopupData extends Object {
  action?: Function;
}

const Util = {
  // you can use just classList remove add
  addClass(element: HTMLElement, className: string) {
    element.className += " " + className;
  },
  removeClass(element: HTMLElement, className: string) {
    // whitespace or start, whitespace or end, global
    const classRegex = new RegExp("(\\s|^)" + className + "(\\s|$)", "g");
    element.className = element.className.replace(classRegex, " ").trim();
  }
};

class TemplateStore {
  constructor() {}

  getCardTemplate(state: STATE, item: Item): string {
    switch (state) {
      case STATE.TODO: {
        return `<div class="card card--${KEY.TODO}" id="${KEY.CARD_PREFIX}${item.id}">
          <div class="card__row">
            <a href="#" class="card__check card__check--${KEY.TODO}">
              <span class="iconify" data-icon="mdi-checkbox-blank-outline">
              </span>
              <span class="iconify" data-icon="mdi-check-box-outline"></span>
            </a>
            <div
              contenteditable
              class="card__content"
              placeholder="내용을 입력해주세요."
            >
              ${item.content}
            </div>
          </div>
          <div class="card__row">
            <a href="#" class="card__button card__button--edit">
              <span
                class="iconify"
                data-icon="mdi-check-circle-outline"
              ></span>
            </a>
            <span class="card__date">${item.modifiedDatePresantation}</span>
          </div>
        </div>`;
      }
      case STATE.DONE: {
        return `<div class="card card--${KEY.DONE}" id="${KEY.CARD_PREFIX}${item.id}">
          <div class="card__row">
            <a href="#" class="card__check card__check--${KEY.DONE}">
              <span class="iconify" data-icon="mdi-check-box-outline"></span>
              <span class="iconify" data-icon="mdi-checkbox-blank-outline">
              </span>
            </a>
            <div
              contenteditable
              class="card__content"
              placeholder="내용을 입력해주세요."
            >
              ${item.content}
            </div>
          </div>
          <div class="card__row">
            <a href="#" class="card__button card__button--edit">
              <span
                class="iconify"
                data-icon="mdi-check-circle-outline"
              ></span>
            </a>
            <a href="#" class="card__button card__button--delete">
              <span
                class="iconify"
                data-icon="mdi-trash-can-outline"
              ></span>
            </a>
            <span class="card__date"
              >${item.modifiedDatePresantation} ~ ${item.finishedDatePresantation}</span
            >
          </div>
        </div>`;
      }
    }
  }

  getPopupTextTemplate(popup: POPUP): string {
    switch (popup) {
      case POPUP.EMPTY: {
        return "<span>내용을 입력해주세요.</span>";
      }
      case POPUP.DELETE: {
        return "<span>메모를 삭제하시겠습니까?</span>";
      }
    }
  }

  getPopupButtonTemplate(popup: POPUP): string {
    switch (popup) {
      case POPUP.EMPTY: {
        return `<a href="#delete-1" class="popup__button popup__button--confirm">확인</a>`;
      }
      case POPUP.DELETE: {
        return `<a href="#delete-1" class="popup__button popup__button--accept">예</a>
                <a href="#delete-1" class="popup__button popup__button--cancel">아니오</a>`;
      }
    }
  }
}

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

class PopupManager {
  private _popupElement: HTMLElement | null;
  private _popupTextElement: HTMLElement | null;
  private _popupButtonElement: HTMLElement | null;
  private _templateStore: TemplateStore;

  constructor(templateStore: TemplateStore) {
    const popupElement: HTMLElement | null = document.getElementById("popup")!;

    if (!popupElement) {
      console.error("Popup element is not found");
    }

    this._popupElement = popupElement;
    this._popupTextElement = document.querySelector("#popup .popup__text");
    this._popupButtonElement = document.querySelector("#popup .popup__buttons");
    this._templateStore = templateStore;
  }

  private _setTemplate(type: POPUP) {
    if (!this._popupTextElement || !this._popupButtonElement)
      return console.error("Popup element is not found");

    this._popupTextElement.innerHTML = this._templateStore.getPopupTextTemplate(
      type
    );
    this._popupButtonElement.innerHTML = this._templateStore.getPopupButtonTemplate(
      type
    );
  }

  private _setEventListener(type: POPUP, data?: PopupData) {
    switch (type) {
      case POPUP.EMPTY: {
        const confirmButton: HTMLElement | null = document.querySelector(
          "#popup .popup__button--confirm"
        );
        if (!confirmButton) return console.error("Confirm button is not found");

        confirmButton.addEventListener(
          "click",
          this._actionEventListener.bind(this, () => {})
        );
        break;
      }
      case POPUP.DELETE: {
        const acceptButton: HTMLElement | null = document.querySelector(
          "#popup .popup__button--accept"
        );
        const cancelButton: HTMLElement | null = document.querySelector(
          "#popup .popup__button--cancel"
        );
        if (!acceptButton || !cancelButton)
          return console.error("Aceept button or Cancel button is not found");
        if (!data) return console.error("Data is not defined");

        acceptButton.addEventListener(
          "click",
          this._actionEventListener.bind(this, data.action as Function)
        );

        cancelButton.addEventListener(
          "click",
          this._actionEventListener.bind(this, () => {})
        );
        break;
      }
    }
  }

  private _actionEventListener(action: Function, event?: Event) {
    event!.preventDefault();
    event!.stopPropagation();

    if (!this._popupElement) return console.error("Popup element is not found");

    const targetElement = event!.target as HTMLElement;

    targetElement.removeEventListener(
      "click",
      this._actionEventListener.bind(this, action)
    );

    action();

    Util.removeClass(this._popupElement, "target");
  }

  pop(type: POPUP, data?: PopupData) {
    if (!this._popupElement) return console.error("Popup element is not found");

    this._setTemplate(type);
    this._setEventListener(type, data);

    Util.addClass(this._popupElement, "target");
  }
}

class TodoManager {
  private _dataStore: DataStore;

  constructor() {
    this._dataStore = new DataStore();

    this._dataStore._todos = this._makeList(STATE.TODO);
    this._dataStore._dones = this._makeList(STATE.DONE);
  }

  private _makeList(state: STATE): Array<Item> {
    const list: Array<Item> = [];

    switch (state) {
      case STATE.TODO: {
        Object.keys(this._dataStore._todo).forEach((id: string) => {
          list.push(this.get(STATE.TODO, id));
        });

        this._sort(list, KEY.MODIFIED_DATE);

        break;
      }
      case STATE.DONE: {
        Object.keys(this._dataStore._done).forEach((id: string) => {
          list.push(this.get(STATE.DONE, id));
        });

        this._sort(list, KEY.FINISHED_DATE);

        break;
      }
    }

    return list;
  }

  private _binarySearch(key: string, targetDate: string, items: Array<Item>) {
    let start: number = 0;
    let end: number = items.length - 1;
    let mid: number;
    let compareDate: number;
    const numberTargetDate: number = Number(targetDate);

    while (start <= end) {
      mid = start + Math.floor((end - start) / 2);
      compareDate = Number(items[mid][key]);

      if (numberTargetDate === compareDate) {
        return mid;
      } else if (numberTargetDate < compareDate) {
        start = mid + 1;
      } else {
        // numberTargetDate > compareDate
        end = mid - 1;
      }
    }

    return -1;
  }

  private _findInsertIndex(
    key: string,
    targetDate: string,
    items: Array<Item>
  ): number {
    let start: number = 0;
    let end: number = items.length - 1;
    let mid: number;
    let compareDate: number;
    const numberTargetDate: number = Number(targetDate);

    while (start <= end) {
      mid = start + Math.floor((end - start) / 2);
      compareDate = Number(items[mid][key]);

      if (numberTargetDate === compareDate) {
        end = mid - 1; // find the data more greater than this.
      } else if (numberTargetDate < compareDate) {
        start = mid + 1;
      } else {
        // numberTargetDate > compareDate
        end = mid - 1;
      }
    }

    return end + 1; // greater than index + 1 === insert index
  }

  private _convertToPresentationalDate(key: string, item: Item) {
    if (item[key] === EMPTY.DATE) return;

    // "2012. 12. 20. 오전 3:00:00"
    item[key + KEY.PRESENTATION] = new Date(Number(item[key])).toLocaleString(
      "ko-KR",
      {
        hour12: false,
        timeZone: "UTC",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      }
    );
  }

  private _sort(items: Array<Item>, key: string) {
    items.sort((a: Item, b: Item) => Number(b[key]) - Number(a[key]));
  }

  make(state: STATE, content: string, oldItem?: Item): Item {
    const todo: Item = {
      state: state,
      content: content.trim()
    };

    switch (state) {
      case STATE.TODO: {
        todo.modifiedDate = String(Date.now());
        todo.finishedDate = EMPTY.DATE;
        break;
      }
      case STATE.DONE: {
        if (!oldItem) {
          throw new Error("oldItem is not defined!");
        }

        todo.modifiedDate = oldItem[KEY.MODIFIED_DATE];
        todo.finishedDate = String(Date.now());
        break;
      }
    }

    return todo;
  }

  get(state: STATE, id: string): Item {
    let todo;
    switch (state) {
      case STATE.TODO: {
        todo = { ...this._dataStore._todo[id] };
        break;
      }
      case STATE.DONE: {
        todo = { ...this._dataStore._done[id] };
        this._convertToPresentationalDate(KEY.FINISHED_DATE, todo);
        break;
      }
    }

    todo.id = id;
    this._convertToPresentationalDate(KEY.MODIFIED_DATE, todo);
    return todo;
  }

  set(state: STATE, item: Item): string {
    this._dataStore._id++;
    const id = String(this._dataStore._id);
    switch (state) {
      case STATE.TODO: {
        this._dataStore._todo[id] = item;

        const insertIndex = this._findInsertIndex(
          KEY.MODIFIED_DATE,
          item[KEY.MODIFIED_DATE],
          this._dataStore._todos
        );

        this._dataStore._todos.splice(insertIndex, 0, this.get(state, id));
        break;
      }
      case STATE.DONE: {
        this._dataStore._done[id] = item;

        const insertIndex = this._findInsertIndex(
          KEY.FINISHED_DATE,
          item[KEY.FINISHED_DATE],
          this._dataStore._dones
        );

        this._dataStore._dones.splice(insertIndex, 0, this.get(state, id));
        break;
      }
    }

    return id;
  }

  delete(state: STATE, id: string) {
    switch (state) {
      case STATE.TODO: {
        const index = this._binarySearch(
          KEY.MODIFIED_DATE,
          this._dataStore._todo[id][KEY.MODIFIED_DATE],
          this._dataStore._todos
        );
        this._dataStore._todos.splice(index, 1);

        delete this._dataStore._todo[id];
        break;
      }
      case STATE.DONE: {
        const index = this._binarySearch(
          KEY.FINISHED_DATE,
          this._dataStore._done[id][KEY.FINISHED_DATE],
          this._dataStore._dones
        );
        this._dataStore._dones.splice(index, 1);

        delete this._dataStore._done[id];
        break;
      }
    }
  }

  getList(state: STATE, count?: number): Array<Item> {
    let list;
    switch (state) {
      case STATE.TODO: {
        if (count !== undefined) {
          list = JSON.parse(
            JSON.stringify(this._dataStore._todos.slice(0, count))
          );
        } else {
          list = JSON.parse(JSON.stringify(this._dataStore._todos));
        }
        break;
      }
      case STATE.DONE: {
        if (count !== undefined) {
          list = JSON.parse(
            JSON.stringify(this._dataStore._dones.slice(0, count))
          );
        } else {
          list = JSON.parse(JSON.stringify(this._dataStore._dones));
        }
        break;
      }
    }
    return list;
  }

  getListAfter(state: STATE, id: string, count?: number): Array<Item> {
    let list;
    switch (state) {
      case STATE.TODO: {
        const index = this._binarySearch(
          KEY.MODIFIED_DATE,
          this._dataStore._todo[id][KEY.MODIFIED_DATE],
          this._dataStore._todos
        );

        if (count !== undefined) {
          list = JSON.parse(
            JSON.stringify(
              this._dataStore._todos.slice(index + 1, index + 1 + count)
            )
          );
        } else {
          list = JSON.parse(
            JSON.stringify(this._dataStore._todos.slice(index + 1))
          );
        }
        break;
      }
      case STATE.DONE: {
        const index = this._binarySearch(
          KEY.FINISHED_DATE,
          this._dataStore._done[id][KEY.FINISHED_DATE],
          this._dataStore._dones
        );

        if (count !== undefined) {
          list = JSON.parse(
            JSON.stringify(
              this._dataStore._dones.slice(index + 1, index + 1 + count)
            )
          );
        } else {
          list = JSON.parse(
            JSON.stringify(this._dataStore._dones.slice(index + 1))
          );
        }
        break;
      }
    }
    return list;
  }
}

class DataStore {
  _id: number;
  _todo: Data;
  _done: Data;

  // presentational purpose
  _todos: Array<Item> = [];
  _dones: Array<Item> = [];

  constructor() {
    this._id =
      localStorage.getItem(KEY.ID) === null ? 0 : this._getLocalNumber(KEY.ID);
    this._todo =
      localStorage.getItem(KEY.TODO) === null
        ? {}
        : this._getLocalData(KEY.TODO);
    this._done =
      localStorage.getItem(KEY.DONE) === null
        ? {}
        : this._getLocalData(KEY.DONE);

    // before close make sure to save it to localStorage
    window.addEventListener("beforeunload", e => {
      this._setLocalNumber(KEY.ID, this._id);
      this._setLocalData(KEY.TODO, this._todo);
      this._setLocalData(KEY.DONE, this._done);
    });
  }

  private _getLocalData(itemKey: string): Data {
    return JSON.parse(Base64.decode(localStorage.getItem(itemKey) as string));
  }

  private _getLocalNumber(itemKey: string): number {
    return Number(localStorage.getItem(itemKey));
  }

  private _setLocalData(itemKey: string, data: Data): void {
    localStorage.setItem(itemKey, Base64.encode(JSON.stringify(data)));
  }

  private _setLocalNumber(itemKey: string, number: number): void {
    localStorage.setItem(itemKey, String(number));
  }
}

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

const templateStore = new TemplateStore();
const todoManager = new TodoManager();
const popupManager = new PopupManager(templateStore);

const renderer = new Renderer(todoManager, templateStore, popupManager);
const consoleManager = new ConsoleManager(todoManager, renderer, popupManager);
