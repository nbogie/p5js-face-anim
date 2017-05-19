"use strict";

///TODO: if smiley is interested in the butterfly, make an 'oo' with the mouth
//TODO: analyse the speech as it is output, and use the fft or waveform to render the butterfly's wings, or have the history of the waveform or fft be visible on the air and have the butterfly treat it as turbulence / thermal.
// TODO: have an alternate silent anim with an eyebrow shrug, to punctuate silence in beat.
//TODO: credit the sound clip (or record and upload my own) https://www.freesound.org/people/RutgerMuller/sounds/51130/
//TOO: do simple sound synthesis of the smiley's "ooh" when the butterfly comes close (low-pass filter for the wah, and pitch, both modded with the mouth radius)
var gFly;
var gLastActivity;
var gHistory = [];
var gCurrentAnim;
var gAnims;
var gPalette;

var gBeatIx = 0;
var gBeat = [];

var gMouthPos = {};
var gDim = 100;

var gMySound;

function preload() {
  gMySound = loadSound(
    "https://www.freesound.org/data/previews/51/51130_179538-lq.mp3"
  );
}

function Vec(x, y) {
  this.x = x;
  this.y = y;
}
function randomPos() {
  return new Vec(random(0, width), random(0, height));
}
function Fly() {
  this.changeColors = function() {
    colorMode(HSB);
    this.color1 = gPalette.wingsOuter,
    this.colorInner = gPalette.wingsInner,
    this.colorBody = gPalette.butterflyBody;
  };
  this.reset = function() {
    this.isActive = true;
    this.changeColors();
    this.pos = randomPos();
    this.vel = new Vec(1, -1);
  };
  this.reset();
  this.drawAsFly = function() {
    noFill();
    strokeWeight(0.3);
    stroke(1);
    var wingWidth = 20;
    ellipse(-wingWidth, 0, wingWidth, 6);
    ellipse(wingWidth, 0, wingWidth, 6);

    fill("#333333");
    rect(0, 0, 4, 4);
  };
  this.drawAsButterfly = function() {
    var scaling = gDim / 510;
    var wingWidth = 20 * scaling;
    var wingWidthInner = 12 * scaling;
    var wingWidthLow = 7 * scaling;

    push();
    var flapPhaseMod = 50 * sin(frameCount / 100);
    var flapAmt = 0.1 + 0.5 * abs(sin((frameCount + flapPhaseMod) / 10));
    scale(flapAmt, 1);
    fill(this.color1);
    ellipse(-wingWidth, 0, wingWidth, wingWidth);
    ellipse(wingWidth, 0, wingWidth, wingWidth);
    fill(this.colorInner);
    ellipse(-wingWidth, 0, wingWidthInner, wingWidthInner);
    ellipse(wingWidth, 0, wingWidthInner, wingWidthInner);
    function smallCirc(r) {
      ellipse(-wingWidth * 0.75, wingWidth, r, r);
      ellipse(wingWidth * 0.75, wingWidth, r, r);
    }
    fill(this.color1);
    smallCirc(wingWidthLow * 1.2);
    fill(this.colorInner);
    smallCirc(wingWidthLow);
    pop(); //done wing-scaling

    fill(this.colorBody);
    rect(0, 0, 2 * scaling, 15 * scaling);
    push();
    rotate(0.05);
    rect(1 * scaling, -20 * scaling, 1 * scaling, 3 * scaling);
    pop();
    push();
    rotate(-0.05);
    rect(-1 * scaling, -20 * scaling, 1 * scaling, 3 * scaling);
    pop();
  };

  this.draw = function() {
    if (this.isActive) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(noise(frameCount / 50.0) - 0.5);
      this.drawAsButterfly(); //    this.drawAsFly();
      pop();
    }
  };

  this.update = function() {
    if (millis() - gLastActivity < 4000) {
      this.isActive = false;
    } else {
      if (!this.isActive) {
        this.reset();
      }
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    if (this.pos.x > width || this.pos.x < 0) {
      this.vel.x = -this.vel.x;
    }
    if (this.pos.y > height || this.pos.y < 0) {
      this.vel.y = -this.vel.y;
    }
    this.pos.x = noise(frameCount / 600) * 1.1 * width;
    this.pos.y = noise(4000 + frameCount / 600) * 1.1 * height;
  };
}

