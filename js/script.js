import PlayArea from './PlayArea.js';
import LogicComp from './LogicComp.js';


const playComp = new PlayArea();
playComp.createPlayArea();
playComp.createShips();
playComp.assignHtml({
   cellSelector: '#comp tbody tr td',
   nameAttrShot: 'data-shot',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
}
);
// playComp.printPlayArea();
playComp.makeShootable();
// console.log('playComp', playComp);

const playUser = new PlayArea();
playUser.createPlayArea();
// playUser.createShips();
playUser.assignHtml({
   cellSelector: '#user [data-square] [data-cell]',
   nameAttrShot: 'data-shot',
   nameAttrShotDied: 'data-shot-died',
   nameAttrShotTarget: 'data-shot-target',
});
playUser.printPlayArea();
playUser.setShips({
   dockSelector: '#user [data-dock]',
   shipSelector: '#user [data-ship]',
   toolbarSelector: '#user [data-toolbar]',
   rotateBtnSelector: '#user [data-rotate]',
   nameAttrVertical: 'data-vertical',
   nameAttrCanDrop: 'data-can-drop',
   nameAttrDrag: 'data-drag',
});
playUser.makeDragableShips('#user [data-square]');

console.log('playUser', playUser);

const logicComp = new LogicComp();



document.querySelector('#btn-auto-place').addEventListener('click', () => {
   playUser.locateShips();
   playUser.finalisePlacement();
   playUser.printPlayArea();
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

// console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();

// todo:

// подсветка тулбара только когда в движении и на поле
// реализовать мой выстрел/ выстрел компа