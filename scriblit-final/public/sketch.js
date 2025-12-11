let finalCanvas;
let tempCanvas;
let historyC;

let menu = 0;   // keep this so the old checks still work

//let menu = 1;

let widthTextbox;
let heightTextbox;
let newcanvasW;
let newcanvasH;
let newcanvasC;
let canvasOffsetX = 40;   
let canvasOffsetY = 120;  

let brushSize = 2;
let eraserSize = 2;

let sprayPos;
let angle = 0;
let startX, startY;
let endX, endY;
let selection = false;
let dragging = false;
let rollover = false;

let rectResults = [];
let shapeWidth, shapeHeight;
let shapeSelect;
let vv;
let selectVector;

let currentTool = "brush";
let rbrushinfo;
let eraserinfo;
let slider;

let artHistory = [];
let sstroke = [];

let c;
let sc;
let x;
let y;

let canvasBGColor;

let barwidth = 225;
let barheight = 250;

let theColorPicker;
let toolBox;

let artCanvas;
let decreaseButton;
let startNew;
let alreadyStarted = false;

let offset = 0;
let shift = 0;

function preload() {
  font = loadFont("/assets/inkfree.ttf");
}

function setup() {
  theColorPicker = createColorPicker("#000");

  artCanvas = createCanvas(500, 500);
  // attach the canvas into the #p5-holder div in submit.ejs
  artCanvas.parent("p5-holder");

  let c = theColorPicker.color();
  let sc = ("rgba(150, 220, 255, 0.1)");

  finalCanvas = createGraphics(width, height);
  tempCanvas = createGraphics(width, height);
  historyC = createGraphics(width, height);

  toolBox = createDiv("Toolbox");
  // put toolbox in the same container as canvas
  toolBox.parent("p5-holder");

  rbrushinfo = createSpan("Size: " + brushSize);
  brushInfo();
  eraserinfo = createSpan("Size: " + eraserSize);
  eraserInfo();
  slider = createSlider(0, 20, 2, 2);
  sprayInfo();
  shapeSelect = createSelect();
  shapeSelect.option("Rectangle", "rect");
  shapeSelect.option("Circle", "ellipse");
  shapeSelect.option("Triangle", "triangle");
  shapeSelect.selected("Rectangle");
  shapeInfo();
  shapeSelect.changed(shapeChange);

  selectVector = createVector(shapeWidth, shapeHeight);

  TOOSMALL = createSpan(
    "ERROR: Your canvas is too small! \n Both width and height must be at least 500."
  );
  TOOSMALL.style("opacity:0");
  let maxO = 100;


  canvasInputs();
  theColorPicker.hide();
  toolBox.hide();

  canvasBGColor.value("#FFFFFF");
  checkIfValid();
}

function draw() {
  image(finalCanvas, 0, 0, width, height);
  image(tempCanvas, 0, 0, width, height);
  image(historyC, 0, 0, width, height);

  let c = theColorPicker.color();
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  // no more original menu 
  // if (menu === 1) {
  //   canvasInputGraphics()
  // }
  // if (menu === 1 && alreadyStarted === true) {
  //    fill('rgba(0, 0, 0, 0.8)');
  //    rect(0, 0, width, height);
  //   canvasInputGraphics()
  // }

  if (currentTool === "chop" && mouseIsPressed === false) {
    tempCanvas.clear();
    tempCanvas.square(mouseX, mouseY, brushSize);
  }

  if (currentTool === "airbrush" && mouseIsPressed === true) {
    airbrushTool();
  }

  if (currentTool === "select" && mouseIsPressed === true) {
    tempCanvas.drawingContext.setLineDash([3, 5]);
  } else {
    tempCanvas.drawingContext.setLineDash([]);
  }

  if (
    selection === true &&
    mouseX >= startX &&
    mouseX <= startX + selectVector.x &&
    mouseY >= startY &&
    mouseY <= startY + selectVector.y
  ) {
    rollover = true;
  }

  if (rollover === true) {
    sc = "rgba(130, 200, 235, 0.1)";
    dragging = true;
  }

  let interval = 3000;
  if (millis() % interval < 100) {
    // console.log(selectVector.x)
    // console.log(selectVector.y)
  }
}

