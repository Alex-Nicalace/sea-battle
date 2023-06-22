// собираем все якоря; устанавливаем время анимации и количество кадров
/* const anchors = Array.from(document.querySelectorAll('a[href*="#"]')),
   animationTime = 400,
   framesCount = 40;

anchors.forEach(function (item) {
   // каждому якорю присваиваем обработчик события
   item.addEventListener('click', function (e) {
      // убираем стандартное поведение
      e.preventDefault();

      // высота хедера
      const scrollTop = item.dataset.scrollTop || 0;

      const currentPosition = item.getBoundingClientRect().top + window.pageYOffset;

      // для каждого якоря берем соответствующий ему элемент и определяем его координату Y
      const hash = item.getAttribute('href').trim();
      if (hash == '#') return;
      const position = document.querySelector(hash).getBoundingClientRect().top + window.pageYOffset - scrollTop;

      const distance = position - currentPosition;

      // считаем на сколько скроллить за 1 такт
      const scrollBy = distance / framesCount;

      // запускаем интервал, в котором
      const scroller = setInterval(function () {
         // если к-во пикселей для скролла за 1 такт больше расстояния до элемента
         // и дно страницы не достигнуто
         const heightDocument = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
         );
         // если скрол вниз
         if ((distance > 0 && scrollBy > window.pageYOffset - position && window.innerHeight + window.pageYOffset < heightDocument) ||
            (distance < 0 && scrollBy < window.pageYOffset - position && window.pageYOffset > 0)) {
            // то скроллим на к-во пикселей, которое соответствует одному такту
            window.scrollBy(0, scrollBy);
            return
         } else {
            // иначе добираемся до элемента и выходим из интервала
            window.scrollTo(0, position);
            clearInterval(scroller);
            history.replaceState(history.state, document.title, location.href.replace(/#.*$/g, '') + hash);
         }


         // время интервала равняется частному от времени анимации и к-ва кадров
      }, animationTime / framesCount);
   });
}); */


// вариант более современный
import scrollSmooth from './scrollSmooth.js'
const scrollToAnchor = () => {
   const anchors = Array.from(document.querySelectorAll('a[href*="#"]'));

   anchors.forEach(function (item) {
      // каждому якорю присваиваем обработчик события
      item.addEventListener('click', function (e) {
         // убираем стандартное поведение
         e.preventDefault();

         // для каждого якоря берем соответствующий ему элемент и определяем его координату Y
         const hash = this.hash;
         if (!hash) return;
         scrollSmooth(hash, { duration: 1000 });
         location.hash = hash;
      });
   });
}

export default scrollToAnchor;
