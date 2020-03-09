import { KEY, Data, Item } from "./Common";

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

export default DataStore;
