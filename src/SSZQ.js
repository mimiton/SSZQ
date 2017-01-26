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