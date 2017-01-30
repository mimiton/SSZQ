class WordSupSub extends Word {
  constructor (supWord, subWord) {
    super();
    let html = '' +
      '<span class="supsub">' +
      '</span>';
    html = html.replace(/\n\s+/, '');
    this.init$dom(html);

    this.addSupWord(supWord);
    this.addSubWord(subWord);

    this.startSpace = this.startSpace || this.endSpace;
    this.endSpace = this.endSpace || this.startSpace;

    this.bindDOMEvent();
  }

  bindDOMEvent () {
    const $dom = this.get$dom();
    $dom.on('DOMSubtreeModified', () => {
      const $sup = $dom.children('sup');
      const $sub = $dom.children('sub');

      const hasSup = $sup.length > 0;
      const hasSub = $sub.length > 0;

      $dom[((hasSup && !hasSub) ? 'add' : 'remove') + 'Class']('has-sup');
      $dom[((hasSub && !hasSup) ? 'add' : 'remove') + 'Class']('has-sub');
    });
  }

  addSubWord (subWord) {
    let $sub;
    let subSpace;

    if (subWord) {
      $sub = $('<sub></sub>');
      this.$dom.append($sub);

      if (subWord === true) {
        $sub.addClass('empty');
      }
      else {
        $sub.append(subWord.get$dom());
      }

      subSpace = new Space(undefined, undefined, $sub[0]);

      if (this.rightSpace) {
        subSpace.beforeTo(this.rightSpace);
      }

      this.endSpace = subSpace;
    }
  }

  addSupWord (supWord) {
    let $sup;
    let supSpace;

    if (supWord) {
      $sup = $('<sup></sup>');
      this.$dom.prepend($sup);

      if (supWord === true) {
        $sup.addClass('empty');
      }
      else {
        $sup.append(supWord.get$dom());
      }

      supSpace = new Space(undefined, undefined, $sup[0]);

      if (this.leftSpace) {
        supSpace.afterTo(this.leftSpace);
      }

      this.startSpace = supSpace;
    }
  }
}