/* 
принцип работы основан на том что вносится изменения в dom структуру дерева (меняется физический порядок слайдов)
 */
import Sliders from "./sliders.js";

export default class slidersReorderedSlide extends Sliders {
   constructor(options) {
      super(options);
   }

   decorizeSlide() {
      this.slides.forEach(slide => {
         slide.classList.remove(this.activeClass);
      });

      this.slides[0].classList.add(this.activeClass);

      if (this.animate) {
         this.animate(this.slides);
      }
   }
   nextSlide() {
      try {
         const tempEl = this.slides[0];
         this.slides[this.slides.length - 1].after(tempEl)
         // this.container.append(this.slides[0]);
         this.decorizeSlide();
      } catch (error) {

      }
   }
   bindTriggers() {
      this.prevButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            const tempEl = this.slides[this.slides.length - 1];
            // this.container.prepend(this.slides[this.slides.length - 1]);
            this.slides[0].before(tempEl);
            this.decorizeSlide();
         });
      });
      this.nextButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
         });
      });
   }
   startAutoPlay() {
      this.intervalId = setInterval(() => this.nextSlide(), this.autoPlayTime);
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
      this.container && (this.container.style.cssText = `
      display: flex;
      overflow: hidden;
      flex-wrap: wrap;
      align-items: flex-start;
      `);

      this.bindTriggers();
      this.animate && this.animate(this.slides);
      this.initAutoPlay();
   }
}