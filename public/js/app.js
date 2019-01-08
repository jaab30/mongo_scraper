$(document).ready(function () {
    // sticky header
    window.onscroll = function () { myFunction() };
    var navbar = document.getElementById("navbar");
    // Get the offset position of the navbar
    var sticky = navbar.offsetTop;
    // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function myFunction() {
        if (window.pageYOffset >= sticky) {
            navbar.classList.add("sticky")
        } else {
            navbar.classList.remove("sticky");
        }
    }

    // If there are no articles
    if ($(".articleTitle").text() == "") {
        $(".main-headlineText").text("There are no Articles yet..! Click on the \"Scrape\" button to start")

    } else {
        $(".main-headline").empty()
    }

    // If there are no Saved articles
    if ($(".articleTitleSaved").text() == "") {
        $(".saved-headlineText").text("There are no Saved Articles ..!")

    } else {
        $(".saved-headline").empty()
    }
    // when click on the "Save Article" button
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
            .then(function (data) {
                console.log(data);
                location.reload();
            });
    });
    // when click on the "Remove Article" button
    $(".not-saved").on("click", function () {
        console.log("hi")
        var thisId = $(this).attr("data-id");
        var savedNotState = {
            saved: false
        };

        $.ajax({
            type: "PUT",
            url: "/savednot/" + thisId,
            data: savedNotState
        })
            .then(function (data) {
                console.log(data);
                location.reload();
            });
    });

    // When you click the savenote button
    $(document).on("click", ".submitNote", function (event) {
        event.preventDefault()
        var thisId = $(this).attr("data-id");
        // form validation
        var formValid = true;
        if ($(".note-text" + thisId).val().trim() === "") {
            formValid = false;
        }
        if (formValid === true) {
            // save note to the database
            $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: { body: $(".note-text" + thisId).val() }
            })
                .then(function (data) {
                    console.log(data);
                })
                // then, show the notes for that article
                .then(function () {
                    $.ajax({
                        method: "GET",
                        url: "/articles/" + thisId
                    })
                        .then(function (data) {
                            console.log(data.note[0].body);
                            $(".viewNoteText-" + thisId).empty()

                            for (let i = 0; i < data.note.length; i++) {
                                var noteDiv = $("<ul class='noteDiv'>").attr("data-id", data.note[i]._id)
                                var noteText = $("<li class='noteTextP'>").text(data.note[i].body).attr("data-id", data.note[i]._id)
                                console.log(noteText);
                                var editBtn = $("<button class='editBtn'><i class='far fa-edit'></i>").attr("data-id", data.note[i]._id)
                                var delBtn = $("<button class='delBtn'><i class='fas fa-trash-alt'></i>").attr("data-id", data.note[i]._id).attr("data-article", thisId)
                                noteDiv.append(noteText, editBtn, delBtn)

                                $(".viewNoteText-" + thisId).append(noteDiv);
                            }
                            if (data.note) {
                                $(".articleNotes-content").val(data.note.body);
                            }
                        });
                    // change the "Show"/"hide" status of the note button
                    $(".view-hide[data-id='" + thisId + "']").text("Hide ")
                    $(".viewNote[data-id='" + thisId + "']").addClass("viewNoteOn").removeClass("viewNote")
                    $(".arrowNotes[data-id='" + thisId + "']").addClass("fa-caret-down").removeClass("fa-caret-right")

                });
            $(".note-text" + thisId).val("")
        } else {
            alert("Please enter your note before submitting!")
        }

    });
    // When "show note" button clicked
    $(document).on("click", ".viewNote", function () {
        console.log('test')

        var thisId = $(this).attr("data-id");
        // change the "Show"/"hide" status of the note button
        $(".viewNoteText-" + thisId).empty()
        $(".view-hide[data-id='" + thisId + "']").text("Hide ")
        $(".viewNote[data-id='" + thisId + "']").addClass("viewNoteOn").removeClass("viewNote")
        $(".arrowNotes[data-id='" + thisId + "']").addClass("fa-caret-down").removeClass("fa-caret-right")
        // display notes from database
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            // Then, add the note information to the page
            .then(function (data) {
                for (let i = 0; i < data.note.length; i++) {

                    var noteDiv = $("<ul class='noteDiv'>").attr("data-id", data.note[i]._id)
                    var noteText = $("<li class='noteTextP'>").text(data.note[i].body).attr("data-id", data.note[i]._id)
                    var editBtn = $("<button class='editBtn'><i class='far fa-edit'></i>").attr("data-id", data.note[i]._id)
                    var delBtn = $("<button class='delBtn'><i class='fas fa-trash-alt'></i>").attr("data-id", data.note[i]._id).attr("data-article", thisId)
                    noteDiv.append(noteText, editBtn, delBtn)

                    $(".viewNoteText-" + thisId).append(noteDiv);
                }
                if (data.note) {
                    $(".articleNotes-content").val(data.note.body);
                }
            }).then(function () {
                // if there are no Notes, display this message
                if ($.trim($(".viewNoteText-" + thisId).text()).length == 0) {
                    var emptyNoteText = $("<p class='emptyText'>").text("There are no Notes for this Article...")
                    $(".viewNoteText-" + thisId).append(emptyNoteText)
                }
            })

    });
    // When the show note button is displaying the notes    
    $(document).on("click", ".viewNoteOn", function () {
        var thisId = $(this).attr("data-id");
        $(".viewNoteText-" + thisId).empty()
        $(".view-hide[data-id='" + thisId + "']").text("Show ")
        $(".viewNoteOn[data-id='" + thisId + "']").addClass("viewNote").removeClass("viewNoteOn")
        $(".arrowNotes[data-id='" + thisId + "']").addClass("fa-caret-right").removeClass("fa-caret-down")

    })

    // When the edit button for each note is clicked
    $(document).on("click", ".editBtn", function () {
        var thisId = $(this).attr("data-id");
        var content = $(".noteTextP[data-id='" + thisId + "']").text()
        $(".noteTextP[data-id='" + thisId + "']").html("<input class='editText' type='text' data-id='" + thisId + "' value='" + content + "'><button class='submitEdit' type='submit' data-id='" + thisId + "'>Submit</button>")
        $(".editBtn[data-id='" + thisId + "']").addClass("editOn").removeClass("editBtn")
    });
    // When the edit button again to go back to view the note
    $(document).on("click", ".editOn", function () {
        var thisId = $(this).attr("data-id");
        var content = $(".editText[data-id='" + thisId + "']").val()
        $(".noteTextP[data-id='" + thisId + "']").replaceWith("<li class='noteTextP' data-id='" + thisId + "' >" + content + "</li > ")
        $(".editOn[data-id='" + thisId + "']").addClass("editBtn").removeClass("editOn")
    });

    // when submit button for the note is clicked - update not on the database
    $(document).on("click", ".submitEdit", function () {
        var thisId = $(this).attr("data-id");
        var noteBody = $(".editText[data-id='" + thisId + "']").val()
        $(".editOn[data-id='" + thisId + "']").addClass("editBtn").removeClass("editOn")
        var updateNote = {
            body: noteBody
        };
        $.ajax({
            method: "PUT",
            url: "/notes/" + thisId,
            data: updateNote
        })
            // With that done, add the note information to the page
            .then(function (data) {
                $(".noteTextP[data-id='" + thisId + "']").text(data.body)
            });
    });
    // when delete note button is clicked
    $(document).on("click", ".delBtn", function () {
        var thisId = $(this).attr("data-id");
        var thisarticleId = $(this).attr("data-article");
        // delete note from database
        $.ajax({
            method: "DELETE",
            url: "/notes/" + thisId,
            data: thisId
        })
            .then(function (data) {
                // delete note from display
                $(".noteDiv[data-id='" + thisId + "']").empty()
                // if there ar no notes after thisarticleId, return show/hide button to "show"
                if ($.trim($(".viewNoteText-" + thisarticleId).text()).length == 0) {
                    $(".view-hide[data-id='" + thisarticleId + "']").text("Show ")
                    $(".viewNoteOn[data-id='" + thisarticleId + "']").addClass("viewNote").removeClass("viewNoteOn")
                    $(".arrowNotes[data-id='" + thisarticleId + "']").addClass("fa-caret-right").removeClass("fa-caret-down")
                }
            })
    });
});