class Rating {
   constructor(element) {
      if (!element) return this;

      if (typeof (element) === 'string') {
         const elements = document.querySelectorAll(element);
         const objects = [];
         elements.forEach(element => {
            objects.push(new Rating(element))
         });
         return objects.length === 1 ? objects[0] : objects;
      }

      this.rating = element;
      this.ratingActive = this.rating.querySelector('.rating__active');
      this.ratingValue = this.rating.querySelector('.rating__value');
      this.ratingItems = this.rating.querySelectorAll('.rating__item');

      this.init();
   }
   init() {
      this.setRatingActiveWidth();
      if (this.rating.classList.contains('rating_set')) {
         this.setRating(this.rating);
      }
   }
   //  изменение ширины активных звезд
   setRatingActiveWidth(index = this.ratingValue.innerHTML) {
      // index - используется в событии при наведении мыши на звезду
      const ratingActiveWidth = index / 0.05;
      this.ratingActive.style.width = `${ratingActiveWidth}%`
   }
   // возможность указать оценку
   setRating() {
      for (let index = 0; index < this.ratingItems.length; index++) {
         const ratingItem = this.ratingItems[index];
         ratingItem.addEventListener("mouseenter", () => {
            this.setRatingActiveWidth(ratingItem.value);
         });
         ratingItem.addEventListener("mouseleave", () => {
            this.setRatingActiveWidth();
         });
         ratingItem.addEventListener("click", () => {

            if (this.rating.dataset.ajax) {
               // send to server
               // setRatingValue(ratingItem.value, rating);
            } else {
               // Отобразить указанную оценку
               this.ratingValue.innerHTML = index + 1;
               this.setRatingActiveWidth();
            }
         })
      }
   }
}

new Rating('.rating');