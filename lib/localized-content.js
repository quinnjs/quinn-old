// Generated by LiveScript 1.2.0
var deepmerge, path, readdirSync, localizedContent, slice$ = [].slice;
deepmerge = require('deepmerge');
path = require('path');
readdirSync = require('fs').readdirSync;
module.exports = localizedContent = function(modules, config){
  var messagesByLocale, addMessages, loadFromModule, fallbacksForLocale, messagesForLocale, localize;
  messagesByLocale = {};
  addMessages = function(locale, moduleMessages, prefix){
    var obj, node, ref$, i$, segments, top;
    prefix == null && (prefix = []);
    obj = {};
    node = obj;
    ref$ = [locale].concat(prefix), segments = 0 < (i$ = ref$.length - 1) ? slice$.call(ref$, 0, i$) : (i$ = 0, []), top = ref$[i$];
    segments.forEach(function(segment){
      node[segment] == null && (node[segment] = {});
      return node = node[segment];
    });
    node[top] = moduleMessages;
    return messagesByLocale = deepmerge(messagesByLocale, obj);
  };
  loadFromModule = function(arg$){
    var directory, name, messagesPath, messageFiles;
    directory = arg$.directory, name = arg$.name;
    messagesPath = path.join(directory, 'messages');
    messageFiles = (function(){
      try {
        return readdirSync(messagesPath);
      } catch (e$) {}
    }());
    messageFiles == null && (messageFiles = []);
    messageFiles.forEach(function(filename){
      var ext, locale, moduleMessages;
      ext = path.extname(filename);
      locale = path.basename(filename, ext);
      moduleMessages = require(path.join(messagesPath, filename));
      return addMessages(locale, moduleMessages, [name]);
    });
  };
  modules.forEach(loadFromModule);
  fallbacksForLocale = function(locale){
    return ['defaults', locale];
  };
  messagesForLocale = function(locale){
    var fallbacks, mergeFallback;
    fallbacks = fallbacksForLocale(locale);
    mergeFallback = function(memo, fallback){
      var that;
      if ((that = messagesByLocale[fallback]) != null) {
        return deepmerge(memo, that);
      } else {
        return memo;
      }
    };
    return fallbacks.reduce(mergeFallback, {});
  };
  return localize = function(req, res){
    var i18n;
    return i18n = {
      country: 'US',
      lang: 'en',
      locale: 'en_US',
      scope: [],
      messages: messagesForLocale('en_US'),
      lookup: function(segments){
        return segments.reduce(function(node, key){
          return node != null ? node[key] : void 8;
        }, i18n.messages);
      },
      interpolate: function(node, opts, key){
        return String(node).replace(/%\{\w+\}/g, function(placeholder){
          var name, ref$;
          name = placeholder.substr(2, placeholder.length - 3);
          return (ref$ = opts[name]) != null
            ? ref$
            : "[missing " + i18n.locale + " value: " + JSON.stringify(name) + "]";
        });
      },
      translate: function(key, opts){
        var segments, node, ref$;
        opts == null && (opts = {});
        segments = key.split('.');
        if (segments[0] === '') {
          segments = i18n.scope.concat(segments.slice(1));
        }
        node = (ref$ = i18n.lookup(segments)) != null
          ? ref$
          : opts['default'];
        if (node != null) {
          if (typeof node === 'object') {
            return JSON.stringify(node);
          } else {
            return i18n.interpolate(node, opts);
          }
        } else {
          return "[missing " + i18n.locale + ": " + JSON.stringify(segments.join('.')) + "]";
        }
      }
    };
  };
};