import TemplateStore from './TemplateStore';
import Util from './Util';
import { PopupData, POPUP } from "./Common";

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

export default PopupManager;