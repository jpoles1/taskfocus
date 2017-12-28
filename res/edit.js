vueEditInit = function(conn) {
  var app = new Vue({
    el: '#edit-modal',
    data: {
      id: "",
      boardID: "",
      title: "",
      details: ""
    },
    methods: {
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