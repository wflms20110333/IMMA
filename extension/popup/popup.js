function helloWorld() {
    console.log('in helloWorld');
    var data = serverQuery('helloWorld', function(data) {
        // prints each key-value pair in the returned json
        for (var propName in data) {
            sendNotification('../images/ironman_clear.PNG', propName + '... '+ data[propName]);
        }
    });
}