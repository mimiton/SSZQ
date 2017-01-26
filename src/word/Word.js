class Word {
  constructor (text) {
    if (!text) {
      return;
    }
    this.init$dom('<span>' + text.replace(/\s/, '&nbsp;') + '</span>');
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