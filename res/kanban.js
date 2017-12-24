$(function(){
  var KanbanTest = new jKanban({
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
      },
      boards  :[
          {
              "id" : "_todo",
              "title"  : "To Do",
              "class" : "info",
              "item"  : [
                  {
                      "id":"_test_delete",
                      "title":"My Task Test",
                      "click" : function (el) {
                          alert("click");
                      }
                  },
                  {
                      "title":"Buy Milk",
                  }
              ]
          },
          {
              "id" : "_working",
              "title"  : "Working",
              "class" : "warning",
              "item"  : [
                  {
                      "title":"Do Something!",
                  },
                  {
                      "title":"Run?",
                  }
              ]
          },
          {
              "id" : "_done",
              "title"  : "Done",
              "class" : "success",
              "item"  : [
                  {
                      "title":"All right",
                  },
                  {
                      "title":"Ok!",
                  }
              ]
          }
      ]
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
  $("footer").append("<textarea class='kanban-add-textarea'></textarea><br><button class='kanban-add-btn'>Add</button>")
  autosize($("textarea"))
  $("footer").children().hide()
  $("footer").children(".kanban-add").show()
  $(".kanban-add").click(function(){
    contObj = $(this).parent().parent()
    boardId = contObj.attr("data-id")
    $(this).siblings().show()
    $(this).hide()
  })
  $(".kanban-add-btn").click(function(){
    taskTitle = $(this).prev().prev().val()
    $.ajax("/api/addCard", {board: boardId, title: taskTitle}, function(data){
      console.log(data)
      if(data!=0){
        $.growl.warning({ message: "Creation Error:\n"+data });
      }
      else{
        KanbanTest.addElement(boardId, {"title":taskTitle})
        $(this).parent().children().hide()
        $(this).siblings(".kanban-add").show()      }
    })
  })
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
})
