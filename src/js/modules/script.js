import PlayArea from './playArea.js';
import LogicComp from './logicComp.js';
import Game from './game.js';


const playComp = new PlayArea();
playComp.createShips();
playComp.finalisePlacementShips();
playComp.assignHtml({
   containerCellSelector: '.player_pc .grid',
   cellSelector: '.player_pc .grid .cell',
   nameAttrShot: 'data-shot',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
}
);
// playComp.printPlayArea();
// playComp.makeShootable();
console.log('playComp', playComp);

const playUser = new PlayArea();
playUser.assignHtml({
   containerCellSelector: '.player_human .grid',
   cellSelector: '.player_human .grid .cell',
   nameAttrShot: 'data-shot',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
});
playUser.setShips({
   dockSelector: '.dock',
   shipSelector: '.ship',
   toolbarSelector: '.ship .ship__toolbar',
   rotateBtnSelector: '.ship .ship__rotate-btn',
   classNameVertical: 'ship_vertical',
   nameAttrCanDrop: 'data-can-drop',
   nameAttrDrag: 'data-drag',
});
playUser.makeDragableShips();

console.log('playUser', playUser);

const logicComp = new LogicComp();


const game = new Game(playUser, playComp, logicComp);



document.querySelector('#btn-auto-place').addEventListener('click', () => {
   playUser.locateShips();
   playUser.printPlayArea();
});
document.querySelector('#btn-ready').addEventListener('click', () => {
   const { message } = playUser.finalisePlacementShips();
   console.log(message);
});
document.querySelector('#btn-comp-shot').addEventListener('click', () => {
   const coordShot = logicComp.makeShot();
   const answer = playUser.takeShot(coordShot);
   logicComp.getAnswer(answer);
});
document.querySelector('#btn-print').addEventListener('click', () => {
   console.log(logicComp.area);
   console.log(playUser.area);
});
document.querySelector('#btn-start').addEventListener('click', () => {
   game.start('pc');
});


// console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();

// todo:

// подсветка тулбара только когда в движении и на поле