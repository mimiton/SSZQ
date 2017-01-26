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

      if (prevSpace && prevSpace.rightWord === targetSpace.leftWord) {
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