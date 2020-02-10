"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var KEY = {
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
var EMPTY = {
    DATE: "",
    STRING: ""
};
var RENDER;
(function (RENDER) {
    RENDER[RENDER["TODO_LIST"] = 0] = "TODO_LIST";
    RENDER[RENDER["DONE_LIST"] = 1] = "DONE_LIST";
    RENDER[RENDER["TODO_PARTIAL"] = 2] = "TODO_PARTIAL";
    RENDER[RENDER["DONE_PARTIAL"] = 3] = "DONE_PARTIAL";
    RENDER[RENDER["TODO"] = 4] = "TODO";
    RENDER[RENDER["DONE"] = 5] = "DONE";
    RENDER[RENDER["ALL"] = 6] = "ALL";
})(RENDER || (RENDER = {}));
var POPUP;
(function (POPUP) {
    POPUP[POPUP["EMPTY"] = 0] = "EMPTY";
    POPUP[POPUP["DELETE"] = 1] = "DELETE";
})(POPUP || (POPUP = {}));
var Util = {
    // you can use just classList remove add
    addClass: function (element, className) {
        element.className += " " + className;
    },
    removeClass: function (element, className) {
        // whitespace or start, whitespace or end, global
        var classRegex = new RegExp("(\\s|^)" + className + "(\\s|$)", "g");
        element.className = element.className.replace(classRegex, " ").trim();
    }
};
var TemplateStore = /** @class */ (function () {
    function TemplateStore() {
    }
    TemplateStore.prototype.getCardTemplate = function (state, item) {
        switch (state) {
            case 0 /* TODO */: {
                return "<div class=\"card card--" + KEY.TODO + "\" id=\"" + KEY.CARD_PREFIX + item.id + "\">\n          <div class=\"card__row\">\n            <a href=\"#\" class=\"card__check card__check--" + KEY.TODO + "\">\n              <span class=\"iconify\" data-icon=\"mdi-checkbox-blank-outline\">\n              </span>\n              <span class=\"iconify\" data-icon=\"mdi-check-box-outline\"></span>\n            </a>\n            <div\n              contenteditable\n              class=\"card__content\"\n              placeholder=\"\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.\"\n            >\n              " + item.content + "\n            </div>\n          </div>\n          <div class=\"card__row\">\n            <a href=\"#\" class=\"card__button card__button--edit\">\n              <span\n                class=\"iconify\"\n                data-icon=\"mdi-check-circle-outline\"\n              ></span>\n            </a>\n            <span class=\"card__date\">" + item.modifiedDatePresantation + "</span>\n          </div>\n        </div>";
            }
            case 1 /* DONE */: {
                return "<div class=\"card card--" + KEY.DONE + "\" id=\"" + KEY.CARD_PREFIX + item.id + "\">\n          <div class=\"card__row\">\n            <a href=\"#\" class=\"card__check card__check--" + KEY.DONE + "\">\n              <span class=\"iconify\" data-icon=\"mdi-check-box-outline\"></span>\n              <span class=\"iconify\" data-icon=\"mdi-checkbox-blank-outline\">\n              </span>\n            </a>\n            <div\n              contenteditable\n              class=\"card__content\"\n              placeholder=\"\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.\"\n            >\n              " + item.content + "\n            </div>\n          </div>\n          <div class=\"card__row\">\n            <a href=\"#\" class=\"card__button card__button--edit\">\n              <span\n                class=\"iconify\"\n                data-icon=\"mdi-check-circle-outline\"\n              ></span>\n            </a>\n            <a href=\"#\" class=\"card__button card__button--delete\">\n              <span\n                class=\"iconify\"\n                data-icon=\"mdi-trash-can-outline\"\n              ></span>\n            </a>\n            <span class=\"card__date\"\n              >" + item.modifiedDatePresantation + " ~ " + item.finishedDatePresantation + "</span\n            >\n          </div>\n        </div>";
            }
        }
    };
    TemplateStore.prototype.getPopupTextTemplate = function (popup) {
        switch (popup) {
            case POPUP.EMPTY: {
                return "<span>내용을 입력해주세요.</span>";
            }
            case POPUP.DELETE: {
                return "<span>메모를 삭제하시겠습니까?</span>";
            }
        }
    };
    TemplateStore.prototype.getPopupButtonTemplate = function (popup) {
        switch (popup) {
            case POPUP.EMPTY: {
                return "<a href=\"#delete-1\" class=\"popup__button popup__button--confirm\">\uD655\uC778</a>";
            }
            case POPUP.DELETE: {
                return "<a href=\"#delete-1\" class=\"popup__button popup__button--accept\">\uC608</a>\n                <a href=\"#delete-1\" class=\"popup__button popup__button--cancel\">\uC544\uB2C8\uC624</a>";
            }
        }
    };
    return TemplateStore;
}());
var Renderer = /** @class */ (function () {
    function Renderer(todoManager, templateStore, popupManager) {
        this._INIT_GET_COUNT = 9;
        this._MORE_GET_COUNT = 3;
        this._todoManager = todoManager;
        this._templateStore = templateStore;
        this._popupManager = popupManager;
        this.render(0 /* TODO */, RENDER.TODO_LIST);
        this.render(1 /* DONE */, RENDER.DONE_LIST);
        this._attachMoreEvent(0 /* TODO */);
        this._attachMoreEvent(1 /* DONE */);
    }
    Renderer.prototype._getKey = function (state) {
        return state === 0 /* TODO */ ? KEY.TODO : KEY.DONE;
    };
    Renderer.prototype._attachMoreEvent = function (state) {
        var key = this._getKey(state);
        var moreElement = document.getElementById("todo-section__more-button--" + key);
        if (!moreElement)
            return console.error("todo more element is not found");
        moreElement.addEventListener("click", this._moreEventListener.bind(this, state));
    };
    Renderer.prototype._moreEventListener = function (state, event) {
        event.preventDefault();
        event.stopPropagation();
        var key = this._getKey(state);
        var cardElements = document.getElementsByClassName("card--" + key);
        if (!cardElements)
            return console.error("Todo card element is not found");
        var length = cardElements.length;
        if (length === 0) {
            this.render(state, state === 0 /* TODO */ ? RENDER.TODO_LIST : RENDER.DONE_LIST);
        }
        else {
            var lastId = cardElements[length - 1].id.replace(KEY.CARD_PREFIX, "");
            var todo = this._todoManager.get(state, lastId);
            this.render(state, state === 0 /* TODO */ ? RENDER.TODO_PARTIAL : RENDER.DONE_PARTIAL, todo);
        }
    };
    Renderer.prototype._editEventListener = function (state, event) {
        event.preventDefault();
        event.stopPropagation();
        var key = this._getKey(state);
        var targetElement = event.target;
        var cardElement = targetElement.closest(".card--" + key);
        if (!cardElement)
            return console.error("Todo card element is not found");
        var textElement = document.querySelector("#" + cardElement.id + " .card__content");
        if (!textElement)
            return console.error("Todo card text element is not found");
        var id = cardElement.id.replace(KEY.CARD_PREFIX, "");
        var todo = this._todoManager.get(state, id);
        // prevent update
        if (todo.content === textElement.textContent.trim())
            return;
        this._deleteWithDataAndEvent(state, id, cardElement);
        var todoId = this._todoManager.set(state, state === 0 /* TODO */
            ? this._todoManager.make(state, textElement.textContent)
            : this._todoManager.make(state, textElement.textContent, todo));
        this.render(state, state === 0 /* TODO */ ? RENDER.TODO : RENDER.DONE, this._todoManager.get(state, todoId));
    };
    Renderer.prototype._checkEventListener = function (state, event) {
        event.preventDefault();
        event.stopPropagation();
        var key = this._getKey(state);
        var targetElement = event.target;
        var cardElement = targetElement.closest(".card--" + key);
        if (!cardElement)
            return console.error("Done card element is not found");
        var id = cardElement.id.replace(KEY.CARD_PREFIX, "");
        var todo = this._todoManager.get(state, id);
        var oppositeState = state === 0 /* TODO */ ? 1 /* DONE */ : 0 /* TODO */;
        var todoId = this._todoManager.set(oppositeState, oppositeState === 0 /* TODO */
            ? this._todoManager.make(oppositeState, todo.content)
            : this._todoManager.make(oppositeState, todo.content, todo));
        this._deleteWithDataAndEvent(state, id, cardElement);
        this.render(oppositeState, oppositeState === 0 /* TODO */ ? RENDER.TODO : RENDER.DONE, this._todoManager.get(oppositeState, todoId));
    };
    Renderer.prototype._deleteEventListener = function (state, event) {
        var _this = this;
        event.preventDefault();
        event.stopPropagation();
        var targetElement = event.target;
        var key = this._getKey(state);
        this._popupManager.pop(POPUP.DELETE, {
            action: function () {
                var cardElement = targetElement.closest(".card--" + key);
                if (!cardElement)
                    return console.error("Done card element is not found");
                var id = cardElement.id.replace(KEY.CARD_PREFIX, "");
                _this._deleteWithDataAndEvent(state, id, cardElement);
            }
        });
        targetElement.removeEventListener("click", this._deleteEventListener.bind(this, state));
    };
    Renderer.prototype._deleteWithDataAndEvent = function (state, id, cardElement) {
        this._todoManager.delete(state, id);
        this._dettachEvent(state, id);
        cardElement.remove();
    };
    Renderer.prototype._attachEvent = function (state, id) {
        var key = this._getKey(state);
        var checkElement = document.querySelector("#" + KEY.CARD_PREFIX + id + " .card__check--" + key);
        if (!checkElement)
            return console.error(key + " check element is not found");
        checkElement.addEventListener("click", this._checkEventListener.bind(this, state));
        var editElement = document.querySelector("#" + KEY.CARD_PREFIX + id + " .card__button--edit");
        if (!editElement)
            return console.error(key + " edit element is not found");
        editElement.addEventListener("click", this._editEventListener.bind(this, state));
        if (state === 1 /* DONE */) {
            var deleteElement = document.querySelector("#" + KEY.CARD_PREFIX + id + " .card__button--delete");
            if (!deleteElement)
                return console.error("done delete element is not found");
            deleteElement.addEventListener("click", this._deleteEventListener.bind(this, state));
        }
    };
    Renderer.prototype._dettachEvent = function (state, id) {
        var key = this._getKey(state);
        var checkElement = document.querySelector("#" + KEY.CARD_PREFIX + id + " .card__check--" + key);
        if (!checkElement)
            return console.error("done check element is not found");
        checkElement.removeEventListener("click", this._checkEventListener.bind(this, state));
        var editElement = document.querySelector("#" + KEY.CARD_PREFIX + id + " .card__button--edit");
        if (!editElement)
            return console.error("todo element is not found");
        editElement.removeEventListener("click", this._editEventListener.bind(this, state));
        if (state === 1 /* DONE */) {
            var deleteElement = document.querySelector("#" + KEY.CARD_PREFIX + id + " .card__button--delete");
            if (!deleteElement)
                return console.error("done delete element is not found");
            deleteElement.removeEventListener("click", this._deleteEventListener.bind(this, state));
        }
    };
    Renderer.prototype._clearElementById = function (id) {
        var element = document.getElementById(id);
        if (!element)
            return console.error(id + " is not defined");
        element.innerHTML = "";
    };
    Renderer.prototype.filter = function (type) {
        var bodyElement = document.getElementById("body");
        if (!bodyElement)
            return console.error("Body element is not found");
        Util.removeClass(bodyElement, "todo-section-filter--" + KEY.DONE);
        Util.removeClass(bodyElement, "todo-section-filter--" + KEY.TODO);
        switch (type) {
            case RENDER.TODO_LIST: {
                Util.addClass(bodyElement, "todo-section-filter--" + KEY.TODO);
                this._clearElementById("todo-section__list--" + KEY.TODO);
                this.render(0 /* TODO */, type);
                break;
            }
            case RENDER.DONE_LIST: {
                Util.addClass(bodyElement, "todo-section-filter--" + KEY.DONE);
                this._clearElementById("todo-section__list--" + KEY.DONE);
                this.render(1 /* DONE */, type);
                break;
            }
            case RENDER.ALL: {
                this._clearElementById("todo-section__list--" + KEY.TODO);
                this._clearElementById("todo-section__list--" + KEY.DONE);
                this.render(0 /* TODO */, RENDER.TODO_LIST);
                this.render(1 /* DONE */, RENDER.DONE_LIST);
                break;
            }
        }
    };
    Renderer.prototype.render = function (state, type, item) {
        var _this = this;
        switch (type) {
            case RENDER.TODO:
            case RENDER.TODO_PARTIAL:
            case RENDER.TODO_LIST: {
                var todoSectionList_1 = document.getElementById("todo-section__list--" + KEY.TODO);
                if (!todoSectionList_1)
                    return console.error("Todo section element is not found");
                switch (type) {
                    case RENDER.TODO: {
                        if (!item)
                            console.error("Todo item is not provided");
                        todoSectionList_1.insertAdjacentHTML(KEY.RENDER_LAST, this._templateStore.getCardTemplate(state, item));
                        this._attachEvent(state, item.id);
                        break;
                    }
                    case RENDER.TODO_PARTIAL: {
                        if (!item)
                            console.error("Todo item is not provided");
                        this._todoManager
                            .getListAfter(state, item.id, this._MORE_GET_COUNT)
                            .forEach(function (item) {
                            todoSectionList_1.insertAdjacentHTML(KEY.RENDER_FIRST, _this._templateStore.getCardTemplate(state, item));
                            _this._attachEvent(state, item.id);
                        });
                        break;
                    }
                    case RENDER.TODO_LIST: {
                        var bodyElement = document.getElementById("body");
                        if (!bodyElement)
                            return console.error("Body element is not defined");
                        var hasFilter = bodyElement.className.indexOf("todo-section-filter") >= 0;
                        var count = hasFilter
                            ? this._INIT_GET_COUNT * 2
                            : this._INIT_GET_COUNT;
                        this._todoManager.getList(state, count).forEach(function (item) {
                            todoSectionList_1.insertAdjacentHTML(KEY.RENDER_FIRST, _this._templateStore.getCardTemplate(state, item));
                            _this._attachEvent(state, item.id);
                        });
                        break;
                    }
                }
                break;
            }
            case RENDER.DONE:
            case RENDER.DONE_PARTIAL:
            case RENDER.DONE_LIST: {
                var doneSectionList_1 = document.getElementById("todo-section__list--" + KEY.DONE);
                if (!doneSectionList_1)
                    return console.error("Done section element is not found");
                switch (type) {
                    case RENDER.DONE: {
                        if (!item)
                            console.error("Todo item is not provided");
                        doneSectionList_1.insertAdjacentHTML(KEY.RENDER_LAST, this._templateStore.getCardTemplate(1 /* DONE */, item));
                        this._attachEvent(1 /* DONE */, item.id);
                        break;
                    }
                    case RENDER.DONE_PARTIAL: {
                        if (!item)
                            console.error("Todo item is not provided");
                        this._todoManager
                            .getListAfter(1 /* DONE */, item.id, this._MORE_GET_COUNT)
                            .forEach(function (item) {
                            doneSectionList_1.insertAdjacentHTML(KEY.RENDER_FIRST, _this._templateStore.getCardTemplate(1 /* DONE */, item));
                            _this._attachEvent(1 /* DONE */, item.id);
                        });
                        break;
                    }
                    case RENDER.DONE_LIST: {
                        var bodyElement = document.getElementById("body");
                        if (!bodyElement)
                            return console.error("Body element is not defined");
                        var hasFilter = bodyElement.className.indexOf("todo-section-filter") >= 0;
                        var count = hasFilter
                            ? this._INIT_GET_COUNT * 2
                            : this._INIT_GET_COUNT;
                        this._todoManager
                            .getList(1 /* DONE */, count)
                            .forEach(function (item) {
                            doneSectionList_1.insertAdjacentHTML(KEY.RENDER_FIRST, _this._templateStore.getCardTemplate(1 /* DONE */, item));
                            _this._attachEvent(1 /* DONE */, item.id);
                        });
                        break;
                    }
                }
                break;
            }
        }
    };
    return Renderer;
}());
var PopupManager = /** @class */ (function () {
    function PopupManager(templateStore) {
        var popupElement = document.getElementById("popup");
        if (!popupElement) {
            console.error("Popup element is not found");
        }
        this._popupElement = popupElement;
        this._popupTextElement = document.querySelector("#popup .popup__text");
        this._popupButtonElement = document.querySelector("#popup .popup__buttons");
        this._templateStore = templateStore;
    }
    PopupManager.prototype._setTemplate = function (type) {
        if (!this._popupTextElement || !this._popupButtonElement)
            return console.error("Popup element is not found");
        this._popupTextElement.innerHTML = this._templateStore.getPopupTextTemplate(type);
        this._popupButtonElement.innerHTML = this._templateStore.getPopupButtonTemplate(type);
    };
    PopupManager.prototype._setEventListener = function (type, data) {
        switch (type) {
            case POPUP.EMPTY: {
                var confirmButton = document.querySelector("#popup .popup__button--confirm");
                if (!confirmButton)
                    return console.error("Confirm button is not found");
                confirmButton.addEventListener("click", this._actionEventListener.bind(this, function () { }));
                break;
            }
            case POPUP.DELETE: {
                var acceptButton = document.querySelector("#popup .popup__button--accept");
                var cancelButton = document.querySelector("#popup .popup__button--cancel");
                if (!acceptButton || !cancelButton)
                    return console.error("Aceept button or Cancel button is not found");
                if (!data)
                    return console.error("Data is not defined");
                acceptButton.addEventListener("click", this._actionEventListener.bind(this, data.action));
                cancelButton.addEventListener("click", this._actionEventListener.bind(this, function () { }));
                break;
            }
        }
    };
    PopupManager.prototype._actionEventListener = function (action, event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this._popupElement)
            return console.error("Popup element is not found");
        var targetElement = event.target;
        targetElement.removeEventListener("click", this._actionEventListener.bind(this, action));
        action();
        Util.removeClass(this._popupElement, "target");
    };
    PopupManager.prototype.pop = function (type, data) {
        if (!this._popupElement)
            return console.error("Popup element is not found");
        this._setTemplate(type);
        this._setEventListener(type, data);
        Util.addClass(this._popupElement, "target");
    };
    return PopupManager;
}());
var TodoManager = /** @class */ (function () {
    function TodoManager() {
        this._dataStore = new DataStore();
        this._dataStore._todos = this._makeList(0 /* TODO */);
        this._dataStore._dones = this._makeList(1 /* DONE */);
    }
    TodoManager.prototype._makeList = function (state) {
        var _this = this;
        var list = [];
        switch (state) {
            case 0 /* TODO */: {
                Object.keys(this._dataStore._todo).forEach(function (id) {
                    list.push(_this.get(0 /* TODO */, id));
                });
                this._sort(list, KEY.MODIFIED_DATE);
                break;
            }
            case 1 /* DONE */: {
                Object.keys(this._dataStore._done).forEach(function (id) {
                    list.push(_this.get(1 /* DONE */, id));
                });
                this._sort(list, KEY.FINISHED_DATE);
                break;
            }
        }
        return list;
    };
    TodoManager.prototype._binarySearch = function (key, targetDate, items) {
        var start = 0;
        var end = items.length - 1;
        var mid;
        var compareDate;
        var numberTargetDate = Number(targetDate);
        while (start <= end) {
            mid = start + Math.floor((end - start) / 2);
            compareDate = Number(items[mid][key]);
            if (numberTargetDate === compareDate) {
                return mid;
            }
            else if (numberTargetDate < compareDate) {
                start = mid + 1;
            }
            else {
                // numberTargetDate > compareDate
                end = mid - 1;
            }
        }
        return -1;
    };
    TodoManager.prototype._findInsertIndex = function (key, targetDate, items) {
        var start = 0;
        var end = items.length - 1;
        var mid;
        var compareDate;
        var numberTargetDate = Number(targetDate);
        while (start <= end) {
            mid = start + Math.floor((end - start) / 2);
            compareDate = Number(items[mid][key]);
            if (numberTargetDate === compareDate) {
                end = mid - 1; // find the data more greater than this.
            }
            else if (numberTargetDate < compareDate) {
                start = mid + 1;
            }
            else {
                // numberTargetDate > compareDate
                end = mid - 1;
            }
        }
        return end + 1; // greater than index + 1 === insert index
    };
    TodoManager.prototype._convertToPresentationalDate = function (key, item) {
        if (item[key] === EMPTY.DATE)
            return;
        // "2012. 12. 20. 오전 3:00:00"
        item[key + KEY.PRESENTATION] = new Date(Number(item[key])).toLocaleString("ko-KR", {
            hour12: false,
            timeZone: "UTC",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        });
    };
    TodoManager.prototype._sort = function (items, key) {
        items.sort(function (a, b) { return Number(b[key]) - Number(a[key]); });
    };
    TodoManager.prototype.make = function (state, content, oldItem) {
        var todo = {
            state: state,
            content: content.trim()
        };
        switch (state) {
            case 0 /* TODO */: {
                todo.modifiedDate = String(Date.now());
                todo.finishedDate = EMPTY.DATE;
                break;
            }
            case 1 /* DONE */: {
                if (!oldItem) {
                    throw new Error("oldItem is not defined!");
                }
                todo.modifiedDate = oldItem[KEY.MODIFIED_DATE];
                todo.finishedDate = String(Date.now());
                break;
            }
        }
        return todo;
    };
    TodoManager.prototype.get = function (state, id) {
        var todo;
        switch (state) {
            case 0 /* TODO */: {
                todo = __assign({}, this._dataStore._todo[id]);
                break;
            }
            case 1 /* DONE */: {
                todo = __assign({}, this._dataStore._done[id]);
                this._convertToPresentationalDate(KEY.FINISHED_DATE, todo);
                break;
            }
        }
        todo.id = id;
        this._convertToPresentationalDate(KEY.MODIFIED_DATE, todo);
        return todo;
    };
    TodoManager.prototype.set = function (state, item) {
        this._dataStore._id++;
        var id = String(this._dataStore._id);
        switch (state) {
            case 0 /* TODO */: {
                this._dataStore._todo[id] = item;
                var insertIndex = this._findInsertIndex(KEY.MODIFIED_DATE, item[KEY.MODIFIED_DATE], this._dataStore._todos);
                this._dataStore._todos.splice(insertIndex, 0, this.get(state, id));
                break;
            }
            case 1 /* DONE */: {
                this._dataStore._done[id] = item;
                var insertIndex = this._findInsertIndex(KEY.FINISHED_DATE, item[KEY.FINISHED_DATE], this._dataStore._dones);
                this._dataStore._dones.splice(insertIndex, 0, this.get(state, id));
                break;
            }
        }
        return id;
    };
    TodoManager.prototype.delete = function (state, id) {
        switch (state) {
            case 0 /* TODO */: {
                var index = this._binarySearch(KEY.MODIFIED_DATE, this._dataStore._todo[id][KEY.MODIFIED_DATE], this._dataStore._todos);
                this._dataStore._todos.splice(index, 1);
                delete this._dataStore._todo[id];
                break;
            }
            case 1 /* DONE */: {
                var index = this._binarySearch(KEY.FINISHED_DATE, this._dataStore._done[id][KEY.FINISHED_DATE], this._dataStore._dones);
                this._dataStore._dones.splice(index, 1);
                delete this._dataStore._done[id];
                break;
            }
        }
    };
    TodoManager.prototype.getList = function (state, count) {
        var list;
        switch (state) {
            case 0 /* TODO */: {
                if (count !== undefined) {
                    list = JSON.parse(JSON.stringify(this._dataStore._todos.slice(0, count)));
                }
                else {
                    list = JSON.parse(JSON.stringify(this._dataStore._todos));
                }
                break;
            }
            case 1 /* DONE */: {
                if (count !== undefined) {
                    list = JSON.parse(JSON.stringify(this._dataStore._dones.slice(0, count)));
                }
                else {
                    list = JSON.parse(JSON.stringify(this._dataStore._dones));
                }
                break;
            }
        }
        return list;
    };
    TodoManager.prototype.getListAfter = function (state, id, count) {
        var list;
        switch (state) {
            case 0 /* TODO */: {
                var index = this._binarySearch(KEY.MODIFIED_DATE, this._dataStore._todo[id][KEY.MODIFIED_DATE], this._dataStore._todos);
                if (count !== undefined) {
                    list = JSON.parse(JSON.stringify(this._dataStore._todos.slice(index + 1, index + 1 + count)));
                }
                else {
                    list = JSON.parse(JSON.stringify(this._dataStore._todos.slice(index + 1)));
                }
                break;
            }
            case 1 /* DONE */: {
                var index = this._binarySearch(KEY.FINISHED_DATE, this._dataStore._done[id][KEY.FINISHED_DATE], this._dataStore._dones);
                if (count !== undefined) {
                    list = JSON.parse(JSON.stringify(this._dataStore._dones.slice(index + 1, index + 1 + count)));
                }
                else {
                    list = JSON.parse(JSON.stringify(this._dataStore._dones.slice(index + 1)));
                }
                break;
            }
        }
        return list;
    };
    return TodoManager;
}());
var DataStore = /** @class */ (function () {
    function DataStore() {
        var _this = this;
        // presentational purpose
        this._todos = [];
        this._dones = [];
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
        window.addEventListener("beforeunload", function (e) {
            _this._setLocalNumber(KEY.ID, _this._id);
            _this._setLocalData(KEY.TODO, _this._todo);
            _this._setLocalData(KEY.DONE, _this._done);
        });
    }
    DataStore.prototype._getLocalData = function (itemKey) {
        return JSON.parse(Base64.decode(localStorage.getItem(itemKey)));
    };
    DataStore.prototype._getLocalNumber = function (itemKey) {
        return Number(localStorage.getItem(itemKey));
    };
    DataStore.prototype._setLocalData = function (itemKey, data) {
        localStorage.setItem(itemKey, Base64.encode(JSON.stringify(data)));
    };
    DataStore.prototype._setLocalNumber = function (itemKey, number) {
        localStorage.setItem(itemKey, String(number));
    };
    return DataStore;
}());
var ConsoleManager = /** @class */ (function () {
    function ConsoleManager(todoManager, renderer, popupManager) {
        this._todoManager = todoManager;
        this._renderer = renderer;
        this._popupManager = popupManager;
        this._registerEnter();
        this._registerFilter();
    }
    ConsoleManager.prototype._registerEnter = function () {
        var _this = this;
        // console
        var consoleEnter = document.getElementById("console__enter");
        if (!consoleEnter)
            console.error("Console enter element is not found");
        consoleEnter.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var contentElement = document.getElementById("console__content");
            if (!contentElement)
                return console.error("Console element is not found");
            var text = contentElement.textContent;
            // Fixme. Error modal
            // textContent is empty;
            if (EMPTY.STRING === text) {
                _this._popupManager.pop(POPUP.EMPTY);
                return;
            }
            var todoId = _this._todoManager.set(0 /* TODO */, _this._todoManager.make(0 /* TODO */, text));
            _this._renderer.render(0 /* TODO */, RENDER.TODO, _this._todoManager.get(0 /* TODO */, todoId));
            contentElement.textContent = "";
        });
    };
    ConsoleManager.prototype._registerFilter = function () {
        var _this = this;
        var todoFilter = document.getElementById("console__filter-todo");
        if (!todoFilter)
            console.error("Console filter todo element is not found");
        todoFilter.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            _this._renderer.filter(RENDER.TODO_LIST);
        });
        var doneFilter = document.getElementById("console__filter-done");
        if (!doneFilter)
            console.error("Console filter done element is not found");
        doneFilter.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            _this._renderer.filter(RENDER.DONE_LIST);
        });
        var removeFilter = document.getElementById("console__filter-remove");
        if (!removeFilter)
            console.error("Console filter remove element is not found");
        removeFilter.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            _this._renderer.filter(RENDER.ALL);
        });
    };
    return ConsoleManager;
}());
var templateStore = new TemplateStore();
var todoManager = new TodoManager();
var popupManager = new PopupManager(templateStore);
var renderer = new Renderer(todoManager, templateStore, popupManager);
var consoleManager = new ConsoleManager(todoManager, renderer, popupManager);
