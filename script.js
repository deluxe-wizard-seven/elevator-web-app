const ELEVATOR_MOVEMENT_TIME_INTERVAL = 5000; // (in milliseconds) the time taken for the elevator to go from one floor to its adjacent one
const ELEVATOR_STOPPAGE_TIME_INTERVAL = 2000; // (in milliseconds) the time for which it will wait at a floor, given that any button at that floor is pressed

const UP = 0;
const DOWN = 1;

const TOP_MOST_FLOOR = 2;
const BOTTOM_MOST_FLOOR = 0;

let currentPosition = BOTTOM_MOST_FLOOR; // inititally the elevator is in the ground floor

let movingUp = false;
let movingDown = false;

let buttons = []; // buttons will contain the states of the button pressed at a given floor, thus if buttons[i][j] = true then it means that in the i-th floor, the j-th button (which can either be 0[UP] or 1[DOWN]) was pressed
for (let i = BOTTOM_MOST_FLOOR; i <= TOP_MOST_FLOOR; i++)
  buttons.push([false, false]);

const elevator = document.getElementById("elevator-main");

let elevatorAtFloor = [];
for (let i = 0; i <= TOP_MOST_FLOOR - BOTTOM_MOST_FLOOR; i++)
  elevatorAtFloor[i] = document.getElementById(`elevator-level-${i}`);

const audioPlayer = document.getElementById("elevator-audio");

/**
 * This funciton is used to play the elevator audio.
 */
function playAudio() {
  audioPlayer.play();
}

/**
 * This function is used to pause the elevator audio.
 */
function pauseAudio() {
  audioPlayer.pause();
  audioPlayer.currentTime = null; // resetting the time, so that after pausing each and every time, it will start from the begining
}

/**
 * This function is used to set the component of a color based on its id.
 *
 * @param {String} elementId The id of the element.
 * @param {String} color The name/hexcode of the color.
 */
function setBgColorOfElementById(elementId, color) {
  document.getElementById(elementId).style.backgroundColor = color;
}

/**
 * This function returns whether any button is pressed or not, above or below based on the direction.
 *
 * @param {Number} direction Can be 0(=UP) or 1(=DOWN).
 * @returns true if any button of given direction is pressed, else false.
 */
function anyButtonPressedAtAnyFloor(direction) {
  for (let i = BOTTOM_MOST_FLOOR; i <= TOP_MOST_FLOOR; i++)
    if (buttons[i][direction]) return true;
  return false;
}

/**
 * This function is used to get the coordinates of the adjacent floor based on the direction.
 *
 * @param {Number} direction Can be 0(=UP) or 1(=DOWN).
 * @param {Number} floor The current floor/level of the elevator.
 * @returns An object having the properties { top: The top coordinate of the elevator's new position, left: The left coordinate of the elevator's new position, floor: The adjacent floor where the elevator will visit, to: The destination }
 */
function getFloorCoordinates(direction, floor) {
  const srcFloor = elevator[floor];
  const destFloor =
    direction === UP ? elevatorAtFloor[floor + 1] : elevatorAtFloor[floor - 1];
  const clone = elevator.cloneNode();
  clone.style.visibility = "hidden";
  destFloor.appendChild(clone);
  const newTop =
    clone.getBoundingClientRect().top - elevator.getBoundingClientRect().top;
  const newLeft =
    clone.getBoundingClientRect().left - elevator.getBoundingClientRect().left;
  clone.parentNode.removeChild(clone);
  return {
    top: newTop + "px",
    left: newLeft + "px",
    floor: direction === UP ? floor + 1 : floor - 1,
    to: destFloor,
  };
}

/**
 * This function implements the transition details of the elevator from one floor to another.
 *
 * @param {*} obj Must contain the following properties :- {top : The top coordinate of the elevator, left: The left coordinate of the elevator, floor: The adjacent/new floor, to: The destination floor}
 */
function transit({ top, left, floor, to }) {
  elevator.classList.add("elevator-transition");
  elevator.style.top = top;
  elevator.style.left = left;
  setTimeout(() => {
    elevator.style.position = "scroll";
    elevator.classList.remove("elevator-transition");
    elevator.style.removeProperty("top");
    elevator.style.removeProperty("left");
    currentPosition = floor;
    to.appendChild(elevator);
  }, ELEVATOR_MOVEMENT_TIME_INTERVAL);
}

/**
 * This utility function is used to sleep the current thread by the given time(in milliseconds) passed.
 *
 * @param {Number} milliseconds The time (in milliseconds) for which the thread will remain in waiting state.
 */
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * This function is used to move the elevator.
 */
async function moveElevator() {
  if (currentPosition === TOP_MOST_FLOOR) {
    if (anyButtonPressedAtAnyFloor(DOWN)) {
      playAudio();
      for (let floor = TOP_MOST_FLOOR; floor > BOTTOM_MOST_FLOOR; floor--) {
        if (buttons[floor][DOWN]) {
          pauseAudio();
          await sleep(ELEVATOR_STOPPAGE_TIME_INTERVAL);
          buttons[floor][DOWN] = false;
          setBgColorOfElementById(`button-down-${floor}`, "#aaa");
          playAudio();
        }
        transit(getFloorCoordinates(DOWN, floor));
        await sleep(ELEVATOR_MOVEMENT_TIME_INTERVAL);
        movingDown = false;
        pauseAudio();
      }
    } else movingDown = false;
  } else if (currentPosition === BOTTOM_MOST_FLOOR) {
    if (anyButtonPressedAtAnyFloor(UP)) {
      playAudio();
      for (let floor = BOTTOM_MOST_FLOOR; floor < TOP_MOST_FLOOR; floor++) {
        if (buttons[floor][UP]) {
          pauseAudio();
          await sleep(ELEVATOR_STOPPAGE_TIME_INTERVAL);
          buttons[floor][UP] = false;
          setBgColorOfElementById(`button-up-${floor}`, "#aaa");
          playAudio();
        }
        transit(getFloorCoordinates(UP, floor));
        await sleep(ELEVATOR_MOVEMENT_TIME_INTERVAL);
        movingUp = false;
        pauseAudio();
      }
    } else movingUp = false;
  }
}

/**
 * This function is called when the UP or DOWN button is pressed at any floor.
 *
 * @param {String} direction Can be "UP" or "DOWN".
 * @param {Number} floor The floor at which the elevator button is pressed.
 */
function move(direction, floor) {
  if (direction === "UP" || direction === "DOWN") {
    const movementDirection = direction === "UP" ? UP : DOWN;
    buttons[floor][movementDirection] = true;
    setBgColorOfElementById(
      `button-${movementDirection === UP ? "up" : "down"}-${floor}`,
      "#2e2"
    );
    buttons[TOP_MOST_FLOOR][UP] = false;
    buttons[BOTTOM_MOST_FLOOR][DOWN] = false;
    if (movementDirection === UP) {
      if (!movingUp) {
        movingUp = true;
        moveElevator();
      }
    } else {
      if (!movingDown) {
        movingDown = true;
        moveElevator();
      }
    }
  }
}
