module.exports = function Queue() {
  var arrQueue = [];
  this.enqueue = function(data) {
    arrQueue.push(data);
  }
  this.dequeue = function() {
    if (arrQueue.length) {
      return arrQueue.shift();
    }
  }
}
