vueInit = function(conn, boardData) {
  var drake, drakeBoard
  var app = new Vue({
    el: '#myKanban',
    data: {
      wallWidth: 800,
      boardWidth: 300,
      gutter: 15,
      responsiveWidth: 400,
      boardList: Object.values(JSON.parse(boardData))
    },
    methods: {
      addCard: function(boardID, card) {
        Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
      },
      addBoard: function(boardID, name) {
        this.boardList.push({
          id: boardID,
          title: name,
          item: {}
        })
        this.calcWidth()
        setTimeout(this.refreshEvents, 200)
      },
      changeBoardTitle: function(boardID, name) {
        //Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        this.boardList[boardID].title = name
        this.calcWidth()
        setTimeout(this.refreshEvents, 200)
      },
      calcWidth: function() {
        this.wallWidth = (this.boardWidth + 2 * this.gutter) * (this.boardList.length + 1)
        console.log(this.wallWidth)
      },
      refreshEvents: function() {
        autosize($("textarea"))
        $(".cancel").click(function() {
          $(this).parent().parent().children().show()
          $(this).parent().hide()
          $(this).siblings("input,textarea").each(function() {
            if ($(this).attr("defaultvalue")) {
              $(this).val($(this).attr("defaultvalue"))
            } else {
              $(this).val("")
            }
          })
        })
        $(".kanban-add").click(function() {
          contObj = $(this).parent().parent()
          boardId = contObj.attr("data-id")
          $(this).siblings().show()
          $(this).hide()
          $(this).siblings("div").children("textarea").focus()
        })
        $(".kanban-add-btn").click(function() {
          contObj = $(this).parents().eq(2)
          boardID = contObj.attr("data-id")
          taskTitle = $(this).prev().prev().val()
          $(this).parent().children().hide()
          $(this).siblings(".kanban-add").show()
          $(this).siblings("textarea").val("")
          conn.send("addCard ~ ~ " + JSON.stringify({
            BoardID: boardID,
            Title: taskTitle
          }))
        })
        $(".kanban-addboard-btn").click(function() {
          $(this).parent().children().show()
          $(this).hide()
        })
        $(".kanban-addboard-form button").click(function() {
          title = $(this).siblings("input").first().val()
          if ($.trim(title) == "") {
            return
          }
          console.log("Adding new board")
          conn.send("addBoard ~ ~ " + JSON.stringify({
            Title: title
          }))
          $(this).siblings(".cancel").click()
        })
        $(".kanban-board-title").click(function() {
          $(this).parent().children().show()
          $(this).hide()
        })
        $(".kanban-board-title-form button").click(function() {
          title = $(this).siblings("input").first().val()
          if ($.trim(title) == "") {
            return
          }
          contObj = $(this).parents().eq(2)
          console.log(contObj)
          boardID = contObj.attr("data-id")
          console.log("Changing title")
          $(this).parent().parent().children().show()
          $(this).parent().hide()
          conn.send("changeBoardTitle ~ ~ " + JSON.stringify({
            BoardID: boardID,
            Title: title
          }))
        })
      },
      init: function() {
        console.log("init")
        console.log(this.$el)
        dragula([this.$el], {
          moves: function(el, source, handle, sibling) {
            return (handle.classList.contains('kanban-board-header') || handle.classList.contains('kanban-board-title'));
          },
          accepts: function(el, target, source, sibling) {
            return target.classList.contains('kanban-container');
          },
          revertOnSpill: true,
          direction: 'horizontal',
        }).on('drag', function(el, source) {
          el.classList.add('is-moving');
          this.dragBoard(el, source);
          if (typeof(el.dragfn) === 'function')
            el.dragfn(el, source);
        }).on('dragend', function(el, source) {
          el.classList.remove('is-moving');
        }).on('drop', function(el, target, source, sibling) {
          el.classList.remove('is-moving');
          console.log("Moved:", el)
          console.log("From:", source, "; To:", target)
          console.log("Sibling", sibling)
          console.log($(el).next())
        });

        drake = dragula($(".kanban-board main").toArray(), function() {
          revertOnSpill: true
        }).on('drag', function(el, source) {
          el.classList.add('is-moving');
          console.log("Drag", el, $(source).parent().attr("data-id"))
        }).on('dragend', function(el, source) {
          el.classList.remove('is-moving');
        }).on('drop', function(el, target, source, sibling) {
          el.classList.remove('is-moving');
          console.log("Moved:", el)
          console.log("From:", source, "; To:", target)
          console.log("Sibling", sibling)
          console.log($(el).next())
        });
      }
    }
  })
  app.init()
  app.calcWidth()
  return app
}