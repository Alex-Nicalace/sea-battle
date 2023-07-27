import PlayArea from './playArea.js';
import Game from './game.js';

const playComp = new PlayArea();
playComp.createShips();
playComp.finalisePlacementShips();
playComp.assignHtml({
   containerCellSelector: '.sea-battle__player_pc .grid',
   cellSelector: '.sea-battle__player_pc .grid .cell',
   nameAttrShot: 'data-shot',
   nameAttrShotPseudo: 'data-shot-pseudo',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
});
playComp.setShips({
   classNameVertical: 'ship_vertical',
   classNameDestroyed: 'ship_destroyed',
});

const playUser = new PlayArea();
playUser.assignHtml({
   containerCellSelector: '.sea-battle__player_human .grid',
   cellSelector: '.sea-battle__player_human .grid .cell',
   nameAttrShot: 'data-shot',
   nameAttrShotPseudo: 'data-shot-pseudo',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
});
playUser.setShips({
   dockSelector: '.dock',
   shipSelector: '.ship',
   toolbarSelector: '.ship .ship__toolbar',
   rotateBtnSelector: '.ship .ship__rotate-btn',
   classNameVertical: 'ship_vertical',
   classNameDestroyed: 'ship_destroyed',
   nameAttrCanDrop: 'data-can-drop',
   nameAttrDrag: 'data-drag',
});
playUser.makeDragableShips();


const game = new Game({
   playUser: playUser,
   playComp: playComp,
   statistics: {
      quantityShots: '.shots-state__count',
      listShips: '.list-ships',
      shipOfList: '.list-ships__ship',
      classNameDeadShip: 'list-ships__ship_dead',
   },
   components: {
      containerGame: '.sea-battle',
      btnRnd: '.sea-battle__btn-rnd',
      btnReadyToGame: '.sea-battle__btn-start',
      btnReset: '.sea-battle__btn-reset',
      btnResetGame: '.sea-battle__btn-reset-game',
      cell: '.cell',
      containerPlayers: '.sea-battle__wrap',
      playerHuman: '.sea-battle__player_human',
      playerPc: '.sea-battle__player_pc',
      containerDock: '.sea-battle__wrap-dock',
      nameClassEmtyDock: 'sea-battle__wrap-dock_empty',
      nameClassShooting: 'sea-battle__player_shooting',
      nameClassBeginGame: 'sea-battle_prep',
   },
   sound: {
      soundBackgroundSelector: '#sound-bg',
      soundBackgroundToggleSelector: '#music',
      soundEffectsToggleSelector: '#sound',
   }
});

console.log('playComp', playComp);
console.log('playUser', playUser);
console.log('game', game);