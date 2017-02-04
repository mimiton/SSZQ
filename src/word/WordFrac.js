class WordFrac extends Word {
  constructor () {
    super();
    let html = '<span class="fraction"></span>';
    this.init$dom(html);

    this.addNumerator();
    this.addDenominator();

    this.startSpace = this.startSpace || this.endSpace;
    this.endSpace = this.endSpace || this.startSpace;

    if (this.startSpace && this.endSpace && (this.startSpace !== this.endSpace)) {
      this.startSpace.beforeTo(this.endSpace);
    }
  }

  addNumerator () {
    const $dom = this.get$dom();

    let $numerator;
    let space;
    $numerator = $('<span class="numerator"></span>');
    $dom.prepend($numerator);

    $numerator.addClass('empty');

    space = new Space(undefined, undefined, $numerator[0]);

    if (this.leftSpace) {
      space.afterTo(this.leftSpace);
    }

    this.startSpace = space;
  }

  addDenominator () {
    const $dom = this.get$dom();

    let $denominator;
    let space;
    $denominator = $('<span attr-disable_delete class="denominator"></span>');
    $dom.append($denominator);

    $denominator.addClass('empty');

    space = new Space(undefined, undefined, $denominator[0]);

    if (this.rightSpace) {
      space.beforeTo(this.rightSpace);
    }

    this.endSpace = space;
  }
}