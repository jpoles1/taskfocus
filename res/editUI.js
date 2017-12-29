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
          console.log("TXT", text)
          text = text.replace(/[\r\n]/g, "<br>");
          console.log(text)
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
      }
    }
  })
  $("#edit-modal").keydown(function(e) {
    //Cntrl + Enter
    if (e.ctrlKey && e.keyCode == 13) {
      app.saveCard();
      $("#edit-modal-btn").prop("checked", false);
    }
    //Esc
    if (e.keyCode == 27) {
      $("#edit-modal-btn").prop("checked", false);
    }
  })
  $("#edit-modal-save").click(function() {
    app.saveCard();
    $("#edit-modal-btn").prop("checked", false);
  })
  return app
}