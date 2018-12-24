$(document).ready(function () {

    if ($(".articleTitleSaved").text() == "") {
        $(".saved-headline").text("There are no Articles Saved..!")

    } else {
        $(".saved-headline").empty()
    }



    $(".saved").on("click", function () {
        var thisId = $(this).attr("data-id");
        var savedState = {
            saved: true
        };
        $.ajax({
            type: "PUT",
            url: "/saved/" + thisId,
            data: savedState
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data);
                location.reload();
            });
    });

    $(".not-saved").on("click", function () {
        var thisId = $(this).attr("data-id");

        var savedNotState = {
            saved: false
        };

        $.ajax({
            type: "PUT",
            url: "/savednot/" + thisId,
            data: savedNotState
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data);
                location.reload();
            });
    });

    // When you click the savenote button
    $(document).on("click", ".submitNote", function (event) {
        event.preventDefault()
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");

        // var insideNote = $(".note-text" + thisId).val()
        // var noteArray = []
        // noteArray.push(insideNote)


        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: { body: $(".note-text" + thisId).val() }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                // location.reload();
            })

            .then(function () {


                $.ajax({
                    method: "GET",
                    url: "/articles/" + thisId
                })
                    // With that done, add the note information to the page
                    .then(function (data) {
                        console.log(data.note[0].body);

                        for (let i = 0; i < data.note.length; i++) {

                            var noteDiv = $("<div class='noteDiv'>").attr("data-id", data.note[i]._id)
                            var noteText = $("<p class='noteTextP'>").text(data.note[i].body).attr("data-id", data.note[i]._id)
                            console.log(noteText);
                            var editBtn = $("<button class='editBtn'>").text("edit").attr("data-id", data.note[i]._id)
                            var delBtn = $("<button class='delBtn'>").text("X").attr("data-id", data.note[i]._id)
                            noteDiv.append(noteText, editBtn, delBtn)

                            $(".viewNoteText-" + thisId).append(noteDiv);
                        }
                        // The title of the article
                        // If there's a note in the article
                        if (data.note) {
                            $(".articleNotes-content").val(data.note.body);
                        }
                    });




            });
        $(".note-text" + thisId).val("")

    });

    $(".viewNote").on("click", function () {

        var thisId = $(this).attr("data-id");
        console.log(thisId)
        $(".viewNoteText-" + thisId).empty()

        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data.note[0].body);

                for (let i = 0; i < data.note.length; i++) {

                    var noteDiv = $("<div class='noteDiv'>").attr("data-id", data.note[i]._id)
                    var noteText = $("<p class='noteTextP'>").text(data.note[i].body).attr("data-id", data.note[i]._id)
                    console.log(noteText);
                    var editBtn = $("<button class='editBtn'>").text("edit").attr("data-id", data.note[i]._id)
                    var delBtn = $("<button class='delBtn'>").text("X").attr("data-id", data.note[i]._id)
                    noteDiv.append(noteText, editBtn, delBtn)

                    $(".viewNoteText-" + thisId).append(noteDiv);
                }
                // The title of the article
                // If there's a note in the article
                if (data.note) {
                    $(".articleNotes-content").val(data.note.body);
                }
            });
    });


    $(document).on("click", ".editBtn", function () {

        var thisId = $(this).attr("data-id");
        var content = $(".noteTextP[data-id='" + thisId + "']").text()
        console.log(content)
        $(".noteTextP[data-id='" + thisId + "']").html("<input class='editText' type='text' data-id='" + thisId + "' value='" + content + "'><button class='submitEdit' type='submit' data-id='" + thisId + "'>Submit</button>")
        console.log(content)
    });


    $(document).on("click", ".submitEdit", function () {

        var thisId = $(this).attr("data-id");
        var noteBody = $(".editText[data-id='" + thisId + "']").val()

        var updateNote = {
            body: noteBody
        };
        console.log(noteBody)

        $.ajax({
            method: "PUT",
            url: "/notes/" + thisId,
            data: updateNote
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data.body);
                $(".noteTextP[data-id='" + thisId + "']").text(data.body)

            });
    });

    $(document).on("click", ".delBtn", function () {

        var thisId = $(this).attr("data-id");
        console.group(thisId)

        $.ajax({
            method: "DELETE",
            url: "/notes/" + thisId,
            data: thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                // console.log(data.body);
                $(".noteDiv[data-id='" + thisId + "']").empty()

            });
    });


});