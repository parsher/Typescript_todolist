import { STATE, KEY, Item, POPUP } from './Common';

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

export default TemplateStore;
