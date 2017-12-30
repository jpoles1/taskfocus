vueEditInit = function(conn) {
  var app = new Vue({
    el: '#edit-modal',
    data: {
      id: "",
      boardID: "",
      title: "",
      details: "",
      tasks: {}
    },
    computed: {
      orderedTasks: function() {
        console.log(this.tasks)
        return Object.values(this.tasks).sort(function(a, b) {
          if (a.checked != b.checked) {
            return a.checked
          } else {
            return parseInt(a.id) > parseInt(b.id)
          }
        })
      }
    },
    methods: {
      cleanDetails(detailsText) {
        if (detailsText == "") {
          return ""
        }
        return this.linkify(detailsText)
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
      saveCard: function() {
        detailsData = {
          CardID: this.id,
          BoardID: this.boardID,
          WallID: urlWallID,
          Details: this.details
        }
        conn.send("changeCardDetails ~ ~ " + JSON.stringify(detailsData))
      },
      addChecklistItem: function(taskText) {
        checklistData = {
          CardID: this.id,
          BoardID: this.boardID,
          WallID: urlWallID,
          TaskText: taskText
        }
        conn.send("addChecklistItem ~ ~ " + JSON.stringify(checklistData))
      },
      updateChecklistItem: function(taskID, checked) {
        checklistData = {
          TaskID: taskID,
          CardID: this.id,
          BoardID: this.boardID,
          WallID: urlWallID,
          Checked: checked
        }
        conn.send("updateChecklistItem ~ ~ " + JSON.stringify(checklistData))
      },
      deleteChecklistItem: function(taskID) {
        checklistData = {
          TaskID: taskID,
          CardID: this.id,
          BoardID: this.boardID,
          WallID: urlWallID
        }
        conn.send("deleteChecklistItem ~ ~ " + JSON.stringify(checklistData))
      },
      refreshEvents() {
        var app = this
        //TODO Doesn't seem to work
        $("#edit-modal").keydown(function(e) {
          if (e.keyCode == 27) {
            $("#edit-modal").prop("checked", false)
          }
        });
        //Editing card details
        $("#kanban-card-details").dblclick(function() {
          $(this).parent().children().show()
          $(this).hide()
          autosize.update($("textarea"))
          $(this).siblings(".kanban-card-details-form").children("textarea").focus()
          app.refreshEvents()
        })

        function submitCardDetailsForm(el) {
          app.details = $(el).parent().children("textarea").first().val()
          app.saveCard();
          $(el).siblings(".cancel").click()
        }
        $("#kanban-card-details-form textarea").off("keydown").keydown(function(e) {
          if (e.keyCode == 27) {
            $(this).siblings(".cancel").click()
          }
          if (e.ctrlKey && e.keyCode == 13) {
            submitCardDetailsForm(this)
          }
        })
        $("#kanban-card-details-form button").click(function() {
          submitCardDetailsForm(this)
        })

        function submitCardChecklist(el) {
          app.addChecklistItem($(el).val());
          $(el).val("")
        }
        //Task creation
        $(".kanban-card-task-form textarea").off("keydown").keydown(function(e) {
          if (e.keyCode == 27) {
            $(this).val("")
          }
          if (e.ctrlKey && e.keyCode == 13) {
            submitCardChecklist(this)
          }
        })
        $(".kanban-checklist-item input").off("click").click(function() {
          taskID = $(this).parent().parent().attr("data-eid")
          app.updateChecklistItem(taskID, $(this).prop("checked"));
        })
        //Task deletion
        $(".kanban-checklist-item-delete").off("click").click(function() {
          taskID = $(this).parent().attr("data-eid")
          app.deleteChecklistItem(taskID);
        })
      }
    }
  })
  return app
}