function canvasInputs() {
  //menu = 1;
  fill("rgba(0, 0, 0, 0.8)");
  rect(0, 0, width, height);

  canvasBGColor = createColorPicker(HSB);
  canvasBGColor.position(barwidth + 50, barheight + 42);
  widthTextbox = createInput("500", "number");
  heightTextbox = createInput("500", "number");
  widthTextbox.attribute("required");
  heightTextbox.attribute("required");

  widthTextbox.position(barwidth, barheight - 65);
  heightTextbox.position(barwidth, barheight - 10);
  let newcanvasW = widthTextbox.value();
  let newcanvasH = heightTextbox.value();
  let newcanvasC = canvasBGColor.color();

  startDrawing = createButton("OK");
  startDrawing.position(500 / 2 - 30, 350);
  startDrawing.mousePressed(checkIfValid);

  //EVERYTHING CHANGES IF YOU WERE ALREADY DRAWING

  if (alreadyStarted === true) {
    canvasBGColor.position(CENTER);
    widthTextbox.position(CENTER);
    heightTextbox.position(CENTER);
    push();
    fill("rgba(0, 0, 0, 0.8)");
    rectMode(CENTER);
    rect(0, 0, 500, 500, 6);
    pop();
  }
}

function canvasInputGraphics() {
  fill("#fff");
  textSize(25);
  textFont(font);
  text("Start creating some art!", 125, 150);

  textFont("arial");
  text("Width", 500 / 4 + 3, 500 / 2 - 45);
  text("Height", 500 / 4 + 10, 500 / 2 + 7);

  textSize(25);
  text("BG Color", 500 / 4 + 25, 500 / 2 + 65);
}

function checkIfValid() {
  newcanvasW = widthTextbox.value();
  newcanvasH = heightTextbox.value();
  newcanvasC = canvasBGColor.color();

  if (alreadyStarted === false) {
    TOOSMALL.hide();
  }

  if (newcanvasW < 500 || newcanvasH < 500) {
    textSize(18);
    fill("#fff");
    push();
    textAlign(CENTER);
    TOOSMALL.show();
    TOOSMALL.position(50, height - 110);
    TOOSMALL.style(
      "opacity:100; box-sizing: content-box; text-align:center; color: #fff; font-family:arial; font-size:20px; width: 400px; height: 100px;"
    );
    pop();
  } else {
    areyouDrawingyet();
  }
}

function areyouDrawingyet() {
  menu = 0;

  theColorPicker.show();
  newSketch();
  alreadyStarted = true;

  TOOSMALL.hide();
  widthTextbox.hide();
  heightTextbox.hide();
  canvasBGColor.hide();
  startDrawing.hide();
}

