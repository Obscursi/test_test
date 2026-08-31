/**
 * Showing and updating the timer
 */

const timerElement = document.getElementById("mission-timer");


export function renderTimer(minutes, seconds) {

    if (!timerElement) {
        console.log("DEBUG : timerElement not found");
        return;
    }

    timerElement.textContent = `${minutes}:${seconds}`;

    if (minutes === "00" && seconds === "00") timerElement.classList.add("finished");
}

export function showTimer(visible) {
    if (timerElement) timerElement.style.display = visible ? "block" : "none";
}
