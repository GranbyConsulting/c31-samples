
var tag;   // Tag to write

var write; // Did we change anything?

function doDocument() {

    // This function is called when the document is ready by
    // virtue of $(document).ready call right at the bottom
    // of this script. We call Crimson's default handler,
    // bind the input button, and start the tag update process.

    doSession();

    $("#commit").on("click", function (e) { submitData(); });

    sendRead();
}

function submitData() {

    // We are potentially going to submit all two data fields,
    // so we start at the first one, clear the flag that says
    // that we changed something, and start the write process.

    tag = 0;

    write = 0;

    submitField();
}

function submitField() {

    // Find the IDs of the element that contains the new value.

    var iid = "#inputTag" + (tag + 1);

    // Read the new value.

    var val = $(iid).val();

    if (val == "") {

        // If it is empty, skip to the next tag.

        submitNext();
    }
    else {

        // Otherwise, we are going to submit an AJAX request
        // to write the tag value, so allocate the request and
        // compose the URL per the Crimson requirements. Note
        // that we're using data page 1 and indexing the tags
        // that it lists. It's important that these tags match
        // the ones defined in the HTML above.

        var xhr = new XMLHttpRequest();

        var url = "/ajax/dataview-write.htm?page=1&tag=" + tag + "&data=\"" + val + "\"" + cacheBreaker();

        xhr.open("GET", url, true);

        xhr.onload = function () {

            // If the request completed, check the return code.

            if (xhr.status == 200) {

                // If it is 200, the write did not fail.

                if (xhr.response.length) {

                    // If the response is non-empty, we actually changed
                    // something, so set the flag we use to indicate this.

                    write = 1;

                    // And update the document via the callback.

                    updateDocument(tag, val);
                }

                // Clear the input box.

                $(iid).val("");

                // And move on to the next tag.

                submitNext();
            }
            else {

                // If we didn't get 200, show the error message.

                alertShow("alert-danger", "Error", xhr.response);
            }
        };

        xhr.onerror = function () {

            // If the request failed, show the error message.

            alertShow("alert-danger", "Error", "Failed to send write to server.");
        };

        // Send the request to the server.

        xhr.send(null);
    }
}

function submitNext() {

    // This function is called to submit the next tag,
    // either because the current tag is not being changed,
    // or because the tag was changed successfully.

    if (++tag == 2) {

        // We get here if we have processed all the tags.

        if (write) {

            // If we changed anything, show a message to that effect.

            alertShow("alert-success", "Success", "The tag values were written as requested.");

            // And read the updated values.

            readNewData();
        }
    }
    else {

        // Submit the next tag in turn.

        submitField();
    }
}

function sendRead() {

    // Create the request to read the tag values.

    var xhr = new XMLHttpRequest();

    var url = "/ajax/dataview-read.htm?page=1" + cacheBreaker();

    xhr.open("GET", url, true);

    xhr.onload = function () {

        // If the request completed, check the return code.

        if (xhr.status == 200) {

            // If it is 200, split the response into lines.

            var list = xhr.responseText.split("\n");

            for (var n = 0; n < list.length; n++) {

                // For each line, find the associated data value
                // from the server and call the callback function
                // used to update the document.

                var fields = list[n].split("\t");

                updateDocument(n, fields[0]);
            }

            // Start the read process after a delay.

            setTimeout(sendRead, 10);
        }
        else {

            // If we got another code, the read failed.

            readFailed();
        }
    };

    xhr.onerror = function () {

        // If the request failed, let the user know.

        readFailed();
    };

    // Send the request to the server.

    xhr.send(null);
}

function readFailed() {

    // We have a couple of choices here.

    if (true) {

        // The first is to show an error message, let that timeout
        // and then restart the process after another delay.

        alertShow("alert-danger", "Error", "Failed to read values from server.");
    }
    else {

        // The second is just to ERROR out the fields and
        // then start the read again after a short delay.

        // Note this code is expecting to find td elements!

        $("td[id^=showTag]").html("ERROR");

        setTimeout(sendRead, 500);
    }
}

function alertHide() {

    // Hide the alert message that we displayed.

    clearTimeout(timeout);

    $("#alertdiv").remove();

    // And try the read again after a delay.

    setTimeout(sendRead, 1500);
}

function alertShow(coloring, tagword, message) {

    // Show an alert message at the appropriate placeholder for 2.5 seconds.

    $("#alert-placeholder").html("<div id='alertdiv' class='alert " + coloring + " alert-dismissable'>" +
        "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
        "<span><strong>" + tagword + "!</strong> " + message + "</span></div>"
    );

    timeout = setTimeout(alertHide, 2500);
}
