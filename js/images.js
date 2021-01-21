var loadFile = function (event) {
    var image = document.getElementById('output');
    image.style.display = "inherit";
    image.src = URL.createObjectURL(event.target.files[0]);
};