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
        if (!/\w+/.test(this.value)) {
          locked = false;
        }
      }
      if (!locked) {
        for (let i = 0; i < this.value.length; i++) {
          if (self.handlerCursor) {
            self.handlerCursor.command(this.value[i]);
          }
        }
        this.value = '';
      }
    });
    this.$dom.on('keydown', (e) => {
      let stop = true;
      const code = e.keyCode;
      if (code === 54 && e.shiftKey) {
        this.handlerCursor.command('^^');
      }
      else if (code === 189 && e.shiftKey) {
        this.handlerCursor.command('__');
      }
      else if (code === Cursor.KEY_LEFT) {
        this.handlerCursor.command('<=');
      }
      else if (code === Cursor.KEY_RIGHT) {
        this.handlerCursor.command('=>');
      }
      else if (code === Cursor.KEY_UP) {

      }
      else if (code === Cursor.KEY_DOWN) {

      }
      else if (code === Cursor.KEY_BACKSPACE) {
        this.handlerCursor.command('<<');
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