function newSketch() {
  toolBox.show();
  //MAKE ALL THE TOOL INFO INSIDE THEIR OWN FUNCTION TOO! THEN USE HIDE() INSIDE THAT FUNCTION AND CALL THE TOOL INFO FUNCTION WITHIN THE TOOL FUNCTION ITSELF!!!!!!!//

if (!alreadyStarted) {
  startNew = createButton("Start over");
  startNew.mousePressed(resetDrawing);
}


let buttonOffsetX = 260;    
let buttonOffsetY = 10;  


let buttonX = canvasOffsetX + buttonOffsetX;
let buttonY = canvasOffsetY + height + buttonOffsetY;


startNew.position(buttonX, buttonY);


  resizeCanvas(newcanvasW, newcanvasH);
  finalCanvas.width = newcanvasW;
  tempCanvas.width = newcanvasW;
  historyC.width = newcanvasW;
  finalCanvas.height = newcanvasH;
  tempCanvas.height = newcanvasH;
  historyC.height = newcanvasH;
  finalCanvas.background(newcanvasC);

  // toolbox icons WIP!!!!!!!!! //

  toolBox.addClass("w3-container");
  toolBox.position(newcanvasW, 0);
  toolBox.style(
    "box-sizing: content-box; text-align:center; background-color: #A4A4A4; font-family:monospace; font-size:20px; padding-top: 1px; padding-right: 12px; width: 100px; height: 495px; border:thick #ff000; border-style:ridge;"
  );

  theColorPicker.position(20, 25);
  toolBox.child(theColorPicker);

  rbrushIcon = createImg("/icons/rbrush_button.png", "");
  rbrushIcon.position(70, 0);
  brushButton = createButton("Brush");
  brushButton.style("text-align: left;");
  brushButton.size(100, 27);
  brushButton.child(rbrushIcon);
  brushButton.position(5, 65);
  brushButton.mousePressed(regularBrush);
  toolBox.child(brushButton);

  eraserIcon = createImg("/icons/eraser_button.png", "");
  eraserIcon.position(70, 0);
  eraserButton = createButton("Eraser");
  eraserButton.style("text-align: left;");
  eraserButton.size(100, 27);
  eraserButton.position(5, 98);
  eraserButton.child(eraserIcon);
  eraserButton.mousePressed(eraserTool);
  toolBox.child(eraserButton);

  sprayIcon = createImg("/icons/spray_button.png", "");
  sprayIcon.position(70, 0);
  sprayButton = createButton("Spraycan");
  sprayButton.style("text-align: left;");
  sprayButton.size(100, 27);
  sprayButton.position(5, 131);
  sprayButton.child(sprayIcon);
  sprayButton.mousePressed(sprayTool);
  toolBox.child(sprayButton);

  lineIcon = createImg("/icons/line_button.png", "");
  lineIcon.position(70, 0);
  lineButton = createButton("Line");
  lineButton.style("text-align: left;");
  lineButton.size(100, 27);
  lineButton.position(5, 164);
  lineButton.child(lineIcon);
  lineButton.mousePressed(lineTool);
  toolBox.child(lineButton);

  chopIcon = createImg("/icons/chop_button.png", "");
  chopIcon.position(70, 0);
  chopButton = createButton("Chop");
  chopButton.style("text-align: left;");
  chopButton.size(100, 27);
  chopButton.position(5, 197);
  chopButton.child(chopIcon);
  chopButton.mousePressed(chopTool);
  toolBox.child(chopButton);

  shapeIcon = createImg("/icons/shapes_button.png", "");
  shapeIcon.position(70, 0);
  shapeButton = createButton("Shapes");
  shapeButton.style("text-align: left;");
  shapeButton.size(100, 27);
  shapeButton.position(5, 230);
  shapeButton.child(shapeIcon);
  shapeButton.mousePressed(shapeTool);
  toolBox.child(shapeButton);

  selectIcon = createImg("/icons/select_button.png", "");
  selectIcon.position(70, 0);
  selectButton = createButton("Select");
  selectButton.style("text-align: left;");
  selectButton.size(100, 27);
  selectButton.position(5, 263);
  selectButton.child(selectIcon);
  selectButton.mousePressed(selectTool);
  toolBox.child(selectButton);

  airbrushIcon = createImg("/icons/airbrush_button.png", "");
  airbrushIcon.position(70, 0);
  airbrushButton = createButton("Airbrush");
  airbrushButton.style("text-align: left;");
  airbrushButton.size(100, 27);
  airbrushButton.position(5, 296);
  airbrushButton.child(airbrushIcon);
  airbrushButton.mousePressed(airbrushTool);
  toolBox.child(airbrushButton);

  decreaseButton = createImg("/icons/button_smaller.png", "");
  decreaseSize = createButton("");
  decreaseSize.child(decreaseButton);
  decreaseSize.position(15, 460);
  decreaseSize.mousePressed(shrinkTool);
  decreaseSize.doubleClicked(shrinkTool2);

  increaseButton = createImg("/icons/button_larger.png", "");
  increaseSize = createButton("");
  increaseSize.child(increaseButton);
  increaseSize.position(65, 460);
  increaseSize.mousePressed(growTool);
  increaseSize.doubleClicked(growTool2);

  toolBox.child(decreaseSize);
  toolBox.child(increaseSize);
}

