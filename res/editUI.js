vueEditInit = function(conn) {
  var app = new Vue({
    el: '#edit-modal',
    data: {
      id: "",
      boardID: "",
      title: "",
      details: "",
      tasks: []
    },
    methods: {
      cleanDetails(detailsText) {
        if (detailsText == "") {
          return "<i>Click to add details...</i>"
        }
        return this.linkify(detailsText)
      },
      linkify: function(text) {
        if (text) {
          text = text.replace(
            /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
            function(url) {
              var full_url = url;
              if (!full_url.match('^https?:\/\/')) {
                full_url = 'http://' + full_url;
              }
              return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
            }
          );
          text = text.replace(/[\r\n]/g, "<br>");
        }
        return text;
      },
      saveCard: function() {
        detailsData = {
          CardID: this.id,
          BoardID: this.boardID,
          WallID: urlWallID,
          Details: this.details
        }
        conn.send("changeCardDetails ~ ~ " + JSON.stringify(detailsData))
      },
      refreshEvents() {
        var app = this
        $("#card-details").dblclick(function() {
          $(this).parent().children().show()
          $(this).hide()
          autosize.update($("textarea"))
          $(this).siblings(".card-details-form").children("textarea").focus()
          app.refreshEvents()
        })
        $("#edit-modal-container").keydown(function(e) {
          if (e.keyCode == 27) {
            $("#edit-modal").prop("checked", false)
          }
        });

        function submitCardDetailsForm(el) {
          app.details = $(el).parent().children("textarea").first().val()
          app.saveCard();
          $(el).siblings(".cancel").click()
        }
        $("#card-details-form textarea").off("keydown").keydown(function(e) {
          if (e.keyCode == 27) {
            $(this).siblings(".cancel").click()
          }
          if (e.ctrlKey && e.keyCode == 13) {
            submitCardDetailsForm(this)
          }
        })
        $("#card-details-form button").click(function() {
          submitCardDetailsForm(this)
        })
      }
    }
  })
  return app
}