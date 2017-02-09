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

  getDOMPutRule () {
    let targetDOM;
    let direction;
    const { leftWord, rightWord, parentElem } = this;

    if (leftWord && rightWord) {
      const $leftWordDOM = leftWord.get$dom();
      const $rightWordDOM = rightWord.get$dom();

      if (
        $leftWordDOM.hasAttr('attr-has_container')
        &&
        $rightWordDOM.hasAttr('attr-has_container')
        &&
        $leftWordDOM.parent()[0] === $rightWordDOM.parent()[0]
        ) {
        return false;
      }
    }

    if (parentElem) {
      targetDOM = parentElem;
      direction = 'inner';
    }
    else if (leftWord) {
      const $leftWordDOM = leftWord.get$dom();
      if ($leftWordDOM.hasAttr('attr-has_container')) {
        targetDOM = $leftWordDOM.parent()[0];
        direction = 'right';
      }
      else {
        targetDOM = $leftWordDOM[0];
        direction = 'right';
      }
    }
    else if (rightWord) {
      const $rightWordDOM = rightWord.get$dom();
      if ($rightWordDOM.hasAttr('attr-cursor_jump_over')) {
        targetDOM = $rightWordDOM.parent()[0];
        direction = 'left';
      }
      else {
        targetDOM = $rightWordDOM[0];
        direction = 'left';
      }
    }

    if (targetDOM && direction) {
      return {
        targetDOM,
        direction
      }
    }
    else {
      return false;
    }
  }

  putWord (word) {
    word.putToSpace(this);

    this._removeEmpty();
    const newSpace = new Space();

    if (this.leftWord) {
      this.leftWord.attachToRightSpace(newSpace);
    }
    newSpace.beforeTo(this);
    word.attachToLeftSpace(newSpace);
    word.attachToRightSpace(this);

    if (word.startSpace && word.endSpace) {
      newSpace.beforeTo(word.startSpace);
      this.afterTo(word.endSpace);

      return word.startSpace;
    }


    return this;
  }

  deleteWord () {
    if (!this.leftWord && !this.rightWord) {
      const nextSpace = this.nextSpace;
      if (nextSpace && !$(this.parentElem).hasAttr('attr-disable_delete')) {
        this.dettach();
        return nextSpace.deleteWord();
      }
      else if (this.prevSpace && this.prevSpace.rightWord && this.prevSpace.rightWord.rightSpace) {
        return this.prevSpace.rightWord.rightSpace.deleteWord();
      }
    }
    else if (this.leftWord) {
      const leftWord = this.leftWord;
      const rightWord = this.rightWord;
      const targetSpace = leftWord.leftSpace;

      leftWord.dettachFromLeftSpace();
      if (rightWord) {
        rightWord.attachToLeftSpace(targetSpace);
      }

      let currentSpace = this;
      let nextSpace;
      do {
        nextSpace = currentSpace.prevSpace;
        currentSpace.dettach();
        currentSpace = nextSpace;
      } while(currentSpace !== targetSpace);

      if (!targetSpace.leftWord && !targetSpace.rightWord) {
        const $parent = leftWord.get$dom().parent();
        $parent.addClass('empty');
        targetSpace.parentElem = $parent[0];
      }

      leftWord.destroy();

      return targetSpace;
    }

    return this;
  }

  _deleteWord () {
//    console.log(this);
    if (!this.leftWord && !this.rightWord) {
      const nextSpace = this.nextSpace;
      if (nextSpace) {
        this.dettach();
        nextSpace.deleteWord();
        return nextSpace;
      }
    }
    const targetSpace = this.prevSpace;
    if (!targetSpace) {
      return this;
    }

    const prevSpace = targetSpace.prevSpace;
    const targetWord = targetSpace.rightWord;

//    console.log('targetWord:', targetWord);
    if (targetWord && targetWord === this.leftWord) {
      targetSpace.dettach();

      if (prevSpace && prevSpace.rightWord && prevSpace.rightWord === targetSpace.leftWord) {
        prevSpace.rightWord.attachToRightSpace(this);
      }
      else {
        if (!this.rightWord) {
          this.parentElem = this.leftWord.get$dom().parent()[0];
//          console.log(this.parentElem);
          $(this.parentElem).addClass('empty');
        }
        if (targetSpace.leftWord) {
          targetSpace.leftWord.attachToRightSpace(this);
        }
        else {
          this.leftWord.dettachFromRightSpace();
        }
      }

      targetWord.destroy();
    }
    else {
      return this.prevSpace;
    }

    return this;
  }

  _removeEmpty () {
    if (this.parentElem) {
      $(this.parentElem).removeClass('empty');
      delete this.parentElem;
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