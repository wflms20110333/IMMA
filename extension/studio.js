$(document).ready(function() {
    $("#add").click(function() { // process for creating custom messages
    	// where to place next message
        var lastField = $("#yourform div:last");
        var intId = (lastField && lastField.length && lastField.data("idx") + 1) || 1;
        var fieldWrapper = $("<div class=\"fieldwrapper\" id=\"field" + intId + "\"/>");
        fieldWrapper.data("idx", intId);
        // get contents
        var flabel = document.getElementById('messagecontent').value;
        document.getElementById('messagecontent').value = "";
        var removeButton = $("<input type=\"button\" class=\"remove\" value=\"-\" />");
        removeButton.click(function() {
            $(this).parent().remove();
        });
        //export contents
        fieldWrapper.append(flabel);
        fieldWrapper.append(removeButton);
        $("#yourform").append(fieldWrapper);
    });
});
