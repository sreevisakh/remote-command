module.exports = function stack(){
	var arrStack = [];
	this.push = function(data){
		arrStack.push(data);
	}
	this.pop = function(){
		if(arrStack.length){
			return arrStack.pop();	
		}	
	}
}