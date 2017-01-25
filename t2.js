;(function(global) {
  class GlobalKeyEventListener {
    constructor () {
      const self = this;
      this.handlers = [];

      document.addEventListener('keydown', (e) => {
//        console.log(e);
        let command;
        const code = e.keyCode;
        if (code >= 65 && code < 65 + 26) {
          command = e.key;
        }
        else if (code === 54 && e.shiftKey) {
          command = '^^';
        }
        else if (code === 189 && e.shiftKey) {
          command = '__';
        }
        else if (code === GlobalKeyEventListener.KEY_LEFT) {
          command = '<=';
        }
        else if (code === GlobalKeyEventListener.KEY_RIGHT) {
          command = '=>';
        }
        else if (code === GlobalKeyEventListener.KEY_UP) {
          command = '^=';
        }
        else if (code === GlobalKeyEventListener.KEY_DOWN) {
          command = '_=';
        }
        else if (code === GlobalKeyEventListener.KEY_BACKSPACE) {
          command = '<<';
        }

        if (!command) {
          return;
        }

        const handlers = this.handlers;

        if (handlers && handlers.length > 0) {
          handlers.forEach((handler) => {
            handler.command(command);
          });
        }
      });
    }

    registerHandler (handler) {
      this.handlers.push(handler);
    }
  }
  GlobalKeyEventListener.KEY_LEFT = 37;
  GlobalKeyEventListener.KEY_UP = 38;
  GlobalKeyEventListener.KEY_RIGHT = 39;
  GlobalKeyEventListener.KEY_DOWN = 40;
  GlobalKeyEventListener.KEY_BACKSPACE = 8;

  const keyListener = new GlobalKeyEventListener();

  class SSZQ {
    constructor(target) {
      this.$dom = $(target);

      this.init();

      keyListener.registerHandler(this);
    }

    init () {
      let $root = this.$dom.children('.root');
      if ($root.length < 1) {
        this.$dom.append('<span class="root"></span>');
        $root = this.$dom.children('.root');
      }

      this.$root = $root;

      $root.on('click', (e) => {
        this.focus(e.target);
      });
    }

    editable () {
      const cursor = new Cursor();

      this.$root.append(cursor.get$DOM());

      this.cursor = cursor;
    }

    command (command) {
      if (!this.cursor.isActive()) {
        return this;
      }

      if (command.match(/^[A-Za-z]$/)) {
        this.cursor.input(new Word(command));
      }
      else if (command === '^^') {
        this.cursor.input(new WordSupSub(true));
      }
      else if (command === '__') {
        this.cursor.input(new WordSupSub(false, true));
      }
      else if (command === '<=') {
        this.cursor.move(-1);
      }
      else if (command === '=>') {
        this.cursor.move(1);
      }
      else if (command === '^=') {
        this.cursor.moveUpDown(-1);
      }
      else if (command === '_=') {
        this.cursor.moveUpDown(1);
      }
      else if (command === '<<') {
        this.cursor.delete();
      }

      return this;
    }

    focus (DOM) {
      if (this.cursor) {
        this.cursor.activate();
        const space = new Space(undefined, undefined, this.$root[0]);
        this.cursor.moveTo(space);
      }
    }
  }

  class Cursor {
    constructor () {
      this.$dom = $('<span class="cursor"></span>');
    }

    activate (duration) {
      this.inactivate();

      this.blink = true;

      this.tmr = setInterval(() => {
        this.toggle();
      }, duration || 450);
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

    inactivate () {
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
      this.$dom[(this.blink ? 'add' : 'remove') + 'Class']('blink');
    }

    get$DOM () {
      return this.$dom;
    }

    input (word) {
      const $dom = this.$dom;
      const word$dom = word.get$dom();


      $dom.remove();
      this.currentSpace.putWord(word);
//      console.log(word);
      this.moveTo(this.currentSpace);
//      console.log(this.currentSpace);
    }

    delete () {
      const $dom = this.$dom;
      $dom.remove();
      const deleteResult = this.currentSpace.deleteWord();
      if (deleteResult === false) {
        this.move(-1);
      }
      else {
        this.moveTo(this.currentSpace);
      }
    }



    moveTo (space) {
      const $dom = this.$dom;
      this.currentSpace = space;
//      console.log('cursor move to:', space);

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
  }

  class Space {
    constructor (leftWord, rightWord, parentElem) {
      if (leftWord) {
        this.leftWord = leftWord;
      }
      if (rightWord) {
        this.rightWord = rightWord;
      }
      if (parentElem) {
        this.parentElem = parentElem;
      }
    }

    putDOM ($dom) {
      const { leftWord, rightWord, parentElem } = this;

      if (parentElem) {
        $(parentElem).append($dom);
      }
      else if (leftWord) {
        leftWord.get$dom().after($dom);
      }
      else if (rightWord) {
        rightWord.get$dom().before($dom);
      }
    }

    putWord (word) {
      const $dom = word.get$dom();

      this.putDOM($dom);

      if (this.parentElem) {
        $(this.parentElem).removeClass('empty');
        delete this.parentElem;
      }
      const newSpace = new Space();

      if (this.leftWord) {
        newSpace.leftWord = this.leftWord;
      }
      newSpace.beforeTo(this);
      this.leftWord = word;
      newSpace.rightWord = word;

      if (word.startSpace && word.endSpace) {
        newSpace.beforeTo(word.startSpace);
        this.afterTo(word.endSpace);
      }


    }

    deleteWord () {
//      console.log(this);
      if (!this.leftWord && !this.rightWord) {
        const nextSpace = this.nextSpace;
        this.dettach();
        nextSpace.deleteWord();
        return false;
      }
      const targetSpace = this.prevSpace;
      if (!targetSpace) {
        return;
      }

      const prevSpace = targetSpace.prevSpace;
      const targetWord = targetSpace.rightWord;

//      console.log('targetWord:', targetWord);
      if (targetWord) {
        targetSpace.dettach();

        if (prevSpace && prevSpace.rightWord === targetSpace.leftWord) {
          this.leftWord = prevSpace.rightWord;
        }
        else {
          if (!this.rightWord) {
            this.parentElem = this.leftWord.get$dom().parent()[0];
            console.log(this.parentElem);
            $(this.parentElem).addClass('empty');
          }
          delete this.leftWord;
        }

        targetWord.destroy();
      }
      else {
        return false;
      }
    }

    afterTo (space) {
      this.prevSpace = space;
      if (space.nextSpace) {
        this.nextSpace = space.nextSpace;
        this.nextSpace.prevSpace = this;
      }
      space.nextSpace = this;
    }
    beforeTo (space) {
      this.nextSpace = space;
      if (space.prevSpace) {
        this.prevSpace = space.prevSpace;
        this.prevSpace.nextSpace = this;
      }
      space.prevSpace = this;
    }

    dettach () {
      if (this.prevSpace) {
        if (this.nextSpace) {
          this.prevSpace.nextSpace = this.nextSpace;
        }
        else {
          delete this.prevSpace.nextSpace;
        }
      }
      if (this.nextSpace) {
        if (this.prevSpace) {
          this.nextSpace.prevSpace = this.prevSpace;
        }
        else {
          delete this.nextSpace.prevSpace;
        }
      }
    }
  }

  class Word {
    constructor (text) {
      if (!text) {
        return;
      }
      this.init$dom('<span sel_word>' + text + '</span>');
    }

    init$dom (html) {
      this.$dom = $(html);
    }

    get$dom () {
      return this.$dom;
    }

    destroy () {
      this.$dom.remove();
    }
  }

  class WordSupSub extends Word {
    constructor (supWord, subWord) {
      super();
      let $sup;
      let $sub;
      let html = '' +
        '<span sel_leaf class="supsub">' +
        '</span>';
      html = html.replace(/\n\s+/, '');
      this.init$dom(html);

      if (supWord) {
        $sup = $('<sup></sup>');
        this.$dom.append($sup);
        if (supWord === true) {
          $sup.addClass('empty');
        }
        else {
          $sup.append(supWord.get$dom());
        }
      }

      if (subWord) {
        $sub = $('<sub></sub>');
        this.$dom.append($sub);
        if (subWord === true) {
          $sub.addClass('empty');
        }
        else {
          $sub.append(subWord.get$dom());
        }
      }

      this.$sup = $sup;
      this.$sub = $sub;

      let supSpace;
      let subSpace;
      if ($sup) {
        supSpace = new Space(undefined, undefined, $sup[0]);
      }
      if ($sub) {
        subSpace = new Space(undefined, undefined, $sub[0]);
      }

      this.startSpace = supSpace || subSpace;
      this.endSpace = subSpace || supSpace;

    }
  }

  global.SSZQ = SSZQ;
})(window);