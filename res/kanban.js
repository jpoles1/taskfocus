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
  startSocket(function(conn){
    conn.send("init ~ ~ test")
    KanbanTest = new jKanban({
        element : '#myKanban',
        gutter  : '10px',
        widthBoard : '300px',
        click : function(el){
            console.log(el);
        },
        dragEl : function (el, source) {
            console.log("Drag", el, $(source).parent().attr("data-id"))
        },
        dropEl: function(el, target, source, sibling){
          console.log("Moved:", el)
          console.log("From:", source, "; To:", target)
          console.log("Sibling", sibling)
          console.log($(el).next())
        }
    });
    /*var addBoardDefault = document.getElementById('addDefault');
    addBoardDefault.addEventListener('click', function () {
        KanbanTest.addBoards(
            [{
                "id" : "_default",
                "title"  : "Kanban Default",
                "item"  : [
                    {
                        "title":"Default Item",
                    },
                    {
                        "title":"Default Item 2",
                    },
                    {
                        "title":"Default Item 3",
                    }
                ]
            }]
        )
    });
    var toDoButton = document.getElementById('addToDo');
    toDoButton.addEventListener('click',function(){
        KanbanTest.addElement(
            "_todo",
            {
                "title":"Test Add",
            }
        );
    });*/
    /*var removeBoard = document.getElementById('removeBoard');
    removeBoard.addEventListener('click',function(){
        KanbanTest.removeBoard('_done');
    });
    var removeElement = document.getElementById('removeElement');
    removeElement.addEventListener('click',function(){
        KanbanTest.removeElement('_test_delete');
    });
    var allEle = KanbanTest.getBoardElements('_todo');
    allEle.forEach(function(item, index){
        console.log(item);
    })*/
  }, function (evt) {
    msgsplit = evt.data.split(" ~ ~ ")
    if(msgsplit.length == 2){
      console.log("Msgtype:", msgsplit[0])
      console.log("Msg:", msgsplit[1])
      switch(msgsplit[0]){
        case "init":
          if(!initialized){
            console.log(msgsplit[1])
            KanbanTest.addBoards(JSON.parse(msgsplit[1]))
            addButt = "<div class='kanban-add'>+ Add Item</div>"
            txtarea = "<textarea class='kanban-add-textarea'></textarea><br><button class='kanban-add-btn'>Add</button>"
            $("footer").append(addButt+txtarea)
            autosize($("textarea"))
            $("footer").children().hide()
            $("footer").children(".kanban-add").show()
            refreshEvents()
            initialized = 1
          }
        case "addCard":
          newCard = JSON.parse(msgsplit[1])
          KanbanTest.addElement(newCard.BoardID, {"title": newCard.Title})
      }
    }
    else{
      console.log("Socket Error: Poorly Formatted Message")
    }
  })
})
