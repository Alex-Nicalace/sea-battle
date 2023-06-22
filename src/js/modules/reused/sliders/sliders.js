export default class Sliders {
   constructor({
      containerSelector = undefined,
      slideClass = '',
      slideActive = 1,
      dir = 'horizontal',
      nameClassNext,
      nameClassPrev,
      autoPlayTime,
      prevButtonSelector = undefined,
      nextButtonSelector = undefined,
      activeClass,
      animate,
      slider = undefined,
   } = {}) {
      this.container = document.querySelector(containerSelector);
      try {
         this.slides = slideClass
            ? this.container.getElementsByClassName(slideClass)
            : this.container.children;
      } catch (e) { this.slides = [] };
      this.prevButtons = prevButtonSelector ? document.querySelectorAll(prevButtonSelector) : [];
      this.nextButtons = nextButtonSelector ? document.querySelectorAll(nextButtonSelector) : [];
      this.slideIndex = slideActive;
      this.activeClass = activeClass;
      this.animate = animate;
      this.autoPlayTime = autoPlayTime;

      this.nameClassNext = nameClassNext || (dir === 'horizontal' ? 'animate_slideInLeft' : 'animate_slideInUp');
      this.nameClassPrev = nameClassPrev || (dir === 'horizontal' ? 'animate_slideInRight' : 'animate_slideInDown');

      if (slider) {
         this.slider = slider;
         slider.setSlider(this);
      }
   }
   setSlider(slider) {
      this.slider = slider;
   }
}