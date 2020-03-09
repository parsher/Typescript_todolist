import DataStore from './DataStore';
import { STATE, KEY, EMPTY, Item } from './Common';

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

export default TodoManager;