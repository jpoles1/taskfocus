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
          // http://, https://, ftp://
          var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
          // www. sans http:// or https://
          var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

          return text
            .replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>')
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