function Anim(opts) {
  this.frames = opts.frames;
  this.times = opts.times;
  this.startedAt;
  this.finishesAt = 0;
  this.durationMs = opts.durationMs ? opts.durationMs : 1000;

  this.start = function() {
    this.startedAt = millis();
    this.finishesAt = this.startedAt + this.durationMs;
    this.debugStep = 0;
  };

  if (this.times) {
  } else {
    console.log("ERROR: no .times in anim");
  }

  this.calcFrameForClockMs = function(nowMs) {
    var elapsed = nowMs - this.startedAt;
    var percElapsed = elapsed / this.durationMs;
    var frameToShow = 0;

    for (var i = 0; i < this.times.length; i++) {
      var p = this.times[i];
      if (p < percElapsed) {
        frameToShow = i;
      }
    }
    return frameToShow;
  };
  this.display = function() {
    this.frameShowing = this.calcFrameForClockMs(millis());
    this.frames[this.frameShowing]();
  };

  this.advance = function() {
    this.debugStep++;
    if (this.debugStep >= this.frames.length) {
      this.debugStep = 0;
    }
  };

  this.debugStep = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setFaceSize();
}

function createPalette() {
  var ix = random([0,1]);
  colorMode(HSB);

  var paletteHeadache = {
    face: color("#E6AC27"),
    background: color("#655643"),
    eyeWhites: color('#F6F7BD'),
    teethWhite: color("#F6F7BD"),
    wingsOuter: color('#80BCA3'),
    wingsInner: color('#BF4D28'),
    butterflyBody: color(0,100,20,1),
    tongue: color('#BF4D28'),
    text: color('#80BCA3'),
    url: 'http://www.colourlovers.com/palette/953498/Headache'
  };
  
  var white = color('white');
  var paletteHappy = {
    face: color("#F7A541"),
    background: color("#A1DBB2"),
    eyeWhites: color('#FEE5AD'),
    teethWhite: color("#FEE5AD"),
    tongue: color('#F45D4C'),
    wingsOuter: color('#FACA66'),
    wingsInner: color('#FEE5AD'),
    text: color('#80BCA3'),
    url: 'http://www.colourlovers.com/palette/953498/Headache'
    //#A1DBB2,#FEE5AD,#FACA66,#F7A541,#F45D4C,#A1DBB2,#FEE5AD,#FACA66
  }

  gPalette = {
    face: color("#FFC10E"),
    mouthBlack: color("#333333"),
    eyeWhites: color(255),
    background: color("#4ba6bd"), 
    tongue: color('red'),
    wingsOuter: color(191, 100, 100, 1),
    wingsInner: color("#FFD864"), 
    butterflyBody: color('#333333'),
    teethWhite: color("white"),
    text: color( 'white')
  };
  var p = random([gPalette, paletteHappy, paletteHeadache])
  gPalette = Object.assign(gPalette, p);
}

//separate from setup() so that we can start multiple times without reload.
function restart() {
  createPalette();
  gMySound.setVolume(0.3);
  gLastActivity = millis();
  gFly = new Fly();

  //cool!
  //  gMySound.play(0, 0.1);
  //  play([startTime],[rate],[amp],[cueStart],[duration])

  setFaceSize();

  var allBeats = [
    [boom, tss, kah, tss, boom, boom, kah, tss],
    [boom, tss, kah, boom, idle, boom, kah, idle]
  ];
  gBeat = random(allBeats);
  gBeatIx = 0;
  
  ellipseMode(RADIUS);
  rectMode(RADIUS);

  gHistory = [];
  gAnims = {
    boom: new Anim({
      frames: [drawB, drawOoh, drawMmm],
      times: [0, 0.1, 0.8],
      durationMs: 300
    }),
    bip: new Anim({
      frames: [drawB, drawIh, drawP],
      times: [0, 0.1, 0.8],
      durationMs: 250
    }),
    kah: new Anim({
      frames: [drawTss, drawIh, drawP],
      times: [0, 0.1, 0.8],
      durationMs: 250
    }),
    tss: new Anim({
      frames: [drawTss, drawB],
      times: [0, 0.9],
      durationMs: 250
    }),
    idle: new Anim({ frames: [drawReactiveIdle], times: [0] })
  };
  setAnim(gAnims.idle);

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  restart();
  loop();
}

