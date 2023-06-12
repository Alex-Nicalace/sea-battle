class SeaBatleError extends Error {
   constructor(message) {
      super(message);
      this.name = this.constructor.name;
   }
}

class LogicCompError extends SeaBatleError {
   constructor(message) {
      super(message);
   }
}

class GridError extends SeaBatleError {
   constructor(message) {
      super(message);
   }
}

export { LogicCompError, GridError };