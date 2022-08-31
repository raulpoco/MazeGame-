//Boiler Plate
const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events
} = Matter;

const width = window.innerWidth;
const height = window.innerHeight;

const cellsHorizontal = 15;
const cellsVertical = 10;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {
  world
} = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Drawing Borders- Walls

const walls = [
  //Top Wall
  Bodies.rectangle(width / 2, 0, width, 2, {
    isStatic: true
  }),
  //Left Wall
  Bodies.rectangle(0, height / 2, 2, height, {
    isStatic: true
  }),
  //Bottom Wall
  Bodies.rectangle(width / 2, height, width, 2, {
    isStatic: true
  }),
  //Right Wall
  Bodies.rectangle(width, height / 2, 2, height, {
    isStatic: true
  }),
];
World.add(world, walls);

//Maze Generation

const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
}

//Grid Template
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));


//Creating the verticals & horizontals Array
const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));


//Maze Algorithm

const startRow = Math.floor(Math.random() * cellsVertical)
const startColumn = Math.floor(Math.random() * cellsHorizontal)


const stepThroughCell = (row, column) => {

  //If i have visited the cell at [row,column] return

  if (grid[row][column]) {
    return;
  }

  //Mark this cell as being visited

  grid[row][column] = true;

  //Assemble randomly-ordered list of neighbors

  const neighbors = shuffle([
    [row - 1, column, `up`],
    [row, column + 1, `right`],
    [row + 1, column, `down`],
    [row, column - 1, `left`]
  ]);

  //For each neighbour...

  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;


    //See if that neighbour is out of bonds
    if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
      continue;
    }

    //If we have visited that neighbour, continue to next neighbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //Remove a wall from either horizontals or verticals wall

    if (direction === `left`) {
      verticals[row][column - 1] = true;
    } else if (direction === `right`) {
      verticals[row][column] = true;
    } else if (direction === `up`) {
      horizontals[row - 1][column] = true;
    } else if (direction === `down`) {
      horizontals[row][column] = true;
    }

    // Visit that next cell
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn)

//Iterating through horizontals and verticals and drawing the lines

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open == true) {
      return;
    }


    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      10, {
        isStatic: true,
        label: `wall`,
        render: {
          fillStyle: `magenta`
        }
      }
    );
    World.add(world, wall);

  });
});
//
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      10,
      unitLengthY, {
        isStatic: true,
        label: `wall`,
        render: {
          fillStyle: `magenta`
        }
      }
    );
    World.add(world, wall);

  });
});

//Creating the finish point, the goals

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * .7,
  unitLengthY * .7, {
    isStatic: true,
    label: `goal`,
    render: {
      fillStyle: `green`
    }
  }
);
World.add(world, goal);

//Creating the circle shape for the user and applying some keyboard moves

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius, {
    label: `ball`,
    render: {
      fillStyle: `cyan`
    }
  }
);

World.add(world, ball);


//Adding keydown listener for the circle shape


document.addEventListener(`keydown`, event => {

  const {
    x,
    y
  } = ball.velocity;

  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, {
      x: x,
      y: y - 5
    });
  }
  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, {
      x: x + 5,
      y: y
    });
  }
  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, {
      x: x,
      y: y + 5
    });
  }
  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, {
      x: x - 5,
      y: y
    });
  }
});


//Wining Statement - Condiion

Events.on(engine, `collisionStart`, event => {
  event.pairs.forEach((collision) => {
    const labels = [`ball`, `goal`];
    if (labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector(`.winner`).classList.remove(`hidden`);
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === `wall`) {
          Body.setStatic(body, false);
        }
      })

      document.querySelector(`button`).addEventListener(`click`, () => {
        location.reload();
      })

    }

  });

});
