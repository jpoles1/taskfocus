$(function() {
  var conn;
  if (window["WebSocket"]) {
    conn = new WebSocket("ws://" + document.location.host + "/ws");
    conn.onopen = function() {}
    conn.onclose = function(evt) {
      console.log("Connection Lost")
    };
    conn.onmessage = function(evt) {
      msgsplit = evt.data.split(" ~ ~ ")
      if (msgsplit.length == 2) {
        if (msgsplit[0] == "addWall") {
          newWall = JSON.parse(msgsplit[1])
          window.location = "/focus/" + urlAccountID + "/" + newWall.WallID
        }
      }
    }
  } else {
    var item = document.createElement("div");
    item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
  }
  //Adding a wall
  $(".kanban-addwall-btn").off("click").click(function() {
    var wallName = prompt("Name of New Wall")
    if (wallName == "" || wallName == null) {
      showError("Cannot create wall with no name.")
      return
    }
    conn.send("addWall ~ ~ " + JSON.stringify({
      AccountID: urlAccountID,
      WallName: wallName
    }))
    location.reload();
  })
})