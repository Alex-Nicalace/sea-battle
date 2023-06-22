class BindToggleClass {
   constructor(action, triggerSelector, elementSelector, nameClassToggle) {
      if (!document.querySelector(triggerSelector) || !document.querySelector(elementSelector)) {
         return;
      }
      this.isOpen = false;
      this.triggerElement = document.querySelector(triggerSelector);
      this.element = document.querySelector(elementSelector);
      this.triggerElement.addEventListener(action, () => {
         this.element.classList.toggle(nameClassToggle);
         this.isOpen = !this.isOpen;
         if (this.isOpen) {
            document.addEventListener(action, close)
         } else {
            document.removeEventListener(action, close);
         }
      })

      const close = (e) => {
         const target = e.target;
         if (!this.element.contains(target) && !this.triggerElement.contains(target)) {
            this.element.classList.remove(nameClassToggle);
            document.removeEventListener(action, close);
            this.isOpen = false;
         }
      }
   }
}

new BindToggleClass('click', '.header__icon-search.icon-search', '.header__menu', 'header__menu_hidden')