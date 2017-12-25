$(function(){
  var KanbanTest
  var initialized = 0;
  var conn;
  function startSocket(startCallback, msgCallback){
    if (window["WebSocket"]) {
        conn = new WebSocket("ws://" + document.location.host + "/ws");
        conn.onopen = function(){
          startCallback(conn)
        }
        conn.onclose = function (evt) {
          console.log("Connection Lost")
        };
        conn.onmessage = msgCallback
    } else {
        var item = document.createElement("div");
        item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
    }
  }
  function refreshEvents(){
    $(".kanban-add").click(function(){
      contObj = $(this).parent().parent()
      boardId = contObj.attr("data-id")
      $(this).siblings().show()
      $(this).hide()
    })
    $(".kanban-add-btn").click(function(){
      contObj = $(this).parent().parent()
      boardID = contObj.attr("data-id")
      taskTitle = $(this).prev().prev().val()
      $(this).parent().children().hide()
      $(this).siblings(".kanban-add").show()
      $(this).siblings("textarea").val("")
      conn.send("addCard ~ ~ "+JSON.stringify({BoardID: boardID, Title: taskTitle}))
    })
  }
  var app;
  startSocket(function(conn){
    conn.send("init ~ ~ test")
    $("#myKanban").append("<div class='kanban-board'><header class='kanban-board-header'><button class='kanban-addboard-btn'>+ Add Board</button></header>")
  }, function (evt) {
    msgsplit = evt.data.split(" ~ ~ ")
    if(msgsplit.length == 2){
      console.log("Msgtype:", msgsplit[0])
      console.log("Msg:", msgsplit[1])
      if(msgsplit[0] == "init"){
        if(!initialized){
          app = vueInit(msgsplit[1])
          refreshEvents()
          initialized = 1
        }
      }
      if(msgsplit[0] == "addCard"){
        newCard = JSON.parse(msgsplit[1])
        console.log("CRD:", newCard)
        console.log(app.boardList)
        app.addCard(newCard.BoardID, {"id": newCard.ID, "title": newCard.Title})
        console.log(app.boardList[parseInt(newCard.BoardID)])
      }
    }
    else{
      console.log("Socket Error: Poorly Formatted Message")
    }
  })
})