function setFaceSize() {
  gDim = 3 * min(width, height);
  gMouthPos = {
    x: width / 2,
    y: height / 2 + gDim / 20
  };
  strokeWeight(gDim / 100);
}

function Eye(x, y) {
  angleMode(RADIANS);
  this.whiteEyes = true;
  this.x = x;
  this.y = y;
  var target = function() {
    //either the mouse pos, if it's moved recently, or the fly pos
    if (gFly.isActive) {
      return { x: gFly.pos.x, y: gFly.pos.y };
    } else {
      return { x: mouseX, y: mouseY };
    }
  };
  this.offset = function() {
    var tgt = target();
    var mouseDist = dist(tgt.x, tgt.y, this.x, this.y);
    var dy = tgt.y - this.y;
    var lookAngleRads = asin(dy / mouseDist);
    var offsetMag = gDim * 0.016; //map(abs(mouseDist), 0, 0.5*max(width, height), 0, gDim * 0.016);
    var ox = cos(lookAngleRads) * offsetMag * (tgt.x > this.x ? 1 : -1);
    var oy = sin(lookAngleRads) * offsetMag;
    return { x: ox, y: oy };
  };

  this.draw = function() {
    if (this.whiteEyes) {
      fill(gPalette.eyeWhites);
    } else {
      fill(gPalette.face);
      stroke(gPalette.mouthBlack);
      strokeWeight(gDim / 130);
    }
    ellipse(this.x, this.y, gDim / 30);
    fill(gPalette.mouthBlack);
    var off = this.offset();
    ellipse(this.x + off.x, this.y + off.y, gDim / 60);
    //eyelids???
    if (false) {
      fill(gPalette.face);
      arc(this.x, this.y - gDim / 45, gDim / 30, gDim / 30, PI, 0);
    }
  };
}

function draw() {
  background(gPalette.background);

  gCurrentAnim.display();
  if (millis() - gCurrentAnim.finishesAt > 2000) {
    gCurrentAnim = gAnims.idle;
  }

  drawWords();
  gFly.update();
  gFly.draw();

  //  drawDebugInfo();
}

function drawBasicFace() {
  noStroke();
  //FACE CIRCLE
  fill(gPalette.face);
  ellipse(width / 2, height / 2, min(width, height) / 2);

  var eyeL = new Eye(width / 2 - gDim / 20, height / 2 - gDim / 30);
  var eyeR = new Eye(width / 2 + gDim / 20, height / 2 - gDim / 30);

  eyeL.draw();
  eyeR.draw();
  noStroke();
}

function drawMmm() {
  drawBasicFace();
  stroke("#333333");
  strokeWeight(gDim / 100);
  line(
    gMouthPos.x - gDim / 40,
    gMouthPos.y,
    gMouthPos.x + gDim / 40,
    gMouthPos.y
  );
}
function clampedMap(inp, inLo, inHi, outA, outB) {
  return map(constrain(inp, inLo, inHi), inLo, inHi, outA, outB);
}
function drawReactiveIdle() {
  if (!gFly.isActive) {
    drawSmile();
  } else {
    drawBasicFace();
    fill(gPalette.mouthBlack);
    var r = clampedMap(
      dist(gFly.pos.x, gFly.pos.y, gMouthPos.x, gMouthPos.y),
      0,
      min(width, height),
      gDim / 30,
      gDim / 120
    );
    ellipse(gMouthPos.x, gMouthPos.y, r, r);
  }
}

