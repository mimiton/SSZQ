class WordBar extends Word {
  constructor () {
    super();
    let html = '<span class="bar empty"></span>';
    this.init$dom(html);

    const $bar = this.get$dom();

    const space = new Space(undefined, undefined, $bar[0]);


    this.startSpace = space;
    this.endSpace = space;
  }
}