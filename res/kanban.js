vueInit = function(conn, boardData){
  var drake, drakeBoard
  var app = new Vue({
    el: '#myKanban',
    data: {
      wallWidth: 800,
      boardWidth: 300,
      gutter: 15,
      responsiveWidth: 600,
      boardList: Object.values(JSON.parse(boardData)),
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
    },
    methods: {
      addCard: function(boardID, card){
        Vue.set(this.boardList[parseInt(boardID)]["item"], card.id, card)
      },
      addBoard: function(boardID, name){
        this.boardList.push({id: boardID, title: name, item: {}})
        this.calcWidth()
        setTimeout(this.refreshEvents, 200)
      },
      calcWidth: function(){
        this.wallWidth = (this.boardWidth + 2*this.gutter)*(this.boardList.length+1)
        console.log(this.wallWidth)
      },
      refreshEvents: function(){
        addButt = "<div class='kanban-add'>+ Add Item</div>"
        txtarea = "<textarea class='kanban-add-textarea'></textarea><br><button class='kanban-add-btn'>Add</button>"
        $("footer").html(addButt+txtarea)
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
          contObj = $(this).parent().parent()
          boardID = contObj.attr("data-id")
          taskTitle = $(this).prev().prev().val()
          $(this).parent().children().hide()
          $(this).siblings(".kanban-add").show()
          $(this).siblings("textarea").val("")
          conn.send("addCard ~ ~ "+JSON.stringify({BoardID: boardID, Title: taskTitle}))
        })
        $(".kanban-addboard-btn").click(function(){
          $(this).parent().children().show()
          $(this).hide()
        })
        $(".kanban-addboard-form button").click(function(){
          console.log("Adding new board")
          $(this).parent().parent().children().show()
          $(this).parent().hide()
          conn.send("addBoard ~ ~ "+JSON.stringify({Title: $(this).siblings("input").first().val()}))
        })
        $(".kanban-addboard-form .cancel").click(function(){
          $(this).parent().parent().children().show()
          $(this).parent().hide()
        })
      },
      init: function(){
        if(window.innerWidth > this.responsive) {
          drakeBoard = dragula([this.$el], {
            moves: function (el, source, handle, sibling) {
                return (handle.classList.contains('kanban-board-header') || handle.classList.contains('kanban-title-board'));
            },
            accepts: function (el, target, source, sibling) {
                return target.classList.contains('kanban-container');
            },
            revertOnSpill: true,
            direction: 'horizontal',
          }).on('drag', function (el, source) {
            el.classList.add('is-moving');
            self.options.dragBoard(el, source);
            if(typeof(el.dragfn) === 'function')
              el.dragfn(el, source);
          }).on('dragend', function (el) {
            el.classList.remove('is-moving');
            self.options.dragendBoard(el);
            if(typeof(el.dragendfn) === 'function')
                el.dragendfn(el);
          });

          drake = dragula($(".kanban-board").toArray(), function () {
              revertOnSpill: true
          }).on('drag', function (el, source) {
            el.classList.add('is-moving');
            self.options.dragEl(el, source);
            if(typeof(el.dragfn) === 'function')
              el.dragfn(el, source);
          }).on('dragend', function (el) {
            el.classList.remove('is-moving');
            self.options.dragendEl(el);
            if(typeof(el.dragendfn) === 'function')
              el.dragendfn(el);
          }).on('drop', function (el, target, source, sibling) {
            el.classList.remove('is-moving');
            self.options.dropEl(el, target, source, sibling);
            if(typeof(el.dragendfn) === 'function')
              el.dragendfn(el);
          })
        }
      }
    }
  })
  app.init()
  app.calcWidth()
  return app
}
