class IllegalMoveException extends Error {
    constructor(message, moveObject) {
        super(message);
        this.name = 'IllegalMoveException';
        this.moveObject = moveObject;
    }
}

module.exports = { IllegalMoveException };
