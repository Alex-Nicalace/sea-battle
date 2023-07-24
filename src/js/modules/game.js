import { randomInteger } from './reused/numbers.js';
import Modal from './reused/modal.js';
import LogicComp from './logicComp.js';
import animate from './reused/animateJS/animate.js';
import PlayArea from './playArea.js';
/**
 * @typedef {'random' | 'user' | 'pc'} FirstShot кто первый сделает выстрел
 */
/**
 * @typedef {'Miss' | 'Hit' | 'Sunk' | 'Victory'} ShotResult результат выстрела по противнику
 */
/**
 * алгоритм игры
 * @class 
 */
class Game {
   /**
    * @param {Object} [param={}]
    * @param {import('./playArea.js').default} [param.playUser] Объект игрового поля пользователя
    * @param {import('./playArea.js').default} [param.playComp] Объект игрового поля ПК
    * @param {Object} [param.statistics] настроки отображения статистики выстрелов и убитых кораблей
    * @param {string} [param.statistics.quantityShots] Селектор элемента куда будет отображаться статистика выстрелов
    * @param {string} [param.statistics.listShips] Селектор контейнера кораблей где будут перечеркиваться убитые корабли
    * @param {string} [param.statistics.shipOfList] Селектор корабля в контейнера кораблей где будут перечеркиваться убитые корабли
    * @param {string} [param.statistics.classNameDeadShip] Название класса убитого корабля в отображении статистики
    * @param {Object} [param.components] селекотры компонентов игрового процесса
    * @param {string} [param.components.containerGame] Селектор контейнера игры 
    * @param {string} [param.components.cell] Селектор ячейки 
    * @param {string} [param.components.btnRnd] Селектор триггера автом. расстановки кораблей
    * @param {string} [param.components.btnReset] Селектор триггера сбросса расстановки кораблей
    * @param {string} [param.components.btnReadyToGame] Селектор триггера начала игры
    * @param {string} [param.components.btnResetGame] Селектор триггера сброса игры
    * @param {string} [param.components.containerPlayers] селектор контенера игровых полей
    * @param {string} [param.components.playerHuman] селектор игрового поля пользователя 
    * @param {string} [param.components.playerPc] селектор игрового поля ПК  
    * @param {string} [param.components.containerDock] селектор контенера дока кораблей и кнопок
    * @param {string} [param.components.nameClassEmtyDock] название класса - пустой док
    * @param {string} [param.components.nameClassShooting] название класса - чей ход-выстрел
    * @param {string} [param.components.nameClassBeginGame] название класса, означающего начало игры
    */
   constructor({
      playUser,
      playComp,
      statistics: {
         quantityShots,
         listShips,
         shipOfList,
         classNameDeadShip,
      },
      components: {
         containerGame,
         cell,
         btnRnd,
         btnReadyToGame,
         btnReset,
         btnResetGame,
         containerPlayers,
         playerHuman,
         playerPc,
         containerDock,
         nameClassEmtyDock,
         nameClassShooting,
         nameClassBeginGame,
      }
   }) {
      /**
       * @type {import('./playArea.js').default}
       */
      this.playUser = playUser;
      /**
       * @type {import('./logicComp.js').default}
       */
      this.logicComp = new LogicComp();
      /**
       * @type {import('./playArea.js').default}
       */
      this.playComp = playComp;
      /**
       * Элемент главный контейнер игры
       * @type {HTMLElement}
       */
      this.containerGameEl = document.querySelector(containerGame);
      /**
       * @type {string} название класса, означающего начало игры
       */
      this.nameClassBeginGame = nameClassBeginGame;
      /**
       * количество mc
       * @type {number}
       */
      this.delay = 0;
      /**
       * @type {number} Количество выстрелов, сделанное ПК
       */
      this.quantityShotsPC = 0;
      /**
       * @type {number} Количество выстрелов, сделанное пользователем
       */
      this.quantityShotsHuman = 0;
      /**
       * элемент, содержащий игровые поля
       * @type {HTMLElement}
       */
      this.containerPlayersEl = document.querySelector(containerPlayers);
      /**
       * элемент игрового поля пользователя
       * @type {HTMLElement}
       */
      this.playerHumanEl = this.containerPlayersEl.querySelector(playerHuman);
      /**
       * элемент игрового поля ПК
       * @type {HTMLElement}
       */
      this.playerPcEl = this.containerPlayersEl.querySelector(playerPc);
      /**
       * элемент куда будет отображаться статистика выстрелов ПК
       * @type {HTMLElement} 
       */
      this.quantityShotsPcEl = this.playerHumanEl.querySelector(quantityShots);
      /**
       * контейнер кораблей где будут перечеркиваться убитые корабли ПК
       * @type {HTMLElement}
       */
      this.listShipsPcEl = this.playerHumanEl.querySelector(listShips);
      /**
       * Селектор корабля в контейнера кораблей где будут перечеркиваться убитые корабли
       * @type {string}
       */
      this.shipOfList = shipOfList;
      /**
       * элемент куда будет отображаться статистика выстрелов пользователя
       * @type {HTMLElement} 
       */
      this.quantityShotsHumanEl = this.playerPcEl.querySelector(quantityShots);
      /**
       * контейнер кораблей где будут перечеркиваться убитые корабли пользователя
       * @type {HTMLElement}
       */
      this.listShipsHumanEl = this.playerPcEl.querySelector(listShips);
      /**
       * Название класса убитого корабля в отображении статистики убитых кораблей
       * @type {string}
       */
      this.classNameDeadShip = classNameDeadShip;
      /**
       * елемент-контенер дока кораблей и кнопок
       * @type {HTMLElement}
       */
      this.containerDockEl = this.containerPlayersEl.querySelector(containerDock);
      /**
       * название класса - чей ход-выстрел
       * @type {string}
       */
      this.nameClassShooting = nameClassShooting;

      this.containerGameEl.classList.add(this.nameClassBeginGame);

      /**
       * @type {HTMLElement}
       */
      const cellElement = document.querySelector(cell);
      if (cellElement) {
         const animDurationStr = getComputedStyle(cellElement).animationDuration;
         // задержка м/у выстрелами исходя из продолжительности анимации Х на коэфициент подходящий
         this.delay = animDurationStr.replace(/(\d+)(s|ms)/gi, (m, p1, p2) => {
            return +p1 * (p2.toLowerCase() === 's' ? 1000 : 1);
         }).split(',').reduce((sum, num) => sum += +num, 0) * 1.5;
      }


      document.querySelector(btnRnd).addEventListener('click', () => {
         this.autoLocateShips();
      });
      /**
       * Кнопка начать игру
       * @type {HTMLButtonElement}
       */
      this.buttonReadyToGame = document.querySelector(btnReadyToGame);
      this.buttonReadyToGame?.addEventListener('click', () => {
         this.beginGame();
      });
      /**
       * Кнопка сбросить расположение кораблей пользователя
       * @type {HTMLButtonElement}
       */
      this.buttonReset = document.querySelector(btnReset);
      this.buttonReset?.addEventListener('click', () => {
         this.resetUser();
      });

      document.querySelector(btnResetGame).addEventListener('click', () => {
         this.resetGame();
      });

      /**
       * Отрабатывает события изменения кораблей на поле
       * @param {CustomEvent} e 
       */
      const onChangearea = (e) => {
         if (!e.target.closest(playerHuman)) return
         const { isAllShipsOnArea, quantityShipsOnArea } = e.detail;
         // заблокировать кнопку если док не пуст
         this.buttonReadyToGame.disabled = !isAllShipsOnArea;
         // заблокировать кнопку если док заполнен
         this.buttonReset.disabled = !!!quantityShipsOnArea;
         // навесить класс пустому доку
         const action = isAllShipsOnArea ? 'add' : 'remove';
         this.containerDockEl.classList[action](nameClassEmtyDock);
      }
      this.containerPlayersEl?.addEventListener('changearea', onChangearea);
   }
   /**
    * Текущая функция выстрела.
    * @type {function(): Promise<string>}
    * @typedef {('shotUser' | 'shotComp')} CurrentShotType
    * @type {CurrentShotType}
    */
   currentShot;
   /**
    * Выстрел пользователя
    * @returns {ShotResult}
    */
   async shotUser() {
      this.playerPcEl.classList.add(this.nameClassShooting);
      const coord = await this.playComp.makeShot();
      // анимация полета снаряда
      await this.makeAnimateShot(this.playUser, this.playComp, this.playUser.getCoordCellOfShipRnd(), coord);
      // получить результат выстрела
      const { shotResult: answer, sizeShip } = this.playComp.takeShot(coord);
      if (answer === 'Miss') {
         this.playerPcEl.classList.remove(this.nameClassShooting);
         this.currentShot = this.shotComp;
      }
      this.updateQuantityShots(this.quantityShotsHumanEl, ++this.quantityShotsHuman);
      this.updateDeadShips(this.listShipsHumanEl, sizeShip);
      return answer
   }
   /**
    * Выстрел ПК
    * @returns {ShotResult}
    */
   async shotComp() {
      this.playerHumanEl.classList.add(this.nameClassShooting);
      const coord = await this.logicComp.makeShot(this.delay);
      // анимация полета снаряда
      await this.makeAnimateShot(this.playComp, this.playUser, this.playUser.getCoordCellOfAreaRnd(), coord);
      const { shotResult: answer, sizeShip } = this.playUser.takeShot(coord);
      this.logicComp.getAnswer(answer);
      if (answer === 'Miss') {
         this.playerHumanEl.classList.remove(this.nameClassShooting);
         this.currentShot = this.shotUser;
      }
      this.updateQuantityShots(this.quantityShotsPcEl, ++this.quantityShotsPC);
      this.updateDeadShips(this.listShipsPcEl, sizeShip);
      return answer;
   }
   /**
    * Анимация полета снаряда с поля противника
    * @param {import('./playArea.js').default} shooter объект стреляющий
    * @param {import('./playArea.js').default} target объект принимающий выстрел
    * @param {import('./area.js').Coord} shotFrom координата ячейки с которой происходит выстрел
    * @param {import('./area.js').Coord} shotTo координата ячейки куда производится выстрел
    */
   async makeAnimateShot(shooter, target, shotFrom, shotTo) {
      // координаты выстрела
      const { i, k } = shotTo;
      // координаты откуда выстрел
      const { i: ii, k: kk } = shotFrom;
      // создать ядро выстрела
      const cannonballEl = document.createElement('div');
      cannonballEl.classList.add('cannonball');
      // Получение координат для полета снаряда
      // координаты откуда выстрел
      const { left: leftFrom, top: topFrom } = PlayArea.getAbsoluteCoordinates(target.containerCell, shooter.area[ii][kk].cellHtml);
      // координаты куда выстрел
      const { left: leftTo, top: topTo } = PlayArea.getAbsoluteCoordinates(target.containerCell, target.area[i][k].cellHtml);
      // положить снаряд в контейнер
      target.containerCell.append(cannonballEl);
      // надо делать анимацию
      cannonballEl.style.top = topFrom;
      cannonballEl.style.left = leftFrom;
      // дистанция полета
      const distanceTop = parseFloat(topTo) - parseFloat(topFrom);
      const distanceLeft = parseFloat(leftTo) - parseFloat(leftFrom);
      const distance = Math.sqrt((parseFloat(topFrom) - parseFloat(topTo)) ** 2 + (parseFloat(leftFrom) - parseFloat(leftTo)) ** 2);
      const transformStyle = getComputedStyle(cannonballEl).transform;
      const draw = (progress) => {
         const currentProgressTop = progress * distanceTop;
         const currentProgressLeft = progress * distanceLeft;
         const scale = 1 + 4 *
            (progress * distance < (distance / 2)
               ? progress
               : 1 - progress);

         cannonballEl.style.top = parseFloat(topFrom) + currentProgressTop + '%';
         cannonballEl.style.left = parseFloat(leftFrom) + currentProgressLeft + '%';
         cannonballEl.style.transform = `scale(${scale}) ${transformStyle}`;
         console.log('scale', scale);
      }
      await animate({ draw, duration: 1000 });
      // удалить прилитевший снаряд
      cannonballEl.remove();
   }
   /**
    * 
    * @param {HTMLElement} element Контейнер кораблей по которым видно статистику
    * @param {number} sizeShip Размер корабля
    */
   updateDeadShips(element, sizeShip) {
      if (!element || !sizeShip || typeof sizeShip !== 'number') return;
      /**
       * @type {HTMLElement}
       */
      const shipEl = ([...element?.children[sizeShip - 1]?.children] || []).find(elem => !elem.classList.contains(this.classNameDeadShip));
      shipEl.innerHTML = `
         <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" hidden>
            <path d="M0,0 L100,100" vector-effect="non-scaling-stroke" stroke="red"
               stroke-width="2" fill="none" />
            <path d="M0,100 L100,0" vector-effect="non-scaling-stroke" stroke="red"
               stroke-width="2" fill="none" />
         </svg>      
      `;
      shipEl.classList.add(this.classNameDeadShip);
   }
   /**
    * Сброс статистики убитых кораблей
    * @param {HTMLElement} element Контейнер кораблей по которым видно статистику
    */
   resetDeadShips(element) {
      const ships = element.querySelectorAll(this.shipOfList);
      for (const ship of ships) {
         ship.classList.remove(this.classNameDeadShip);
         for (const element of ship.children) {
            element.remove();
         }
      }
   }
   /**
    * @param {HTMLElement} element элемент куда будет отображаться статистика выстрелов
    * @param {number} quantity количество выстрелов
    */
   updateQuantityShots(element, quantity) {
      if (!element) return;
      element.innerHTML = quantity;
   }
   /**
    * Запускает игру
    * @param {FirstShot} mode
    */
   async start(mode = 'random') {
      if (this.isGaming) {
         console.log('Игра уже в процессе');
         return
      };
      if (!this.playUser.isReadyPlacement) {
         console.log('Игрок не подтвердил готовность к игре');
         return
      }
      if (!this.playComp.isReadyPlacement) {
         console.log('PC не подтвердил готовность к игре');
         return
      }

      this.containerGameEl.classList.remove(this.nameClassBeginGame);

      // const players = document.querySelector('.sea-battle__players');
      // players.classList.add('sea-battle__players_gaming');

      switch (mode) {
         case 'human':
            this.currentShot = this.shotUser;
            break;
         case 'pc':
            this.currentShot = this.shotComp;
            break;
         default:
            this.currentShot = randomInteger(1, 100) % 2 ? this.shotUser : this.shotComp
            break;
      }
      this.isGaming = true;
      /**
       * @type {import('./playArea.js').ShotResult}
       */
      let answer;
      do {
         answer = await this.currentShot.call(this);
      } while (answer !== 'Victory');
      this.playComp.showShipsOnArea();
      const message = this.currentShot === this.shotUser ? 'Вы победитель!!!' : 'Вы проиграли ...';
      // показать результат с задержкой по анимации выстрела
      setTimeout(() => this.showDialog(message), this.delay);
      ;
   }
   /**
    * Показать диалоговое окно с укаазанным сообщением
    * @param {string} message сообщение
    */
   showDialog(message) {
      /**
       * @type {HTMLDialogElement}
       */
      const modalWinnerEl = document.querySelector('#modal-message');
      Modal.showModal(modalWinnerEl, {
         content: {
            bodyContetnt: message,
         }
      });
   }
   /**
    * Автоматическая расстановка кораблей пользователя
    */
   autoLocateShips() {
      this.playUser.locateShips();
      // playUser.printPlayArea();
   }
   /**
    * Начать игру
    */
   async beginGame() {
      const { done, message } = this.playUser.finalisePlacementShips();
      if (!done) {
         console.log(message);
         return;
      }
      const answer = await this.askWhoGoesFirst();
      this.start(answer);
   }
   /**
    * Запрашивает у пользователя, кто будет делать первый выстрел в игре.
    * @returns {Promise<FirstShot>} Промис, который разрешается значением выбранной опции:
    * - 'user' - если игрок хочет делать первый выстрел.
    * - 'pc' - если компьютер должен делать первый выстрел.
    * - 'random' - если случайным образом должно определиться.
    */
   askWhoGoesFirst() {
      /**
       * @type {HTMLDialogElement}
       */
      const modalEl = document.querySelector('#modal-first-shot');

      /**
       * @type {HTMLDivElement}
       */
      const buttonsContainer = document.querySelector('.first-shot');

      return new Promise((resolve) => {
         /**
          * @type {FirstShot}
          */
         let value;

         /**
          * Обработчик события клика на кнопках.
          * @param {MouseEvent} e Событие клика.
          */
         const onClick = (e) => {
            const button = e?.target.closest('button');
            if (!button) return;
            value = button.value;
         };

         buttonsContainer.addEventListener('click', onClick);

         Modal.showModal(modalEl, {
            afterModalClose: () => {
               buttonsContainer.removeEventListener('click', onClick);
               resolve(value);
            },
         });
      });
   }
   /**
    * сброс расстановки кораблей пользователя
    */
   resetUser() {
      this.playUser.reset();
   }
   /**
    * Сброс игры к началу
    */
   resetGame() {
      this.playUser.reset();

      this.logicComp = new LogicComp();

      this.playComp.reset();
      this.playComp.createShips();
      this.playComp.finalisePlacementShips();

      this.resetDeadShips(this.listShipsHumanEl);
      this.resetDeadShips(this.listShipsPcEl);

      this.quantityShotsHuman = 0;
      this.quantityShotsPC = 0;
      this.updateQuantityShots(this.quantityShotsHumanEl, 0);
      this.updateQuantityShots(this.quantityShotsPcEl, 0);

      this.containerGameEl.classList.add(this.nameClassBeginGame);

      this.isGaming = false;

      console.log('playComp', this.playComp);
      console.log('playUser', this.playUser);
      console.log('game', this);
      console.log('logicComp', this.logicComp);
   }
}

export default Game;