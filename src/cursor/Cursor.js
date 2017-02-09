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

  moveTo (space, dire) {
//    print(space);
    let direction = dire || 'next';
    this.currentSpace = space;
//    console.log('cursor move to:', space);

    this.activate();
    while(!this.putToSpace(this.currentSpace)) {
      const next = this.currentSpace[direction + 'Space'];
      if (next) {
        this.currentSpace = next;
      }
      else {
        break;
      }
    }

    this.blink = true;
    this.freeze();
  }

  putToSpace (space) {
    const { targetDOM, direction } = space.getDOMPutRule();
    const $dom = this.$dom;

    switch (direction) {
      case 'inner':
        $(targetDOM).append($dom);
        break;
      case 'left':
        $(targetDOM).before($dom);
        break;
      case 'right':
        $(targetDOM).after($dom);
        break;
      default:
        return false;
    }

    return true;
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
    this.moveTo(this.currentSpace, offset < 0 ? 'prev' : 'next');
  }

  command (command) {
    const currentSpace = this.currentSpace;
    if (!currentSpace) {
      return;
    }

    if (command === '^^') {
      const rightWord = currentSpace.rightWord;
      const rightRightWord = rightWord && rightWord.rightSpace && rightWord.rightSpace.rightWord;
      if (rightWord instanceof WordSup) {
        this.moveTo(rightWord.leftSpace.nextSpace);
        return;
      }
      else if (rightRightWord instanceof WordSup) {
        this.moveTo(rightRightWord.leftSpace);
        return;
      }
      this.input(new WordSup(true));
    }
    else if (command === '__') {
      const rightWord = currentSpace.rightWord;
      const rightRightWord = rightWord && rightWord.rightSpace && rightWord.rightSpace.rightWord;
      if (rightWord instanceof WordSub) {
        this.moveTo(rightWord.leftSpace.nextSpace);
        return;
      }
      else if (rightRightWord instanceof WordSub) {
        this.moveTo(rightRightWord.leftSpace);
        return;
      }
      this.input(new WordSub(true));
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
    else if (command === '<_|') {
      this.input(new WordBreak());
    }
    else if (command === '\\sqrt') {
      this.input(new WordSqrt());
    }
    else if (command === '\\frac') {
      this.input(new WordFrac());
    }
    else if (command === '\\bar') {
      this.input(new WordBar());
    }
    else if (command === '\\sum') {
      this.input(new WordPrefix('∑'));
    }
    else if (command === '\\log') {
      this.input(new WordPrefix('log'));
    }
    else if (command === '\\ln') {
      this.input(new WordPrefix('ln'));
    }
    else if (command === '\\int') {
      this.input(new Word('∫', 'int'));
    }
    else if (command === '\\oint') {
      this.input(new Word('∮'));
    }
    else {
      this.input(new Word(command));
    }
  }
}