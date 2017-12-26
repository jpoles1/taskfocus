$(function() {
  var KanbanTest
  var initialized = 0;
  var conn;

  function startSocket(startCallback, msgCallback) {
    if (window["WebSocket"]) {
      conn = new WebSocket("ws://" + document.location.host + "/ws");
      conn.onopen = function() {
        startCallback(conn)
      }
      conn.onclose = function(evt) {
        console.log("Connection Lost")
      };
      conn.onmessage = msgCallback
    } else {
      var item = document.createElement("div");
      item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
    }
  }
  var app;
  startSocket(function(conn) {
    conn.send("init ~ ~ test")
  }, function(evt) {
    msgsplit = evt.data.split(" ~ ~ ")
    if (msgsplit.length == 2) {
      console.log("Msgtype:", msgsplit[0])
      console.log("Msg:", msgsplit[1])
      if (msgsplit[0] == "init") {
        if (!initialized) {
          app = vueInit(conn, msgsplit[1])
          app.refreshEvents()
          initialized = 1
        }
      }
      if (msgsplit[0] == "addCard") {
        newCard = JSON.parse(msgsplit[1])
        app.addCard(newCard.BoardID, {
          "id": newCard.ID,
          "order": newCard.Order,
          "title": newCard.Title
        })
      }
      if (msgsplit[0] == "addBoard") {
        newBoard = JSON.parse(msgsplit[1])
        console.log("Brd:", newBoard)
        console.log(app.boardList)
        app.addBoard(newBoard.ID, newBoard.Title)
      }
      if (msgsplit[0] == "changeBoardTitle") {
        newBoard = JSON.parse(msgsplit[1])
        console.log("Change Title:", newBoard)
        console.log(app.boardList)
        app.changeBoardTitle(newBoard.BoardID, newBoard.Title)
      }
      if (msgsplit[0] == "moveCard") {
        moveData = JSON.parse(msgsplit[1])
        console.log("Move Card:", moveData)
        if (moveData.OriginBoardID != moveData.DestBoardID) {
          app.moveCardBoard(moveData.CardID, moveData.OriginBoardID, moveData.DestBoardID)
        }
      }
    } else {
      console.log("Socket Error: Poorly Formatted Message")
    }
  })
})