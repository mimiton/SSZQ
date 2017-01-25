;(function(global) {
  class SSZQ {
    constructor(target) {
      this.$dom = $(target);

      this.init();
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

    focus () {
      if (this.cursor && !this.cursor.currentSpace) {
        this.cursor.activate();
        const space = new Space(undefined, undefined, this.$root[0]);
        this.cursor.moveTo(space);
      }
    }
  }

  class Cursor {
    constructor () {
      const self = this;
      this.$dom = $('<span class="cursor"></span>');
      this.$input = $('<input class="cursor-input" type="text"/>');
      $('body').append(this.$input);

      let locked;
      this.$input.on('compositionstart', function () {
        console.log('lock')
        locked = true;
      });
      this.$input[0].oninput = function () {
        if (locked) {
          if (!/\w+/.test(this.value)) {
            console.log(this.value);
            locked = false;
          }
        }
        if (!locked) {
          for (let i = 0; i < this.value.length; i++) {
            self.input(new Word(this.value[i]));
          }
          this.value = '';
        }
      };
      this.$input[0].addEventListener('keydown', (e) => {
//        console.log(e);
        let stop;
        const code = e.keyCode;
        if (code === 54 && e.shiftKey) {
          stop = true;
          this.input(new WordSupSub(true));
        }
        else if (code === 189 && e.shiftKey) {
          stop = true;
          this.input(new WordSupSub(false, true));
        }
        else if (code === Cursor.KEY_LEFT) {
          stop = true;
          this.move(-1);
        }
        else if (code === Cursor.KEY_RIGHT) {
          stop = true;
          this.move(1);
        }
        else if (code === Cursor.KEY_UP) {
          stop = true;

        }
        else if (code === Cursor.KEY_DOWN) {
          stop = true;

        }
        else if (code === Cursor.KEY_BACKSPACE) {
          stop = true;
          this.delete();
        }

        if (stop) {
          e.stopPropagation();
          e.preventDefault();
        }

      });
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
      if (document.activeElement !== this.$input[0]) {
        this.$input.focus();
      }
      const offset = this.$dom.offset();
      this.$input.css('left', offset.left).css('top', offset.top);
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
  Cursor.KEY_LEFT = 37;
  Cursor.KEY_UP = 38;
  Cursor.KEY_RIGHT = 39;
  Cursor.KEY_DOWN = 40;
  Cursor.KEY_BACKSPACE = 8;

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
      if (targetWord && targetWord === this.leftWord) {
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
          if (targetSpace.leftWord) {
            this.leftWord = targetSpace.leftWord;
          }
          else {
            delete this.leftWord;
          }
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