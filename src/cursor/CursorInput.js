class CursorInput {
  constructor () {
    const self = this;
    this.$dom = $('<input class="cursor-input" type="text"/>');
    $('body').append(this.$dom);

    let locked;
    this.$dom.on('compositionstart', function () {
      locked = true;
    });
    this.$dom.on('input', function () {
      if (locked) {
        if (!/^\w$|^\w[\w\']+$/.test(this.value)) {
          locked = false;
        }
      }
      if (!locked) {
        if (self.handlerCursor) {
          self.handlerCursor.command(this.value);
        }
        this.value = '';
      }
    });
    this.$dom.on('keydown', (e) => {
      let stop = true;
      const code = e.keyCode;
//      console.log(code);
      if (code === CursorInput.KEY_LEFT) {
        this.handlerCursor.command('<=');
      }
      else if (code === CursorInput.KEY_RIGHT) {
        this.handlerCursor.command('=>');
      }
      else if (code === CursorInput.KEY_UP) {

      }
      else if (code === CursorInput.KEY_DOWN) {

      }
      else if (code === CursorInput.KEY_BACKSPACE) {
        this.handlerCursor.command('<<');
      }
      else if (code === CursorInput.KEY_ENTER) {
        this.handlerCursor.command('<_|');
      }
      else {
        stop = false;
      }

      if (stop) {
        e.stopPropagation();
        e.preventDefault();
      }
    });
  }

  focus (offset) {
    if (document.activeElement !== this.$dom[0]) {
      this.$dom.focus();
    }

    if (offset) {
      this.$dom.css('left', offset.left + 20).css('top', offset.top);
    }
  }

  mountToCursor (cursor) {
    this.handlerCursor = cursor;
  }
}
CursorInput.KEY_LEFT = 37;
CursorInput.KEY_UP = 38;
CursorInput.KEY_RIGHT = 39;
CursorInput.KEY_DOWN = 40;
CursorInput.KEY_BACKSPACE = 8;
CursorInput.KEY_ENTER = 13;