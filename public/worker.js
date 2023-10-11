self.onmessage = function (e) {
  setInterval(() => {
    postMessage("sendCompleteStateUpdate");
  }, e.data.interval);
};
