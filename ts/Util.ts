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

export default Util;