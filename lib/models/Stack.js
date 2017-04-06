module.exports = function Queue() {
  var arrQueue = [];
  this.enqueue = function (data) {
    arrQueue.push(data);
  };
  this.dequeue = function () {
    if (arrQueue.length) {
      return arrQueue.shift();
    }
  };
};

var queue = [];
queue.push(2); // queue is now [2]
queue.push(5); // queue is now [2, 5]
var i = queue.shift(); // queue is now [5]
alert(i);