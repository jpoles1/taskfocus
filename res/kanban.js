vueInit = function(conn, boardData) {
  var drake, drakeBoard
  var boardData = Object.values(JSON.parse(boardData))
  console.log("Populating Data:", boardData)
  var app = new Vue({
    el: '#myKanban',
    data: {
      wallWidth: 800,
      boardWidth: 300,
      gutter: 15,
      responsiveWidth: 400,
      boardList: boardData
    },
    methods: {
      addCard: function(boardID, card) {
        Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
      },
      getCardArray: function(boardID) {
        cardArray = Object.values(this.boardList[boardID]["item"])
        cardArray.sort(function(a, b) {
          return a.order - b.order
        })
        return cardArray
      },
      addBoard: function(boardID, name) {
        this.boardList.push({
          id: boardID,
          name: name,
          item: {}
        })
        this.calcWidth()
        setTimeout(this.refreshEvents, 200)
        setTimeout(this.refreshDrag, 200)
      },
      changeBoardTitle: function(boardID, title) {
        //Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        this.boardList[boardID].title = title
        this.calcWidth()
        setTimeout(this.refreshEvents, 200)
      },
      changeCardTitle: function(boardID, cardID, title) {
        //Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        this.boardList[boardID].item[cardID].title = title
        setTimeout(this.refreshEvents, 200)
      },
      moveCardBoard: function(cardID, originBoardID, destBoardID) {
        console.log("moving board:", this.boardList[parseInt(originBoardID)].item[cardID])
        Vue.set(this.boardList[parseInt(destBoardID)]["item"], cardID, this.boardList[parseInt(originBoardID)].item[cardID])
        delete this.boardList[parseInt(originBoardID)].item[cardID]
        //Change Card from one board to another
      },
      moveCardOrder: function(cardID, destBoardID, orderBefore, orderAfter) {
        var bl = this.boardList
        $.each(bl[destBoardID].item, function(cID, oldCard) {
          if (cID != cardID) {
            if (oldCard.order >= orderAfter) {
              oldCard.order = oldCard.order + 1
            }
            bl[destBoardID].item[cID] = oldCard
          }
        })
        oldCard = bl[destBoardID].item[cardID]
        oldCard.order = orderBefore + 1
        bl[destBoardID].item[cardID] = oldCard
        this.boardList = bl
      },
      calcWidth: function() {
        this.wallWidth = (this.boardWidth + 2 * this.gutter) * (this.boardList.length + 1)
      },
      refreshEvents: function() {
        autosize($("textarea"))
        $(".cancel").off("click").click(function() {
          console.log("cancel")
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
        $(".kanban-addwall-btn").off("click").click(function() {
          var wallName = prompt("Name of New Wall")
          conn.send("addWall ~ ~ " + JSON.stringify({
            AccountID: urlAccountID,
            WallName: wallName
          }))
        })
        $(".kanban-add").off("click").click(function() {
          contObj = $(this).parent().parent()
          boardId = contObj.attr("data-id")
          $(this).siblings().show()
          $(this).hide()
          $(this).siblings("div").children("textarea").focus()
        })

        function submitAddCardForm(el) {
          console.log("ADD")
          contObj = $(el).parents().eq(2)
          boardID = contObj.attr("data-id")
          taskTitle = $(el).parents().children(".kanban-add-textarea").first().val()
          conn.send("addCard ~ ~ " + JSON.stringify({
            WallID: urlWallID,
            BoardID: boardID,
            Title: taskTitle
          }))
          $(el).siblings(".cancel").click()
        }
        $(".kanban-add-btn").off("click").click(function() {
          submitAddCardForm(this)
        })
        $(".kanban-add-textarea").off("keydown").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitAddCardForm(this)
          }
        });
        $(".kanban-addboard-btn").off("click").click(function() {
          $(this).parent().children().show()
          $(this).hide()
        })

        function submitAddBoardForm(el) {
          title = $(el).parent().children("input").first().val()
          if ($.trim(title) == "") {
            return
          }
          console.log("Adding new board")
          conn.send("addBoard ~ ~ " + JSON.stringify({
            WallID: urlWallID,
            Title: title
          }))
          $(el).siblings(".cancel").click()
        }
        $(".kanban-addboard-form button").off("click").click(function() {
          submitAddBoardForm(this)
        })
        $(".kanban-addboard-form input").off("keydown").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitAddBoardForm(this)
          }
        });
        $(".kanban-board-title").off("click").click(function() {
          $(this).parent().children().show()
          $(this).hide()
        })
        $(".kanban-board-title-form button").off("click").click(function() {
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
            WallID: urlWallID,
            BoardID: boardID,
            Title: title
          }))
        })
        $(".kanban-card-title").off("click").click(function() {
          $(this).parent().children().show()
          $(this).hide()
          autosize.update($("textarea"))
        })

        function submitCardtitleForm(el) {
          title = $(el).parent().children("textarea").first().val()
          contObj = $(el).parents().eq(3)
          console.log(contObj)
          boardID = contObj.attr("data-id")
          cardID = $(el).parent().parent().attr("data-eid")
          console.log("Changing title")
          $(el).parent().parent().children().show()
          $(el).parent().hide()
          conn.send("changeCardTitle ~ ~ " + JSON.stringify({
            WallID: urlWallID,
            CardID: cardID,
            BoardID: boardID,
            Title: title
          }))
        }
        $(".kanban-card-title-form textarea").off("keydown").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitCardtitleForm(this)
          }
        });
        $(".kanban-card-title-form button").off("click").click(function() {
          submitCardtitleForm(this)
        })
      },
      refreshDrag: function() {
        var refreshEvents = this.refreshEvents
        var drake = dragula($(".kanban-board main").toArray(), function() {
          revertOnSpill: true
        })
        drake.on('drag', function(el, source) {
          el.classList.add('is-moving');
          //console.log("Drag", el, $(source).parent().attr("data-id"))
        })
        drake.on('drop', function(el, target, source, sibling) {
          el.classList.remove('is-moving');
          /*console.log("Moved:", el)
          console.log("From:", source, "; To:", target)
          console.log("Siblings", $(el).prev().attr("data-order"), $(el).next().attr("data-order"))*/
          cardID = $(el).attr("data-eid")
          sendObj = {
            WallID: urlWallID,
            CardID: cardID,
            OriginBoardID: $(source).parent().attr("data-id"),
            DestBoardID: $(target).parent().attr("data-id"),
            OrderBefore: parseInt($(el).prev().attr("data-order")),
            OrderAfter: parseInt($(el).next().attr("data-order"))
          }
          console.log(sendObj)
          if (isNaN(sendObj.OrderAfter)) {
            sendObj.OrderBefore += 1
            sendObj.OrderAfter = sendObj.OrderBefore + 2
          }
          if (isNaN(sendObj.OrderBefore)) {
            sendObj.OrderBefore = 0
            sendObj.OrderAfter = 0
          }
          conn.send("moveCard ~ ~ " + JSON.stringify(sendObj))
          drake.cancel(true);
        });
        var drakeBoard = dragula($(".kanban-board").toArray(), {
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
        })
        drakeBoard.on('drop', function(el, target, source, sibling) {
          alert("Board Dropped")
          el.classList.remove('is-moving');
          console.log("Moved:", el)
          console.log("From:", source, "; To:", target)
          console.log("Sibling", sibling)
          console.log($(el).next())
          sendObj = {
            WallID: urlWallID
            /*CardID: cardID,
            OriginBoardID: $(source).parent().attr("data-id"),
            DestBoardID: $(target).parent().attr("data-id"),
            OrderBefore: parseInt($(el).prev().attr("data-order")),
            OrderAfter: parseInt($(el).next().attr("data-order"))*/
          }
          conn.send("moveBoard ~ ~ " + JSON.stringify(sendObj))
          drake.cancel(true);
        });
      },
      init: function() {
        console.log("init")
        console.log(this.$el)
      }
    }
  })
  app.init()
  app.refreshEvents()
  app.refreshDrag()
  app.calcWidth()
  return app
}