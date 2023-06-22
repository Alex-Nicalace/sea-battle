function extractFileName(fullName) {
   return fullName.replace(/\.[^.]+$/, '');
   /* const array = fullName.split('.');
   array.pop();
   return array.join('.'); */
}
function parceFileName(fullName) {
   const array = fullName.split('.');
   const extFile = array.pop();
   const nameFile = array.join('.');
   return { nameFile, extFile };
}

export { extractFileName, parceFileName };