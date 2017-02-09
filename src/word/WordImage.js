class WordImage extends Word {
  constructor (file) {
    super();
    let html = '<span class="word-image"><img src=""/></span>';
    this.init$dom(html);

    this.uploadFile(file, (res) => {
      const url = JSON.parse(res).url;
      const imgUrl = 'https://image.shensz.cn/' + url;
      this.get$dom().children('img').attr('src', imgUrl);
    });
  }


  uploadFile (file, callback) {
    if (!file || file.type.indexOf('image') !== 0 ) {
      return;
    }

    const fileType = file.type.replace(/\w+\//, '');
    const xhr = new XMLHttpRequest();
    xhr.open("post", "https://image.shensz.cn/imageUp.php?type=ajax", true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    const fd = new FormData();
    fd.append('upfile', file, 'upfile.' + fileType);

    xhr.send(fd);
    xhr.addEventListener('load', function(e) {
      const r = e.target.response;
      if (callback) {
        callback(r);
      }
    });
  }
}