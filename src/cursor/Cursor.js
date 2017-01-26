class Cursor {
  constructor () {
    this.$dom = $('<span class="cursor"></span>');
    this.cursorInput = new CursorInput();
    this.cursorInput.mountToCursor(this);
  }

  activate (duration) {
    if (this.isActive()) {
      return;
    }
    this.blink = false;

    this.tmr = setInterval(() => {
      this.toggle();
    }, duration || 450);
    this.toggle();
  }

  toggle () {
    if (!this.isFrozen) {
      this.blink = !this.blink;
    }
    this.syncCursorBlinkStatus();
  }

  freeze (duration) {
    this.isFrozen = true;
    if (this.freezeTmr) {
      clearTimeout(this.freezeTmr);
      delete this.freezeTmr;
    }

    this.freezeTmr = setTimeout(() => {
      this.isFrozen = false;
    }, duration || 400);
  }

  inActivate () {
    if (this.tmr) {
      clearInterval(this.tmr);
      delete this.tmr;
    }
    this.blink = false;
    this.syncCursorBlinkStatus();
  }

  isActive () {
    return !!this.tmr;
  }

  syncCursorBlinkStatus () {
    const offset = this.$dom.offset();
    this.$dom[(this.blink ? 'add' : 'remove') + 'Class']('blink');
    if (this.isActive()) {
      this.cursorInput.focus(offset);
    }
  }

  get$DOM () {
    return this.$dom;
  }

  input (word) {
    const $dom = this.$dom;

    $dom.remove();
    const spaceToDropCursor = this.currentSpace.putWord(word);
    word.setRelativeCursor(this);
//    console.log(word);
    this.moveTo(spaceToDropCursor);
//    console.log(this.currentSpace);
  }

  delete () {
    const $dom = this.$dom;
    $dom.remove();
    const spaceToDropCursor = this.currentSpace.deleteWord();
    this.moveTo(spaceToDropCursor);
  }

  moveTo (space) {
//    print(space);
    const $dom = this.$dom;
    this.currentSpace = space;
//    console.log('cursor move to:', space);

    this.activate();
    space.putDOM($dom);

    this.blink = true;
    this.freeze();
  }
  moveUpDown (offset) {
  }
  move (offset) {
    if (offset < 0) {
      for (let i = 0; i > offset; i--) {
        this.currentSpace = this.currentSpace.prevSpace || this.currentSpace;
      }
    }
    else if (offset > 0) {
      for (let i = 0; i < offset; i++) {
        this.currentSpace = this.currentSpace.nextSpace || this.currentSpace;
      }
    }
    this.moveTo(this.currentSpace);
  }

  command (command) {
    if (command === '^^') {
      this.input(new WordSupSub(true));
    }
    else if (command === '__') {
      this.input(new WordSupSub(false, true));
    }
    else if (command === '<=') {
      this.move(-1);
    }
    else if (command === '=>') {
      this.move(1);
    }
    else if (command === '^=') {
    }
    else if (command === '_=') {
    }
    else if (command === '<<') {
      this.delete();
    }
    else {
      this.input(new Word(command));
    }
  }
}
Cursor.KEY_LEFT = 37;
Cursor.KEY_UP = 38;
Cursor.KEY_RIGHT = 39;
Cursor.KEY_DOWN = 40;
Cursor.KEY_BACKSPACE = 8;