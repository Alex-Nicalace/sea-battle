const setAttrTitle = (selector) => {
   const elements = document.querySelectorAll(selector);
   elements.forEach(element => {
      element.title = element.textContent.replace(/\s+/g, ' ').trim();
   });
}

export default setAttrTitle;