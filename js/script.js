import PlayArea from './PlayArea.js';

const playComp = new PlayArea;
playComp.createPlayArea();
playComp.createShips();
playComp.assignHtml('#comp tbody tr td');
playComp.printPlayArea();

const playUser = new PlayArea;
playUser.createPlayArea();
playUser.assignHtml('#user [data-square] [data-cell]');
playUser.setShips('#user [data-dock]', '#user [data-ship]');
playUser.makeDragableShips('#user [data-square]');
console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();