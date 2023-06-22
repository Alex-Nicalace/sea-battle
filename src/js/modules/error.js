class SeaBatleError extends Error {
   constructor(message) {
      super(message);
      this.name = this.constructor.name;
   }
}

class LogicCompError extends SeaBatleError {
   constructor(message, area, excludeDirect) {
      super(message);
      console.log(area);
      console.log(excludeDirect);
   }
}

class GridError extends SeaBatleError {
   constructor(message) {
      super(message);
   }
}

class PlayAreaError extends SeaBatleError {
   constructor(message) {
      super(message);
   }
}

export { LogicCompError, GridError, PlayAreaError };