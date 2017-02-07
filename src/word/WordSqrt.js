class WordSqrt extends Word {
  constructor () {
    super();
    let html = '' +
      '<span class="sqrt">' +
      '<span class="prefix">√</span>' +
      '<span class="stem empty">' +
      '</span>' +
      '</span>';
    this.init$dom(html);

    const $prefix = this.get$dom().find('.prefix');
    const $stem = this.get$dom().find('.stem');
    this.$stem = $stem;

    const stemSpace = new Space(undefined, undefined, this.$stem[0]);

    this.startSpace = stemSpace;
    this.endSpace = stemSpace;

    $stem.on('DOMSubtreeModified', (e) => {
      const stemHeight = $stem.height();
      const height = $prefix.height();
      $prefix.css('transform', 'scale(1,' + (stemHeight/height - 0.1) + ')')
    })
  }
}