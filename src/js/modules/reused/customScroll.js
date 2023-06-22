class CustomScroll {
   constructor(container) {
      // this.container = document.querySelector(nameClass);
      this.container = container;
      this.containerClone = this.container.cloneNode(false);

      this.scrollV = document.createElement('div');
      this.buttonUp = document.createElement('button');
      this.buttonDown = document.createElement('button');
      this.trackV = document.createElement('div');
      this.thumbV = document.createElement('div');

      this.trackCoord;
      this.minThumbValue;
      this.maxThumbValue;
      this.scale = 0;
      this.init();
   }
   init() {
      const nameBlock = 'customscroll';
      this.container.before(this.containerClone);
      this.containerClone.appendChild(this.container);
      this.containerClone.style.overflow = 'hidden';
      this.container.style.position = 'absolute';
      this.container.style.top = 0;
      this.container.style.left = 0;
      this.container.style.height = '100%';
      this.container.style.width = '100%';

      this.scrollV.className = `${nameBlock}__scroll-v`;
      this.buttonUp.className = `${nameBlock}__button ${nameBlock}__button_up`;
      this.buttonDown.className = `${nameBlock}__button ${nameBlock}__button_down`;
      this.trackV.className = `${nameBlock}__track-v`;
      this.thumbV.className = `${nameBlock}__thumb ${nameBlock}__thumb_v`;
      this.trackV.appendChild(this.thumbV);
      this.scrollV.appendChild(this.buttonUp);
      this.scrollV.appendChild(this.trackV);
      this.scrollV.appendChild(this.buttonDown);
      this.containerClone.appendChild(this.scrollV);

      this.setSizeThumb();
      this.container.onscroll = this.onScroll.bind(this);
      this.container.onresize = function (e) {
         console.log('resize');
      }
      this.thumbV.ondragstart = function () {
         return false;
      }
      this.thumbV.onmousedown = this.onMouseDown.bind(this);
      this.bindedMoveAt = this.moveAt.bind(this);
      this.bindedSetSizeThumb = this.setSizeThumb.bind(this);
      this.trackV.onclick = this.clickOnFreeAreaTrack.bind(this);
      this.buttonUp.onclick = this.scrollUp.bind(this);
      this.buttonDown.onclick = this.scrollDown.bind(this);

      if (!CustomScroll.hasOwnProperty('objects')) {
         CustomScroll.objects = [];
         CustomScroll.onResize = function () {
            for (const customScroll of CustomScroll.objects) {
               customScroll.bindedSetSizeThumb();
            }
         }
         window.addEventListener('resize', CustomScroll.onResize);
      }
      CustomScroll.objects.push(this);
   }
   setSizeThumb() {
      const minHeightThumbV = 60;
      const minScale = this.container.offsetHeight / minHeightThumbV;

      this.scale = Math.min(this.container.scrollHeight / this.trackV.offsetHeight, minScale);
      // this.scale = this.container.scrollHeight / this.trackV.offsetHeight;
      // console.log(minScale, this.scale);
      this.thumbV.style.height = this.container.offsetHeight / this.scale + 'px';
      this.thumbV.style.top = this.container.scrollTop / this.scale + 'px';

      this.trackCoord = this.trackV.getBoundingClientRect();
      this.minThumbValue = 0;
      this.maxThumbValue = this.trackV.offsetHeight - this.minThumbValue - this.thumbV.offsetHeight;

      this.onScroll();
   }
   onMouseDown(e) {
      e.preventDefault(); // предотвратить выделение
      const shiftY = e.clientY - this.thumbV.getBoundingClientRect().top;

      this.bindedMoveAt(e.pageY, shiftY);

      // (3) перемещать по экрану
      const onMouseMove = (e) => {
         this.bindedMoveAt(e.pageY, shiftY);
      }
      document.addEventListener('mousemove', onMouseMove);

      // (4) положить объект, удалить более ненужные обработчики событий
      document.addEventListener('mouseup', onMouseUp);

      function onMouseUp() {
         document.removeEventListener('mouseup', onMouseUp);
         document.removeEventListener('mousemove', onMouseMove);
      }
      return false;
   }
   getValueThumbV(pageY, shiftY = 0) {
      return Math.min(Math.max(pageY - shiftY - this.trackCoord.top, this.minThumbValue), this.maxThumbValue);
   }
   moveAt(pageY, shiftY = 0) {
      const value = this.getValueThumbV(pageY, shiftY);
      const scrollTop = value * (this.container.scrollHeight - this.container.clientHeight) / this.maxThumbValue;
      this.thumbV.style.top = value + 'px';
      this.container.scrollTop = scrollTop;
   }
   onScroll() {
      const newValue = this.maxThumbValue * this.container.scrollTop / (this.container.scrollHeight - this.container.clientHeight);
      this.thumbV.style.top = newValue + 'px';
   }
   clickOnFreeAreaTrack(e) {
      if (e.target !== e.currentTarget) return;
      const positionClick = this.getValueThumbV(e.pageY);
      const currentValue = parseInt(this.thumbV.style.top);
      if (positionClick < currentValue) {
         this.scroll('top', -350);
      } else {
         this.scroll('top', 350);
      }
   }
   scroll(direction, value) {
      this.container.scrollTo({
         [direction]: this.container.scrollTop + value,
         behavior: "smooth"
      })
   }
   scrollUp() {
      this.scroll('top', -40);
   }
   scrollDown() {
      this.scroll('top', 40);
   }
   scrollLeft() {
      this.scroll('left', -40);
   }
   scrollRight() {
      this.scroll('left', 40);
   }
}

export default CustomScroll;
