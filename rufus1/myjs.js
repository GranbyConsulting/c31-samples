
function doStartup() {

    window.setInterval(function () {
        doUpdate();
    }, 500);

    $("button").click(function () {
        doUpdate();
    });
}

function doUpdate() {

    $.get("/ajax/dataview-read.htm?page=1", function (data, status) {
        var tags = data.split('\n');
        document.getElementById("data0").innerHTML = tags[0];
    });
}
