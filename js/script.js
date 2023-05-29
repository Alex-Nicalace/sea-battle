import PlayArea from './PlayArea.js';

const playComp = new PlayArea;
playComp.createPlayArea();
playComp.createShips();
playComp.assignHtml('#comp tbody tr td');
playComp.printPlayArea();

const playUser = new PlayArea;
playUser.createPlayArea();
playUser.assignHtml('#user [data-area] tr td');
playUser.setShips('#user [data-ship]');
playUser.makeDragableShips('#user [data-area]');
console.log(playUser);
// playUser.createShips();
// playUser.assignHtml('#user tbody tr td');
// playUser.printPlayArea();