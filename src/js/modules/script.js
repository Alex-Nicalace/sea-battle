import PlayArea from './playArea.js';
import LogicComp from './logicComp.js';
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
// playComp.printPlayArea();
// playComp.makeShootable();
console.log('playComp', playComp);

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

console.log('playUser', playUser);

const logicComp = new LogicComp({
   quantityShotsSelector: '.sea-battle__player_human .shots-state__count',
});


new Game({
   playUser: playUser,
   playComp: playComp,
   logicComp: logicComp,
   btnRndSelector: '#btn-auto-place',
   btnReadyToGameSelector: '#btn-ready',
   cellSelector: '.cell',
   quantityShotsHuman: '.sea-battle__player_pc .shots-state__count',
   listShipsHuman: '.sea-battle__player_pc .list-ships',
   quantityShotsPC: '.sea-battle__player_human .shots-state__count',
   listShipsPC: '.sea-battle__player_human .list-ships',
   classNameDeadShip: 'list-ships__ship_dead',
});