// clears everything when "Start over" is pressed
function resetDrawing() {
  finalCanvas.clear();
  finalCanvas.background(newcanvasC);
  tempCanvas.clear();
  historyC.clear();
  selection = false;
  dragging = false;
  rollover = false;
}

//INFO FOR EACH TOOL IN TOOLBAR
function brushInfo() {
  var brushSize = 2;
  rbrushinfo.hide();
  rbrushinfo.position(15, 435);
  toolBox.child(rbrushinfo);
}

function eraserInfo() {
  eraserinfo.hide();
  eraserinfo.position(15, 400);
  toolBox.child(eraserinfo);
}

function sprayInfo() {
  slider.hide();
  slider.position(10, 410);
  toolBox.child(slider);
  slider.size(80);
}

function shapeInfo() {
  shapeSelect.hide();
  shapeSelect.position(10, 380);
  toolBox.child(shapeSelect);
}

function shapeChange() {
  let vv = shapeSelect.value();
}

// START OF ALL TOOL FUNCTIONS //

function regularBrush() {
  let c = theColorPicker.color();
  brushButton.style("background-color: #c8c8c8;");
  currentTool = "brush";
  rbrushinfo.show();
  finalCanvas.strokeWeight(brushSize);
  finalCanvas.stroke(c);
  finalCanvas.line(pmouseX, pmouseY, mouseX, mouseY);
  slider.hide();
  shapeSelect.hide();
  //changes color of other buttons
  brushButton.style("background-color: #c8c8c8;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function eraserTool() {
  let newcanvasC = canvasBGColor.color();
  currentTool = "eraser";
  rbrushinfo.show();
  finalCanvas.strokeWeight(brushSize);
  finalCanvas.stroke(newcanvasC);
  finalCanvas.line(pmouseX, pmouseY, mouseX, mouseY);
  slider.hide();
  shapeSelect.hide();
  //changes color of other buttons
  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #c8c8c8;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function sprayTool() {
  slider.show();
  shapeSelect.hide();
  push();
  let c = theColorPicker.color();

  currentTool = "spray";

  let distX = random(-30, 30);
  let distY = random(-30, 30);
  let density = slider.value();
  let num = 20;

  for (let i = 0; i < num; i++) {
    finalCanvas.fill(c);
    finalCanvas.noStroke();
    let sprayXX = cos(i) * random(density - 2, density + 1);
    let sprayYY = sin(i) * random(density - 2, density + 1);

    if (brushSize <= 4) {
      finalCanvas.circle(
        mouseX + distX * sprayXX,
        mouseY + distY * sprayYY,
        random(brushSize - 1, brushSize + 2)
      );
    } else if (brushSize >= 5) {
      finalCanvas.circle(
        mouseX + distX * sprayXX,
        mouseY + distY * sprayYY,
        random(brushSize - 3, brushSize + 1)
      );
    }
  }
  pop();

  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #c8c8c8;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function lineTool() {
  currentTool = "line";
  slider.hide();
  shapeSelect.hide();

  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #c8c8c8;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function chopTool() {
  let c = theColorPicker.color();
  currentTool = "chop";
  slider.hide();
  shapeSelect.hide();

  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #c8c8c8;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function shapeTool() {
  currentTool = "shape";
  slider.hide();
  shapeSelect.show();
  vv = shapeSelect.value();

  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #c8c8c8;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function selectTool() {
  slider.hide();
  currentTool = "select";
  tempCanvas.strokeWeight(2);
  tempCanvas.stroke("#00D1FF");
  selection = false;

  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #c8c8c8;");
  airbrushButton.style("background-color: #e9e9ed;");
}

function selectDrag() {
  currentTool = "drag";
}

function airbrushTool() {
  currentTool = "airbrush";
  let c = theColorPicker.color();
  slider.hide();
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  for (let i = 0; i < 15; i++) {
    let alpha = map(i, 0, 14, 50, 0);
    let brushradius = (brushSize * (i + 15) * 2) / 15;
    push();

    finalCanvas.fill(r, g, b, alpha);
    finalCanvas.noStroke();
    finalCanvas.circle(mouseX, mouseY, brushradius);
    pop();
  }

  brushButton.style("background-color: #e9e9ed;");
  eraserButton.style("background-color: #e9e9ed;");
  sprayButton.style("background-color: #e9e9ed;");
  lineButton.style("background-color: #e9e9ed;");
  chopButton.style("background-color: #e9e9ed;");
  shapeButton.style("background-color: #e9e9ed;");
  selectButton.style("background-color: #e9e9ed;");
  airbrushButton.style("background-color: #c8c8c8;");
}

// END OF TOOL FUNCTIONS //
// TOOL OPTIONS

function growTool() {
  brushSize += 2;
  rbrushinfo.html("Size: " + brushSize);

  // case "eraser":
  //  eraserSize += 2;
  //   eraserinfo.html("Size: " + brushSize);
  //   rbrushinfo.hide()
  // break;
}

function growTool2() {
  brushSize += 4;
  rbrushinfo.html("Size: " + brushSize);
}

function shrinkTool() {
  if (brushSize >= 3) {
    brushSize -= 2;
    rbrushinfo.html("Size: " + brushSize);
  }
}

function shrinkTool2() {
  if (brushSize >= 5) {
    brushSize -= 4;
    rbrushinfo.html("Size: " + brushSize);
  }
}

function mousePressed() {
  console.log(currentTool);
  startX = mouseX;
  startY = mouseY;
  shapeWidth = 0;
  shapeHeight = 0;
}

//FUNCTION STUFF
function mouseDragged() {
  if (dragging === false) {
    tempCanvas.clear();
  }

  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    switch (currentTool) {
      case "brush":
        if (menu === 0) {
          regularBrush();
        }
        break;

      case "eraser":
        if (menu === 0) {
          eraserTool();
        }
        break;

      case "spray":
        if (menu === 0) {
          sprayTool();
        }
        break;

      case "line":
        if (menu === 0) {
          tempCanvas.clear();
          let c = theColorPicker.color();
          tempCanvas.strokeWeight(brushSize);
          tempCanvas.stroke(c);
          tempCanvas.line(startX, startY, mouseX, mouseY);
        }
        break;

      case "chop":
        if (menu === 0) {
          chopTool();
          let c = theColorPicker.color();
          finalCanvas.stroke(c);
          tempCanvas.fill("rgba(150, 220, 255, 0.1)");
          finalCanvas.copy(
            finalCanvas,
            mouseX,
            mouseY,
            brushSize,
            brushSize,
            mouseX,
            mouseY,
            brushSize * 2,
            brushSize * 2
          );
        }
        break;

      case "shape":
        vv = shapeSelect.value();
        if (menu === 0) {
          tempCanvas.clear();
          if (vv === "rect") {
            let shapeWidth = mouseX - startX;
            let shapeHeight = mouseY - startY;

            let c = theColorPicker.color();
            tempCanvas.strokeWeight(brushSize);
            tempCanvas.stroke(c);
            tempCanvas.rect(startX, startY, shapeWidth, shapeHeight);
          } else if (vv === "ellipse") {
            let shapeWidth = mouseX - startX;
            let shapeHeight = mouseY - startY;

            let c = theColorPicker.color();
            tempCanvas.strokeWeight(brushSize);
            tempCanvas.stroke(c);
            tempCanvas.ellipse(startX, startY, shapeWidth, shapeHeight);
          } else if (vv === "triangle") {
            shapeWidth = mouseX - startX;
            shapeHeight1 = lerp(startX, shapeWidth, 0.5); 
            shapeHeight2 = mouseY - startY;

            let c = theColorPicker.color();
            tempCanvas.strokeWeight(brushSize);
            tempCanvas.stroke(c);
            tempCanvas.triangle(
              startX,
              startY,
              shapeWidth,
              startY,
              shapeHeight1,
              shapeHeight2
            );
          }
        }

        break;

      case "select":
        if (menu === 0) {
          let shapeWidth = mouseX - startX;
          let shapeHeight = mouseY - startY;
          let sc = "rgba(150, 220, 255, 0.1)";
          tempCanvas.clear();

          if (dragging === false) {
            tempCanvas.fill(sc);
            tempCanvas.rect(startX, startY, shapeWidth, shapeHeight);
          }

          if (dragging === true) {
            shapeOffsetX = mouseX - startX;
            shapeOffsetY = mouseY - startY;

            tempCanvas.rect(
              startX + shapeOffsetX,
              startY + shapeOffsetY,
              selectVector.x,
              selectVector.y
            );

            finalCanvas.loadPixels();
            tempCanvas.copy(
              finalCanvas,
              startX,
              startY,
              shapeWidth,
              shapeHeight,
              startX + shapeOffsetX,
              startY + shapeOffsetY,
              shapeWidth,
              shapeHeight
            );
            tempCanvas.updatePixels();
          }
        }
        break;

      case "airbrush":
        break;
    }
  }
}

