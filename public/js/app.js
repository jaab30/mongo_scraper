$(document).ready(function () {

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

    if ($(".articleTitleSaved").text() == "") {
        $(".saved-headlineText").text("There are no Saved Articles ..!")

    } else {
        $(".saved-headline").empty()
    }

    if ($(".articleTitle").text() == "") {
        $(".main-headlineText").text("There are no Articles yet..! Click on the \"Scrape\" button to start")

    } else {
        $(".main-headline").empty()
    }


    // $.getJSON("/scrape", function(data) {
    //     // For each one
    //     for (var i = 0; i < data.length; i++) {
    //       // Display the apropos information on the page
    //       $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    //     }
    //   });

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
        var formValid = true;
        if ($(".note-text" + thisId).val().trim() === "") {
            formValid = false;
        }
        if (formValid === true) {
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
                            $(".viewNoteText-" + thisId).empty()

                            for (let i = 0; i < data.note.length; i++) {

                                var noteDiv = $("<ul class='noteDiv'>").attr("data-id", data.note[i]._id)
                                var noteText = $("<li class='noteTextP'>").text(data.note[i].body).attr("data-id", data.note[i]._id)
                                console.log(noteText);
                                var editBtn = $("<button class='editBtn'><i class='far fa-edit'></i>").attr("data-id", data.note[i]._id)
                                var delBtn = $("<button class='delBtn'><i class='fas fa-trash-alt'></i>").attr("data-id", data.note[i]._id)
                                noteDiv.append(noteText, editBtn, delBtn)

                                $(".viewNoteText-" + thisId).append(noteDiv);
                            }
                            // The title of the article
                            // If there's a note in the article
                            if (data.note) {
                                $(".articleNotes-content").val(data.note.body);
                            }
                        });

                    $(".viewNote[data-id='" + thisId + "']").addClass("viewNoteOn").removeClass("viewNote")
                    $(".arrowNotes[data-id='" + thisId + "']").addClass("fa-caret-down").removeClass("fa-caret-right")

                });
            $(".note-text" + thisId).val("")
        } else {
            alert("Please enter your note before submitting!")
        }

    });
    // var viewNoteSwicth = false
    $(document).on("click", ".viewNote", function () {
        console.log('test')

        var thisId = $(this).attr("data-id");
        // console.log(thisId)
        $(".viewNoteText-" + thisId).empty()
        $(".view-hide").text("Hide ")
        $(".viewNote[data-id='" + thisId + "']").addClass("viewNoteOn").removeClass("viewNote")
        $(".arrowNotes[data-id='" + thisId + "']").addClass("fa-caret-down").removeClass("fa-caret-right")

        // if (viewNoteSwicth == false) {

        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                // console.log(data.note[0].body);

                for (let i = 0; i < data.note.length; i++) {

                    var noteDiv = $("<ul class='noteDiv'>").attr("data-id", data.note[i]._id)
                    var noteText = $("<li class='noteTextP'>").text(data.note[i].body).attr("data-id", data.note[i]._id)
                    // console.log(noteText);
                    var editBtn = $("<button class='editBtn'><i class='far fa-edit'></i>").attr("data-id", data.note[i]._id)
                    var delBtn = $("<button class='delBtn'><i class='fas fa-trash-alt'></i>").attr("data-id", data.note[i]._id)
                    noteDiv.append(noteText, editBtn, delBtn)

                    $(".viewNoteText-" + thisId).append(noteDiv);
                }
                // The title of the article
                // If there's a note in the article
                if (data.note) {
                    $(".articleNotes-content").val(data.note.body);
                }
            });



        // viewNoteSwicth = true
        // console.log(viewNoteSwicth)
        // } else {
        //     $(".viewNoteText-" + thisId).empty()
        //     viewNoteSwicth = false
        //     console.log(viewNoteSwicth)
        // }
    });

    $(document).on("click", ".viewNoteOn", function () {
        console.log("test")
        var thisId = $(this).attr("data-id");
        $(".viewNoteText-" + thisId).empty()
        $(".view-hide").text("Show ")
        $(".viewNoteOn[data-id='" + thisId + "']").addClass("viewNote").removeClass("viewNoteOn")
        $(".arrowNotes[data-id='" + thisId + "']").addClass("fa-caret-right").removeClass("fa-caret-down")
    })


    $(document).on("click", ".editBtn", function () {

        var thisId = $(this).attr("data-id");
        console.log(content)
        var content = $(".noteTextP[data-id='" + thisId + "']").text()
        console.log(content)
        $(".noteTextP[data-id='" + thisId + "']").html("<input class='editText' type='text' data-id='" + thisId + "' value='" + content + "'><button class='submitEdit' type='submit' data-id='" + thisId + "'>Submit</button>")
        console.log(content)
        $(".editBtn[data-id='" + thisId + "']").addClass("editOn").removeClass("editBtn")
    });
    $(document).on("click", ".editOn", function () {

        var thisId = $(this).attr("data-id");
        var content = $(".editText[data-id='" + thisId + "']").val()
        console.log(content)
        $(".noteTextP[data-id='" + thisId + "']").replaceWith("<li class='noteTextP' data-id='" + thisId + "' >" + content + "</li > ")
        console.log(content)
        $(".editOn[data-id='" + thisId + "']").addClass("editBtn").removeClass("editOn")
    });


    $(document).on("click", ".submitEdit", function () {

        var thisId = $(this).attr("data-id");
        var noteBody = $(".editText[data-id='" + thisId + "']").val()
        $(".editOn[data-id='" + thisId + "']").addClass("editBtn").removeClass("editOn")

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