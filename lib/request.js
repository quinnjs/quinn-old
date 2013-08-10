// Generated by LiveScript 1.2.0
var querystring, Q, ConcatStream, withParsedUrl, parseRequestBody, withBodyParser, patchRequest;
querystring = require('querystring');
Q = require('q');
ConcatStream = require('concat-stream');
withParsedUrl = function(req){
  var ref$, pathname, search, query;
  ref$ = req.url.split('?'), pathname = ref$[0], search = ref$[1];
  query = querystring.parse(search);
  return req.pathname = pathname, req.query = query, req;
};
parseRequestBody = curry$(function(headers, data){
  var ref$, mime, mimeMeta;
  ref$ = (headers['content-type'] || '').split(';'), mime = ref$[0], mimeMeta = ref$[1];
  switch (mime) {
  case 'application/x-www-form-urlencoded':
    return querystring.parse(data.toString());
  default:
    throw new Error("Unsupported mime type: " + mime);
  }
});
withBodyParser = function(req){
  req.setEncoding('utf8');
  return Object.defineProperties(req, {
    body: {
      get: function(){
        var ref$;
        return (ref$ = this._bodyPromise) != null
          ? ref$
          : this._bodyPromise = function(){
            var deferred, bodyStream;
            deferred = Q.defer();
            bodyStream = new ConcatStream(bind$(deferred, 'resolve'));
            bodyStream.once('error', bind$(deferred, 'reject'));
            req.pipe(bodyStream);
            return deferred.promise;
          }();
      }
    },
    content: {
      get: function(){
        var ref$;
        return (ref$ = this._contentPromise) != null
          ? ref$
          : this._contentPromise = function(){
            return req.body.then(parseRequestBody(req.headers));
          }();
      }
    }
  });
};
module.exports = patchRequest = function(req){
  withParsedUrl(req);
  return withBodyParser(req);
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}