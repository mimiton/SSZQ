class SSZQ {
  constructor(target) {
    this.$dom = $(target);

    this.init();
  }

  init () {
    this.$dom.addClass('ssz-field');
    let $root = this.$dom.children('.root');
    if ($root.length < 1) {
      this.$dom.append('<span class="root"></span>');
      $root = this.$dom.children('.root');
    }

    this.$root = $root;

    this.$dom.on('click', (e) => {
      this.focus();
      e.stopPropagation();
    });


    $(document).on('click', (e) => {
      const $root = $(e.target).parent('[sel-field]');
      if (!$.match(e.target, '[sel-field]') && $root.length < 1) {
        this.blur();
      }
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
    this.cursor.command(command);

    return this;
  }

  focus () {
    if (this.cursor) {
      this.cursor.activate();
      if (!this.cursor.currentSpace) {
        const space = new Space(undefined, undefined, this.$root[0]);
        this.cursor.moveTo(space);
      }
    }
  }

  blur () {
    if (this.cursor) {
      this.cursor.inActivate();
    }
  }

  mountKeyboard (DOMSelector) {
    this.$keyboard = $(DOMSelector);
    this.$keyboard.delegate('[attr-cmd]', 'click', (e) => {
      const command = $(e.target).attr('attr-cmd');
      this.command(command);
      e.stopPropagation();
    });
  }
}

function print (space) {
  let curSpace = space;
  while (curSpace.prevSpace) {
    curSpace = curSpace.prevSpace;
  }

  const data = [];

  do {
    const obj = {
      curSpace,
      leftElem: curSpace.leftWord && curSpace.leftWord.$dom[0],
      rightElem: curSpace.rightWord && curSpace.rightWord.$dom[0]
    };

    if (curSpace === space) {
      obj.current = true;
    }
    data.push(obj);
    curSpace = curSpace.nextSpace;
  } while (curSpace);

  console.log(data);
}