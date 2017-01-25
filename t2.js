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
        this.syncCursorBlinkStatus();
        this.blink = !this.blink;
      }, duration || 450);
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
      this.currentSpace.deleteWord();
      this.moveTo(this.currentSpace);
    }



    moveTo (space) {
      const $dom = this.$dom;
      this.currentSpace = space;
      console.log('cursor move to:', space);

      space.putDOM($dom);
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
    constructor (prevElem, nextElem, parentElem) {
      this.prevElem = prevElem;
      this.nextElem = nextElem;
      if (parentElem) {
        this.parentElem = parentElem;
      }
    }

    putDOM ($dom) {
      const { prevElem, nextElem, parentElem } = this;

      if (parentElem) {
        $(parentElem).append($dom);
      }
      else if (prevElem) {
        $(prevElem).after($dom);
      }
      else if (nextElem) {
        $(nextElem).before($dom);
      }
    }

    putWord (word) {
      const $dom = word.get$dom();

      if (this.parentElem) {
        $(this.parentElem).removeClass('empty');
      }
      this.putDOM($dom);

      this.afterToElem($dom[0]);
      const space = new Space();
      space.beforeToElem($dom[0]);
      space.beforeTo(this);
      if (word.startSpace && word.endSpace) {
        space.beforeTo(word.startSpace);
        this.afterTo(word.endSpace);
      }
    }

    deleteWord () {
      const middleSpace = this.prevSpace;
      if (!middleSpace) {
        return;
      }

      const prevSpace = middleSpace.prevSpace;
      const nextSpace = this;
//      console.log('delete word:', middleSpace);
      console.log(prevSpace, middleSpace, nextSpace);

      if (!nextSpace.prevElem) {
        return;
      }

      $(middleSpace.nextElem).remove();
      nextSpace.prevElem = nextSpace.nextElem ? nextSpace.nextElem.previousElementSibling : prevSpace.nextElem;
      middleSpace.dettach();
    }

    afterToElem (elem) {
      delete this.parentElem;
      this.prevElem = elem;
      if (elem.nextElementSibling) {
        this.nextElem = elem.nextElementSibling;
      }
      else {
        delete this.nextElem;
      }
    }
    beforeToElem (elem) {
      delete this.parentElem;
      this.nextElem = elem;
      if (elem.previousElementSibling) {
        this.prevElem = elem.previousElementSibling;
      }
      else {
        delete this.prevElem;
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