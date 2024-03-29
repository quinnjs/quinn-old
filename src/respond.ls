
require! stream.Readable

require! 'json-stringify-safe'
require! Q: q

const MIME =
  JSON: 'application/json; charset=utf-8'
  TEXT: 'text/plain'

all-stringify = (marshal, raw) -->
  | Buffer.is-buffer raw => marshal raw.toString()
  | Q.is-promise raw     => raw.then all-stringify(marshal)
  | _                    => marshal raw

module.exports = respond = (result, res) -->
  Q.when result, ({body, status, headers}) ->
    Q.when body, (body) ->
      if 'string' == typeof body || Buffer.is-buffer body
        headers['Content-Length'] ?= Buffer.byte-length body
      try res.write-head status, headers

      # if typeof body is 'object' && body instanceof Readable
      if body instanceof Readable
        _responded = Q.defer!
        body.on 'error', (err) -> _responded.reject err
        res.on 'error', (err) -> _responded.reject err
        res.once 'end', -> _responded.resolve true
        body.pipe res
        _responded.promise
      else
        res.end body
        true

respond <<<
  text: (body = '', status = 200, _headers = {}) ->
    headers = {
      'Content-Type': MIME.TEXT
    } <<< _headers
    respond { body, status, headers }

  json: (obj = null, status = 200, _headers = {}) ->
    body = all-stringify JSON.stringify, obj
    headers = {
      'Content-Type': MIME.JSON
    } <<< _headers
    respond { body, status, headers }

  jsonSafe: (obj = null, status = 200, _headers = {}) ->
    body = all-stringify json-stringify-safe obj
    headers = {
      'Content-Type': MIME.JSON
    } <<< _headers
    respond { body, status, headers }

  redirect: (url, status = 302, _headers = {}) ->
    headers = {
      'Location': url
    } <<< _headers
    respond { body: null, status, headers }
