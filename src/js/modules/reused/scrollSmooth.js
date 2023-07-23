import animate from './animateJS/animate.js';

function scrollSmooth(selector, option = {}) {
   const beginScrollTop = document.documentElement.scrollTop,
      toBlockTop = document.querySelector(selector).getBoundingClientRect().top,
      toScrollTop = beginScrollTop + toBlockTop,
      distance = toBlockTop < 0 ? beginScrollTop - toScrollTop : beginScrollTop + toScrollTop;

   animate({
      ...option,
      draw
   });

   function draw(progress) {
      const currentProgress = progress * distance;
      const r = (toBlockTop < 0 ? Math.max(beginScrollTop - currentProgress, toScrollTop) : Math.min(beginScrollTop + currentProgress, toScrollTop));
      document.documentElement.scrollTo(0, r);
   }
}

export default scrollSmooth;