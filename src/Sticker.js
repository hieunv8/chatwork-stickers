import jQuery from 'jquery';
import Ajv from 'ajv';
import RegExpFactory from './RegExpFactory';

class Sticker {
  constructor(contentUrl, storageKey) {
    this.contentUrl = contentUrl;
    this.storageKey = storageKey;

    this.ajv = (new Ajv()).compile({
      properties: {
        'data_name': {
          type: 'string',
        },
        'data_version': {
          type: 'number',
        },
        'emoticons': {
          type: 'array',
        }
      }
    });
    try {
      let json = localStorage.getItem(this.storageKey);
      this.json = json && JSON.parse(json) || this.defaultJson();
    }
    catch (e) {
      this.json = this.defaultJson();
    }
  }

  load() {
    jQuery.getJSON(this.contentUrl, (obj) => {
      if (!this.ajv(obj) || this.json.version >= obj['data_version']) {
        return;
      }
      this.json.name = obj['data_name'];
      this.json.version = obj['data_version'];
      this.json.emoticons = obj.emoticons.map((emoticon) => {
        if (emoticon.src.indexOf('http://i.imgur.com/') === 0 || emoticon.src.indexOf('http://static.skaip.org/img/emoticons/v2/') === 0) {
          emoticon.src = emoticon.src.replace('http', 'https');
        }
        return {
          key: emoticon.key,
          src: (emoticon.src.indexOf('https') === 0 || emoticon.src.indexOf('http') === 0) && emoticon.src || `${Sticker.DEFAULT_BASE_URL}${emoticon.src}`
        };
      });
      localStorage.setItem(this.storageKey, JSON.stringify(this.json));
    });
  }

  build() {
    if (!this.json && this.json.emoticons.length <= 0) {
      return;
    }
    let elements = this.json.emoticons.map((obj) => {
      return `<img src="${obj.src}" alt="${obj.key}" style="max-width: 128px; max-height: 128px;" data-key="${obj.key}" />`
    });
    $('.stickers-content .body').append(elements.join());
  }

  import() {
    if (!this.json || !this.json.emoticons || this.json.emoticons.length <= 0) {
      return;
    }
    const {CW: {reg_cmp}} = window;
    const {emoticons} = this.json;
    $(emoticons).each((k, v) => {
      let src = (v.src.indexOf('https') === 0 || v.src.indexOf('http') === 0) && v.src || '';
      reg_cmp.push({
        key: RegExpFactory.create(v.key),
        rep: `[sticker key="${v.key}"]${src}[/sticker]`,
      })
    });
  }
}

Sticker.popup = () => {
  const offset = $('.action-stickers').offset();
  $('.stickers').offset({
    top: offset.top - 310,
    left: offset.left - 324,
  });
};

Sticker.DEFAULT_BASE_URL = 'https://chatpp.thangtd.com/img/emoticons/';
Sticker.DEFAULT_EMOTICON_URL = 'https://dl.dropboxusercontent.com/s/lmxis68cfh4v1ho/default.json?dl=1';
Sticker.VIETNAMESE_EMOTICON_URL = 'https://dl.dropboxusercontent.com/s/2b085bilbno4ri1/vietnamese.json?dl=1';
Sticker.JAPANESE_EMOTICON_URL = 'https://dl.dropboxusercontent.com/s/fdq05pwwtsccrn6/japanese.json?dl=1';
Sticker.SKYPE_EMOTICON_URL = 'https://dl.dropboxusercontent.com/s/8ew2mdh0v2vcad8/skype.json?dl=1';

Sticker.DEFAULT_EMOTICON_STORAGE = 'DEFAULT_EMOTICON_STORAGE';
Sticker.VIETNAMESE_EMOTICON_STORAGE = 'VIETNAMESE_EMOTICON_STORAGE';
Sticker.JAPANESE_EMOTICON_STORGE = 'JAPANESE_EMOTICON_STORGE';
Sticker.SKYPE_EMOTICON_STORAGE = 'SKYPE_EMOTICON_STORAGE';

export default Sticker;