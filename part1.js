const rs = require("readline-sync");

class Ship {
  constructor(startpos, isVertical, length = 1) {
    this.startpos = startpos;
    this.isVertical = isVertical;
    this.length = length;
    this.isDestroyed = false;
    this.spacesHit = [];
    this.shipCoordinates = [];
    for (let i = 0; i < length; i++) {
      const coordToAdd = isVertical
        ? [startpos[0], startpos[1] + i]
        : [startpos[0] + i, startpos[1]];
      this.shipCoordinates.push(coordToAdd);
    }
  }

  hitShip(x, y) {
    this.spacesHit.push([x, y]);
    if (this.spacesHit.length === this.length) {
      this.isDestroyed = true;
      this.shipCoordinates.forEach((space) => {
        Grid.changeGridTile(space[0], space[1], true, true);
      });
    }
  }
}

function gridSpace() {
  this.hasShip = false;
  this.shipDestroyed = false;
}

class Grid {
  static gridLayout = [];
  static ships = [];

  static createGrid(size, amountOfShips) {
    Grid.amountOfShips = [];
    Grid.ships = [];

    Grid.amountOfShips = amountOfShips;
    for (let x = 0; x < size; x++) {
      Grid.gridLayout[x] = [];
      for (let y = 0; y < size; y++) {
        Grid.gridLayout[x][y] = new gridSpace();
      }
    }
  }

  static changeGridTile(x, y, hasShip, isDestroyed = false) {
    Grid.gridLayout[x][y].hasShip = hasShip;
    Grid.gridLayout[x][y].isDestroyed = isDestroyed;
  }

  static isSpaceWithinGrid(x, y) {
    if (
      x < 0 ||
      x > Grid.gridLayout.length ||
      y < 0 ||
      y > Grid.gridLayout.length
    )
      return false;

    return true;
  }

  static logCoordinateError(startpos, endpos) {
    console.log(
      `Given ship coordinates are not within range of grid!
      start x: ${startpos[0]}, y: ${startpos[1]}
      end x: ${endpos[0]}, y: ${endpos[1]}`
    );
  }

  static isSpaceOccupied(x, y, isVertical = false, length = 1) {
    if (isVertical) {
      if (
        Grid.isSpaceWithinGrid(x, y) === false ||
        Grid.isSpaceWithinGrid(x, y + length) === false
      ) {
        logCoordinateError([x, y], [x, y + length]);
        return true;
      }
      if (length === 1) return Grid.gridLayout[x][y].hasShip;
      else {
        for (let i = y; i < y + length; i++) {
          if (Grid.gridLayout[x][i].hasShip) return true;
        }
      }
    } else if (!isVertical) {
      if (
        Grid.isSpaceWithinGrid(x, y) === false ||
        Grid.isSpaceWithinGrid(x + length, y) === false
      ) {
        logCoordinateError([x, y], [x + length, y]);
        return true;
      }

      if (length === 1) return Grid.gridLayout[x][y].hasShip;
      else {
        for (let i = x; i < x + length; i++) {
          if (Grid.gridLayout[i][y].hasShip) return true;
        }
      }
    }

    return false;
  }

  static placeShip(startPos, isVertical, length = 1) {
    if (
      Grid.isSpaceOccupied(startPos[0], startPos[1], isVertical, length) ===
      false
    ) {
      Grid.ships.push(new Ship(startPos, isVertical, length));
      if (isVertical) {
        for (let i = startPos[1]; i < startPos[1] + length; i++) {
          Grid.changeGridTile(startPos[0], i, true);
        }
      } else {
        for (let i = startPos[0]; i < startPos[0] + length; i++) {
          Grid.changeGridTile(i, startPos[1], true);
        }
      }
    } else console.log("Error");
  }

  static getShipInSpace(x, y) {
    let returnShip = undefined;
    Grid.ships.forEach((ship) => {
      ship.shipCoordinates.forEach((coord) => {
        if (coord[0] === x && coord[1] === y) returnShip = ship;
      });
    });
    return returnShip;
  }
}

class Weapon {
  static shotsFired = [];
  static shoot(x, y) {
    if (Weapon.shotsFired) {
      const pickedLocation = Weapon.shotsFired.find(
        (location) => location[0] === x && location[1] === y
      );
      if (pickedLocation) {
        return "You have already picked this location. Miss!";
      }
    }

    this.shotsFired.push([x, y]);
    if (
      Grid.isSpaceOccupied(x, y) &&
      Grid.gridLayout[x][y].shipDestroyed === false
    ) {
      const ship = Grid.getShipInSpace(x, y);
      if (ship && ship.isDestroyed === false) {
        ship.hitShip(x, y);
        if (ship.isDestroyed) {
          Grid.amountOfShips--;
          return `You sunk a ship! ${Grid.amountOfShips} ships remaining!`;
        }
        return "You Have hit a ship!";
      }
    }
    return "You missed!";
  }
}

function placeShipRandomly(lengthOfShip = 1) {
  let foundGoodSpace = false;
  while (foundGoodSpace === false) {
    const x = Math.floor(Math.random() * Grid.gridLayout.length);
    const y = Math.floor(Math.random() * Grid.gridLayout.length);
    foundGoodSpace = !Grid.isSpaceOccupied(x, y);
    if (foundGoodSpace)
      Grid.placeShip([x, y], Math.random() < 0.5, lengthOfShip);
  }
}

function setupGame() {
  Weapon.shotsFired = [];
  const amountOfShips = 2;
  Grid.createGrid(3, amountOfShips);

  for (let i = 0; i < amountOfShips; i++) {
    placeShipRandomly();
  }
}

function isValidInput(input) {
  const pattern = /^[A-Ca-c][1-3]$/;
  return pattern.test(input);
}

function playerTurn() {
  let input;
  do {
    input = rs.question("Enter a location (A1 to C3): ");
    if (!isValidInput(input)) {
      console.log(
        "Invalid input. Please enter a letter (A-C) followed by a number (1-3)."
      );
    }
  } while (!isValidInput(input));

  const x = charToNumber(input[0]);
  const y = input[1];
  console.log(Weapon.shoot(x - 1, y - 1));
}

function charToNumber(char) {
  return char.toLowerCase().charCodeAt(0) - 96;
}

function playGame() {
  rs.keyIn("press any key to start the Game!");
  setupGame();
  do {
    playerTurn();
  } while (Grid.amountOfShips > 0);

  if (rs.keyInYNStrict("You Won! Would you like to play again? Y/N"))
    playGame();
}

playGame();
