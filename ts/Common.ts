export const enum STATE {
  TODO,
  DONE
}

export interface Object {
  [key: string]: any;
}

export interface StringObject {
  [key: string]: string;
}

export interface Item extends Object {
  id?: string;
  state?: STATE;
  modifiedDate?: string;
  finishedDate?: string;
  modifiedDatePresantation?: string;
  finishedDatePresantation?: string;
  content?: string;
}

export interface Data {
  [key: string]: Item;
}

export const KEY: StringObject = {
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

export const EMPTY: StringObject = {
  DATE: "",
  STRING: ""
};

export enum RENDER {
  TODO_LIST,
  DONE_LIST,
  TODO_PARTIAL,
  DONE_PARTIAL,
  TODO,
  DONE,
  ALL
}

export enum POPUP {
  EMPTY,
  DELETE
}

export interface PopupData extends Object {
  action?: Function;
}
