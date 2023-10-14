const populationSize = 1000;
const lineCount = 10;
const initalRange = [-500, 500, 0, 180]; //min x,max x, min a, max a

let dotList = [];
let lines = [];

let actualLine;
let epoch = 10;

class Dot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    const dotWidth = 4;
    noStroke();
    fill(this.colour);
    circle(this.x - dotWidth / 2, this.y - dotWidth / 2, dotWidth);
  }
}

class Line {
  constructor(angle, offset) {
    this.angle = angle;
    this.fitness = 0;

    this.calculateLinePoints(angle, offset);
    this.calculateGrad();
    this.colour = color(255, 0, 0);
  }

  calculateLinePoints(angle, offset) {
    this.startX = offset;
    this.startY = 0;
    this.endX = this.startX + 10000 * cos(angle);
    this.endY = this.startY + 10000 * sin(angle);
  }

  calculateGrad() {
    this.gradient = (this.endY - this.startY) / (this.endX - this.startX);
  }

  calculateFitness() {
    //   fitness is # of geen above line + # of blue below
    let score = 0;

    for (let dot of dotList) {
      if (isDotAboveLine(this, dot) == dot.above) {
        score++;
        dot.display();
      }
    }
    this.fitness = score;
  }

  display() {
    stroke(this.colour);
    strokeWeight(1);
    line(this.startX, this.startY, this.endX, this.endY);
  }
}

function setup() {
  angleMode(DEGREES);
  createCanvas(500, 500);
  frameRate(1);

  generateActualLine();
  populate();

  generateLines(initalRange);
}

function draw() {
  if (epoch == 0) return;

  background(255);
  evolve();
  displayEpoch();
}

function populate() {
  for (let i = 0; i < populationSize; i++) {
    const x = random(0, width);
    const y = random(0, height);
    const dot = new Dot(x, y);
    if (isDotAboveLine(actualLine, dot)) {
      dot.above = true;
      dot.colour = color(255, 0, 255);
    } else {
      dot.above = false;
      dot.colour = color(0, 0, 255);
    }
    dotList.push(dot);
  }
}

function drawDots() {
  dots.forEach((dot) => {
    dot.display();
  });
}

function drawAllLines() {
  lines.forEach((l) => {
    l.display();
  });
}

function generateLines(range) {
  for (let i = 0; i < lineCount; i++) {
    let offset = random(range[0], range[1]);
    let angle = random(range[2], range[3]);
    lines.push(new Line(angle, offset));
  }
}

function generateActualLine() {
  let offset = random(0, 200);
  let angle = random(10, 80);
  actualLine = new Line(angle, offset);
  actualLine.colour = color(0, 255, 255);
}

function populationFitness() {
  //   fitness is # of geen above line + # of blue below
  for (let line of lines) {
    line.calculateFitness();
  }
}

function sortLines() {
  //   fitness is # of geen above line + # of blue below
  lines.sort((a, b) => {
    if (a.fitness < b.fitness) return 1;
    return -1;
  });
  lines[0].colour = color(0, 255, 0);
}

function isDotAboveLine(l, d) {
  const offset = (1 - tan(l.angle)) * l.startX;
  return d.y < d.x * l.gradient - l.startX + offset;
}

function displayEpoch() {
  lines[0].colour = color(0, 255, 0);
  drawAllLines();
  actualLine.display();
  lines[0].display();
}

function evolve() {
  epoch--;
  populationFitness();
  sortLines();
  const best = lines[0];
  best.colour = color(255, 0, 0);
  const targetDistance = (populationSize - best.fitness) / populationSize;
  console.log(targetDistance);

  const xRange = (initalRange[1] - initalRange[0]) * targetDistance;
  const aRange = (initalRange[3] - initalRange[2]) * targetDistance;
  const targetArray = [
    best.startX - xRange,
    best.startX + xRange,
    best.angle - aRange,
    best.angle + aRange,
  ];

  //   keep best in for anotehr round
  lines = [];
  lines.push(best);
  generateLines(targetArray);

  // generate new lines based off how close they are to the target
}
