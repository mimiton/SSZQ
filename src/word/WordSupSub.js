class WordSupSub extends Word {
  constructor (supWord, subWord) {
    super();
    let $sup;
    let $sub;
    let html = '' +
      '<span class="supsub">' +
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