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

  command (command, extraData) {
    const currentSpace = this.currentSpace;
    if (!currentSpace) {
      return;
    }

    if (command === '<=') {
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
      const parentWord = this.currentSpace.getParentWord();
      if (parentWord instanceof WordManualInput) {
        parentWord.enter();
      }
      else {
        this.input(new WordBreak());
      }
    }
    else {
      const parentWord = this.currentSpace.getParentWord();
      for (let i in fnCommands) {
        const dataCommand = fnCommands[i].command;
        const commandList = dataCommand instanceof Array ? dataCommand : [dataCommand];

        for (let j in commandList) {
          const itemCommand = commandList[j];
          if (command === itemCommand) {
            if (!(parentWord instanceof WordManualInput)) {
              fnCommands[i].processor(this, extraData);
              return;
            }
          }
        }
      }

      for (let i = 0; i < command.length; i++) {
        this.input(new Word(command[i]));
      }
    }
  }
}

const fnCommands = [
  {
    command: '[file]',
    processor: function (cursor, extraData) {
      cursor.input(new WordImage(extraData));
    }
  },
  {
    command: '\\',
    processor: function (cursor) {
      cursor.input(new WordManualInput());
    }
  },
  {
    command: '^',
    processor: function (cursor) {
      const currentSpace = cursor.currentSpace;

      const rightWord = currentSpace.rightWord;
      const rightRightWord = rightWord && rightWord.rightSpace && rightWord.rightSpace.rightWord;
      if (rightWord instanceof WordSup) {
        cursor.moveTo(rightWord.leftSpace.nextSpace);
        return;
      }
      else if (rightRightWord instanceof WordSup) {
        cursor.moveTo(rightRightWord.leftSpace);
        return;
      }
      cursor.input(new WordSup(true));
    }
  },
  {
    command: '_',
    processor: function (cursor) {
      const currentSpace = cursor.currentSpace;

      const rightWord = currentSpace.rightWord;
      const rightRightWord = rightWord && rightWord.rightSpace && rightWord.rightSpace.rightWord;
      if (rightWord instanceof WordSub) {
        cursor.moveTo(rightWord.leftSpace.nextSpace);
        return;
      }
      else if (rightRightWord instanceof WordSub) {
        cursor.moveTo(rightRightWord.leftSpace);
        return;
      }
      cursor.input(new WordSub(true));
    }
  },
  {
    command: '\\sqrt',
    processor: function (cursor) {
      cursor.input(new WordSqrt());
    }
  },
  {
    command: ['\\frac', '/'],
    processor: function (cursor) {
      cursor.input(new WordFrac());
    }
  },
  {
    command: '\\bar',
    processor: function (cursor) {
      cursor.input(new WordBar());
    }
  },
  {
    command: '\\sum',
    processor: function (cursor) {
      cursor.input(new WordPrefix('∑'));
    }
  },
  {
    command: '\\log',
    processor: function(cursor) {
      cursor.input(new WordPrefix('log'));
    }
  },
  {
    command: '\\ln',
    processor: function(cursor) {
      cursor.input(new WordPrefix('ln'));
    }
  },
  {
    command: '\\int',
    processor: function(cursor) {
      cursor.input(new Word('∫', 'int'));
    }
  },
  {
    command: '\\oint',
    processor: function(cursor) {
      cursor.input(new Word('∮'));
    }
  },
  {
    command: '\\cases',
    processor: function(cursor) {
      cursor.input(new WordMultiLine());
    }
  }
];