function mouseReleased() {
  switch (currentTool) {
    case "line":
      tempCanvas.line(startX, startY, mouseX, mouseY);
      finalCanvas.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
      tempCanvas.clear();
      break;

    case "shape":
      tempCanvas.clear();
      if (vv === "rect") {
        let shapeWidth = mouseX - startX;
        let shapeHeight = mouseY - startY;
        tempCanvas.noFill();
        tempCanvas.rect(startX, startY, shapeWidth, shapeHeight);

        historyC.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
        finalCanvas.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
        tempCanvas.clear();
      } else if (vv === "ellipse") {
        let shapeWidth = mouseX - startX;
        let shapeHeight = mouseY - startY;
        tempCanvas.noFill();
        tempCanvas.ellipse(startX, startY, shapeWidth, shapeHeight);

        historyC.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
        finalCanvas.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
        tempCanvas.clear();
      } else if (vv === "triangle") {
        shapeWidth = mouseX - startX;
        shapeHeight1 = lerp(startX, shapeWidth, 0.5); 
        shapeHeight2 = mouseY - startY;

        let c = theColorPicker.color();
        tempCanvas.strokeWeight(brushSize);
        tempCanvas.stroke(c);
        tempCanvas.triangle(
          startX,
          startY,
          shapeWidth,
          startY,
          shapeHeight1,
          shapeHeight2
        );

        historyC.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
        finalCanvas.image(tempCanvas, 0, 0, newcanvasH, newcanvasW);
        tempCanvas.clear();
      }
      break;

    case "select":
      selectVector = createVector(mouseX - startX, mouseY - startY);
      tempCanvas.drawingContext.lineDashOffset = offset;
      tempCanvas.rect(startX, startY, selectVector.x, selectVector.y);

      if (selectVector.x >= 1 && selectVector.y >= 1) {
        selection = true;
      }
      break;
  }
}

function mouseClicked() {
  if (dragging === true) {
    tempCanvas.clear();
  }
}

function doubleClicked() {
  switch (currentTool) {
    case "line":
      break;
  }
}


