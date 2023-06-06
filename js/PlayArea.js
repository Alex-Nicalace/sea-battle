import { randomInteger } from './numbers.js';
import Dragable from './Dragable.js';

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
/**
 * Класс, представляющий объект игрового поля
 * @class
 */
class PlayArea {
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
    * Поле, представляющее двумерный массив объектов.
    * @type {Area}
    */
   area = Array(10);
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
    * Поле содержит значение, кот. должно обозначать пустую ячейку
    */
   emptyCell = null;
   /**
    * Поле содержит значение, кот. должно обозначать ячейки, кот. непосредственно примыкают к кораблю
    */
   borderCell = '.';
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
   constructor() {
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
      if (!this.cellsHtml) return;
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
    * @returns {String} ключ корабля в объекте shipsOnArea
    */
   buildShip(track = []) {
      const aroundTrack = [];
      const sizeShip = track.length;
      const setBorder = (i, k) => {
         const iMin = Math.max(i - 1, 0);
         const iMax = Math.min(i + 1, 9);
         const kMin = Math.max(k - 1, 0);
         const kMax = Math.min(k + 1, 9);
         for (let ii = iMin; ii <= iMax; ii++) {
            for (let kk = kMin; kk <= kMax; kk++) {
               if (this.area[ii][kk].cell !== this.emptyCell || track.find(({ i, k }) => ii === i && kk === k)) continue;
               this.area[ii][kk].cell = this.borderCell;
               // res.push({ i: ii, k: kk })
               aroundTrack.push({ i: ii, k: kk })
            }
         }
      }
      track.forEach(coord => {
         this.area[coord.i][coord.k].cell = sizeShip;
         setBorder(coord.i, coord.k, sizeShip);
      });
      return aroundTrack;
      // return this.addShipsOnArea(track, aroundTrack);
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
      this.isReadyPlacement = true;
   }
   /**
    * сделать поле, спсобным принять клик-выстрел
    */
   makeShootable() {
      this.bindShipsToArrayCells();
      for (const [cellEl, { i, k }] of this.cellsHtml) {
         cellEl.addEventListener('click', e => {
            this.area[i][k].isShooted = true;
            const track = this.area[i][k].track;
            if (track) {
               const coord = track.find(({ i: ii, k: kk }) => i === ii && k === kk);
               coord.isShooted = true;
               const health = track.filter(({ isShooted }) => isShooted).length;
               if (health === track.length) {
                  console.log('убил')
               } else {
                  console.log('попал')
               };
            } else {
               console.log('мимо');
            }
         })
      }
   }
   /**
    * связать ключ объекта корабля с ячейкой
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