function drawSmile() {
  drawBasicFace();
  noFill();
  strokeWeight(gDim / 100);

  stroke("#333333");
  arc(
    gMouthPos.x,
    gMouthPos.y - gDim / 10,
    gDim / 10,
    gDim / 8,
    PI * 0.7 - HALF_PI,
    PI * 0.7
  );
}

function drawTss() {
  drawBasicFace();
  fill(gPalette.mouthBlack);
  arc(gMouthPos.x, gMouthPos.y - 0.015 * gDim, gDim / 35, gDim / 35, 0, PI);
  fill(gPalette.teethWhite);
  rect(gMouthPos.x, gMouthPos.y - 0.0090 * gDim, gDim / 80, gDim / 180);
  rect(gMouthPos.x, gMouthPos.y + 0.005 * gDim, gDim / 80, gDim / 160);
}

function drawIh() {
  drawBasicFace();
  fill(gPalette.mouthBlack);
  arc(gMouthPos.x, gMouthPos.y - 0.014 * gDim, gDim / 35, gDim / 35, 0, PI);
  fill(gPalette.tongue);
  arc(gMouthPos.x, gMouthPos.y + 0.011 * gDim, gDim / 100, gDim / 240, PI, 0);
}

function drawP() {
  drawBasicFace();
  stroke(gPalette.mouthBlack);

  strokeWeight(gDim / 100);
  line(
    gMouthPos.x - gDim / 40,
    gMouthPos.y,
    gMouthPos.x + gDim / 40,
    gMouthPos.y
  );
}

function drawB() {
  drawBasicFace();
  stroke("#333333");
  strokeWeight(gDim / 100);

  line(
    gMouthPos.x - gDim / 40,
    gMouthPos.y,
    gMouthPos.x + gDim / 40,
    gMouthPos.y
  );
}

function drawOoh() {
  drawBasicFace();
  fill(gPalette.mouthBlack);
  ellipse(gMouthPos.x, gMouthPos.y, gDim / 80, gDim / 80);
}

function drawDebugInfo() {
  fill(gPalette.text);
  textSize(20);
  noStroke();
  text("debugstep: " + gCurrentAnim.debugStep, 100, 200);
  text("frame Showing: " + gCurrentAnim.frameShowing, 100, 300);
}

function drawWords() {
  noStroke();
  fill(gPalette.text);
  var words = gHistory.slice(-4).reverse();
  var first = true;
  var i = 0;
  words.forEach(function(w) {
//    fill(255, map(i, 0, words.length - 1, 255, 30));
    if (first) {
      textSize(30);
      first = false;
    } else {
      textSize(20);
    }
    text(w, width * 0.8, height / 2 - i * 40);
    i++;
  });
}

function playNextInBeat() {
  gBeat[gBeatIx]();
  gBeatIx = (gBeatIx + 1) % gBeat.length;
}
function mousePressed() {
  gLastActivity = millis();
  playNextInBeat();
}

function mouseMoved() {
  gLastActivity = millis();
}

function say(msg) {
  gLastActivity = millis();
  gHistory.push(msg);
}

function setAnim(anim) {
  if (anim) {
    gCurrentAnim = anim;
    gCurrentAnim.start();
  } else {
    console.log("ERROR: no anim given");
  }
}

function boom() {
  say("boom ('b')");
  gMySound.play(0, 1, 0.5, 0, 0.38);

  setAnim(gAnims.boom);
}

function idle() {
  say("...");
  setAnim(gAnims.idle);
}

function bip() {
  say("bip");
  setAnim(gAnims.bip);
}

function kah() {
  say("kah ('k')");
  gMySound.play(0, 1, 0.5, 0.75, 0.4);
  setAnim(gAnims.kah);
}

function tss() {
  say("tss ('t')");
  gMySound.play(0, 1, 0.5, 0.38, 0.2);

  setAnim(gAnims.tss);
}

function keyPressed() {
  switch (key) {
    case "B":
      boom();
      break;
    case "I":
      bip();
      break;
    case "K":
      kah();
      break;
    case "C":
      restart();
      break;
    case "R":
      idle();
      break;
    case "T":
      tss();
      break;
    case " ":
      playNextInBeat();
      break;
    default:
  }
}
