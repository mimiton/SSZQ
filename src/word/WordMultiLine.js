class WordMultiLine extends Word {
  constructor () {
    super();
    let html = '<span class="multi">' +
      '<span class="left-brac"><span>{</span></span>' +
      '<span class="content empty"></span>' +
      '<span class="right-brac"><span>}</span></span>' +
      '</span>';
    html = html.replace(/\n\s+/, '');
    this.init$dom(html);

    const $dom = this.get$dom();
    const $leftBrac = $dom.children('.left-brac');
    const $rightBrac = $dom.children('.right-brac');
    const $content = this.get$dom().children('.content');

    const space = new Space(undefined, undefined, $content[0]);
    this.startSpace = space;
    this.endSpace = space;


    $content.on('DOMSubtreeModified', (e) => {
      const contentHeight = $content.height();
      const height = $leftBrac.height();
      let rate = contentHeight / height;
      rate = rate > 1 ? rate : 1;

      $leftBrac.css('transform', 'scale(1,' + (rate) + ')')
      $rightBrac.css('transform', 'scale(1,' + (rate) + ')')
    })
  }
}