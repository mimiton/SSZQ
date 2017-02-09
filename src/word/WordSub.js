class WordSub extends Word {
  constructor () {
    super();
    let html = '<sub attr-has_container class="empty"></sub>';
    this.init$dom(html);

    const space = new Space(undefined, undefined, this.get$dom()[0]);

    this.startSpace = space;
    this.endSpace = space;
  }

  putToSpace (space) {
    const $supSubContainer = $('<span class="supsub sub-only"></span>');

    const { targetDOM, direction } = space.getDOMPutRule();
    const $dom = this.get$dom();

    switch (direction) {
      case 'inner':
        $supSubContainer.append($dom);
        $(targetDOM).append($supSubContainer);
        break;
      case 'left':
        const $prev = $(targetDOM).prev();
        if ($.match($prev[0], 'span.supsub')) {
          $prev.append($dom);
          $prev.removeClass('sup-only');
        }
        else {
          $supSubContainer.append($dom);
          $(targetDOM).before($supSubContainer);
        }
        break;
      case 'right':
        const $next = $(targetDOM).next();
        if ($.match($next[0], 'span.supsub')) {
          $next.append($dom);
          $next.removeClass('sup-only');
        }
        else {
          $supSubContainer.append($dom);
          $(targetDOM).after($supSubContainer);
        }
        break;
    }
  }
}