/* 
принцип млайдера основан на изменении свойства display
 */
import Sliders from "./sliders.js";

export default class slidersStateDisplay extends Sliders {
   constructor(options) {
      super(options);
   }
   bindTriggers() {
      this.prevButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            this.minusSlides(1);
         });
      });
      this.nextButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            this.plusSlides(1);
         });
      });
   }
   render() {
      this.bindTriggers();
      this.showSlide(1);
   }
   hideSliders() {
      try {
         for (const slide of this.slides) {
            slide.style.display = 'none';
            slide.classList.add('animate');
            slide.classList.remove(this.nameClassNext, this.nameClassPrev);
            // slide.classList.remove('.slideInRight', '.slideInDown', '.slideInLeft', '.slideInUp');
         }
      } catch (e) { console.log('error'); }
   }
   showSlide(n, isForward) {
      try {
         this.hideSliders();

         if (n > this.slides.length) this.slideIndex = 1;
         if (n < 1) this.slideIndex = this.slides.length;
         if (this.slider) {
            this.slider.slideIndex = this.slideIndex;
         }

         const slideIndex = this.slideIndex - 1;
         if (isForward !== undefined) {
            if (isForward) {
               this.slides[slideIndex].classList.add(this.nameClassNext)
            } else {
               this.slides[slideIndex].classList.add(this.nameClassPrev);
            }
         }
         this.slides[slideIndex].style.display = 'block';
      } catch (error) {

      }
   }
   plusSlides(n) {
      this.showSlide(this.slideIndex += n, true);
   }
   minusSlides(n) {
      this.showSlide(this.slideIndex -= n, false);
   }
}