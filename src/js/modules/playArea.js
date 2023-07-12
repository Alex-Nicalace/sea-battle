import Dragable from './reused/dragable.js';
import Area from './area.js';
import { PlayAreaError } from './error.js';

/**
 * @typedef {Array<import('./area.js').Coord>} AreaCoord
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
 * @typedef {'Miss' | 'Hit' | 'Sunk' | 'Victory'} ShotResult Результат выстрела
 */

/**
 * @typedef {Object} ResultShot
 * @property {ShotResult} shotResult Результат выстрела
 * @property {number=} sizeShip Размер убитого корабля
 */

/**
 * Класс, представляющий объект игрового поля
 * @class
 */
class PlayArea extends Area {
   /**
    * селектор контейнера клеток игорового поля
    * @type {string | null;}
    */
   cellSelector = null;
   /**
    * @type {Node} HTML-узлел - общий родитель cellsHtml
    */
   containerCell;
   /**
    * Поле, представляющее Map с ключами в виде HTML-узлов и значениями в виде объектов {i, k} - координаты 2-мерного массива.
    * @type {Map<Node, import('./area.js').Coord>}
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
    * вертикальный корабль имеет указанный класс
    * @type {String}
    */
   classNameVerticalShip;
   /**
    * уничтоженный корабль имеет указанный класс
    * @type {String}
    */
   classNameDestroyed;
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
    * @property {import('./area.js').Coord[]} track - координаты занятые кораблем
    * @property {import('./area.js').Coord[]} aroundTrack - координаты буферной зоны
    */
   /**
    * Объект содержит по определенному ключу координаты занятые кораблем и координаты буферной зоны
    * @type {Object.<string, ShipCoords>}
    * @property {string} - уникальный ключ корабля
    * @property {ShipCoords} - координаты корабля
    */
   listShips = {};
   /**
    * @type {Dragable}
    */
   dragable;
   /**
    * @type {Boolean} признак подтвержденного завершения расстановки кораблей
    */
   isReadyPlacement = false;
   /**
    * @type {boolean} признак что все корабли расставлены
    */
   isAllShipsOnArea = false;
   /**
    * @type {number} количество уничтоженных кораблей собственных
    */
   numberKillsShips = 0;
   /**
    * Проверить возможность размещения корабля по заданным координатам
    * @param {import('./area.js').Coord[]} track массив координат корабля
    * @returns {Boolean}
    */
   canBuildShip(track = []) {
      return !!track.length && !track.some(({ i, k }) => this.area[i][k].cell != this.emptyCell);
   }
   /**
    * создание кораблей на поле в автаматическом режиме
    */
   createShips() {
      for (const ship of this.schemeShips) {
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
      * @param {String} [options.containerCellSelector] селектор HTML-узла, кот. является контейнером ячеек
      * @param {String} [options.cellSelector] селектор HTML-узла, кот. будет считаться ячейкой
      * @param {String} [options.nameAttrShot] - атрибут для ячейки по которой был выстрел
      * @param {String} [options.nameAttrShotPseudo] - атрибут для ячейки по которой был псевдо выстрел
      * @param {String} [options.nameAttrShotTarget] - атрибут для ячейки по которой было попадание
      * @param {String} [options.nameAttrShotDied] - атрибут для ячейки входит в состав убитого корабля
      * @returns 
      */
   assignHtml({ containerCellSelector, cellSelector, nameAttrShot, nameAttrShotTarget, nameAttrShotDied, nameAttrShotPseudo }) {
      this.containerCell = document.querySelector(containerCellSelector);
      this.cellSelector = cellSelector;
      /**
       * атрибут для ячейки по которой был выстрел
       */
      this.nameAttrShot = nameAttrShot;
      /**
       * атрибут для ячейки по которой был псевдо выстрел
       */
      this.nameAttrShotPseudo = nameAttrShotPseudo;
      /**
       * атрибут для ячейки по которой было попадание
       */
      this.nameAttrShotTarget = nameAttrShotTarget;
      /**
       * атрибут для ячейки входит в состав убитого корабля
       */
      this.nameAttrShotDied = nameAttrShotDied;

      const elements = [...document.querySelectorAll(this.cellSelector)];
      const sizeSideArea = this.area.length;
      if (elements.length < Math.pow(sizeSideArea, 2)) {
         throw new PlayAreaError('The number of node elements does not match the size of the grid');
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
   * @param {string} [options.classNameVertical] - вертикальный корабль имеет указанный класс
   * @param {string} [options.classNameDestroyed] - уничтоженный корабль имеет указанный класс
   * @param {string} [options.nameAttrCanDrop] - атрибут указывающий на возможность размещения корабля
   * @param {string} [options.nameAttrDrag] - атрибут - признак перемещения крабля
   */
   setShips({ dockSelector, shipSelector, rotateBtnSelector, toolbarSelector, classNameVertical, nameAttrCanDrop, nameAttrDrag, classNameDestroyed, } = {}) {
      this.shipSelector = shipSelector;
      this.classNameVerticalShip = classNameVertical;
      this.classNameDestroyed = classNameDestroyed;
      this.nameAttrCanDrop = nameAttrCanDrop;
      this.nameAttrDrag = nameAttrDrag;

      this.dock = document.querySelector(dockSelector);

      /**
       * @type {HTMLElement | undefined}
       */
      const ships = this.dock?.querySelectorAll(shipSelector);
      if (ships) {
         for (const ship of ships) {
            this.shipsNodes.set(ship, null)
         }
      }

      this.toolbarSelector = toolbarSelector;
      const rotateShip = (e) => {
         if (this.isReadyPlacement) return;
         const shipEl = e.target.closest(this.shipSelector);
         if (!shipEl) return;
         shipEl.classList.toggle(this.classNameVerticalShip);
         this.clearCellsUnderShip(shipEl);
         shipEl.removeAttribute(this.nameAttrCanDrop);

         const { cellBegin, dir } = this.getCellsUnderShip(shipEl);
         const
            cellBeginCoord = this.cellsHtml.get(cellBegin),
            sizeShip = +shipEl.dataset.ship,
            track = this.tracks[dir].filler(cellBeginCoord.i, cellBeginCoord.k, sizeShip);
         if (!this.canBuildShip(track)) {
            // shipEl.classList.add('[data-drag]');
            shipEl.setAttribute(this.nameAttrDrag, '')
            return;
         }
         const { i, k } = track[0];

         this.positioningElInArea(i, k, shipEl);

         const aroundTrack = this.buildShip(track);
         const keyShip = this.addListShips(track, aroundTrack);
         this.shipsNodes.set(shipEl, keyShip);
         // this.printPlayArea();
      }
      /**
       * @type {HTMLElement | undefined}
       */
      const rotateBtns = this.dock?.querySelectorAll(rotateBtnSelector);
      if (rotateBtns) {
         for (const btn of rotateBtns) {
            btn.addEventListener('click', rotateShip);
         }
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
       * @type {import('./area.js').Coord[]}
       */
      const coordShip = [...this.listShips[key].track, ...this.listShips[key].aroundTrack];
      if (coordShip.length) {
         coordShip.forEach(({ i, k }) => {
            this.area[i][k].cell = this.emptyCell;
            delete this.area[i][k].dataShip;
         });
         this.removeDekorCells(this.listShips[key].track);
         delete this.listShips[key];
         this.setIsAllShipsOnArea();
         this.shipsNodes.set(shipEl, null);
         // this.printPlayArea();
      }
      // обновить буферные зоны кораблей, т.к. циклы выше почистил
      this.refreshBufferZone();
   }
   /**
    * 
    * @param {Array<import('./area.js').Coord>} track 
    */
   removeDekorCells(track) {
      track.forEach(({ i, k }) => {
         this.area[i][k].cellHtml.removeAttribute(this.nameAttrCanDrop, '')
      });
   }
   /**
    * 
    * @param {Array<import('./area.js').Coord>} track 
    */
   setDekorCells(track) {
      track.forEach(({ i, k }) => {
         this.area[i][k].cellHtml.setAttribute(this.nameAttrCanDrop, '')
      });
   }
   /**
    * Уже имеющиеся в классе корабли делает перетаскиваемыми
    */
   makeDragableShips() {
      if (!this.containerCell) return new PlayAreaError('The containerCell property does not exist');

      this.containerCell.style.position = 'relative';
      let
         isOverArea,
         track = [],
         canBuild,
         sizeShip,
         prevCellBegin;
      const cbMouseDown = (dragElement, e) => {
         // если клик просходит по тулбару корабля, то не отрабатывать этот клик
         if (e.target.closest(this.toolbarSelector)) return true;

         sizeShip = +dragElement.dataset.ship;
         dragElement.setAttribute(this.nameAttrDrag, '');
         this.clearCellsUnderShip(dragElement);
      }
      const cbMouseMove = (dragElement) => {
         const { cellBegin, cellEnd, dir } = this.getCellsUnderShip(dragElement);
         if (prevCellBegin === cellBegin) return;
         prevCellBegin = cellBegin;

         dragElement.removeAttribute(this.nameAttrCanDrop);
         this.removeDekorCells(track);

         isOverArea =
            this.containerCell.contains(cellBegin) &&
            this.containerCell.contains(cellEnd);

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
            dragElement.removeAttribute(this.nameAttrDrag);
            const sizeShip = dragElement.dataset.ship - 1;
            if (!this.dock.contains(dragElement)) {
               for (const portNode of this.dock.children[sizeShip].children) {
                  if (!portNode.querySelector(this.shipSelector)) {
                     portNode.append(dragElement);
                     break;
                  }
               }
               dragElement.classList.remove(this.classNameVerticalShip);
            }
            resetVariable();
            return;
         }
         const { i, k } = track[0];

         this.positioningElInArea(i, k, dragElement);

         const aroundTrack = this.buildShip(track);
         const keyShip = this.addListShips(track, aroundTrack);
         this.shipsNodes.set(dragElement, keyShip);
         // this.printPlayArea();
         dragElement.removeAttribute(this.nameAttrDrag);
         dragElement.removeAttribute(this.nameAttrCanDrop);
         this.removeDekorCells(track);
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
    * 
    * @param {Node} dragElement перетаскиваемый корабль
    * @returns {Object}
    * @property {Element} cellBegin
    * @property {Element} cellEnd
    * @property {string} dir
    */
   getCellsUnderShip(dragElement) {
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
      return { cellBegin, cellEnd, dir }
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
    * @param {Array<import('./area.js').Coord>} track координаты корабля
    * @param {Array<import('./area.js').Coord>} aroundTrack координаты буфера вокруг корабля
    * @returns {String} ключ корабля в объекте listShips
    */
   addListShips(track, aroundTrack) {
      if (!this.addListShips.counter) {
         this.addListShips.counter = 0;
      }
      const key = `${track.length}_${++this.addListShips.counter}`;
      this.listShips[key] = {};
      this.listShips[key].track = [...track];
      this.listShips[key].aroundTrack = [...aroundTrack];
      this.setIsAllShipsOnArea();
      return key;
   }
   /**
    * проверяет все ли корабли на поле и устанавливает соответсвующему свойству логическое значение
    */
   setIsAllShipsOnArea() {
      const newValue = Object.keys(this.listShips).length === this.totalShips;
      if (newValue === this.isAllShipsOnArea) return;
      this.isAllShipsOnArea = newValue;
      if (this.containerCell) {
         const event = new CustomEvent('playarea', {
            bubbles: true,
            detail: { isAllShipsOnArea: this.isAllShipsOnArea }
         });
         this.containerCell.dispatchEvent(event);
      }
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

         const { coord: { i, k }, isVertical } = this.minCell(track);

         if (isVertical) shipNode.classList.add(this.classNameVerticalShip);

         this.positioningElInArea(i, k, shipNode);

         this.shipsNodes.set(shipNode, listShipsKey);
      }
   }
   /**
    * 
    * @typedef {Object} result Информация о минимальной ячейке
    * @property {import('./area.js').Coord} result.coord
    * @property {boolean} result.isVertical Признак, что корабль расположен вертикально
    */
   /**
    * Находит минимальную ячейку на треке и возвращает информацию о ней.
    * @param {import('./area.js').Coord[]} track 
    * @returns {result} 
    *   - coord: {Coord} Объект с координатами минимальной ячейки (i, k).
    *   - isVertical: {boolean} Флаг, указывающий, является ли трек вертикальным.
    */
   minCell(track) {
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
      return {
         coord: { i: minI, k: minK },
         isVertical: minI < maxI,
      }
   }
   /**
    * позиционирование корабля по заданным координатам
    * @param {Number} i строка
    * @param {Number} k столбец
    * @param {Node} element HTML-узел
    */
   positioningElInArea(i, k, element) {
      const { top: topDropEl, left: leftDropEl, height: heightDropEl, width: widthDropEl } = this.containerCell.getBoundingClientRect();
      const { top: topDragEl, left: leftDragEl } = this.area[i][k].cellHtml.getBoundingClientRect();
      element.style.top = `${(topDragEl - topDropEl) / heightDropEl * 100}%`;
      element.style.left = `${(leftDragEl - leftDropEl) / widthDropEl * 100}%`;
      element.style.position = 'absolute';
      this.containerCell.appendChild(element);
   }
   /**
    * завершить расстановку кораблей
    * @returns {{done: boolean, message?: string}}
    */
   finalisePlacementShips() {
      const isCompleate = this.totalShips === Object.keys(this.listShips).length;
      if (!isCompleate) return { done: false, message: 'Необходимо расставить все корабли на поле' };
      this.offDragable();
      this.bindShipsToArrayCells();
      this.isReadyPlacement = true;
      return { done: true };
   }
   /**
   * сделать поле, спсобным принять клик-выстрел
   */
   makeShootable() {
      for (const [cellEl, coord] of this.cellsHtml) {
         cellEl.addEventListener('click', () => this.takeShot(coord))
      }
   }
   /**
    * переводит игровое поле в ожижание клика-выстрела по полю
    * возвращает координаты выстрела
    * @returns 
    */
   makeShot() {
      return new Promise((res) => {
         const onClick = e => {
            const cellEl = e?.target?.closest(this.cellSelector);
            const coord = this.cellsHtml.get(cellEl);
            if (!coord) return new PlayAreaError('The HTML node has no coordinates');
            // если за ячейкой есть атрибут выстрела то не засчитывать этот выстрел
            if (cellEl.hasAttribute(this.nameAttrShot)) return;
            this.containerCell.removeEventListener('click', onClick);
            res(coord);
         }
         this.containerCell.addEventListener('click', onClick)
      })
   }
   /**
    * По указанной координате получить ключ корабля в списке listShips
    * @param {import('./area.js').Coord} coord
    * @returns {string} Ключ
    */
   getKeyShipFromListShips({ i, k }) {
      return Object.keys(this.listShips).find(key => this.listShips[key] == this.area[i][k].dataShip);
   }
   /**
    * 
    * @param {string} keyListShips Ключ объекта listShips
    * @returns {HTMLElement} HTML-узел корабля
    */
   getShipElementFromShipsNodes(keyListShips) {
      /**
       * @type {HTMLElement}
       */
      let shipHtml;
      for (const [HTML, key] of this.shipsNodes) {
         if (key === keyListShips) {
            shipHtml = HTML;
            break;
         }
      }
      return shipHtml;
   }
   /**
    * 
    * @param {import('./area.js').Coord} coord координаты выстрела
    * @returns {ResultShot} результат выстрела
    */
   takeShot({ i, k }) {
      if (!this.isReadyPlacement) {
         throw new PlayAreaError('The placement of ships has not been completed');
      }
      this.area[i][k].isShooted = true;
      const cellHtml = this.area[i][k].cellHtml
      cellHtml.setAttribute(this.nameAttrShot, '')

      if (!this.area[i][k].dataShip) {
         // выстрел мимо
         console.log('мимо');
         return { shotResult: 'Miss' };
      }

      const keyListShips = this.getKeyShipFromListShips({ i, k });
      const shipHtml = this.getShipElementFromShipsNodes(keyListShips);

      const { track, aroundTrack } = this.area[i][k].dataShip;
      // попадание в цель
      const coord = track.find(({ i: ii, k: kk }) => i === ii && k === kk);
      coord.isShooted = true;
      cellHtml.setAttribute(this.nameAttrShotTarget, '');
      const health = track.filter(({ isShooted }) => isShooted).length;

      const { coord: start, isVertical } = this.minCell(track);
      const idxCell = i + k - start.i - start.k;
      if (shipHtml) {
         [...shipHtml.querySelectorAll(this.cellSelector)][idxCell].setAttribute(this.nameAttrShotTarget, '');
      }
      if (health === track.length) {
         // попадание и убил
         console.log('убил');
         ++this.numberKillsShips;
         track.map(({ i, k }) => this.area[i][k].cellHtml).forEach(elCell => elCell.setAttribute(this.nameAttrShotDied, ''));
         aroundTrack.map(({ i, k }) => this.area[i][k].cellHtml).forEach(elCell => {
            if (!elCell.hasAttribute(this.nameAttrShot))
               elCell.setAttribute(this.nameAttrShotPseudo, '');
         });
         shipHtml?.classList.add(this.classNameDestroyed);

         // если нет кораблей на поле, то это поле противника и после попадания необходимо его показать, а прежде создать
         if (this.shipsNodes.size !== this.totalShips) {
            const shipDied = this.createShipElement(health);
            shipDied.classList.add(this.classNameDestroyed);
            this.shipsNodes.set(shipDied, keyListShips);
            if (isVertical) shipDied.classList.add(this.classNameVerticalShip);
            this.positioningElInArea(start.i, start.k, shipDied);
            this.containerCell.append(shipDied);
         }

         if (this.numberKillsShips === this.totalShips) {
            return { shotResult: 'Victory', sizeShip: health };
         };
         return { shotResult: 'Sunk', sizeShip: health };
      }
      // попадание и ранение
      console.log('попал');
      return { shotResult: 'Hit' };

   }
   /**
    * В конце игры показать оставшиеся уцелевшие корабли ПК
    */
   showShipsOnArea() {
      if (this.shipsNodes.size === this.totalShips) return;
      // ключи уцелевших кораблей из
      const shipKeys = Object.keys(this.listShips)
         .filter(key => this.listShips[key].track.some(({ isShooted }) => !isShooted));
      // перебираю ключи уцелевших кораблей и создаю их на поле
      shipKeys.forEach(key => {
         const track = this.listShips[key].track;
         const { coord: { i, k }, isVertical } = this.minCell(track);
         const sizeShip = track.length;
         const shipEl = this.createShipElement(sizeShip);
         this.shipsNodes.set(shipEl, key);
         if (isVertical) shipEl.classList.add(this.classNameVerticalShip);
         this.positioningElInArea(i, k, shipEl);
         this.containerCell.append(shipEl);
      })
   }
   /**
    * связать ключ списка (объекта) кораблей с ячейками корабля
    * т.о. по координатам ячейки можно выйти на весь корабль
    */
   bindShipsToArrayCells() {
      Object.entries(this.listShips).forEach(([key, { track }]) => {
         track.forEach(({ i, k }) => {
            this.area[i][k].dataShip = this.listShips[key];
         })
      });
   }
   /**
    * Создает элемент корабля и возвращает его.
    *
    * @param {number} size - Размер корабля.
    * @returns {HTMLElement} Элемент корабля.
    */
   createShipElement(size) {
      const shipEl = document.createElement('div');
      shipEl.classList.add('ship');
      shipEl.dataset.ship = size;
      shipEl.insertAdjacentHTML('afterbegin', `${'<div class="cell"></div>'.repeat(size)} <img class="ship__img" src="img/ships/${size}_h.png" alt="image of ship">`);
      return shipEl;
   }
}

export default PlayArea;