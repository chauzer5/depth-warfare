// timerWorker.js
let secondsLeft = 0;
let timerInterval;

self.onmessage = (e) => {
    if (e.data.command === 'start') {
        secondsLeft = e.data.seconds;
        timerInterval = setInterval(() => {
            secondsLeft = Math.max(0, secondsLeft - 1);
            postMessage({ secondsLeft });

            if (secondsLeft === 0) {
                clearInterval(timerInterval);
                postMessage({ finished: true });
            }
        }, 1000);
    } else if (e.data.command === 'stop') {
        clearInterval(timerInterval);
    }
};
