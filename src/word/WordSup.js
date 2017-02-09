class WordSup extends Word {
  constructor () {
    super();
    let html = '<sup attr-has_container class="empty"></sup>';
    this.init$dom(html);

    const space = new Space(undefined, undefined, this.get$dom()[0]);

    this.startSpace = space;
    this.endSpace = space;
  }

  putToSpace (space) {
    const $supSubContainer = $('<span class="supsub sup-only"></span>');

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
          $prev.prepend($dom);
          $prev.removeClass('sub-only');
        }
        else {
          $supSubContainer.append($dom);
          $(targetDOM).before($supSubContainer);
        }
        break;
      case 'right':
        const $next = $(targetDOM).next();
        if ($.match($next[0], 'span.supsub')) {
          $next.prepend($dom);
          $next.removeClass('sub-only');
        }
        else {
          $supSubContainer.append($dom);
          $(targetDOM).after($supSubContainer);
        }
        break;
    }
  }
}