function helloWorld() {
    console.log('in helloWorld');
    var data = serverQuery('helloWorld', function(data) {
        // prints each key-value pair in the returned json
        for (var propName in data) {
            sendNotification('../images/ironman_clear.PNG', propName + '... '+ data[propName]);
        }
    });
}

/* // doesn't work with chrome extension security, #todo fix
function openPopupTab(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
} */