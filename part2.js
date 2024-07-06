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
    }
    this.shipCoordinates.forEach((space) => {
      Grid.changeGridTile(space[0], space[1], true, this.isDestroyed);
    });
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
        // Grid.logCoordinateError([x, y], [x, y + length]);
        return true;
      } else if (length === 1) return Grid.gridLayout[x][y].hasShip;
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
        //Grid.logCoordinateError([x, y], [x + length, y]);
        return true;
      } else if (length === 1) return Grid.gridLayout[x][y].hasShip;
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

  static DisplayGrid() {
    const rows = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    const columns = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

    process.stdout.write("     ");
    for (let col of columns) {
      process.stdout.write(`  ${col}  `);
    }
    process.stdout.write("\n");

    for (let x = 0; x < Grid.gridLayout.length; x++) {
      process.stdout.write(`  ${rows[x]}  |`);
      for (let y = 0; y < Grid.gridLayout.length; y++) {
        if (Grid.isCoordinateHit(x, y)) {
          process.stdout.write("  x |");
        } else if (
          Weapon.shotsFired &&
          Weapon.shotsFired.find(
            (location) => location[0] === x && location[1] === y
          )
        ) {
          process.stdout.write("  0 |");
        } else {
          process.stdout.write("    |");
        }
      }
      process.stdout.write("\n");

      if (x < rows.length - 1) {
        process.stdout.write("    ");
        for (let y = 0; y < columns.length; y++) {
          process.stdout.write("-----");
        }
        process.stdout.write("\n");
      }
    }
  }

  static isCoordinateHit(x, y) {
    for (let ship of Grid.ships) {
      const foundCoordinate = ship.spacesHit.find(
        (coord) => coord[0] === x && coord[1] === y
      );
      if (foundCoordinate) {
        return true;
      }
    }
    return false;
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

function placeShipRandomly(...lengthOfShip) {
  lengthOfShip.forEach((length) => {
    let foundGoodSpace = false;
    while (foundGoodSpace === false) {
      const x = Math.floor(Math.random() * Grid.gridLayout.length);
      const y = Math.floor(Math.random() * Grid.gridLayout.length);
      const isVertical = Math.random() < 0.5;
      if (Grid.isSpaceOccupied(x, y, isVertical, length) === false) {
        foundGoodSpace = true;
        Grid.placeShip([x, y], isVertical, length);
      }
    }
  });
}

function setupGame() {
  Weapon.shotsFired = [];
  Grid.createGrid(10, 5);

  placeShipRandomly(2, 3, 3, 4, 5);

  Grid.DisplayGrid();
}

function isValidInput(input) {
  const pattern = /^[A-Ja-j][1-9]$|^[A-Ja-j]10$/;
  return pattern.test(input);
}

function playerTurn() {
  let input;
  do {
    input = rs.question("Enter a location (A1 to J10): ");
    if (!isValidInput(input)) {
      console.log(
        "Invalid input. Please enter a letter (A-J) followed by a number (1-10)."
      );
    }
  } while (!isValidInput(input));

  const x = charToNumber(input[0]);
  const y = input.substring(1);
  console.log(Weapon.shoot(x - 1, y - 1));
  Grid.DisplayGrid();
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
