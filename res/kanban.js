function vueInit(boardData){
  console.log("DT", Object.values(JSON.parse(boardData)))
  var drake, drakeBoard
  var app = new Vue({
    el: '#myKanban',
    data: {
      boardWidth: "300px",
      gutter: "15px",
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
  console.log(drake, drakeBoard)
  addButt = "<div class='kanban-add'>+ Add Item</div>"
  txtarea = "<textarea class='kanban-add-textarea'></textarea><br><button class='kanban-add-btn'>Add</button>"
  $("footer").append(addButt+txtarea)
  autosize($("textarea"))
  $("footer").children().hide()
  $("footer").children(".kanban-add").show()
  return app
}
