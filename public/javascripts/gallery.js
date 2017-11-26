$(function() {
  var templates = {};
  var photos;
  var allComments = [];
  var currentPhotoIdx = 0;

  $("[type='text/x-handlebars']").each(function() {
    templates[$(this).attr("id")] = Handlebars.compile($(this).html());
  })

  $("[data-type='partial']").each(function() {
    Handlebars.registerPartial($(this).attr("id"), $(this).html());
  })

  $.ajax({
    url: "/photos",
    success: function(photos_json) {
      photos = photos_json;
      renderPhotos();
      renderPhotoInfo(currentPhotoIdx);
      getCommentsFor(photos[0].id);
    }
  })

  $(".next").click(function(e) {
    e.preventDefault();
    currentPhotoIdx = (currentPhotoIdx + 1) % photos.length;
    displayPhotoAndInfo();
  })

  $(".prev").click(function(e) {
    e.preventDefault();
    if (currentPhotoIdx - 1 < 0) {
      currentPhotoIdx = photos.length - 1;
    } else {
      currentPhotoIdx -= 1;
    }
    displayPhotoAndInfo();
  })

  $("section > header").on("click", ".actions a", (function(e) {
    e.preventDefault();
    $.ajax({
      url: $(e.target).attr("href"),
      method: "POST",
      data: "photo_id" + $(e.target).attr("data-id"),
      success: function(json) {
        $e.text(function(i, txt) {
          return txt.replace(/\d+/, json.total);
        })
      }
    })
  }))

  function renderPhotos() {
    $("#slides").append(templates.photos({photos: photos}));
  }

  function renderPhotoInfo(idx) {
    $("section > header").html(templates.photo_information(photos[idx]));
  }

  function getCommentsFor(idx) {
    $.ajax({
      url: "/comments",
      data: "photo_id=" + idx,
      success: function(comments_json) {
        $("#comments_section").html(templates.comments({comments: comments_json}));
      }
    })
  }

  function displayPhotoAndInfo() {
    $("#slides").children($("figure")).not(":hidden").each(function() {
      $(this).fadeOut(500);
    });
    $("figure").eq(currentPhotoIdx).fadeIn(500);
    renderPhotoInfo(currentPhotoIdx);
    getCommentsFor(photos[currentPhotoIdx].id);
  }
})
