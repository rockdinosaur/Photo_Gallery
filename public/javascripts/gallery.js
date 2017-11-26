$(function() {
  var scripts = {};
  var currentPhotoIdx = 0;
  var photos = [];

  $("[type='text/x-handlebars']").each(function() {
    scripts[$(this).attr("id")] = Handlebars.compile($(this).html());
  })

  $("[data-type='partial']").each(function() {
    Handlebars.registerPartial($(this).attr("id"), $(this).html());
  })

  $.ajax({
    url: "/photos",
    success: function(json) {
      json.forEach(function(photo_json) {
        photos.push(photo_json);
      });
      $("#slides").append(scripts.photos({photos: photos}));
      $("section header").html(scripts.photo_information(currentPhotoJSON()));
      getCurrentComments();
    },
  })

  $(".next").click(function(e) {
    e.preventDefault();
    currentPhotoIdx = (currentPhotoIdx + 1) % photos.length;
    renderCurrentPhoto();
    renderCurrentInfo();
    getCurrentComments();
  })

  $(".prev").click(function(e) {
    e.preventDefault();
    if (currentPhotoIdx - 1 < 0) {
      currentPhotoIdx = photos.length - 1;
    } else {
      currentPhotoIdx -= 1;
    }
    renderCurrentPhoto();
    renderCurrentInfo();
    getCurrentComments();
  })

  $("section > header").click(function(e) {
    e.preventDefault();
    if ($(e.target).hasClass("button")) {
      $.ajax({
        url: $(e.target).attr("href"),
        method: "POST",
        data: "photo_id=" + $(e.target).attr("data-id"),
        success: function(json) {
          $(e.target).text(function(i, txt) {
            return $(this).text().replace(/\d+/, json.total)
          });
        }
      })
    }
  })

  $("form").submit(function(e) {
    var currentComment;
    e.preventDefault();
    $.ajax({
      url: "/comments/new",
      method: "POST",
      data: $(this).serialize(),
      success: function(json) {
        getCurrentComments();
      }
    })
  })

  function currentPhotoJSON() {
    return photos[currentPhotoIdx];
  }

  function renderCurrentPhoto() {
    $("#slides figure").not(":hidden").fadeOut(500);
    $("#slides figure").eq(currentPhotoIdx).fadeIn(500);
  }

  function renderCurrentInfo() {
    $("section > header").html(scripts.photo_information(photos[currentPhotoIdx]))
  }

  function getCurrentComments() {
    $("[name='photo_id']").attr("value", String(photos[currentPhotoIdx].id));
    $.ajax({
      url: "/comments",
      data: "photo_id=" + photos[currentPhotoIdx].id,
      success: function(json) {
        $("#comments_section ul").html(scripts.comments({comments: json}));
      }
    })
  }
})
