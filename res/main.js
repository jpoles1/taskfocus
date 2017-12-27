$(function() {
  var KanbanTest
  var initialized = 0;
  var conn;
  console.log("AccountID:", urlAccountID, "WallID:", urlWallID)

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
    conn.send("init ~ ~ {\"WallID\": \"" + urlWallID + "\"}")
  }, function(evt) {
    msgsplit = evt.data.split(" ~ ~ ")
    if (msgsplit.length == 2) {
      console.log("Msgtype:", msgsplit[0])
      console.log("Msg:", msgsplit[1])
      if (msgsplit[0] == "init") {
        if (!initialized) {
          app = vueInit(conn, msgsplit[1])
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
      if (msgsplit[0] == "deleteCard") {
        card = JSON.parse(msgsplit[1])
        app.deleteCard(card.BoardID, card.CardID)
      }
      if (msgsplit[0] == "addBoard") {
        newBoard = JSON.parse(msgsplit[1])
        console.log("Brd:", newBoard)
        console.log(app.boardList)
        app.addBoard(newBoard.ID, newBoard.Name)
      }
      if (msgsplit[0] == "addWall") {
        newWall = JSON.parse(msgsplit[1])
        window.location = "/focus/" + urlAccountID + "/" + newWall.WallID
      }
      if (msgsplit[0] == "changeWallName") {
        newWall = JSON.parse(msgsplit[1])
        console.log("Change Wall Name:", newWall)
        console.log(app.boardList)
        app.changeWallName(newWall.WallID, newWall.Name)
      }
      if (msgsplit[0] == "changeBoardName") {
        newBoard = JSON.parse(msgsplit[1])
        console.log("Change Board Name:", newBoard)
        console.log(app.boardList)
        app.changeBoardName(newBoard.BoardID, newBoard.Name)
      }
      if (msgsplit[0] == "changeCardTitle") {
        newCard = JSON.parse(msgsplit[1])
        console.log("Change Card Title:", newCard)
        app.changeCardTitle(newCard.BoardID, newCard.CardID, newCard.Title)
      }
      if (msgsplit[0] == "moveCard") {
        moveData = JSON.parse(msgsplit[1])
        console.log("Move Card:", moveData)
        if (moveData.OriginBoardID != moveData.DestBoardID) {
          app.moveCardBoard(moveData.CardID, moveData.OriginBoardID, moveData.DestBoardID)
        }
        app.moveCardOrder(moveData.CardID, moveData.DestBoardID, moveData.OrderBefore, moveData.OrderAfter)
        setTimeout(app.refreshEvents, 200)
      }
    } else {
      console.log("Socket Error: Poorly Formatted Message")
    }
  })
})