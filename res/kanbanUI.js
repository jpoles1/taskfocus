var vueEditApp
var currentModalCardID //string containing ID of current card in editing pane
vueKanbanInit = function(conn, boardData) {
  var drake, drakeBoard
  var boardData = Object.values(JSON.parse(boardData))
  console.log("Populating Data:", boardData)
  vueEditApp = vueEditInit(conn);

  function showError(errmsg) {
    $.growl.error({
      message: errmsg,
      location: "br",
      delayOnHover: false,
      duration: 1500
    })
  }
  var app = new Vue({
    el: '#jkanban',
    data: {
      wallName: urlWallName,
      wallWidth: 800,
      boardWidth: 300,
      gutter: 15,
      responsiveWidth: 400,
      boardList: boardData
    },
    methods: {
      startEdit: function(boardID, cardID) {
        cardData = this.boardList[parseInt(boardID)].item[cardID]
        currentModalCardID = cardID
        vueEditApp.id = cardID
        vueEditApp.boardID = boardID
        vueEditApp.title = cardData.title
        vueEditApp.details = cardData.details
        vueEditApp.tasks = cardData.tasks
        setTimeout(function() {
          autosize.update($("textarea"))
          vueEditApp.refreshEvents()
        }, 200)
      },
      linkify: function(text) {
        if (text) {
          // http://, https://, ftp://
          var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
          // www. sans http:// or https://
          var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

          return text
            .replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>')
        }
        return text;
      },
      addCard: function(boardID, card) {
        Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        setTimeout(this.refreshEvents, 200)
      },
      deleteCard: function(boardID, cardID) {
        Vue.delete(this.boardList[parseInt(boardID)].item, cardID)
      },
      getCardArray: function(boardID) {
        cardArray = Object.values(this.boardList[boardID]["item"])
        cardArray.sort(function(a, b) {
          return a.order - b.order
        })
        return cardArray
      },
      tasksLeft: function(card) {
        completedCt = 0;
        totalCt = 0;
        for (index in card.tasks) {
          task = card.tasks[index]
          if (task.checked) {
            completedCt += 1
          }
          totalCt += 1
        }
        return completedCt + "/" + totalCt
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
      changeWallName: function(wallID, name) {
        console.log("WALLSET to ", name)
        this.wallName = name;
      },
      changeBoardName: function(boardID, name) {
        //Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        this.boardList[boardID].name = name
        this.calcWidth()
        setTimeout(this.refreshEvents, 200)
      },
      changeCardTitle: function(boardID, cardID, title) {
        //Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        this.boardList[boardID].item[cardID].title = title
        if (cardID == currentModalCardID) {
          vueEditApp.title = title
        }
        setTimeout(this.refreshEvents, 200)
      },
      changeCardDetails: function(boardID, cardID, details) {
        //Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
        this.boardList[boardID].item[cardID].details = details
        if (cardID == currentModalCardID) {
          vueEditApp.details = details
        }
        setTimeout(this.refreshEvents, 200)
      },
      moveCardBoard: function(cardID, originBoardID, destBoardID) {
        console.log("moving board:", this.boardList[parseInt(originBoardID)].item[cardID])
        Vue.set(this.boardList[parseInt(destBoardID)]["item"], cardID, this.boardList[parseInt(originBoardID)].item[cardID])
        Vue.delete(this.boardList[parseInt(originBoardID)].item, cardID)
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
      addChecklistItem: function(boardID, cardID, taskID, taskText) {
        taskObj = {
          id: taskID,
          details: taskText,
          checked: false
        }
        Vue.set(this.boardList[boardID].item[cardID].tasks, taskID, taskObj)
        if (cardID == currentModalCardID) {
          Vue.set(vueEditApp.tasks, taskID, taskObj)
        }
        setTimeout(vueEditApp.refreshEvents, 200)
      },
      updateChecklistItem: function(boardID, cardID, taskID, checked) {
        taskObj = this.boardList[boardID].item[cardID].tasks[taskID]
        taskObj.checked = checked
        Vue.set(this.boardList[boardID].item[cardID].tasks, taskID, taskObj)
        if (cardID == currentModalCardID) {
          Vue.set(vueEditApp.tasks, taskID, taskObj)
        }
        setTimeout(vueEditApp.refreshEvents, 200)
      },
      deleteChecklistItem: function(boardID, cardID, taskID) {
        console.log("deleting")
        Vue.delete(this.boardList[boardID].item[cardID].tasks, taskID)
        if (cardID == currentModalCardID) {
          Vue.delete(vueEditApp.tasks, taskID)
        }
        setTimeout(vueEditApp.refreshEvents, 200)
      },
      calcWidth: function() {
        this.wallWidth = (this.boardWidth + 2 * this.gutter) * (this.boardList.length + 1)
      },
      refreshEvents: function() {
        autosize($("textarea"))
        //Open edit form
        $(".card-edit-button").click(function() {
          cardID = $(this).parent().attr("data-eid")
          boardID = $(this).parents().eq(2).attr("data-id")
          app.startEdit(boardID, cardID)
          $("#edit-modal-btn").prop("checked", true);
        })
        //Closes the current form
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
        //Keyboard Shortcut (esc): causes form to close if pressed on an input
        //This .off() statement clears keydown events for all subsequent textarea,input
        $("textarea, input").off("keydown").keydown(function(event) {
          if (event.keyCode == 27) {
            $(this).siblings(".cancel").click()
          }
        })
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
        })
        //Changing wall name
        $(".kanban-wall-name").off("click").click(function() {
          contObj = $(this).parent().parent()
          boardId = contObj.attr("data-id")
          $(this).siblings().show()
          $(this).hide()
          $(this).siblings("div").children("textarea").focus()
        })

        function submitChangeWallName(el) {
          name = $(el).parent().children("input").first().val()
          if ($.trim(name) == "") {
            showError("Cannot set wall to blank name.")
            return
          }
          console.log("Changing Wall Name")
          conn.send("changeWallName ~ ~ " + JSON.stringify({
            WallID: urlWallID,
            Name: name
          }))
          $(el).siblings(".cancel").click()
        }
        $(".kanban-wall-name-form button").off("click").click(function() {
          submitChangeWallName(this)
        })
        $(".kanban-wall-name-form input").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitChangeWallName(this)
          }
        });
        //Adding Cards
        $(".kanban-add").off("click").click(function() {
          contObj = $(this).parent().parent()
          boardId = contObj.attr("data-id")
          $(this).siblings().show()
          $(this).hide()
          $(this).siblings("div").children("textarea").focus()
        })

        function submitAddCardForm(el) {
          taskTitle = $(el).parents().children(".kanban-add-textarea").first().val()
          if ($.trim(taskTitle) == "") {
            showError("Cannot create blank card.")
            return
          }
          console.log("ADD")
          contObj = $(el).parents().eq(2)
          boardID = contObj.attr("data-id")
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
        $(".kanban-add-textarea").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitAddCardForm(this)
          }
        });
        $(".kanban-addboard-btn").off("click").click(function() {
          $(this).parent().children().show()
          $(this).hide()
          $(this).siblings(".kanban-addboard-form").children("input").focus()
        })

        function submitAddBoardForm(el) {
          name = $(el).parent().children("input").first().val()
          if ($.trim(name) == "") {
            showError("Cannot create board with no name.")
            return
          }
          console.log("Adding new board")
          conn.send("addBoard ~ ~ " + JSON.stringify({
            WallID: urlWallID,
            Name: name
          }))
          $(el).siblings(".cancel").click()
        }
        $(".kanban-addboard-form button").off("click").click(function() {
          submitAddBoardForm(this)
        })
        $(".kanban-addboard-form input").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitAddBoardForm(this)
          }
        });
        $(".kanban-board-title").off("click").click(function() {
          $(this).parent().children().show()
          $(this).hide()
          $(this).siblings(".kanban-board-title-form").children("input").focus()
        })

        function submitBoardNameForm(el) {
          name = $(el).parent().children("input").first().val()
          if ($.trim(name) == "") {
            showError("Cannot set board to blank name.")
            return
          }
          contObj = $(el).parents().eq(2)
          console.log(contObj)
          boardID = contObj.attr("data-id")
          console.log("Changing title")
          $(el).parent().parent().children().show()
          $(el).parent().hide()
          conn.send("changeBoardName ~ ~ " + JSON.stringify({
            WallID: urlWallID,
            BoardID: boardID,
            Name: name
          }))
        }
        $(".kanban-board-title-form input").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitBoardNameForm(this)
          }
        });
        $(".kanban-board-title-form button").off("click").click(function() {
          submitBoardNameForm(this)
        })
        $(".kanban-card-title").off("dblclick").dblclick(function() {
          $(this).parent().children().show()
          $(this).hide()
          autosize.update($("textarea"))
          $(this).siblings(".kanban-card-title-form").children("textarea").focus()
        })

        function submitCardTitleForm(el) {
          title = $(el).parent().children("textarea").first().val()
          contObj = $(el).parents().eq(3)
          console.log(contObj)
          boardID = contObj.attr("data-id")
          cardID = $(el).parent().parent().attr("data-eid")
          console.log("Changing title")
          $(el).parent().parent().children().show()
          $(el).parent().hide()
          if ($.trim(title) == "") {
            if (confirm("Confirm Card Deletion:")) {
              conn.send("deleteCard ~ ~ " + JSON.stringify({
                WallID: urlWallID,
                CardID: cardID,
                BoardID: boardID,
              }))
            }
          } else {
            conn.send("changeCardTitle ~ ~ " + JSON.stringify({
              WallID: urlWallID,
              CardID: cardID,
              BoardID: boardID,
              Title: title
            }))
          }

        }
        $(".kanban-card-title-form textarea").keydown(function(e) {
          if (e.ctrlKey && e.keyCode == 13) {
            submitCardTitleForm(this)
          }
        });
        $(".kanban-card-title-form button").off("click").click(function() {
          submitCardTitleForm(this)
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
        $(this.$el).show()
      }
    }
  })
  app.init()
  app.refreshEvents()
  app.refreshDrag()
  app.calcWidth()
  return app
}