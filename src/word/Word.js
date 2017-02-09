class Word {
  constructor (text, extraClass) {
    if (!text) {
      return;
    }

    let tag;

    if (/[A-Za-z]/.test(text)) {
      tag = 'var';
    }
    else {
      tag = 'span';
    }
    this.init$dom('<' + tag + (extraClass ? ' class="' + extraClass + '"': '') + '>' + text.replace(/\s/, '&nbsp;') + '</' + tag + '>');
  }

  init$dom (html) {
    this.$dom = $(html);
    this.$dom.on('click', (e) => {
      const wordDOMOffset = $(e.target).offset();
      const clickXOffset = e.clientX;

      const leftOrRight = (clickXOffset - wordDOMOffset.left) < (wordDOMOffset.width / 2);

      if (leftOrRight) {
        this.relativeCursor.moveTo(this.leftSpace);
      }
      else {
        this.relativeCursor.moveTo(this.rightSpace);
      }
      e.stopPropagation();
    });
  }

  get$dom () {
    return this.$dom;
  }

  destroy () {
    this.$dom.remove();
  }

  setRelativeCursor (cursor) {
    this.relativeCursor = cursor;
  }

  putToSpace (space) {
    const { targetDOM, direction } = space.getDOMPutRule();
    const $dom = this.get$dom();

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
    }
  }

  dettachFromLeftSpace () {
    if (this.leftSpace) {
      delete this.leftSpace.rightWord;
      delete this.leftSpace;
    }
  }
  dettachFromRightSpace () {
    if (this.rightSpace) {
      delete this.rightSpace.leftWord;
      delete this.rightSpace;
    }
  }

  attachToLeftSpace (space) {
    this.dettachFromLeftSpace();
    if (space.rightWord) {
      space.rightWord.dettachFromLeftSpace();
    }
    this.leftSpace = space;
    this.leftSpace.rightWord = this;
  }
  attachToRightSpace (space) {
    this.dettachFromRightSpace();
    if (space.leftWord) {
      space.leftWord.dettachFromRightSpace();
    }
    this.rightSpace = space;
    this.rightSpace.leftWord = this;
  }
}