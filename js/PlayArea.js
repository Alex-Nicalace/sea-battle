import Dragable from './Dragable.js';
import Grid from './Grid.js';

/**
 * Объект, представляющий координату в массиве
 * @typedef {Object} Coord
 * @property {number} i - строка массива.
 * @property {number} k - столбец массива.
 * @property {boolean} isShooted - был ли выстрел по этой ячейке.
 */

/**
 * ячейка игрового поля
 * @typedef {Object} AreaItem
 * @property {Any} cell - значение ячейки в массиве
 * @property {Node} cellHtml - узел HTML соответсвующий ячейке массива
 * @property {Coord[]} track - координаты всего корабля
 * @property {boolean} isShooted - был ли выстрел по этой ячейке.
 */

/**
 * @typedef {Array<Array<AreaItem>>} Area
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
 * @typedef {'Miss' | 'Hit' | 'Sunk'} ShotResult
 */

/**
 * Класс, представляющий объект игрового поля
 * @class
 */
class PlayArea extends Grid {
   /**
   * HTML-узел, в который можно сбрасывать корабль
   * @type {Node}
   */
   droppableEl;
   /**
    * селектор клетки игорового поля
    * @type {string | null;}
    */
   cellSelector = null;

   /**
    * Поле, представляющее Map с ключами в виде HTML-узлов и значениями в виде объектов {i, k} - координаты 2-мерного массива.
    * @type {Map<Node, Coord>}
    */
   cellsHtml;
   /**
    * @type {Tracks}
    */
   tracks = {
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
   * @type {String} селектор корабля
   */
   shipSelector;
   /**
   * Map структура, где ключ - HTML-узел крабля, значение - ключ объекта listShips
   * @type {Map<Node, String>}
   */
   shipsNodes = new Map;
   /**
    * вертикальный корабль имеет указанный атрибут
    * @type {String}
    */
   nameAttrVertical;
   /**
    * атрибут указывающий на возможность размещения корабля
    * @type {String}
    */
   nameAttrCanDrop;
   /**
    * атрибут - признак перемещения крабля
    * @type {String}
    */
   nameAttrDrag;
   /**
   * @type {Node} HTML-узел содержащий корабли
   */
   dock;
   /**
    * @type {String} селектор панели настроек корабля
    */
   toolbarSelector;
   /**
    * Тип для координат корабля и буферной зоны
    * @typedef {Object} ShipCoords
    * @property {Coord[]} track - координаты занятые кораблем
    * @property {Coord[]} aroundTrack - координаты буферной зоны
    */
   /**
    * Объект содержит по определенному ключу координаты занятые кораблем и координаты буферной зоны
    * @type {Object.<string, ShipCoords>}
    */
   listShips = {};
   /**
    * @type {Dragable}
    */
   dragable;
   /**
    * @type {Boolean} признак завершения расстановки кораблей
    */
   isReadyPlacement = false;



   /**
    * Проверить возможность размещения корабля по заданным координатам
    * @param {Coord[]} track массив координат корабля
    * @returns {Boolean}
    */
   canBuildShip(track = []) {
      return !!track.length && !track.some(coord => this.area[coord.i][coord.k].cell != this.emptyCell);
   }
   /**
    * создание кораблей на поле в автаматическом режиме
    */
   createShips() {
      const setShips = {
         1: 4,
         2: 3,
         3: 2,
         4: 1,
         // символьный метод, возвращающий итератор
         [Symbol.iterator]() {
            const entries = Object.entries(this);
            // метод должен вернуть объект с методом next() 
            return {
               currentI: 0,
               lastI: entries.length,
               currentK: 0,
               entries,
               // в этом методе реализуется логика итерации
               next() {
                  if (this.currentI < this.lastI) {
                     const [sizeShip, quantity] = this.entries[this.currentI];
                     if (++this.currentK > quantity) {
                        this.currentI++;
                        this.currentK = 0;
                        return this.next();
                     }
                     return {
                        done: false,
                        value: sizeShip,
                     }
                  } else
                     return { done: true }
               }
            }
         }
      }
      for (const ship of setShips) {
         // console.log('iterator', iterator);
         this.createShip(+ship)
      }
      /* for (let i = 4; i > 0; i--) {
         for (let k = 1; k <= 5 - i; k++) {
            this.createShip(i)
         }
      } */
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
         const result = this.getRandomEmptyPoint();
         i = result.i;
         k = result.k;
         let excludeDirect = [];
         direct = this.getRandomDirect(excludeDirect);
         while (!canBuildShip && direct) {
            track = this.tracks[direct].filler(i, k, len);
            excludeDirect.push(direct);
            canBuildShip = this.canBuildShip(track);
            direct = this.getRandomDirect(excludeDirect);
         }
      } while (!canBuildShip);

      // this.buildShip(track);
      const aroundTrack = this.buildShip(track);
      this.addListShips(track, aroundTrack);

   }
   /**
      * Ассоциация ячеек 2-мерного массива (игрового поля) с HTML-узлами, представляющие собой ячейку
      * @param {Object} [options={}] - Объект с параметрами.
      * @param {String} [options.cellSelector] селектор HTML-узла, кот. будет считаться ячейкой
      * @param {String} [options.nameAttrShot] - атрибут для ячейки по которой был выстрел
      * @param {String} [options.nameAttrShotTarget] - атрибут для ячейки по которой было попадание
      * @param {String} [options.nameAttrShotDied] - атрибут для ячейки входит в состав убитого корабля
      * @returns 
      */
   assignHtml({ cellSelector, nameAttrShot, nameAttrShotTarget, nameAttrShotDied }) {
      this.cellSelector = cellSelector;
      this.nameAttrShot = nameAttrShot;
      this.nameAttrShotTarget = nameAttrShotTarget;
      this.nameAttrShotDied = nameAttrShotDied;

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
    * Указаней короблей в HTML верстке и сопутсвующих настроек для кораблей
   * @param {Object} [options={}] - Объект с параметрами.
   * @param {string} [options.dockSelector] - селектор дока (гаража) кораблей
   * @param {string} [options.shipSelector] - селектор кораблей
   * @param {string} [options.rotateBtnSelector] - селектор кнопки повората корабля
   * @param {string} [options.toolbarSelector] - селектор панели настроек корабля
   * @param {string} [options.nameAttrVertical] - вертикальный корабль имеет указанный атрибут
   * @param {string} [options.nameAttrCanDrop] - атрибут указывающий на возможность размещения корабля
   * @param {string} [options.nameAttrDrag] - атрибут - признак перемещения крабля
   */
   setShips({ dockSelector, shipSelector, rotateBtnSelector, toolbarSelector, nameAttrVertical, nameAttrCanDrop, nameAttrDrag } = {}) {
      this.shipSelector = shipSelector;
      this.nameAttrVertical = nameAttrVertical;
      this.nameAttrCanDrop = nameAttrCanDrop;
      this.nameAttrDrag = nameAttrDrag;
      const ships = document.querySelectorAll(shipSelector);
      for (const ship of ships) {
         this.shipsNodes.set(ship, null)
      }
      this.dock = document.querySelector(dockSelector);
      this.toolbarSelector = toolbarSelector;
      const rotateShip = (e) => {
         if (this.isReadyPlacement) return;
         const shipEl = e.target.closest(this.shipSelector);
         if (!shipEl) return;
         if (shipEl.hasAttribute(this.nameAttrVertical)) {
            shipEl.removeAttribute(this.nameAttrVertical, '');
         } else {
            shipEl.setAttribute(this.nameAttrVertical, '');
         }
         this.clearCellsUnderShip(shipEl);
         shipEl.removeAttribute(this.nameAttrCanDrop);
      }
      const rotateBtns = document.querySelectorAll(rotateBtnSelector);
      for (const btn of rotateBtns) {
         btn.addEventListener('click', rotateShip);
      }

   }
   /**
    * Очищает поле от корабля
    * @param {Node} shipEl 
    */
   clearCellsUnderShip(shipEl) {
      const key = this.shipsNodes.get(shipEl);
      if (!key) return;
      /**
       * массив координат корабаля и буферной зоны
       * @type {Coord[]}
       */
      const coordShip = [...this.listShips[key].track, ...this.listShips[key].aroundTrack];
      if (coordShip.length) {
         coordShip.forEach(({ i, k }) => {
            this.area[i][k].cell = this.emptyCell;
            this.area[i][k].track = [];
         });
         this.removeDekorCells(this.listShips[key].track);
         delete this.listShips[key];
         this.shipsNodes.set(shipEl, null);
         this.printPlayArea();
      }
      // обновить буферные зоны кораблей, т.к. циклы выше почистил
      this.refreshBufferZone();
   }
   /**
    * 
    * @param {Array<Coord>} track 
    */
   removeDekorCells(track) {
      track.forEach(({ i, k }) => {
         this.area[i][k].cellHtml.removeAttribute(this.nameAttrCanDrop, '')
      });
   }
   /**
    * 
    * @param {Array<Coord>} track 
    */
   setDekorCells(track) {
      track.forEach(({ i, k }) => {
         this.area[i][k].cellHtml.setAttribute(this.nameAttrCanDrop, '')
      });
   }
   /**
    * Уже имеющиеся в классе корабли делает перетаскиваемыми
    * @param {String} droppableSelector селектор игорвого поля, куда можно сбрасывать корабли
    */
   makeDragableShips(droppableSelector) {
      this.droppableEl = document.querySelector(droppableSelector);
      this.droppableEl.style.position = 'relative';
      let
         isOverArea,
         track = [],
         canBuild,
         sizeShip,
         prevCellBegin;
      const cbMouseDown = (e) => {
         // если клик просходит по тулбару корабля, то не отрабатывать этот клик
         if (e.target.closest(this.toolbarSelector)) return true;

         const dragElement = e && e.currentTarget;
         sizeShip = +dragElement.dataset.ship;
         dragElement.setAttribute(this.nameAttrDrag, '');
         this.clearCellsUnderShip(dragElement);
      }
      const cbMouseMove = (dragElement) => {
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

         if (prevCellBegin === cellBegin) return;
         prevCellBegin = cellBegin;

         dragElement.removeAttribute(this.nameAttrCanDrop);
         this.removeDekorCells(track);

         isOverArea =
            this.droppableEl.contains(cellBegin) &&
            this.droppableEl.contains(cellEnd);

         const
            cellBeginCoord = this.cellsHtml.get(cellBegin),
            cellEndCoord = this.cellsHtml.get(cellEnd);
         canBuild = !!(cellBeginCoord && cellEndCoord);
         if (canBuild) {
            const currentTrack = this.tracks[dir].filler(cellBeginCoord.i, cellBeginCoord.k, sizeShip);
            canBuild = this.canBuildShip(currentTrack);

            if (canBuild) {
               dragElement.setAttribute(this.nameAttrCanDrop, '');
               track = [...currentTrack];
               this.setDekorCells(track);
            }
         }
      }
      const cbMouseUp = (dragElement) => {
         if (!canBuild) {
            dragElement.removeAttribute('style');
            dragElement.removeAttribute(this.nameAttrDrag, '');
            if (dragElement.parentElement !== this.dock) {
               this.dock.append(dragElement);
            }
            resetVariable();
            return;
         }
         const { i, k } = track[0];

         this.positioningElInArea(i, k, dragElement);

         const aroundTrack = this.buildShip(track);
         const keyShip = this.addListShips(track, aroundTrack);
         this.shipsNodes.set(dragElement, keyShip);
         this.printPlayArea();
         dragElement.removeAttribute(this.nameAttrDrag);
         dragElement.removeAttribute(this.nameAttrCanDrop);
         resetVariable();
      }
      this.dragable = new Dragable(this.shipSelector, {
         cbMouseDown,
         cbMouseMove,
         cbMouseUp,
      });
      this.dragable.on();
      function resetVariable() {
         track = [];
         isOverArea = canBuild = sizeShip = prevCellBegin = null;
      }
   }
   /**
    * отключить Drag'n drop
    * @returns 
    */
   offDragable() {
      if (!this.dragable) return;
      this.dragable.off();
   }
   /**
    * включить Drag'n drop
    * @returns 
    */
   onDragable() {
      if (!this.dragable) return;
      this.dragable.on();
   }
   /**
    * 
    * @param {Array<Coord>} track координаты корабля
    * @param {Array<Coord>} aroundTrack координаты буфера вокруг корабля
    * @returns {String} ключ корабля в объекте shipsOnArea
    */
   addListShips(track, aroundTrack) {
      if (!this.addListShips.counter) {
         this.addListShips.counter = 0;
      }
      const key = `${track.length}_${++this.addListShips.counter}`;
      this.listShips[key] = {};
      this.listShips[key].track = [...track];
      this.listShips[key].aroundTrack = [...aroundTrack];
      return key;
   }
   /**
    * обновить буферную зону возле кораблей.
    * когда корабль стоит возле корабля, то после перетаскивания близлежащего корабля удаляется и буферная зона
    */
   refreshBufferZone() {
      Object.values(this.listShips).forEach(({ track, aroundTrack }) => aroundTrack = [...this.buildShip(track)]);
   }
   /**
    * Расстановка ранее указанных Node-кораблей в автоматическом режиме по полю
    */
   locateShips() {
      for (const [shipNode, value] of this.shipsNodes) {
         const sizeShip = +shipNode.dataset.ship;
         if (!value) {
            this.createShip(sizeShip);
         };

         const listShipsItem = Object.entries(this.listShips).find(([key, { track }]) => track.length == sizeShip && ![...this.shipsNodes.values()].includes(key));
         // если не существует, вероятно этот кораблб уже на поле
         if (!listShipsItem) continue;

         const [listShipsKey, { track }] = listShipsItem;
         // найти стартовую ячеку корабля
         let minI = Infinity;
         let minK = Infinity;
         let maxI = -Infinity;
         let maxK = -Infinity;
         track.forEach(({ i, k }) => {
            if (minI > i) minI = i;
            if (minK > k) minK = k;
            if (maxI < i) maxI = i;
            if (maxK < k) maxK = k;
         });

         if (minI < maxI) shipNode.setAttribute(this.nameAttrVertical, '');

         this.positioningElInArea(minI, minK, shipNode);

         this.shipsNodes.set(shipNode, listShipsKey);
      }
   }
   /**
    * 
    * @param {Number} i строка
    * @param {Number} k столбец
    * @param {Node} element HTML-узел
    */
   positioningElInArea(i, k, element) {
      const { top: topDropEl, left: leftDropEl, height: heightDropEl, width: widthDropEl } = this.droppableEl.getBoundingClientRect();
      const { top: topDragEl, left: leftDragEl } = this.area[i][k].cellHtml.getBoundingClientRect();
      element.style.top = `${(topDragEl - topDropEl) / heightDropEl * 100}%`;
      element.style.left = `${(leftDragEl - leftDropEl) / widthDropEl * 100}%`;
      element.style.position = 'absolute';
      this.droppableEl.appendChild(element);
   }
   /**
    * завершить расстановку кораблей
    */
   finalisePlacement() {
      const isCompleate = ![...this.shipsNodes.values()].some(item => !item);
      console.log('isNotCompleate', isCompleate);
      if (!isCompleate) return;
      this.offDragable();
      this.bindShipsToArrayCells();
      this.isReadyPlacement = true;
   }
   /**
      * сделать поле, спсобным принять клик-выстрел
      */
   makeShootable() {
      this.bindShipsToArrayCells();
      for (const [cellEl, coord] of this.cellsHtml) {
         cellEl.addEventListener('click', () => this.takeShot(coord))
      }
   }
   /**
    * 
    * @param {Coord} coord координаты выстрела
    * @returns {ShotResult} результат выстрела
    */
   takeShot({ i, k }) {
      this.area[i][k].isShooted = true;
      const cellHtml = this.area[i][k].cellHtml
      cellHtml.setAttribute(this.nameAttrShot, '')
      const track = this.area[i][k].track;
      if (!track?.length) {
         // выстрел мимо
         console.log('мимо');
         return 'Miss';
      }
      // попадание в цель
      const coord = track.find(({ i: ii, k: kk }) => i === ii && k === kk);
      coord.isShooted = true;
      cellHtml.setAttribute(this.nameAttrShotTarget, '');
      const health = track.filter(({ isShooted }) => isShooted).length;
      if (health === track.length) {
         // попадание и убил
         console.log('убил');
         track.map(({ i, k }) => this.area[i][k].cellHtml).forEach(elCell => elCell.setAttribute(this.nameAttrShotDied, ''));
         return 'Sunk';
      }
      // попадание и ранение
      console.log('попал');
      return 'Hit';

   }
   /**
    * связать ключ списка (объекта) кораблей с ячейками корабля
    * т.о. по координатам ячейки можно выйти на весь корабль
    */
   bindShipsToArrayCells() {
      Object.entries(this.listShips).forEach(([key, { track }]) => {
         track.forEach(({ i, k }) => {
            this.area[i][k].track = this.listShips[key].track;
         })
      });
   }
}

export default PlayArea;