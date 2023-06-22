/* 
принцип работы основан на том что вносится изменения в dom структуру дерева (меняется физический порядок слайдов)
 */
import Sliders from "./sliders.js";

export default class slidersTranslate extends Sliders {
   constructor(options) {
      super(options);
      const { slidesView = 1, containerWrapperSelector, isInfinity = false } = options;
      this.containerWrapper = document.querySelector(containerWrapperSelector);
      this.slidesView = slidesView;
      this.isInfinity = isInfinity;
      this.widthSlide;
      this.maxSlideIndex;
   }

   toggleEnableButtons() {
      if (!this.isInfinity) return;
      if ([1, 2].includes(this.slideIndex)) {
         this.prevButtons.forEach(button => {
            button.disabled = this.slideIndex == 1;
         });
      }
      if ([this.maxSlideIndex, this.maxSlideIndex - 1].includes(this.slideIndex)) {
         this.nextButtons.forEach(button => {
            button.disabled = this.slideIndex == this.maxSlideIndex;
         });
      }
   }

   showSlide(n) {
      if (n > this.maxSlideIndex) this.slideIndex = 1;
      if (n < 1) this.slideIndex = this.maxSlideIndex;
      console.log(this.slideIndex);
      this.container.style.translate = `${-((this.slideIndex - 1) * this.widthSlide)}px`;

      // дазаблить кнопки если есть установка
      this.toggleEnableButtons();
   }
   bindTriggers() {
      this.prevButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSlide(--this.slideIndex);
         });
      });
      this.nextButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSlide(++this.slideIndex);
         });
      });
   }
   startAutoPlay() {
      this.intervalId = setInterval(() => this.showSlide(++this.slideIndex), this.autoPlayTime);
   }

   initAutoPlay() {
      if (!this.autoPlayTime) return;

      this.startAutoPlay();

      const onMouseEnter = (e) => {
         const target = e && e.target;
         if (!target) return;

         clearInterval(this.intervalId);
         const mouseLeave = () => {
            this.startAutoPlay();
            target.removeEventListener('mouseleave', mouseLeave);
         }
         target.addEventListener('mouseleave', mouseLeave)
      }

      this.nextButtons.forEach(button => {
         button.addEventListener('mouseenter', onMouseEnter)
      });
      this.prevButtons.forEach(button => {
         button.addEventListener('mouseenter', onMouseEnter)
      });
      try {
         this.container.addEventListener('mouseenter', onMouseEnter);
      } catch (error) {
      }
   }

   init() {
      this.containerWrapper && (this.containerWrapper.style.cssText = `overflow: hidden;`)
      // стиля для контейнера
      this.container && (this.container.style.cssText = `
      display: flex;
      align-items: flex-start;
      `);
      // установить размер слайдов исходя из размера контейнера и указанного количества видимых слайдов
      const widthContainerSliders = this.container && this.container.clientWidth;
      const widthSlide = widthContainerSliders / this.slidesView;
      for (const slide of this.slides) {
         slide.style.width = `${widthSlide}px`;
         slide.style.flex = `0 0 ${widthSlide}px`;
      }
      this.widthSlide = widthSlide;
      this.maxSlideIndex = this.slides.length - (this.slidesView - 1);

      this.bindTriggers();
      this.animate && this.animate(this.slides);
      this.initAutoPlay();
      // дазаблить кнопки если есть установка
      this.toggleEnableButtons();
   }
}