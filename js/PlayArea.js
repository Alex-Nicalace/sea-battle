import { randomInteger } from './numbers.js';
import Dragable from './Dragable.js';

/**
 * @typedef {Object} AreaItem
 * @property {any} cell - значение ячейки в массиве
 * @property {Node} cellHtml - узел HTML соответсвующий ячейке массива
 */

/**
 * @typedef {Array<Array<AreaItem>>} Area
 */

/**
 * Объект, представляющий координату в массиве
 * @typedef {Object} Coord
 * @property {number} i - Строка массива.
 * @property {number} k - Столбец массива.
 */

/**
 * @typedef {Array<Coord>} AreaCoord
 */

/**
 * Объект, представляющий треки кораблей.
 * @typedef {Object} Tracks
 * @property {Object} up - Трек вверх.
 * @property {function} up.filler - Метод для формирования трека вверх.
 * @property {Object} right - Трек вправо.
 * @property {function} right.filler - Метод для формирования трека вправо.
 * @property {Object} down - Трек вниз.
 * @property {function} down.filler - Метод для формирования трека вниз.
 * @property {Object} left - Трек влево.
 * @property {function} left.filler - Метод для формирования трека влево.
 */


/**
 * Класс, представляющий объект игрового поля
 * @class
 */
class PlayArea {
   constructor() {
      /**
       * HTML-узел, в который можно сбрасывать корабль
       * @type {Node}
       */
      this.droppableEl;
      /**
       * селектор клетки игорового поля
       * @type {string | null;}
       */
      this.cellSelector = null;
      /**
       * Поле, представляющее двумерный массив объектов.
       * @type {Area}
       */
      this.area = Array(10);
      /**
       * Поле, представляющее Map с ключами в виде HTML-узлов и значениями в виде объектов {i, k} - координаты 2-мерного массива.
       * @type {Map<Node, Coord>}
       */
      this.cellsHtml;
      /**
       * @type {Tracks}
       */
      this.tracks = {
         up: {
            /**
              * Формирует массив координат корабля, от указанной координаты на указанную длину вверх
              * @param {number} i - строка массива
              * @param {number} k - столбец массива
              * @param {number} len - длина корабля
              * @returns {AreaCoord}
              */
            filler: (i, k, len) => {
               /**
                * @type {AreaCoord}
                */
               const track = [];
               if (i - len < -1) return track;
               for (let d = i; d > i - len; d--) {
                  track.push({ i: d, k });
               }
               return track;
            }
         },
         right: {
            /**
              * Формирует массив координат корабля, от указанной координаты на указанную длину вправо
              * @param {number} i - строка массива
              * @param {number} k - столбец массива
              * @param {number} len - длина корабля
              * @returns {AreaCoord}
              */
            filler: (i, k, len) => {
               const track = [];
               if (k + len > 10) return track;
               for (let d = k; d < k + len; d++) {
                  track.push({ i, k: d });
               }
               return track;
            }
         },
         down: {
            /**
              * Формирует массив координат корабля, от указанной координаты на указанную длину вниз
              * @param {number} i - строка массива
              * @param {number} k - столбец массива
              * @param {number} len - длина корабля
              * @returns {AreaCoord}
              */
            filler: (i, k, len) => {
               const track = [];
               if (i + len > 10) return track;
               for (let d = i; d < i + len; d++) {
                  track.push({ i: d, k });
               }
               return track;
            }
         },
         left: {
            /**
           * Формирует массив координат корабля, от указанной координаты на указанную длину влево
           * @param {number} i - строка массива
           * @param {number} k - столбец массива
           * @param {number} len - длина корабля
           * @returns {AreaCoord}
           */
            filler: (i, k, len) => {
               const track = [];
               if (k - len < -1) return track;
               for (let d = k; d > k - len; d--) {
                  track.push({ i, k: d });
               }
               return track;
            }
         },
      }
      /**
       * Поле содержит значение, кот. должно обозначать пустую ячейку
       */
      this.emptyCell = null;
      /**
       * Поле содержит значение, кот. должно обозначать ячейки, кот. непосредственно примыкают к кораблю
       */
      this.borderCell = '.';
   }
   /**
    * создает игоровое поле, 2-мерный массив
    */
   createPlayArea() {
      for (let i = 0; i < this.area.length; i++) {
         this.area[i] = Array(this.area.length)
         for (let k = 0; k < this.area[i].length; k++) {
            this.area[i][k] = { cell: this.emptyCell, cellHtml: null };
         }
      }
   }
   /**
    * печатает значения 2-мерного массива в сопоставленные HTML-узлы
    */
   printPlayArea() {
      /* let row = '';
      for (let i = 0; i < this.area.length; i++) {
         for (let k = 0; k < this.area.length; k++) {
            row += this.area[i][k].cell;
         }
         row += '\n';
      }
      console.log(row);
      console.table(this.area); */

      for (const item of this.cellsHtml) {
         const { i, k } = item[1];
         if (typeof this.area[i][k].cell === 'number') {
            this.area[i][k].cellHtml.innerHTML = this.area[i][k].cell;
            continue
         }
         this.area[i][k].cellHtml.innerHTML = '';
      }
   }
   /**
    * Проверить возможность размещения корабля по заданным координатам
    * @param {Coord[]} track массив координат корабля
    * @returns {Boolean}
    */
   canBuildShip(track = []) {
      return !!track.length && !track.some(coord => this.area[coord.i][coord.k].cell != this.emptyCell);
   }
   /**
    * Размещение корабля по заданным координатам
    * @param {Coord[]} track массив координат корабля
    * @returns {Array<Coord>} массив координат корабля, дополненный координатами буферной зоны
    */
   buildShip(track = []) {
      const res = [...track];
      const sizeShip = track.length;
      const setBorder = (i, k, sizeShip) => {
         const iMin = Math.max(i - 1, 0);
         const iMax = Math.min(i + 1, 9);
         const kMin = Math.max(k - 1, 0);
         const kMax = Math.min(k + 1, 9);
         for (let ii = iMin; ii <= iMax; ii++) {
            for (let kk = kMin; kk <= kMax; kk++) {
               if (this.area[ii][kk].cell !== this.emptyCell) continue;
               this.area[ii][kk].cell = this.borderCell;
               res.push({ i: ii, k: kk })
            }
         }
      }
      track.forEach(coord => {
         this.area[coord.i][coord.k].cell = sizeShip;
         setBorder(coord.i, coord.k, sizeShip);
      });
      return res;
   }
   /**
    * создание кораблей на поле в автаматическом режиме
    */
   createShips() {
      for (let i = 4; i > 0; i--) {
         for (let k = 1; k <= 5 - i; k++) {
            this.createShip(i)
         }
      }
   }
   /**
    * создание корабля заданной длины в автоматическом режиме
    * @param {number} len длина корабля
    */
   createShip(len) {
      let i, k, direct,
         track,
         canBuildShip = false;
      do {
         const resulst = this.getRandomEmptyPoint();
         i = resulst.i;
         k = resulst.k;
         let
            excludeDirect = [];
         do {
            direct = this.getRandomDirect(excludeDirect);
            track = this.tracks[direct].filler(i, k, len);
            excludeDirect.push(direct);
            canBuildShip = this.canBuildShip(track);
         } while (!canBuildShip && direct);
      } while (!canBuildShip);

      this.buildShip(track);

   }
   /**
    * полчение случайной пустой координаты
    * @returns {Coord} координата ячейки
    */
   getRandomEmptyPoint() {
      let i, k;
      do {
         i = Math.abs(randomInteger(0, 9));
         k = Math.abs(randomInteger(0, 9));
      } while (this.area[i][k].cell != this.emptyCell);
      return { i, k };
   }
   /**
    * случайно получить направление для размещения корабля
    * @param {Array<String>} excludeArr массив исключенных направлений
    * @returns 
    */
   getRandomDirect(excludeArr = []) {
      const directArr = ['up', 'left', 'down', 'right'];
      const isAllOptionsExcluded = directArr.every(val => excludeArr.includes(val));
      if (isAllOptionsExcluded) return null;
      let num;
      do {
         num = Math.abs(randomInteger(0, 3));
      } while (excludeArr.indexOf(directArr[num]) > -1);
      return directArr[num];
   }
   /**
    * Ассоциация ячеек 2-мерного массива (игрового поля) с HTML-узлами, представляющие собой ячейку
    * @param {String} cellSelector селектор HTML-узла, кот. будет считаться ячейкой
    * @returns 
    */
   assignHtml(cellSelector) {
      this.cellSelector = cellSelector;
      const elements = [...document.querySelectorAll(this.cellSelector)];
      const sizeSideArea = this.area.length;
      if (elements.length < Math.pow(sizeSideArea, 2)) {
         const msgError = 'Ошибка! Количества HTML элементов недостаточно для создания поля!';
         console.log(msgError);
         alert(msgError);
         return;
      }
      this.cellsHtml = new Map();
      for (let i = 0; i < sizeSideArea; i++) {
         for (let k = 0; k < sizeSideArea; k++) {
            const el = elements[i * 10 + k];
            this.area[i][k].cellHtml = el;
            this.cellsHtml.set(el, { i, k });
         }
      }
   }
   /**
    * Указаней короблей в HTML верстке
    * @param {String} dockSelector селектор дока (гаража) кораблей
    * @param {String} shipSelector селектор кораблей
    */
   setShips(dockSelector, shipSelector) {
      /**
       * @type {String} селектор корабля
       */
      this.shipSelector = shipSelector;
      /**
       * Ключ - HTML-узел крабля, значение - массив координат корабля и буферной зоны
       * @type {Map<Node, Array<Coord>>}
       */
      this.ships = new Map;
      const ships = document.querySelectorAll(shipSelector);
      for (const ship of ships) {
         this.ships.set(ship, [])
      }
      /**
       * @type {Node} HTML-узел содержащий корабли
       */
      this.dock = document.querySelector(dockSelector);
   }
   /**
    * Уже имеющиеся в классе корабли делает перетаскиваемыми
    * @param {String} droppableSelector селектор игорвого поля, куда можно сбрасывать корабли
    */
   makeDragableShips(droppableSelector) {
      this.droppableEl = document.querySelector(droppableSelector);
      this.droppableEl.style.position = 'relative';
      let
         isOverArea = false,
         track = [],
         canBuild = false,
         sizeShip;
      const cbMouseDown = (dragElement) => {
         sizeShip = +dragElement.dataset.ship;
         dragElement.setAttribute('data-drag', '');
         const coordShip = this.ships.get(dragElement);
         if (coordShip.length) {
            coordShip.forEach(({ i, k }) => {
               this.area[i][k].cell = this.emptyCell;
            });
            this.ships.set(dragElement, []);
            this.printPlayArea();
         }
      }
      const cbMouseMove = (dragElement) => {
         dragElement.removeAttribute('data-can-drop');
         track.forEach(({ i, k }) => {
            this.area[i][k].cellHtml.removeAttribute('data-can-drop', '')
         });

         const dragElementCoord = dragElement.getBoundingClientRect();
         dragElement.style.display = 'none';
         const topLeft = document.elementFromPoint(dragElementCoord.left, dragElementCoord.top)?.closest(this.cellSelector);
         const topRight = document.elementFromPoint(dragElementCoord.right, dragElementCoord.top)?.closest(this.cellSelector);
         const bottomLeft = document.elementFromPoint(dragElementCoord.left, dragElementCoord.bottom)?.closest(this.cellSelector);
         const bottomRight = document.elementFromPoint(dragElementCoord.right, dragElementCoord.bottom)?.closest(this.cellSelector);
         dragElement.style.display = '';

         let cellBegin, cellEnd, dir;
         if (dragElementCoord.width > dragElementCoord.height) {
            cellBegin = topLeft || bottomLeft;
            cellEnd = topLeft ? topRight : bottomRight;
            dir = 'right';
         } else {
            cellBegin = topLeft || topRight;
            cellEnd = topLeft ? bottomLeft : bottomRight;
            dir = 'down';
         }

         if (!(cellBegin && cellEnd)) {
            isOverArea = false;
            return;
         };
         isOverArea =
            this.droppableEl.contains(cellBegin) &&
            this.droppableEl.contains(cellEnd);

         if (isOverArea) {
            const
               begin = this.cellsHtml.get(cellBegin),
               end = this.cellsHtml.get(cellEnd);

            const currentTrack = this.tracks[dir].filler(begin.i, begin.k, sizeShip);
            canBuild = this.canBuildShip(currentTrack);

            if (canBuild) {
               dragElement.setAttribute('data-can-drop', '');

               currentTrack.forEach(({ i, k }) => {
                  this.area[i][k].cellHtml.setAttribute('data-can-drop', '')
               });
               track = [...currentTrack];
            }
         }
      }
      const cbMouseUp = (dragElement) => {
         if (!isOverArea) {
            dragElement.removeAttribute('style');
            dragElement.removeAttribute('data-drag', '');
            if (dragElement.parentChild !== this.dock) {
               this.dock.append(dragElement);
            }
            return;
         }
         const { i, k } = track[0]
         const { top: topDropEl, left: leftDropEl, height: heightDropEl, width: widthDropEl } = this.droppableEl.getBoundingClientRect();
         const { top: topDragEl, left: leftDragEl } = this.area[i][k].cellHtml.getBoundingClientRect();
         dragElement.style.top = `${(topDragEl - topDropEl) / heightDropEl * 100}%`;
         dragElement.style.left = `${(leftDragEl - leftDropEl) / widthDropEl * 100}%`;
         dragElement.style.position = 'absolute';
         this.droppableEl.appendChild(dragElement);

         if (canBuild) {
            const buildedShip = this.buildShip(track);
            this.ships.set(dragElement, buildedShip);
            this.printPlayArea();
         }
         dragElement.removeAttribute('data-drag', '');
      }
      new Dragable(this.shipSelector, {
         cbMouseDown,
         cbMouseMove,
         cbMouseUp,
      }).init();
   }
}

export default PlayArea;