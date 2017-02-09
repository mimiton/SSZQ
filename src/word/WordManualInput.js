class WordManualInput extends Word {
  constructor () {
    super();
    let html = '<span class="word-manual-input"><span class="content empty"></span></span>';
    this.init$dom(html);

    const $content = this.get$dom().children('.content');

    const space = new Space(undefined, undefined, $content[0]);
    this.startSpace = space;
    this.endSpace = space;
  }

  enter () {
    const $content = this.get$dom().children('.content');
    const str = $content.text();
    this.relativeCursor.moveTo(this.rightSpace);
    this.relativeCursor.delete();
    this.relativeCursor.command(str);
  }
}