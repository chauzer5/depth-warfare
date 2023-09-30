self.onmessage = function(e) {
    setInterval(() => {
        console.log("Worker is running");
        postMessage('sendCompleteStateUpdate');
    }, e.data.interval);
}
