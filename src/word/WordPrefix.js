class WordPrefix extends Word {
  constructor (text) {
    super();
    let html = '<span class="word-prefix">' + text + '</span>';
    this.init$dom(html);
  }
}