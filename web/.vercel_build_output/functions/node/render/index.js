var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error3;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-vercel/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-vercel/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/xml2js/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/xml2js/lib/defaults.js"(exports) {
    init_shims();
    (function() {
      exports.defaults = {
        "0.1": {
          explicitCharkey: false,
          trim: true,
          normalize: true,
          normalizeTags: false,
          attrkey: "@",
          charkey: "#",
          explicitArray: false,
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitRoot: false,
          validator: null,
          xmlns: false,
          explicitChildren: false,
          childkey: "@@",
          charsAsChildren: false,
          includeWhiteChars: false,
          async: false,
          strict: true,
          attrNameProcessors: null,
          attrValueProcessors: null,
          tagNameProcessors: null,
          valueProcessors: null,
          emptyTag: ""
        },
        "0.2": {
          explicitCharkey: false,
          trim: false,
          normalize: false,
          normalizeTags: false,
          attrkey: "$",
          charkey: "_",
          explicitArray: true,
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitRoot: true,
          validator: null,
          xmlns: false,
          explicitChildren: false,
          preserveChildrenOrder: false,
          childkey: "$$",
          charsAsChildren: false,
          includeWhiteChars: false,
          async: false,
          strict: true,
          attrNameProcessors: null,
          attrValueProcessors: null,
          tagNameProcessors: null,
          valueProcessors: null,
          rootName: "root",
          xmldec: {
            "version": "1.0",
            "encoding": "UTF-8",
            "standalone": true
          },
          doctype: null,
          renderOpts: {
            "pretty": true,
            "indent": "  ",
            "newline": "\n"
          },
          headless: false,
          chunkSize: 1e4,
          emptyTag: "",
          cdata: false
        }
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/Utility.js
var require_Utility = __commonJS({
  "node_modules/xmlbuilder/lib/Utility.js"(exports, module2) {
    init_shims();
    (function() {
      var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject, slice = [].slice, hasProp = {}.hasOwnProperty;
      assign = function() {
        var i, key, len, source, sources, target;
        target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (isFunction(Object.assign)) {
          Object.assign.apply(null, arguments);
        } else {
          for (i = 0, len = sources.length; i < len; i++) {
            source = sources[i];
            if (source != null) {
              for (key in source) {
                if (!hasProp.call(source, key))
                  continue;
                target[key] = source[key];
              }
            }
          }
        }
        return target;
      };
      isFunction = function(val) {
        return !!val && Object.prototype.toString.call(val) === "[object Function]";
      };
      isObject = function(val) {
        var ref;
        return !!val && ((ref = typeof val) === "function" || ref === "object");
      };
      isArray = function(val) {
        if (isFunction(Array.isArray)) {
          return Array.isArray(val);
        } else {
          return Object.prototype.toString.call(val) === "[object Array]";
        }
      };
      isEmpty = function(val) {
        var key;
        if (isArray(val)) {
          return !val.length;
        } else {
          for (key in val) {
            if (!hasProp.call(val, key))
              continue;
            return false;
          }
          return true;
        }
      };
      isPlainObject = function(val) {
        var ctor, proto;
        return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && typeof ctor === "function" && ctor instanceof ctor && Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object);
      };
      getValue = function(obj) {
        if (isFunction(obj.valueOf)) {
          return obj.valueOf();
        } else {
          return obj;
        }
      };
      module2.exports.assign = assign;
      module2.exports.isFunction = isFunction;
      module2.exports.isObject = isObject;
      module2.exports.isArray = isArray;
      module2.exports.isEmpty = isEmpty;
      module2.exports.isPlainObject = isPlainObject;
      module2.exports.getValue = getValue;
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMImplementation.js
var require_XMLDOMImplementation = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMImplementation.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLDOMImplementation;
      module2.exports = XMLDOMImplementation = function() {
        function XMLDOMImplementation2() {
        }
        XMLDOMImplementation2.prototype.hasFeature = function(feature, version) {
          return true;
        };
        XMLDOMImplementation2.prototype.createDocumentType = function(qualifiedName, publicId, systemId) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLDOMImplementation2.prototype.createDocument = function(namespaceURI, qualifiedName, doctype) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLDOMImplementation2.prototype.createHTMLDocument = function(title) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLDOMImplementation2.prototype.getFeature = function(feature, version) {
          throw new Error("This DOM method is not implemented.");
        };
        return XMLDOMImplementation2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js
var require_XMLDOMErrorHandler = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLDOMErrorHandler;
      module2.exports = XMLDOMErrorHandler = function() {
        function XMLDOMErrorHandler2() {
        }
        XMLDOMErrorHandler2.prototype.handleError = function(error3) {
          throw new Error(error3);
        };
        return XMLDOMErrorHandler2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMStringList.js
var require_XMLDOMStringList = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMStringList.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLDOMStringList;
      module2.exports = XMLDOMStringList = function() {
        function XMLDOMStringList2(arr) {
          this.arr = arr || [];
        }
        Object.defineProperty(XMLDOMStringList2.prototype, "length", {
          get: function() {
            return this.arr.length;
          }
        });
        XMLDOMStringList2.prototype.item = function(index2) {
          return this.arr[index2] || null;
        };
        XMLDOMStringList2.prototype.contains = function(str) {
          return this.arr.indexOf(str) !== -1;
        };
        return XMLDOMStringList2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMConfiguration.js
var require_XMLDOMConfiguration = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMConfiguration.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList;
      XMLDOMErrorHandler = require_XMLDOMErrorHandler();
      XMLDOMStringList = require_XMLDOMStringList();
      module2.exports = XMLDOMConfiguration = function() {
        function XMLDOMConfiguration2() {
          var clonedSelf;
          this.defaultParams = {
            "canonical-form": false,
            "cdata-sections": false,
            "comments": false,
            "datatype-normalization": false,
            "element-content-whitespace": true,
            "entities": true,
            "error-handler": new XMLDOMErrorHandler(),
            "infoset": true,
            "validate-if-schema": false,
            "namespaces": true,
            "namespace-declarations": true,
            "normalize-characters": false,
            "schema-location": "",
            "schema-type": "",
            "split-cdata-sections": true,
            "validate": false,
            "well-formed": true
          };
          this.params = clonedSelf = Object.create(this.defaultParams);
        }
        Object.defineProperty(XMLDOMConfiguration2.prototype, "parameterNames", {
          get: function() {
            return new XMLDOMStringList(Object.keys(this.defaultParams));
          }
        });
        XMLDOMConfiguration2.prototype.getParameter = function(name) {
          if (this.params.hasOwnProperty(name)) {
            return this.params[name];
          } else {
            return null;
          }
        };
        XMLDOMConfiguration2.prototype.canSetParameter = function(name, value) {
          return true;
        };
        XMLDOMConfiguration2.prototype.setParameter = function(name, value) {
          if (value != null) {
            return this.params[name] = value;
          } else {
            return delete this.params[name];
          }
        };
        return XMLDOMConfiguration2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/NodeType.js
var require_NodeType = __commonJS({
  "node_modules/xmlbuilder/lib/NodeType.js"(exports, module2) {
    init_shims();
    (function() {
      module2.exports = {
        Element: 1,
        Attribute: 2,
        Text: 3,
        CData: 4,
        EntityReference: 5,
        EntityDeclaration: 6,
        ProcessingInstruction: 7,
        Comment: 8,
        Document: 9,
        DocType: 10,
        DocumentFragment: 11,
        NotationDeclaration: 12,
        Declaration: 201,
        Raw: 202,
        AttributeDeclaration: 203,
        ElementDeclaration: 204,
        Dummy: 205
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLAttribute.js
var require_XMLAttribute = __commonJS({
  "node_modules/xmlbuilder/lib/XMLAttribute.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLAttribute, XMLNode;
      NodeType = require_NodeType();
      XMLNode = require_XMLNode();
      module2.exports = XMLAttribute = function() {
        function XMLAttribute2(parent, name, value) {
          this.parent = parent;
          if (this.parent) {
            this.options = this.parent.options;
            this.stringify = this.parent.stringify;
          }
          if (name == null) {
            throw new Error("Missing attribute name. " + this.debugInfo(name));
          }
          this.name = this.stringify.name(name);
          this.value = this.stringify.attValue(value);
          this.type = NodeType.Attribute;
          this.isId = false;
          this.schemaTypeInfo = null;
        }
        Object.defineProperty(XMLAttribute2.prototype, "nodeType", {
          get: function() {
            return this.type;
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "ownerElement", {
          get: function() {
            return this.parent;
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "textContent", {
          get: function() {
            return this.value;
          },
          set: function(value) {
            return this.value = value || "";
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "namespaceURI", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "prefix", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "localName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "specified", {
          get: function() {
            return true;
          }
        });
        XMLAttribute2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLAttribute2.prototype.toString = function(options2) {
          return this.options.writer.attribute(this, this.options.writer.filterOptions(options2));
        };
        XMLAttribute2.prototype.debugInfo = function(name) {
          name = name || this.name;
          if (name == null) {
            return "parent: <" + this.parent.name + ">";
          } else {
            return "attribute: {" + name + "}, parent: <" + this.parent.name + ">";
          }
        };
        XMLAttribute2.prototype.isEqualNode = function(node) {
          if (node.namespaceURI !== this.namespaceURI) {
            return false;
          }
          if (node.prefix !== this.prefix) {
            return false;
          }
          if (node.localName !== this.localName) {
            return false;
          }
          if (node.value !== this.value) {
            return false;
          }
          return true;
        };
        return XMLAttribute2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLNamedNodeMap.js
var require_XMLNamedNodeMap = __commonJS({
  "node_modules/xmlbuilder/lib/XMLNamedNodeMap.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLNamedNodeMap;
      module2.exports = XMLNamedNodeMap = function() {
        function XMLNamedNodeMap2(nodes) {
          this.nodes = nodes;
        }
        Object.defineProperty(XMLNamedNodeMap2.prototype, "length", {
          get: function() {
            return Object.keys(this.nodes).length || 0;
          }
        });
        XMLNamedNodeMap2.prototype.clone = function() {
          return this.nodes = null;
        };
        XMLNamedNodeMap2.prototype.getNamedItem = function(name) {
          return this.nodes[name];
        };
        XMLNamedNodeMap2.prototype.setNamedItem = function(node) {
          var oldNode;
          oldNode = this.nodes[node.nodeName];
          this.nodes[node.nodeName] = node;
          return oldNode || null;
        };
        XMLNamedNodeMap2.prototype.removeNamedItem = function(name) {
          var oldNode;
          oldNode = this.nodes[name];
          delete this.nodes[name];
          return oldNode || null;
        };
        XMLNamedNodeMap2.prototype.item = function(index2) {
          return this.nodes[Object.keys(this.nodes)[index2]] || null;
        };
        XMLNamedNodeMap2.prototype.getNamedItemNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLNamedNodeMap2.prototype.setNamedItemNS = function(node) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLNamedNodeMap2.prototype.removeNamedItemNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented.");
        };
        return XMLNamedNodeMap2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLElement.js
var require_XMLElement = __commonJS({
  "node_modules/xmlbuilder/lib/XMLElement.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLAttribute, XMLElement, XMLNamedNodeMap, XMLNode, getValue, isFunction, isObject, ref, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      ref = require_Utility(), isObject = ref.isObject, isFunction = ref.isFunction, getValue = ref.getValue;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      XMLAttribute = require_XMLAttribute();
      XMLNamedNodeMap = require_XMLNamedNodeMap();
      module2.exports = XMLElement = function(superClass) {
        extend(XMLElement2, superClass);
        function XMLElement2(parent, name, attributes) {
          var child, j, len, ref1;
          XMLElement2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing element name. " + this.debugInfo());
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.Element;
          this.attribs = {};
          this.schemaTypeInfo = null;
          if (attributes != null) {
            this.attribute(attributes);
          }
          if (parent.type === NodeType.Document) {
            this.isRoot = true;
            this.documentObject = parent;
            parent.rootObject = this;
            if (parent.children) {
              ref1 = parent.children;
              for (j = 0, len = ref1.length; j < len; j++) {
                child = ref1[j];
                if (child.type === NodeType.DocType) {
                  child.name = this.name;
                  break;
                }
              }
            }
          }
        }
        Object.defineProperty(XMLElement2.prototype, "tagName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLElement2.prototype, "namespaceURI", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLElement2.prototype, "prefix", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLElement2.prototype, "localName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLElement2.prototype, "id", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLElement2.prototype, "className", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLElement2.prototype, "classList", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLElement2.prototype, "attributes", {
          get: function() {
            if (!this.attributeMap || !this.attributeMap.nodes) {
              this.attributeMap = new XMLNamedNodeMap(this.attribs);
            }
            return this.attributeMap;
          }
        });
        XMLElement2.prototype.clone = function() {
          var att, attName, clonedSelf, ref1;
          clonedSelf = Object.create(this);
          if (clonedSelf.isRoot) {
            clonedSelf.documentObject = null;
          }
          clonedSelf.attribs = {};
          ref1 = this.attribs;
          for (attName in ref1) {
            if (!hasProp.call(ref1, attName))
              continue;
            att = ref1[attName];
            clonedSelf.attribs[attName] = att.clone();
          }
          clonedSelf.children = [];
          this.children.forEach(function(child) {
            var clonedChild;
            clonedChild = child.clone();
            clonedChild.parent = clonedSelf;
            return clonedSelf.children.push(clonedChild);
          });
          return clonedSelf;
        };
        XMLElement2.prototype.attribute = function(name, value) {
          var attName, attValue;
          if (name != null) {
            name = getValue(name);
          }
          if (isObject(name)) {
            for (attName in name) {
              if (!hasProp.call(name, attName))
                continue;
              attValue = name[attName];
              this.attribute(attName, attValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            if (this.options.keepNullAttributes && value == null) {
              this.attribs[name] = new XMLAttribute(this, name, "");
            } else if (value != null) {
              this.attribs[name] = new XMLAttribute(this, name, value);
            }
          }
          return this;
        };
        XMLElement2.prototype.removeAttribute = function(name) {
          var attName, j, len;
          if (name == null) {
            throw new Error("Missing attribute name. " + this.debugInfo());
          }
          name = getValue(name);
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              attName = name[j];
              delete this.attribs[attName];
            }
          } else {
            delete this.attribs[name];
          }
          return this;
        };
        XMLElement2.prototype.toString = function(options2) {
          return this.options.writer.element(this, this.options.writer.filterOptions(options2));
        };
        XMLElement2.prototype.att = function(name, value) {
          return this.attribute(name, value);
        };
        XMLElement2.prototype.a = function(name, value) {
          return this.attribute(name, value);
        };
        XMLElement2.prototype.getAttribute = function(name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].value;
          } else {
            return null;
          }
        };
        XMLElement2.prototype.setAttribute = function(name, value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getAttributeNode = function(name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name];
          } else {
            return null;
          }
        };
        XMLElement2.prototype.setAttributeNode = function(newAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.removeAttributeNode = function(oldAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagName = function(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getAttributeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setAttributeNS = function(namespaceURI, qualifiedName, value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.removeAttributeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getAttributeNodeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setAttributeNodeNS = function(newAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.hasAttribute = function(name) {
          return this.attribs.hasOwnProperty(name);
        };
        XMLElement2.prototype.hasAttributeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setIdAttribute = function(name, isId) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].isId;
          } else {
            return isId;
          }
        };
        XMLElement2.prototype.setIdAttributeNS = function(namespaceURI, localName, isId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setIdAttributeNode = function(idAttr, isId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagName = function(tagname) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByClassName = function(classNames) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.isEqualNode = function(node) {
          var i, j, ref1;
          if (!XMLElement2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.namespaceURI !== this.namespaceURI) {
            return false;
          }
          if (node.prefix !== this.prefix) {
            return false;
          }
          if (node.localName !== this.localName) {
            return false;
          }
          if (node.attribs.length !== this.attribs.length) {
            return false;
          }
          for (i = j = 0, ref1 = this.attribs.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            if (!this.attribs[i].isEqualNode(node.attribs[i])) {
              return false;
            }
          }
          return true;
        };
        return XMLElement2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLCharacterData.js
var require_XMLCharacterData = __commonJS({
  "node_modules/xmlbuilder/lib/XMLCharacterData.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLCharacterData, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      module2.exports = XMLCharacterData = function(superClass) {
        extend(XMLCharacterData2, superClass);
        function XMLCharacterData2(parent) {
          XMLCharacterData2.__super__.constructor.call(this, parent);
          this.value = "";
        }
        Object.defineProperty(XMLCharacterData2.prototype, "data", {
          get: function() {
            return this.value;
          },
          set: function(value) {
            return this.value = value || "";
          }
        });
        Object.defineProperty(XMLCharacterData2.prototype, "length", {
          get: function() {
            return this.value.length;
          }
        });
        Object.defineProperty(XMLCharacterData2.prototype, "textContent", {
          get: function() {
            return this.value;
          },
          set: function(value) {
            return this.value = value || "";
          }
        });
        XMLCharacterData2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLCharacterData2.prototype.substringData = function(offset, count) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.appendData = function(arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.insertData = function(offset, arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.deleteData = function(offset, count) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.replaceData = function(offset, count, arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.isEqualNode = function(node) {
          if (!XMLCharacterData2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.data !== this.data) {
            return false;
          }
          return true;
        };
        return XMLCharacterData2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLCData.js
var require_XMLCData = __commonJS({
  "node_modules/xmlbuilder/lib/XMLCData.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLCData, XMLCharacterData, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module2.exports = XMLCData = function(superClass) {
        extend(XMLCData2, superClass);
        function XMLCData2(parent, text) {
          XMLCData2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing CDATA text. " + this.debugInfo());
          }
          this.name = "#cdata-section";
          this.type = NodeType.CData;
          this.value = this.stringify.cdata(text);
        }
        XMLCData2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLCData2.prototype.toString = function(options2) {
          return this.options.writer.cdata(this, this.options.writer.filterOptions(options2));
        };
        return XMLCData2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLComment.js
var require_XMLComment = __commonJS({
  "node_modules/xmlbuilder/lib/XMLComment.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLCharacterData, XMLComment, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module2.exports = XMLComment = function(superClass) {
        extend(XMLComment2, superClass);
        function XMLComment2(parent, text) {
          XMLComment2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing comment text. " + this.debugInfo());
          }
          this.name = "#comment";
          this.type = NodeType.Comment;
          this.value = this.stringify.comment(text);
        }
        XMLComment2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLComment2.prototype.toString = function(options2) {
          return this.options.writer.comment(this, this.options.writer.filterOptions(options2));
        };
        return XMLComment2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDeclaration.js
var require_XMLDeclaration = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDeclaration.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDeclaration, XMLNode, isObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isObject = require_Utility().isObject;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module2.exports = XMLDeclaration = function(superClass) {
        extend(XMLDeclaration2, superClass);
        function XMLDeclaration2(parent, version, encoding, standalone) {
          var ref;
          XMLDeclaration2.__super__.constructor.call(this, parent);
          if (isObject(version)) {
            ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
          }
          if (!version) {
            version = "1.0";
          }
          this.type = NodeType.Declaration;
          this.version = this.stringify.xmlVersion(version);
          if (encoding != null) {
            this.encoding = this.stringify.xmlEncoding(encoding);
          }
          if (standalone != null) {
            this.standalone = this.stringify.xmlStandalone(standalone);
          }
        }
        XMLDeclaration2.prototype.toString = function(options2) {
          return this.options.writer.declaration(this, this.options.writer.filterOptions(options2));
        };
        return XMLDeclaration2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDAttList.js
var require_XMLDTDAttList = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDAttList.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDTDAttList, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module2.exports = XMLDTDAttList = function(superClass) {
        extend(XMLDTDAttList2, superClass);
        function XMLDTDAttList2(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          XMLDTDAttList2.__super__.constructor.call(this, parent);
          if (elementName == null) {
            throw new Error("Missing DTD element name. " + this.debugInfo());
          }
          if (attributeName == null) {
            throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
          }
          if (!attributeType) {
            throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
          }
          if (!defaultValueType) {
            throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
          }
          if (defaultValueType.indexOf("#") !== 0) {
            defaultValueType = "#" + defaultValueType;
          }
          if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
            throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
          }
          if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
            throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
          }
          this.elementName = this.stringify.name(elementName);
          this.type = NodeType.AttributeDeclaration;
          this.attributeName = this.stringify.name(attributeName);
          this.attributeType = this.stringify.dtdAttType(attributeType);
          if (defaultValue) {
            this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
          }
          this.defaultValueType = defaultValueType;
        }
        XMLDTDAttList2.prototype.toString = function(options2) {
          return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options2));
        };
        return XMLDTDAttList2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDEntity.js
var require_XMLDTDEntity = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDEntity.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDTDEntity, XMLNode, isObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isObject = require_Utility().isObject;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module2.exports = XMLDTDEntity = function(superClass) {
        extend(XMLDTDEntity2, superClass);
        function XMLDTDEntity2(parent, pe, name, value) {
          XMLDTDEntity2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing DTD entity name. " + this.debugInfo(name));
          }
          if (value == null) {
            throw new Error("Missing DTD entity value. " + this.debugInfo(name));
          }
          this.pe = !!pe;
          this.name = this.stringify.name(name);
          this.type = NodeType.EntityDeclaration;
          if (!isObject(value)) {
            this.value = this.stringify.dtdEntityValue(value);
            this.internal = true;
          } else {
            if (!value.pubID && !value.sysID) {
              throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
            }
            if (value.pubID && !value.sysID) {
              throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
            }
            this.internal = false;
            if (value.pubID != null) {
              this.pubID = this.stringify.dtdPubID(value.pubID);
            }
            if (value.sysID != null) {
              this.sysID = this.stringify.dtdSysID(value.sysID);
            }
            if (value.nData != null) {
              this.nData = this.stringify.dtdNData(value.nData);
            }
            if (this.pe && this.nData) {
              throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
            }
          }
        }
        Object.defineProperty(XMLDTDEntity2.prototype, "publicId", {
          get: function() {
            return this.pubID;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "systemId", {
          get: function() {
            return this.sysID;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "notationName", {
          get: function() {
            return this.nData || null;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "inputEncoding", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "xmlEncoding", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "xmlVersion", {
          get: function() {
            return null;
          }
        });
        XMLDTDEntity2.prototype.toString = function(options2) {
          return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options2));
        };
        return XMLDTDEntity2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDElement.js
var require_XMLDTDElement = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDElement.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDTDElement, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module2.exports = XMLDTDElement = function(superClass) {
        extend(XMLDTDElement2, superClass);
        function XMLDTDElement2(parent, name, value) {
          XMLDTDElement2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing DTD element name. " + this.debugInfo());
          }
          if (!value) {
            value = "(#PCDATA)";
          }
          if (Array.isArray(value)) {
            value = "(" + value.join(",") + ")";
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.ElementDeclaration;
          this.value = this.stringify.dtdElementValue(value);
        }
        XMLDTDElement2.prototype.toString = function(options2) {
          return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options2));
        };
        return XMLDTDElement2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDNotation.js
var require_XMLDTDNotation = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDNotation.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDTDNotation, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module2.exports = XMLDTDNotation = function(superClass) {
        extend(XMLDTDNotation2, superClass);
        function XMLDTDNotation2(parent, name, value) {
          XMLDTDNotation2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing DTD notation name. " + this.debugInfo(name));
          }
          if (!value.pubID && !value.sysID) {
            throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.NotationDeclaration;
          if (value.pubID != null) {
            this.pubID = this.stringify.dtdPubID(value.pubID);
          }
          if (value.sysID != null) {
            this.sysID = this.stringify.dtdSysID(value.sysID);
          }
        }
        Object.defineProperty(XMLDTDNotation2.prototype, "publicId", {
          get: function() {
            return this.pubID;
          }
        });
        Object.defineProperty(XMLDTDNotation2.prototype, "systemId", {
          get: function() {
            return this.sysID;
          }
        });
        XMLDTDNotation2.prototype.toString = function(options2) {
          return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options2));
        };
        return XMLDTDNotation2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDocType.js
var require_XMLDocType = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDocType.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDocType, XMLNamedNodeMap, XMLNode, isObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isObject = require_Utility().isObject;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      XMLDTDAttList = require_XMLDTDAttList();
      XMLDTDEntity = require_XMLDTDEntity();
      XMLDTDElement = require_XMLDTDElement();
      XMLDTDNotation = require_XMLDTDNotation();
      XMLNamedNodeMap = require_XMLNamedNodeMap();
      module2.exports = XMLDocType = function(superClass) {
        extend(XMLDocType2, superClass);
        function XMLDocType2(parent, pubID, sysID) {
          var child, i, len, ref, ref1, ref2;
          XMLDocType2.__super__.constructor.call(this, parent);
          this.type = NodeType.DocType;
          if (parent.children) {
            ref = parent.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.Element) {
                this.name = child.name;
                break;
              }
            }
          }
          this.documentObject = parent;
          if (isObject(pubID)) {
            ref1 = pubID, pubID = ref1.pubID, sysID = ref1.sysID;
          }
          if (sysID == null) {
            ref2 = [pubID, sysID], sysID = ref2[0], pubID = ref2[1];
          }
          if (pubID != null) {
            this.pubID = this.stringify.dtdPubID(pubID);
          }
          if (sysID != null) {
            this.sysID = this.stringify.dtdSysID(sysID);
          }
        }
        Object.defineProperty(XMLDocType2.prototype, "entities", {
          get: function() {
            var child, i, len, nodes, ref;
            nodes = {};
            ref = this.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.EntityDeclaration && !child.pe) {
                nodes[child.name] = child;
              }
            }
            return new XMLNamedNodeMap(nodes);
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "notations", {
          get: function() {
            var child, i, len, nodes, ref;
            nodes = {};
            ref = this.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.NotationDeclaration) {
                nodes[child.name] = child;
              }
            }
            return new XMLNamedNodeMap(nodes);
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "publicId", {
          get: function() {
            return this.pubID;
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "systemId", {
          get: function() {
            return this.sysID;
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "internalSubset", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        XMLDocType2.prototype.element = function(name, value) {
          var child;
          child = new XMLDTDElement(this, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          var child;
          child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.entity = function(name, value) {
          var child;
          child = new XMLDTDEntity(this, false, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.pEntity = function(name, value) {
          var child;
          child = new XMLDTDEntity(this, true, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.notation = function(name, value) {
          var child;
          child = new XMLDTDNotation(this, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.toString = function(options2) {
          return this.options.writer.docType(this, this.options.writer.filterOptions(options2));
        };
        XMLDocType2.prototype.ele = function(name, value) {
          return this.element(name, value);
        };
        XMLDocType2.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
        };
        XMLDocType2.prototype.ent = function(name, value) {
          return this.entity(name, value);
        };
        XMLDocType2.prototype.pent = function(name, value) {
          return this.pEntity(name, value);
        };
        XMLDocType2.prototype.not = function(name, value) {
          return this.notation(name, value);
        };
        XMLDocType2.prototype.up = function() {
          return this.root() || this.documentObject;
        };
        XMLDocType2.prototype.isEqualNode = function(node) {
          if (!XMLDocType2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.name !== this.name) {
            return false;
          }
          if (node.publicId !== this.publicId) {
            return false;
          }
          if (node.systemId !== this.systemId) {
            return false;
          }
          return true;
        };
        return XMLDocType2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLRaw.js
var require_XMLRaw = __commonJS({
  "node_modules/xmlbuilder/lib/XMLRaw.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLNode, XMLRaw, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLNode = require_XMLNode();
      module2.exports = XMLRaw = function(superClass) {
        extend(XMLRaw2, superClass);
        function XMLRaw2(parent, text) {
          XMLRaw2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing raw text. " + this.debugInfo());
          }
          this.type = NodeType.Raw;
          this.value = this.stringify.raw(text);
        }
        XMLRaw2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLRaw2.prototype.toString = function(options2) {
          return this.options.writer.raw(this, this.options.writer.filterOptions(options2));
        };
        return XMLRaw2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLText.js
var require_XMLText = __commonJS({
  "node_modules/xmlbuilder/lib/XMLText.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLCharacterData, XMLText, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module2.exports = XMLText = function(superClass) {
        extend(XMLText2, superClass);
        function XMLText2(parent, text) {
          XMLText2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing element text. " + this.debugInfo());
          }
          this.name = "#text";
          this.type = NodeType.Text;
          this.value = this.stringify.text(text);
        }
        Object.defineProperty(XMLText2.prototype, "isElementContentWhitespace", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLText2.prototype, "wholeText", {
          get: function() {
            var next, prev, str;
            str = "";
            prev = this.previousSibling;
            while (prev) {
              str = prev.data + str;
              prev = prev.previousSibling;
            }
            str += this.data;
            next = this.nextSibling;
            while (next) {
              str = str + next.data;
              next = next.nextSibling;
            }
            return str;
          }
        });
        XMLText2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLText2.prototype.toString = function(options2) {
          return this.options.writer.text(this, this.options.writer.filterOptions(options2));
        };
        XMLText2.prototype.splitText = function(offset) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLText2.prototype.replaceWholeText = function(content) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        return XMLText2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLProcessingInstruction.js
var require_XMLProcessingInstruction = __commonJS({
  "node_modules/xmlbuilder/lib/XMLProcessingInstruction.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLCharacterData, XMLProcessingInstruction, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module2.exports = XMLProcessingInstruction = function(superClass) {
        extend(XMLProcessingInstruction2, superClass);
        function XMLProcessingInstruction2(parent, target, value) {
          XMLProcessingInstruction2.__super__.constructor.call(this, parent);
          if (target == null) {
            throw new Error("Missing instruction target. " + this.debugInfo());
          }
          this.type = NodeType.ProcessingInstruction;
          this.target = this.stringify.insTarget(target);
          this.name = this.target;
          if (value) {
            this.value = this.stringify.insValue(value);
          }
        }
        XMLProcessingInstruction2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLProcessingInstruction2.prototype.toString = function(options2) {
          return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options2));
        };
        XMLProcessingInstruction2.prototype.isEqualNode = function(node) {
          if (!XMLProcessingInstruction2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.target !== this.target) {
            return false;
          }
          return true;
        };
        return XMLProcessingInstruction2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDummy.js
var require_XMLDummy = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDummy.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDummy, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module2.exports = XMLDummy = function(superClass) {
        extend(XMLDummy2, superClass);
        function XMLDummy2(parent) {
          XMLDummy2.__super__.constructor.call(this, parent);
          this.type = NodeType.Dummy;
        }
        XMLDummy2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLDummy2.prototype.toString = function(options2) {
          return "";
        };
        return XMLDummy2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLNodeList.js
var require_XMLNodeList = __commonJS({
  "node_modules/xmlbuilder/lib/XMLNodeList.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLNodeList;
      module2.exports = XMLNodeList = function() {
        function XMLNodeList2(nodes) {
          this.nodes = nodes;
        }
        Object.defineProperty(XMLNodeList2.prototype, "length", {
          get: function() {
            return this.nodes.length || 0;
          }
        });
        XMLNodeList2.prototype.clone = function() {
          return this.nodes = null;
        };
        XMLNodeList2.prototype.item = function(index2) {
          return this.nodes[index2] || null;
        };
        return XMLNodeList2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/DocumentPosition.js
var require_DocumentPosition = __commonJS({
  "node_modules/xmlbuilder/lib/DocumentPosition.js"(exports, module2) {
    init_shims();
    (function() {
      module2.exports = {
        Disconnected: 1,
        Preceding: 2,
        Following: 4,
        Contains: 8,
        ContainedBy: 16,
        ImplementationSpecific: 32
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLNode.js
var require_XMLNode = __commonJS({
  "node_modules/xmlbuilder/lib/XMLNode.js"(exports, module2) {
    init_shims();
    (function() {
      var DocumentPosition, NodeType, XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLNamedNodeMap, XMLNode, XMLNodeList, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject, ref1, hasProp = {}.hasOwnProperty;
      ref1 = require_Utility(), isObject = ref1.isObject, isFunction = ref1.isFunction, isEmpty = ref1.isEmpty, getValue = ref1.getValue;
      XMLElement = null;
      XMLCData = null;
      XMLComment = null;
      XMLDeclaration = null;
      XMLDocType = null;
      XMLRaw = null;
      XMLText = null;
      XMLProcessingInstruction = null;
      XMLDummy = null;
      NodeType = null;
      XMLNodeList = null;
      XMLNamedNodeMap = null;
      DocumentPosition = null;
      module2.exports = XMLNode = function() {
        function XMLNode2(parent1) {
          this.parent = parent1;
          if (this.parent) {
            this.options = this.parent.options;
            this.stringify = this.parent.stringify;
          }
          this.value = null;
          this.children = [];
          this.baseURI = null;
          if (!XMLElement) {
            XMLElement = require_XMLElement();
            XMLCData = require_XMLCData();
            XMLComment = require_XMLComment();
            XMLDeclaration = require_XMLDeclaration();
            XMLDocType = require_XMLDocType();
            XMLRaw = require_XMLRaw();
            XMLText = require_XMLText();
            XMLProcessingInstruction = require_XMLProcessingInstruction();
            XMLDummy = require_XMLDummy();
            NodeType = require_NodeType();
            XMLNodeList = require_XMLNodeList();
            XMLNamedNodeMap = require_XMLNamedNodeMap();
            DocumentPosition = require_DocumentPosition();
          }
        }
        Object.defineProperty(XMLNode2.prototype, "nodeName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "nodeType", {
          get: function() {
            return this.type;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "nodeValue", {
          get: function() {
            return this.value;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "parentNode", {
          get: function() {
            return this.parent;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "childNodes", {
          get: function() {
            if (!this.childNodeList || !this.childNodeList.nodes) {
              this.childNodeList = new XMLNodeList(this.children);
            }
            return this.childNodeList;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "firstChild", {
          get: function() {
            return this.children[0] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "lastChild", {
          get: function() {
            return this.children[this.children.length - 1] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "previousSibling", {
          get: function() {
            var i;
            i = this.parent.children.indexOf(this);
            return this.parent.children[i - 1] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "nextSibling", {
          get: function() {
            var i;
            i = this.parent.children.indexOf(this);
            return this.parent.children[i + 1] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "ownerDocument", {
          get: function() {
            return this.document() || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "textContent", {
          get: function() {
            var child, j, len, ref2, str;
            if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
              str = "";
              ref2 = this.children;
              for (j = 0, len = ref2.length; j < len; j++) {
                child = ref2[j];
                if (child.textContent) {
                  str += child.textContent;
                }
              }
              return str;
            } else {
              return null;
            }
          },
          set: function(value) {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        XMLNode2.prototype.setParent = function(parent) {
          var child, j, len, ref2, results;
          this.parent = parent;
          if (parent) {
            this.options = parent.options;
            this.stringify = parent.stringify;
          }
          ref2 = this.children;
          results = [];
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            results.push(child.setParent(this));
          }
          return results;
        };
        XMLNode2.prototype.element = function(name, attributes, text) {
          var childNode, item, j, k, key, lastChild, len, len1, ref2, ref3, val;
          lastChild = null;
          if (attributes === null && text == null) {
            ref2 = [{}, null], attributes = ref2[0], text = ref2[1];
          }
          if (attributes == null) {
            attributes = {};
          }
          attributes = getValue(attributes);
          if (!isObject(attributes)) {
            ref3 = [attributes, text], text = ref3[0], attributes = ref3[1];
          }
          if (name != null) {
            name = getValue(name);
          }
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              item = name[j];
              lastChild = this.element(item);
            }
          } else if (isFunction(name)) {
            lastChild = this.element(name.apply());
          } else if (isObject(name)) {
            for (key in name) {
              if (!hasProp.call(name, key))
                continue;
              val = name[key];
              if (isFunction(val)) {
                val = val.apply();
              }
              if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
                lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
              } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
                lastChild = this.dummy();
              } else if (isObject(val) && isEmpty(val)) {
                lastChild = this.element(key);
              } else if (!this.options.keepNullNodes && val == null) {
                lastChild = this.dummy();
              } else if (!this.options.separateArrayItems && Array.isArray(val)) {
                for (k = 0, len1 = val.length; k < len1; k++) {
                  item = val[k];
                  childNode = {};
                  childNode[key] = item;
                  lastChild = this.element(childNode);
                }
              } else if (isObject(val)) {
                if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
                  lastChild = this.element(val);
                } else {
                  lastChild = this.element(key);
                  lastChild.element(val);
                }
              } else {
                lastChild = this.element(key, val);
              }
            }
          } else if (!this.options.keepNullNodes && text === null) {
            lastChild = this.dummy();
          } else {
            if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
              lastChild = this.text(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
              lastChild = this.cdata(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
              lastChild = this.comment(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
              lastChild = this.raw(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
              lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
            } else {
              lastChild = this.node(name, attributes, text);
            }
          }
          if (lastChild == null) {
            throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
          }
          return lastChild;
        };
        XMLNode2.prototype.insertBefore = function(name, attributes, text) {
          var child, i, newChild, refChild, removed;
          if (name != null ? name.type : void 0) {
            newChild = name;
            refChild = attributes;
            newChild.setParent(this);
            if (refChild) {
              i = children.indexOf(refChild);
              removed = children.splice(i);
              children.push(newChild);
              Array.prototype.push.apply(children, removed);
            } else {
              children.push(newChild);
            }
            return newChild;
          } else {
            if (this.isRoot) {
              throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
            }
            i = this.parent.children.indexOf(this);
            removed = this.parent.children.splice(i);
            child = this.parent.element(name, attributes, text);
            Array.prototype.push.apply(this.parent.children, removed);
            return child;
          }
        };
        XMLNode2.prototype.insertAfter = function(name, attributes, text) {
          var child, i, removed;
          if (this.isRoot) {
            throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
          }
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          child = this.parent.element(name, attributes, text);
          Array.prototype.push.apply(this.parent.children, removed);
          return child;
        };
        XMLNode2.prototype.remove = function() {
          var i, ref2;
          if (this.isRoot) {
            throw new Error("Cannot remove the root element. " + this.debugInfo());
          }
          i = this.parent.children.indexOf(this);
          [].splice.apply(this.parent.children, [i, i - i + 1].concat(ref2 = [])), ref2;
          return this.parent;
        };
        XMLNode2.prototype.node = function(name, attributes, text) {
          var child, ref2;
          if (name != null) {
            name = getValue(name);
          }
          attributes || (attributes = {});
          attributes = getValue(attributes);
          if (!isObject(attributes)) {
            ref2 = [attributes, text], text = ref2[0], attributes = ref2[1];
          }
          child = new XMLElement(this, name, attributes);
          if (text != null) {
            child.text(text);
          }
          this.children.push(child);
          return child;
        };
        XMLNode2.prototype.text = function(value) {
          var child;
          if (isObject(value)) {
            this.element(value);
          }
          child = new XMLText(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.cdata = function(value) {
          var child;
          child = new XMLCData(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.comment = function(value) {
          var child;
          child = new XMLComment(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.commentBefore = function(value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i);
          child = this.parent.comment(value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.commentAfter = function(value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          child = this.parent.comment(value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.raw = function(value) {
          var child;
          child = new XMLRaw(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.dummy = function() {
          var child;
          child = new XMLDummy(this);
          return child;
        };
        XMLNode2.prototype.instruction = function(target, value) {
          var insTarget, insValue, instruction, j, len;
          if (target != null) {
            target = getValue(target);
          }
          if (value != null) {
            value = getValue(value);
          }
          if (Array.isArray(target)) {
            for (j = 0, len = target.length; j < len; j++) {
              insTarget = target[j];
              this.instruction(insTarget);
            }
          } else if (isObject(target)) {
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget))
                continue;
              insValue = target[insTarget];
              this.instruction(insTarget, insValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            instruction = new XMLProcessingInstruction(this, target, value);
            this.children.push(instruction);
          }
          return this;
        };
        XMLNode2.prototype.instructionBefore = function(target, value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i);
          child = this.parent.instruction(target, value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.instructionAfter = function(target, value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          child = this.parent.instruction(target, value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.declaration = function(version, encoding, standalone) {
          var doc, xmldec;
          doc = this.document();
          xmldec = new XMLDeclaration(doc, version, encoding, standalone);
          if (doc.children.length === 0) {
            doc.children.unshift(xmldec);
          } else if (doc.children[0].type === NodeType.Declaration) {
            doc.children[0] = xmldec;
          } else {
            doc.children.unshift(xmldec);
          }
          return doc.root() || doc;
        };
        XMLNode2.prototype.dtd = function(pubID, sysID) {
          var child, doc, doctype, i, j, k, len, len1, ref2, ref3;
          doc = this.document();
          doctype = new XMLDocType(doc, pubID, sysID);
          ref2 = doc.children;
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            child = ref2[i];
            if (child.type === NodeType.DocType) {
              doc.children[i] = doctype;
              return doctype;
            }
          }
          ref3 = doc.children;
          for (i = k = 0, len1 = ref3.length; k < len1; i = ++k) {
            child = ref3[i];
            if (child.isRoot) {
              doc.children.splice(i, 0, doctype);
              return doctype;
            }
          }
          doc.children.push(doctype);
          return doctype;
        };
        XMLNode2.prototype.up = function() {
          if (this.isRoot) {
            throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
          }
          return this.parent;
        };
        XMLNode2.prototype.root = function() {
          var node;
          node = this;
          while (node) {
            if (node.type === NodeType.Document) {
              return node.rootObject;
            } else if (node.isRoot) {
              return node;
            } else {
              node = node.parent;
            }
          }
        };
        XMLNode2.prototype.document = function() {
          var node;
          node = this;
          while (node) {
            if (node.type === NodeType.Document) {
              return node;
            } else {
              node = node.parent;
            }
          }
        };
        XMLNode2.prototype.end = function(options2) {
          return this.document().end(options2);
        };
        XMLNode2.prototype.prev = function() {
          var i;
          i = this.parent.children.indexOf(this);
          if (i < 1) {
            throw new Error("Already at the first node. " + this.debugInfo());
          }
          return this.parent.children[i - 1];
        };
        XMLNode2.prototype.next = function() {
          var i;
          i = this.parent.children.indexOf(this);
          if (i === -1 || i === this.parent.children.length - 1) {
            throw new Error("Already at the last node. " + this.debugInfo());
          }
          return this.parent.children[i + 1];
        };
        XMLNode2.prototype.importDocument = function(doc) {
          var clonedRoot;
          clonedRoot = doc.root().clone();
          clonedRoot.parent = this;
          clonedRoot.isRoot = false;
          this.children.push(clonedRoot);
          return this;
        };
        XMLNode2.prototype.debugInfo = function(name) {
          var ref2, ref3;
          name = name || this.name;
          if (name == null && !((ref2 = this.parent) != null ? ref2.name : void 0)) {
            return "";
          } else if (name == null) {
            return "parent: <" + this.parent.name + ">";
          } else if (!((ref3 = this.parent) != null ? ref3.name : void 0)) {
            return "node: <" + name + ">";
          } else {
            return "node: <" + name + ">, parent: <" + this.parent.name + ">";
          }
        };
        XMLNode2.prototype.ele = function(name, attributes, text) {
          return this.element(name, attributes, text);
        };
        XMLNode2.prototype.nod = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLNode2.prototype.txt = function(value) {
          return this.text(value);
        };
        XMLNode2.prototype.dat = function(value) {
          return this.cdata(value);
        };
        XMLNode2.prototype.com = function(value) {
          return this.comment(value);
        };
        XMLNode2.prototype.ins = function(target, value) {
          return this.instruction(target, value);
        };
        XMLNode2.prototype.doc = function() {
          return this.document();
        };
        XMLNode2.prototype.dec = function(version, encoding, standalone) {
          return this.declaration(version, encoding, standalone);
        };
        XMLNode2.prototype.e = function(name, attributes, text) {
          return this.element(name, attributes, text);
        };
        XMLNode2.prototype.n = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLNode2.prototype.t = function(value) {
          return this.text(value);
        };
        XMLNode2.prototype.d = function(value) {
          return this.cdata(value);
        };
        XMLNode2.prototype.c = function(value) {
          return this.comment(value);
        };
        XMLNode2.prototype.r = function(value) {
          return this.raw(value);
        };
        XMLNode2.prototype.i = function(target, value) {
          return this.instruction(target, value);
        };
        XMLNode2.prototype.u = function() {
          return this.up();
        };
        XMLNode2.prototype.importXMLBuilder = function(doc) {
          return this.importDocument(doc);
        };
        XMLNode2.prototype.replaceChild = function(newChild, oldChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.removeChild = function(oldChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.appendChild = function(newChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.hasChildNodes = function() {
          return this.children.length !== 0;
        };
        XMLNode2.prototype.cloneNode = function(deep) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.normalize = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.isSupported = function(feature, version) {
          return true;
        };
        XMLNode2.prototype.hasAttributes = function() {
          return this.attribs.length !== 0;
        };
        XMLNode2.prototype.compareDocumentPosition = function(other) {
          var ref, res;
          ref = this;
          if (ref === other) {
            return 0;
          } else if (this.document() !== other.document()) {
            res = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific;
            if (Math.random() < 0.5) {
              res |= DocumentPosition.Preceding;
            } else {
              res |= DocumentPosition.Following;
            }
            return res;
          } else if (ref.isAncestor(other)) {
            return DocumentPosition.Contains | DocumentPosition.Preceding;
          } else if (ref.isDescendant(other)) {
            return DocumentPosition.Contains | DocumentPosition.Following;
          } else if (ref.isPreceding(other)) {
            return DocumentPosition.Preceding;
          } else {
            return DocumentPosition.Following;
          }
        };
        XMLNode2.prototype.isSameNode = function(other) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.lookupPrefix = function(namespaceURI) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.isDefaultNamespace = function(namespaceURI) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.lookupNamespaceURI = function(prefix) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.isEqualNode = function(node) {
          var i, j, ref2;
          if (node.nodeType !== this.nodeType) {
            return false;
          }
          if (node.children.length !== this.children.length) {
            return false;
          }
          for (i = j = 0, ref2 = this.children.length - 1; 0 <= ref2 ? j <= ref2 : j >= ref2; i = 0 <= ref2 ? ++j : --j) {
            if (!this.children[i].isEqualNode(node.children[i])) {
              return false;
            }
          }
          return true;
        };
        XMLNode2.prototype.getFeature = function(feature, version) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.setUserData = function(key, data, handler) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.getUserData = function(key) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.contains = function(other) {
          if (!other) {
            return false;
          }
          return other === this || this.isDescendant(other);
        };
        XMLNode2.prototype.isDescendant = function(node) {
          var child, isDescendantChild, j, len, ref2;
          ref2 = this.children;
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            if (node === child) {
              return true;
            }
            isDescendantChild = child.isDescendant(node);
            if (isDescendantChild) {
              return true;
            }
          }
          return false;
        };
        XMLNode2.prototype.isAncestor = function(node) {
          return node.isDescendant(this);
        };
        XMLNode2.prototype.isPreceding = function(node) {
          var nodePos, thisPos;
          nodePos = this.treePosition(node);
          thisPos = this.treePosition(this);
          if (nodePos === -1 || thisPos === -1) {
            return false;
          } else {
            return nodePos < thisPos;
          }
        };
        XMLNode2.prototype.isFollowing = function(node) {
          var nodePos, thisPos;
          nodePos = this.treePosition(node);
          thisPos = this.treePosition(this);
          if (nodePos === -1 || thisPos === -1) {
            return false;
          } else {
            return nodePos > thisPos;
          }
        };
        XMLNode2.prototype.treePosition = function(node) {
          var found, pos;
          pos = 0;
          found = false;
          this.foreachTreeNode(this.document(), function(childNode) {
            pos++;
            if (!found && childNode === node) {
              return found = true;
            }
          });
          if (found) {
            return pos;
          } else {
            return -1;
          }
        };
        XMLNode2.prototype.foreachTreeNode = function(node, func) {
          var child, j, len, ref2, res;
          node || (node = this.document());
          ref2 = node.children;
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            if (res = func(child)) {
              return res;
            } else {
              res = this.foreachTreeNode(child, func);
              if (res) {
                return res;
              }
            }
          }
        };
        return XMLNode2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLStringifier.js
var require_XMLStringifier = __commonJS({
  "node_modules/xmlbuilder/lib/XMLStringifier.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLStringifier, bind = function(fn, me) {
        return function() {
          return fn.apply(me, arguments);
        };
      }, hasProp = {}.hasOwnProperty;
      module2.exports = XMLStringifier = function() {
        function XMLStringifier2(options2) {
          this.assertLegalName = bind(this.assertLegalName, this);
          this.assertLegalChar = bind(this.assertLegalChar, this);
          var key, ref, value;
          options2 || (options2 = {});
          this.options = options2;
          if (!this.options.version) {
            this.options.version = "1.0";
          }
          ref = options2.stringify || {};
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this[key] = value;
          }
        }
        XMLStringifier2.prototype.name = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalName("" + val || "");
        };
        XMLStringifier2.prototype.text = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar(this.textEscape("" + val || ""));
        };
        XMLStringifier2.prototype.cdata = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          val = val.replace("]]>", "]]]]><![CDATA[>");
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.comment = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (val.match(/--/)) {
            throw new Error("Comment text cannot contain double-hypen: " + val);
          }
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.raw = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return "" + val || "";
        };
        XMLStringifier2.prototype.attValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar(this.attEscape(val = "" + val || ""));
        };
        XMLStringifier2.prototype.insTarget = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.insValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (val.match(/\?>/)) {
            throw new Error("Invalid processing instruction value: " + val);
          }
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.xmlVersion = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (!val.match(/1\.[0-9]+/)) {
            throw new Error("Invalid version number: " + val);
          }
          return val;
        };
        XMLStringifier2.prototype.xmlEncoding = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
            throw new Error("Invalid encoding: " + val);
          }
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.xmlStandalone = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          if (val) {
            return "yes";
          } else {
            return "no";
          }
        };
        XMLStringifier2.prototype.dtdPubID = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdSysID = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdElementValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdAttType = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdAttDefault = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdEntityValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdNData = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.convertAttKey = "@";
        XMLStringifier2.prototype.convertPIKey = "?";
        XMLStringifier2.prototype.convertTextKey = "#text";
        XMLStringifier2.prototype.convertCDataKey = "#cdata";
        XMLStringifier2.prototype.convertCommentKey = "#comment";
        XMLStringifier2.prototype.convertRawKey = "#raw";
        XMLStringifier2.prototype.assertLegalChar = function(str) {
          var regex, res;
          if (this.options.noValidation) {
            return str;
          }
          regex = "";
          if (this.options.version === "1.0") {
            regex = /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
            if (res = str.match(regex)) {
              throw new Error("Invalid character in string: " + str + " at index " + res.index);
            }
          } else if (this.options.version === "1.1") {
            regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
            if (res = str.match(regex)) {
              throw new Error("Invalid character in string: " + str + " at index " + res.index);
            }
          }
          return str;
        };
        XMLStringifier2.prototype.assertLegalName = function(str) {
          var regex;
          if (this.options.noValidation) {
            return str;
          }
          this.assertLegalChar(str);
          regex = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
          if (!str.match(regex)) {
            throw new Error("Invalid character in name");
          }
          return str;
        };
        XMLStringifier2.prototype.textEscape = function(str) {
          var ampregex;
          if (this.options.noValidation) {
            return str;
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
          return str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
        };
        XMLStringifier2.prototype.attEscape = function(str) {
          var ampregex;
          if (this.options.noValidation) {
            return str;
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
          return str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
        };
        return XMLStringifier2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/WriterState.js
var require_WriterState = __commonJS({
  "node_modules/xmlbuilder/lib/WriterState.js"(exports, module2) {
    init_shims();
    (function() {
      module2.exports = {
        None: 0,
        OpenTag: 1,
        InsideTag: 2,
        CloseTag: 3
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLWriterBase.js
var require_XMLWriterBase = __commonJS({
  "node_modules/xmlbuilder/lib/XMLWriterBase.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, WriterState, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, assign, hasProp = {}.hasOwnProperty;
      assign = require_Utility().assign;
      NodeType = require_NodeType();
      XMLDeclaration = require_XMLDeclaration();
      XMLDocType = require_XMLDocType();
      XMLCData = require_XMLCData();
      XMLComment = require_XMLComment();
      XMLElement = require_XMLElement();
      XMLRaw = require_XMLRaw();
      XMLText = require_XMLText();
      XMLProcessingInstruction = require_XMLProcessingInstruction();
      XMLDummy = require_XMLDummy();
      XMLDTDAttList = require_XMLDTDAttList();
      XMLDTDElement = require_XMLDTDElement();
      XMLDTDEntity = require_XMLDTDEntity();
      XMLDTDNotation = require_XMLDTDNotation();
      WriterState = require_WriterState();
      module2.exports = XMLWriterBase = function() {
        function XMLWriterBase2(options2) {
          var key, ref, value;
          options2 || (options2 = {});
          this.options = options2;
          ref = options2.writer || {};
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this["_" + key] = this[key];
            this[key] = value;
          }
        }
        XMLWriterBase2.prototype.filterOptions = function(options2) {
          var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6;
          options2 || (options2 = {});
          options2 = assign({}, this.options, options2);
          filteredOptions = {
            writer: this
          };
          filteredOptions.pretty = options2.pretty || false;
          filteredOptions.allowEmpty = options2.allowEmpty || false;
          filteredOptions.indent = (ref = options2.indent) != null ? ref : "  ";
          filteredOptions.newline = (ref1 = options2.newline) != null ? ref1 : "\n";
          filteredOptions.offset = (ref2 = options2.offset) != null ? ref2 : 0;
          filteredOptions.dontPrettyTextNodes = (ref3 = (ref4 = options2.dontPrettyTextNodes) != null ? ref4 : options2.dontprettytextnodes) != null ? ref3 : 0;
          filteredOptions.spaceBeforeSlash = (ref5 = (ref6 = options2.spaceBeforeSlash) != null ? ref6 : options2.spacebeforeslash) != null ? ref5 : "";
          if (filteredOptions.spaceBeforeSlash === true) {
            filteredOptions.spaceBeforeSlash = " ";
          }
          filteredOptions.suppressPrettyCount = 0;
          filteredOptions.user = {};
          filteredOptions.state = WriterState.None;
          return filteredOptions;
        };
        XMLWriterBase2.prototype.indent = function(node, options2, level) {
          var indentLevel;
          if (!options2.pretty || options2.suppressPrettyCount) {
            return "";
          } else if (options2.pretty) {
            indentLevel = (level || 0) + options2.offset + 1;
            if (indentLevel > 0) {
              return new Array(indentLevel).join(options2.indent);
            }
          }
          return "";
        };
        XMLWriterBase2.prototype.endline = function(node, options2, level) {
          if (!options2.pretty || options2.suppressPrettyCount) {
            return "";
          } else {
            return options2.newline;
          }
        };
        XMLWriterBase2.prototype.attribute = function(att, options2, level) {
          var r;
          this.openAttribute(att, options2, level);
          r = " " + att.name + '="' + att.value + '"';
          this.closeAttribute(att, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.cdata = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<![CDATA[";
          options2.state = WriterState.InsideTag;
          r += node.value;
          options2.state = WriterState.CloseTag;
          r += "]]>" + this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.comment = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<!-- ";
          options2.state = WriterState.InsideTag;
          r += node.value;
          options2.state = WriterState.CloseTag;
          r += " -->" + this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.declaration = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<?xml";
          options2.state = WriterState.InsideTag;
          r += ' version="' + node.version + '"';
          if (node.encoding != null) {
            r += ' encoding="' + node.encoding + '"';
          }
          if (node.standalone != null) {
            r += ' standalone="' + node.standalone + '"';
          }
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + "?>";
          r += this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.docType = function(node, options2, level) {
          var child, i, len, r, ref;
          level || (level = 0);
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level);
          r += "<!DOCTYPE " + node.root().name;
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"';
          }
          if (node.children.length > 0) {
            r += " [";
            r += this.endline(node, options2, level);
            options2.state = WriterState.InsideTag;
            ref = node.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              r += this.writeChildNode(child, options2, level + 1);
            }
            options2.state = WriterState.CloseTag;
            r += "]";
          }
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + ">";
          r += this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.element = function(node, options2, level) {
          var att, child, childNodeCount, firstChildNode, i, j, len, len1, name, prettySuppressed, r, ref, ref1, ref2;
          level || (level = 0);
          prettySuppressed = false;
          r = "";
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r += this.indent(node, options2, level) + "<" + node.name;
          ref = node.attribs;
          for (name in ref) {
            if (!hasProp.call(ref, name))
              continue;
            att = ref[name];
            r += this.attribute(att, options2, level);
          }
          childNodeCount = node.children.length;
          firstChildNode = childNodeCount === 0 ? null : node.children[0];
          if (childNodeCount === 0 || node.children.every(function(e) {
            return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === "";
          })) {
            if (options2.allowEmpty) {
              r += ">";
              options2.state = WriterState.CloseTag;
              r += "</" + node.name + ">" + this.endline(node, options2, level);
            } else {
              options2.state = WriterState.CloseTag;
              r += options2.spaceBeforeSlash + "/>" + this.endline(node, options2, level);
            }
          } else if (options2.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && firstChildNode.value != null) {
            r += ">";
            options2.state = WriterState.InsideTag;
            options2.suppressPrettyCount++;
            prettySuppressed = true;
            r += this.writeChildNode(firstChildNode, options2, level + 1);
            options2.suppressPrettyCount--;
            prettySuppressed = false;
            options2.state = WriterState.CloseTag;
            r += "</" + node.name + ">" + this.endline(node, options2, level);
          } else {
            if (options2.dontPrettyTextNodes) {
              ref1 = node.children;
              for (i = 0, len = ref1.length; i < len; i++) {
                child = ref1[i];
                if ((child.type === NodeType.Text || child.type === NodeType.Raw) && child.value != null) {
                  options2.suppressPrettyCount++;
                  prettySuppressed = true;
                  break;
                }
              }
            }
            r += ">" + this.endline(node, options2, level);
            options2.state = WriterState.InsideTag;
            ref2 = node.children;
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              child = ref2[j];
              r += this.writeChildNode(child, options2, level + 1);
            }
            options2.state = WriterState.CloseTag;
            r += this.indent(node, options2, level) + "</" + node.name + ">";
            if (prettySuppressed) {
              options2.suppressPrettyCount--;
            }
            r += this.endline(node, options2, level);
            options2.state = WriterState.None;
          }
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.writeChildNode = function(node, options2, level) {
          switch (node.type) {
            case NodeType.CData:
              return this.cdata(node, options2, level);
            case NodeType.Comment:
              return this.comment(node, options2, level);
            case NodeType.Element:
              return this.element(node, options2, level);
            case NodeType.Raw:
              return this.raw(node, options2, level);
            case NodeType.Text:
              return this.text(node, options2, level);
            case NodeType.ProcessingInstruction:
              return this.processingInstruction(node, options2, level);
            case NodeType.Dummy:
              return "";
            case NodeType.Declaration:
              return this.declaration(node, options2, level);
            case NodeType.DocType:
              return this.docType(node, options2, level);
            case NodeType.AttributeDeclaration:
              return this.dtdAttList(node, options2, level);
            case NodeType.ElementDeclaration:
              return this.dtdElement(node, options2, level);
            case NodeType.EntityDeclaration:
              return this.dtdEntity(node, options2, level);
            case NodeType.NotationDeclaration:
              return this.dtdNotation(node, options2, level);
            default:
              throw new Error("Unknown XML node type: " + node.constructor.name);
          }
        };
        XMLWriterBase2.prototype.processingInstruction = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<?";
          options2.state = WriterState.InsideTag;
          r += node.target;
          if (node.value) {
            r += " " + node.value;
          }
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + "?>";
          r += this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.raw = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level);
          options2.state = WriterState.InsideTag;
          r += node.value;
          options2.state = WriterState.CloseTag;
          r += this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.text = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level);
          options2.state = WriterState.InsideTag;
          r += node.value;
          options2.state = WriterState.CloseTag;
          r += this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdAttList = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<!ATTLIST";
          options2.state = WriterState.InsideTag;
          r += " " + node.elementName + " " + node.attributeName + " " + node.attributeType;
          if (node.defaultValueType !== "#DEFAULT") {
            r += " " + node.defaultValueType;
          }
          if (node.defaultValue) {
            r += ' "' + node.defaultValue + '"';
          }
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + ">" + this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdElement = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<!ELEMENT";
          options2.state = WriterState.InsideTag;
          r += " " + node.name + " " + node.value;
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + ">" + this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdEntity = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<!ENTITY";
          options2.state = WriterState.InsideTag;
          if (node.pe) {
            r += " %";
          }
          r += " " + node.name;
          if (node.value) {
            r += ' "' + node.value + '"';
          } else {
            if (node.pubID && node.sysID) {
              r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
            } else if (node.sysID) {
              r += ' SYSTEM "' + node.sysID + '"';
            }
            if (node.nData) {
              r += " NDATA " + node.nData;
            }
          }
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + ">" + this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdNotation = function(node, options2, level) {
          var r;
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          r = this.indent(node, options2, level) + "<!NOTATION";
          options2.state = WriterState.InsideTag;
          r += " " + node.name;
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
          } else if (node.pubID) {
            r += ' PUBLIC "' + node.pubID + '"';
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"';
          }
          options2.state = WriterState.CloseTag;
          r += options2.spaceBeforeSlash + ">" + this.endline(node, options2, level);
          options2.state = WriterState.None;
          this.closeNode(node, options2, level);
          return r;
        };
        XMLWriterBase2.prototype.openNode = function(node, options2, level) {
        };
        XMLWriterBase2.prototype.closeNode = function(node, options2, level) {
        };
        XMLWriterBase2.prototype.openAttribute = function(att, options2, level) {
        };
        XMLWriterBase2.prototype.closeAttribute = function(att, options2, level) {
        };
        return XMLWriterBase2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLStringWriter.js
var require_XMLStringWriter = __commonJS({
  "node_modules/xmlbuilder/lib/XMLStringWriter.js"(exports, module2) {
    init_shims();
    (function() {
      var XMLStringWriter, XMLWriterBase, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLWriterBase = require_XMLWriterBase();
      module2.exports = XMLStringWriter = function(superClass) {
        extend(XMLStringWriter2, superClass);
        function XMLStringWriter2(options2) {
          XMLStringWriter2.__super__.constructor.call(this, options2);
        }
        XMLStringWriter2.prototype.document = function(doc, options2) {
          var child, i, len, r, ref;
          options2 = this.filterOptions(options2);
          r = "";
          ref = doc.children;
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            r += this.writeChildNode(child, options2, 0);
          }
          if (options2.pretty && r.slice(-options2.newline.length) === options2.newline) {
            r = r.slice(0, -options2.newline.length);
          }
          return r;
        };
        return XMLStringWriter2;
      }(XMLWriterBase);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDocument.js
var require_XMLDocument = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDocument.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, XMLDOMConfiguration, XMLDOMImplementation, XMLDocument, XMLNode, XMLStringWriter, XMLStringifier, isPlainObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isPlainObject = require_Utility().isPlainObject;
      XMLDOMImplementation = require_XMLDOMImplementation();
      XMLDOMConfiguration = require_XMLDOMConfiguration();
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      XMLStringifier = require_XMLStringifier();
      XMLStringWriter = require_XMLStringWriter();
      module2.exports = XMLDocument = function(superClass) {
        extend(XMLDocument2, superClass);
        function XMLDocument2(options2) {
          XMLDocument2.__super__.constructor.call(this, null);
          this.name = "#document";
          this.type = NodeType.Document;
          this.documentURI = null;
          this.domConfig = new XMLDOMConfiguration();
          options2 || (options2 = {});
          if (!options2.writer) {
            options2.writer = new XMLStringWriter();
          }
          this.options = options2;
          this.stringify = new XMLStringifier(options2);
        }
        Object.defineProperty(XMLDocument2.prototype, "implementation", {
          value: new XMLDOMImplementation()
        });
        Object.defineProperty(XMLDocument2.prototype, "doctype", {
          get: function() {
            var child, i, len, ref;
            ref = this.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.DocType) {
                return child;
              }
            }
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "documentElement", {
          get: function() {
            return this.rootObject || null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "inputEncoding", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "strictErrorChecking", {
          get: function() {
            return false;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "xmlEncoding", {
          get: function() {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].encoding;
            } else {
              return null;
            }
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "xmlStandalone", {
          get: function() {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].standalone === "yes";
            } else {
              return false;
            }
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "xmlVersion", {
          get: function() {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].version;
            } else {
              return "1.0";
            }
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "URL", {
          get: function() {
            return this.documentURI;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "origin", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "compatMode", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "characterSet", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "contentType", {
          get: function() {
            return null;
          }
        });
        XMLDocument2.prototype.end = function(writer) {
          var writerOptions;
          writerOptions = {};
          if (!writer) {
            writer = this.options.writer;
          } else if (isPlainObject(writer)) {
            writerOptions = writer;
            writer = this.options.writer;
          }
          return writer.document(this, writer.filterOptions(writerOptions));
        };
        XMLDocument2.prototype.toString = function(options2) {
          return this.options.writer.document(this, this.options.writer.filterOptions(options2));
        };
        XMLDocument2.prototype.createElement = function(tagName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createDocumentFragment = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createTextNode = function(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createComment = function(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createCDATASection = function(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createProcessingInstruction = function(target, data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createAttribute = function(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createEntityReference = function(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementsByTagName = function(tagname) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.importNode = function(importedNode, deep) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createElementNS = function(namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createAttributeNS = function(namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementById = function(elementId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.adoptNode = function(source) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.normalizeDocument = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.renameNode = function(node, namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementsByClassName = function(classNames) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createEvent = function(eventInterface) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createRange = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createNodeIterator = function(root, whatToShow, filter) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createTreeWalker = function(root, whatToShow, filter) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        return XMLDocument2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDocumentCB.js
var require_XMLDocumentCB = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDocumentCB.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, WriterState, XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDocument, XMLDocumentCB, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject, ref, hasProp = {}.hasOwnProperty;
      ref = require_Utility(), isObject = ref.isObject, isFunction = ref.isFunction, isPlainObject = ref.isPlainObject, getValue = ref.getValue;
      NodeType = require_NodeType();
      XMLDocument = require_XMLDocument();
      XMLElement = require_XMLElement();
      XMLCData = require_XMLCData();
      XMLComment = require_XMLComment();
      XMLRaw = require_XMLRaw();
      XMLText = require_XMLText();
      XMLProcessingInstruction = require_XMLProcessingInstruction();
      XMLDeclaration = require_XMLDeclaration();
      XMLDocType = require_XMLDocType();
      XMLDTDAttList = require_XMLDTDAttList();
      XMLDTDEntity = require_XMLDTDEntity();
      XMLDTDElement = require_XMLDTDElement();
      XMLDTDNotation = require_XMLDTDNotation();
      XMLAttribute = require_XMLAttribute();
      XMLStringifier = require_XMLStringifier();
      XMLStringWriter = require_XMLStringWriter();
      WriterState = require_WriterState();
      module2.exports = XMLDocumentCB = function() {
        function XMLDocumentCB2(options2, onData, onEnd) {
          var writerOptions;
          this.name = "?xml";
          this.type = NodeType.Document;
          options2 || (options2 = {});
          writerOptions = {};
          if (!options2.writer) {
            options2.writer = new XMLStringWriter();
          } else if (isPlainObject(options2.writer)) {
            writerOptions = options2.writer;
            options2.writer = new XMLStringWriter();
          }
          this.options = options2;
          this.writer = options2.writer;
          this.writerOptions = this.writer.filterOptions(writerOptions);
          this.stringify = new XMLStringifier(options2);
          this.onDataCallback = onData || function() {
          };
          this.onEndCallback = onEnd || function() {
          };
          this.currentNode = null;
          this.currentLevel = -1;
          this.openTags = {};
          this.documentStarted = false;
          this.documentCompleted = false;
          this.root = null;
        }
        XMLDocumentCB2.prototype.createChildNode = function(node) {
          var att, attName, attributes, child, i, len, ref1, ref2;
          switch (node.type) {
            case NodeType.CData:
              this.cdata(node.value);
              break;
            case NodeType.Comment:
              this.comment(node.value);
              break;
            case NodeType.Element:
              attributes = {};
              ref1 = node.attribs;
              for (attName in ref1) {
                if (!hasProp.call(ref1, attName))
                  continue;
                att = ref1[attName];
                attributes[attName] = att.value;
              }
              this.node(node.name, attributes);
              break;
            case NodeType.Dummy:
              this.dummy();
              break;
            case NodeType.Raw:
              this.raw(node.value);
              break;
            case NodeType.Text:
              this.text(node.value);
              break;
            case NodeType.ProcessingInstruction:
              this.instruction(node.target, node.value);
              break;
            default:
              throw new Error("This XML node type is not supported in a JS object: " + node.constructor.name);
          }
          ref2 = node.children;
          for (i = 0, len = ref2.length; i < len; i++) {
            child = ref2[i];
            this.createChildNode(child);
            if (child.type === NodeType.Element) {
              this.up();
            }
          }
          return this;
        };
        XMLDocumentCB2.prototype.dummy = function() {
          return this;
        };
        XMLDocumentCB2.prototype.node = function(name, attributes, text) {
          var ref1;
          if (name == null) {
            throw new Error("Missing node name.");
          }
          if (this.root && this.currentLevel === -1) {
            throw new Error("Document can only have one root node. " + this.debugInfo(name));
          }
          this.openCurrent();
          name = getValue(name);
          if (attributes == null) {
            attributes = {};
          }
          attributes = getValue(attributes);
          if (!isObject(attributes)) {
            ref1 = [attributes, text], text = ref1[0], attributes = ref1[1];
          }
          this.currentNode = new XMLElement(this, name, attributes);
          this.currentNode.children = false;
          this.currentLevel++;
          this.openTags[this.currentLevel] = this.currentNode;
          if (text != null) {
            this.text(text);
          }
          return this;
        };
        XMLDocumentCB2.prototype.element = function(name, attributes, text) {
          var child, i, len, oldValidationFlag, ref1, root;
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            this.dtdElement.apply(this, arguments);
          } else {
            if (Array.isArray(name) || isObject(name) || isFunction(name)) {
              oldValidationFlag = this.options.noValidation;
              this.options.noValidation = true;
              root = new XMLDocument(this.options).element("TEMP_ROOT");
              root.element(name);
              this.options.noValidation = oldValidationFlag;
              ref1 = root.children;
              for (i = 0, len = ref1.length; i < len; i++) {
                child = ref1[i];
                this.createChildNode(child);
                if (child.type === NodeType.Element) {
                  this.up();
                }
              }
            } else {
              this.node(name, attributes, text);
            }
          }
          return this;
        };
        XMLDocumentCB2.prototype.attribute = function(name, value) {
          var attName, attValue;
          if (!this.currentNode || this.currentNode.children) {
            throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
          }
          if (name != null) {
            name = getValue(name);
          }
          if (isObject(name)) {
            for (attName in name) {
              if (!hasProp.call(name, attName))
                continue;
              attValue = name[attName];
              this.attribute(attName, attValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            if (this.options.keepNullAttributes && value == null) {
              this.currentNode.attribs[name] = new XMLAttribute(this, name, "");
            } else if (value != null) {
              this.currentNode.attribs[name] = new XMLAttribute(this, name, value);
            }
          }
          return this;
        };
        XMLDocumentCB2.prototype.text = function(value) {
          var node;
          this.openCurrent();
          node = new XMLText(this, value);
          this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.cdata = function(value) {
          var node;
          this.openCurrent();
          node = new XMLCData(this, value);
          this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.comment = function(value) {
          var node;
          this.openCurrent();
          node = new XMLComment(this, value);
          this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.raw = function(value) {
          var node;
          this.openCurrent();
          node = new XMLRaw(this, value);
          this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.instruction = function(target, value) {
          var i, insTarget, insValue, len, node;
          this.openCurrent();
          if (target != null) {
            target = getValue(target);
          }
          if (value != null) {
            value = getValue(value);
          }
          if (Array.isArray(target)) {
            for (i = 0, len = target.length; i < len; i++) {
              insTarget = target[i];
              this.instruction(insTarget);
            }
          } else if (isObject(target)) {
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget))
                continue;
              insValue = target[insTarget];
              this.instruction(insTarget, insValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            node = new XMLProcessingInstruction(this, target, value);
            this.onData(this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          }
          return this;
        };
        XMLDocumentCB2.prototype.declaration = function(version, encoding, standalone) {
          var node;
          this.openCurrent();
          if (this.documentStarted) {
            throw new Error("declaration() must be the first node.");
          }
          node = new XMLDeclaration(this, version, encoding, standalone);
          this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.doctype = function(root, pubID, sysID) {
          this.openCurrent();
          if (root == null) {
            throw new Error("Missing root node name.");
          }
          if (this.root) {
            throw new Error("dtd() must come before the root node.");
          }
          this.currentNode = new XMLDocType(this, pubID, sysID);
          this.currentNode.rootNodeName = root;
          this.currentNode.children = false;
          this.currentLevel++;
          this.openTags[this.currentLevel] = this.currentNode;
          return this;
        };
        XMLDocumentCB2.prototype.dtdElement = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDElement(this, name, value);
          this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          var node;
          this.openCurrent();
          node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
          this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.entity = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDEntity(this, false, name, value);
          this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.pEntity = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDEntity(this, true, name, value);
          this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.notation = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDNotation(this, name, value);
          this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.up = function() {
          if (this.currentLevel < 0) {
            throw new Error("The document node has no parent.");
          }
          if (this.currentNode) {
            if (this.currentNode.children) {
              this.closeNode(this.currentNode);
            } else {
              this.openNode(this.currentNode);
            }
            this.currentNode = null;
          } else {
            this.closeNode(this.openTags[this.currentLevel]);
          }
          delete this.openTags[this.currentLevel];
          this.currentLevel--;
          return this;
        };
        XMLDocumentCB2.prototype.end = function() {
          while (this.currentLevel >= 0) {
            this.up();
          }
          return this.onEnd();
        };
        XMLDocumentCB2.prototype.openCurrent = function() {
          if (this.currentNode) {
            this.currentNode.children = true;
            return this.openNode(this.currentNode);
          }
        };
        XMLDocumentCB2.prototype.openNode = function(node) {
          var att, chunk, name, ref1;
          if (!node.isOpen) {
            if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
              this.root = node;
            }
            chunk = "";
            if (node.type === NodeType.Element) {
              this.writerOptions.state = WriterState.OpenTag;
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "<" + node.name;
              ref1 = node.attribs;
              for (name in ref1) {
                if (!hasProp.call(ref1, name))
                  continue;
                att = ref1[name];
                chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel);
              }
              chunk += (node.children ? ">" : "/>") + this.writer.endline(node, this.writerOptions, this.currentLevel);
              this.writerOptions.state = WriterState.InsideTag;
            } else {
              this.writerOptions.state = WriterState.OpenTag;
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "<!DOCTYPE " + node.rootNodeName;
              if (node.pubID && node.sysID) {
                chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
              } else if (node.sysID) {
                chunk += ' SYSTEM "' + node.sysID + '"';
              }
              if (node.children) {
                chunk += " [";
                this.writerOptions.state = WriterState.InsideTag;
              } else {
                this.writerOptions.state = WriterState.CloseTag;
                chunk += ">";
              }
              chunk += this.writer.endline(node, this.writerOptions, this.currentLevel);
            }
            this.onData(chunk, this.currentLevel);
            return node.isOpen = true;
          }
        };
        XMLDocumentCB2.prototype.closeNode = function(node) {
          var chunk;
          if (!node.isClosed) {
            chunk = "";
            this.writerOptions.state = WriterState.CloseTag;
            if (node.type === NodeType.Element) {
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "</" + node.name + ">" + this.writer.endline(node, this.writerOptions, this.currentLevel);
            } else {
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "]>" + this.writer.endline(node, this.writerOptions, this.currentLevel);
            }
            this.writerOptions.state = WriterState.None;
            this.onData(chunk, this.currentLevel);
            return node.isClosed = true;
          }
        };
        XMLDocumentCB2.prototype.onData = function(chunk, level) {
          this.documentStarted = true;
          return this.onDataCallback(chunk, level + 1);
        };
        XMLDocumentCB2.prototype.onEnd = function() {
          this.documentCompleted = true;
          return this.onEndCallback();
        };
        XMLDocumentCB2.prototype.debugInfo = function(name) {
          if (name == null) {
            return "";
          } else {
            return "node: <" + name + ">";
          }
        };
        XMLDocumentCB2.prototype.ele = function() {
          return this.element.apply(this, arguments);
        };
        XMLDocumentCB2.prototype.nod = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLDocumentCB2.prototype.txt = function(value) {
          return this.text(value);
        };
        XMLDocumentCB2.prototype.dat = function(value) {
          return this.cdata(value);
        };
        XMLDocumentCB2.prototype.com = function(value) {
          return this.comment(value);
        };
        XMLDocumentCB2.prototype.ins = function(target, value) {
          return this.instruction(target, value);
        };
        XMLDocumentCB2.prototype.dec = function(version, encoding, standalone) {
          return this.declaration(version, encoding, standalone);
        };
        XMLDocumentCB2.prototype.dtd = function(root, pubID, sysID) {
          return this.doctype(root, pubID, sysID);
        };
        XMLDocumentCB2.prototype.e = function(name, attributes, text) {
          return this.element(name, attributes, text);
        };
        XMLDocumentCB2.prototype.n = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLDocumentCB2.prototype.t = function(value) {
          return this.text(value);
        };
        XMLDocumentCB2.prototype.d = function(value) {
          return this.cdata(value);
        };
        XMLDocumentCB2.prototype.c = function(value) {
          return this.comment(value);
        };
        XMLDocumentCB2.prototype.r = function(value) {
          return this.raw(value);
        };
        XMLDocumentCB2.prototype.i = function(target, value) {
          return this.instruction(target, value);
        };
        XMLDocumentCB2.prototype.att = function() {
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            return this.attList.apply(this, arguments);
          } else {
            return this.attribute.apply(this, arguments);
          }
        };
        XMLDocumentCB2.prototype.a = function() {
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            return this.attList.apply(this, arguments);
          } else {
            return this.attribute.apply(this, arguments);
          }
        };
        XMLDocumentCB2.prototype.ent = function(name, value) {
          return this.entity(name, value);
        };
        XMLDocumentCB2.prototype.pent = function(name, value) {
          return this.pEntity(name, value);
        };
        XMLDocumentCB2.prototype.not = function(name, value) {
          return this.notation(name, value);
        };
        return XMLDocumentCB2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLStreamWriter.js
var require_XMLStreamWriter = __commonJS({
  "node_modules/xmlbuilder/lib/XMLStreamWriter.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, WriterState, XMLStreamWriter, XMLWriterBase, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLWriterBase = require_XMLWriterBase();
      WriterState = require_WriterState();
      module2.exports = XMLStreamWriter = function(superClass) {
        extend(XMLStreamWriter2, superClass);
        function XMLStreamWriter2(stream, options2) {
          this.stream = stream;
          XMLStreamWriter2.__super__.constructor.call(this, options2);
        }
        XMLStreamWriter2.prototype.endline = function(node, options2, level) {
          if (node.isLastRootNode && options2.state === WriterState.CloseTag) {
            return "";
          } else {
            return XMLStreamWriter2.__super__.endline.call(this, node, options2, level);
          }
        };
        XMLStreamWriter2.prototype.document = function(doc, options2) {
          var child, i, j, k, len, len1, ref, ref1, results;
          ref = doc.children;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            child = ref[i];
            child.isLastRootNode = i === doc.children.length - 1;
          }
          options2 = this.filterOptions(options2);
          ref1 = doc.children;
          results = [];
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            child = ref1[k];
            results.push(this.writeChildNode(child, options2, 0));
          }
          return results;
        };
        XMLStreamWriter2.prototype.attribute = function(att, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.attribute.call(this, att, options2, level));
        };
        XMLStreamWriter2.prototype.cdata = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.cdata.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.comment = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.comment.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.declaration = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.declaration.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.docType = function(node, options2, level) {
          var child, j, len, ref;
          level || (level = 0);
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          this.stream.write(this.indent(node, options2, level));
          this.stream.write("<!DOCTYPE " + node.root().name);
          if (node.pubID && node.sysID) {
            this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"');
          } else if (node.sysID) {
            this.stream.write(' SYSTEM "' + node.sysID + '"');
          }
          if (node.children.length > 0) {
            this.stream.write(" [");
            this.stream.write(this.endline(node, options2, level));
            options2.state = WriterState.InsideTag;
            ref = node.children;
            for (j = 0, len = ref.length; j < len; j++) {
              child = ref[j];
              this.writeChildNode(child, options2, level + 1);
            }
            options2.state = WriterState.CloseTag;
            this.stream.write("]");
          }
          options2.state = WriterState.CloseTag;
          this.stream.write(options2.spaceBeforeSlash + ">");
          this.stream.write(this.endline(node, options2, level));
          options2.state = WriterState.None;
          return this.closeNode(node, options2, level);
        };
        XMLStreamWriter2.prototype.element = function(node, options2, level) {
          var att, child, childNodeCount, firstChildNode, j, len, name, prettySuppressed, ref, ref1;
          level || (level = 0);
          this.openNode(node, options2, level);
          options2.state = WriterState.OpenTag;
          this.stream.write(this.indent(node, options2, level) + "<" + node.name);
          ref = node.attribs;
          for (name in ref) {
            if (!hasProp.call(ref, name))
              continue;
            att = ref[name];
            this.attribute(att, options2, level);
          }
          childNodeCount = node.children.length;
          firstChildNode = childNodeCount === 0 ? null : node.children[0];
          if (childNodeCount === 0 || node.children.every(function(e) {
            return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === "";
          })) {
            if (options2.allowEmpty) {
              this.stream.write(">");
              options2.state = WriterState.CloseTag;
              this.stream.write("</" + node.name + ">");
            } else {
              options2.state = WriterState.CloseTag;
              this.stream.write(options2.spaceBeforeSlash + "/>");
            }
          } else if (options2.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && firstChildNode.value != null) {
            this.stream.write(">");
            options2.state = WriterState.InsideTag;
            options2.suppressPrettyCount++;
            prettySuppressed = true;
            this.writeChildNode(firstChildNode, options2, level + 1);
            options2.suppressPrettyCount--;
            prettySuppressed = false;
            options2.state = WriterState.CloseTag;
            this.stream.write("</" + node.name + ">");
          } else {
            this.stream.write(">" + this.endline(node, options2, level));
            options2.state = WriterState.InsideTag;
            ref1 = node.children;
            for (j = 0, len = ref1.length; j < len; j++) {
              child = ref1[j];
              this.writeChildNode(child, options2, level + 1);
            }
            options2.state = WriterState.CloseTag;
            this.stream.write(this.indent(node, options2, level) + "</" + node.name + ">");
          }
          this.stream.write(this.endline(node, options2, level));
          options2.state = WriterState.None;
          return this.closeNode(node, options2, level);
        };
        XMLStreamWriter2.prototype.processingInstruction = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.processingInstruction.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.raw = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.raw.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.text = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.text.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.dtdAttList = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdAttList.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.dtdElement = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdElement.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.dtdEntity = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdEntity.call(this, node, options2, level));
        };
        XMLStreamWriter2.prototype.dtdNotation = function(node, options2, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdNotation.call(this, node, options2, level));
        };
        return XMLStreamWriter2;
      }(XMLWriterBase);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/index.js
var require_lib = __commonJS({
  "node_modules/xmlbuilder/lib/index.js"(exports, module2) {
    init_shims();
    (function() {
      var NodeType, WriterState, XMLDOMImplementation, XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;
      ref = require_Utility(), assign = ref.assign, isFunction = ref.isFunction;
      XMLDOMImplementation = require_XMLDOMImplementation();
      XMLDocument = require_XMLDocument();
      XMLDocumentCB = require_XMLDocumentCB();
      XMLStringWriter = require_XMLStringWriter();
      XMLStreamWriter = require_XMLStreamWriter();
      NodeType = require_NodeType();
      WriterState = require_WriterState();
      module2.exports.create = function(name, xmldec, doctype, options2) {
        var doc, root;
        if (name == null) {
          throw new Error("Root element needs a name.");
        }
        options2 = assign({}, xmldec, doctype, options2);
        doc = new XMLDocument(options2);
        root = doc.element(name);
        if (!options2.headless) {
          doc.declaration(options2);
          if (options2.pubID != null || options2.sysID != null) {
            doc.dtd(options2);
          }
        }
        return root;
      };
      module2.exports.begin = function(options2, onData, onEnd) {
        var ref1;
        if (isFunction(options2)) {
          ref1 = [options2, onData], onData = ref1[0], onEnd = ref1[1];
          options2 = {};
        }
        if (onData) {
          return new XMLDocumentCB(options2, onData, onEnd);
        } else {
          return new XMLDocument(options2);
        }
      };
      module2.exports.stringWriter = function(options2) {
        return new XMLStringWriter(options2);
      };
      module2.exports.streamWriter = function(stream, options2) {
        return new XMLStreamWriter(stream, options2);
      };
      module2.exports.implementation = new XMLDOMImplementation();
      module2.exports.nodeType = NodeType;
      module2.exports.writerState = WriterState;
    }).call(exports);
  }
});

// node_modules/xml2js/lib/builder.js
var require_builder = __commonJS({
  "node_modules/xml2js/lib/builder.js"(exports) {
    init_shims();
    (function() {
      "use strict";
      var builder, defaults, escapeCDATA, requiresCDATA, wrapCDATA, hasProp = {}.hasOwnProperty;
      builder = require_lib();
      defaults = require_defaults().defaults;
      requiresCDATA = function(entry) {
        return typeof entry === "string" && (entry.indexOf("&") >= 0 || entry.indexOf(">") >= 0 || entry.indexOf("<") >= 0);
      };
      wrapCDATA = function(entry) {
        return "<![CDATA[" + escapeCDATA(entry) + "]]>";
      };
      escapeCDATA = function(entry) {
        return entry.replace("]]>", "]]]]><![CDATA[>");
      };
      exports.Builder = function() {
        function Builder(opts) {
          var key, ref, value;
          this.options = {};
          ref = defaults["0.2"];
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this.options[key] = value;
          }
          for (key in opts) {
            if (!hasProp.call(opts, key))
              continue;
            value = opts[key];
            this.options[key] = value;
          }
        }
        Builder.prototype.buildObject = function(rootObj) {
          var attrkey, charkey, render2, rootElement, rootName;
          attrkey = this.options.attrkey;
          charkey = this.options.charkey;
          if (Object.keys(rootObj).length === 1 && this.options.rootName === defaults["0.2"].rootName) {
            rootName = Object.keys(rootObj)[0];
            rootObj = rootObj[rootName];
          } else {
            rootName = this.options.rootName;
          }
          render2 = function(_this) {
            return function(element, obj) {
              var attr, child, entry, index2, key, value;
              if (typeof obj !== "object") {
                if (_this.options.cdata && requiresCDATA(obj)) {
                  element.raw(wrapCDATA(obj));
                } else {
                  element.txt(obj);
                }
              } else if (Array.isArray(obj)) {
                for (index2 in obj) {
                  if (!hasProp.call(obj, index2))
                    continue;
                  child = obj[index2];
                  for (key in child) {
                    entry = child[key];
                    element = render2(element.ele(key), entry).up();
                  }
                }
              } else {
                for (key in obj) {
                  if (!hasProp.call(obj, key))
                    continue;
                  child = obj[key];
                  if (key === attrkey) {
                    if (typeof child === "object") {
                      for (attr in child) {
                        value = child[attr];
                        element = element.att(attr, value);
                      }
                    }
                  } else if (key === charkey) {
                    if (_this.options.cdata && requiresCDATA(child)) {
                      element = element.raw(wrapCDATA(child));
                    } else {
                      element = element.txt(child);
                    }
                  } else if (Array.isArray(child)) {
                    for (index2 in child) {
                      if (!hasProp.call(child, index2))
                        continue;
                      entry = child[index2];
                      if (typeof entry === "string") {
                        if (_this.options.cdata && requiresCDATA(entry)) {
                          element = element.ele(key).raw(wrapCDATA(entry)).up();
                        } else {
                          element = element.ele(key, entry).up();
                        }
                      } else {
                        element = render2(element.ele(key), entry).up();
                      }
                    }
                  } else if (typeof child === "object") {
                    element = render2(element.ele(key), child).up();
                  } else {
                    if (typeof child === "string" && _this.options.cdata && requiresCDATA(child)) {
                      element = element.ele(key).raw(wrapCDATA(child)).up();
                    } else {
                      if (child == null) {
                        child = "";
                      }
                      element = element.ele(key, child.toString()).up();
                    }
                  }
                }
              }
              return element;
            };
          }(this);
          rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
            headless: this.options.headless,
            allowSurrogateChars: this.options.allowSurrogateChars
          });
          return render2(rootElement, rootObj).end(this.options.renderOpts);
        };
        return Builder;
      }();
    }).call(exports);
  }
});

// node_modules/sax/lib/sax.js
var require_sax = __commonJS({
  "node_modules/sax/lib/sax.js"(exports) {
    init_shims();
    (function(sax) {
      sax.parser = function(strict, opt) {
        return new SAXParser(strict, opt);
      };
      sax.SAXParser = SAXParser;
      sax.SAXStream = SAXStream;
      sax.createStream = createStream;
      sax.MAX_BUFFER_LENGTH = 64 * 1024;
      var buffers = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      sax.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) {
          return new SAXParser(strict, opt);
        }
        var parser2 = this;
        clearBuffers(parser2);
        parser2.q = parser2.c = "";
        parser2.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
        parser2.opt = opt || {};
        parser2.opt.lowercase = parser2.opt.lowercase || parser2.opt.lowercasetags;
        parser2.looseCase = parser2.opt.lowercase ? "toLowerCase" : "toUpperCase";
        parser2.tags = [];
        parser2.closed = parser2.closedRoot = parser2.sawRoot = false;
        parser2.tag = parser2.error = null;
        parser2.strict = !!strict;
        parser2.noscript = !!(strict || parser2.opt.noscript);
        parser2.state = S.BEGIN;
        parser2.strictEntities = parser2.opt.strictEntities;
        parser2.ENTITIES = parser2.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
        parser2.attribList = [];
        if (parser2.opt.xmlns) {
          parser2.ns = Object.create(rootNS);
        }
        parser2.trackPosition = parser2.opt.position !== false;
        if (parser2.trackPosition) {
          parser2.position = parser2.line = parser2.column = 0;
        }
        emit(parser2, "onready");
      }
      if (!Object.create) {
        Object.create = function(o) {
          function F() {
          }
          F.prototype = o;
          var newf = new F();
          return newf;
        };
      }
      if (!Object.keys) {
        Object.keys = function(o) {
          var a = [];
          for (var i in o)
            if (o.hasOwnProperty(i))
              a.push(i);
          return a;
        };
      }
      function checkBufferLength(parser2) {
        var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
        var maxActual = 0;
        for (var i = 0, l = buffers.length; i < l; i++) {
          var len = parser2[buffers[i]].length;
          if (len > maxAllowed) {
            switch (buffers[i]) {
              case "textNode":
                closeText(parser2);
                break;
              case "cdata":
                emitNode(parser2, "oncdata", parser2.cdata);
                parser2.cdata = "";
                break;
              case "script":
                emitNode(parser2, "onscript", parser2.script);
                parser2.script = "";
                break;
              default:
                error3(parser2, "Max buffer length exceeded: " + buffers[i]);
            }
          }
          maxActual = Math.max(maxActual, len);
        }
        var m = sax.MAX_BUFFER_LENGTH - maxActual;
        parser2.bufferCheckPosition = m + parser2.position;
      }
      function clearBuffers(parser2) {
        for (var i = 0, l = buffers.length; i < l; i++) {
          parser2[buffers[i]] = "";
        }
      }
      function flushBuffers(parser2) {
        closeText(parser2);
        if (parser2.cdata !== "") {
          emitNode(parser2, "oncdata", parser2.cdata);
          parser2.cdata = "";
        }
        if (parser2.script !== "") {
          emitNode(parser2, "onscript", parser2.script);
          parser2.script = "";
        }
      }
      SAXParser.prototype = {
        end: function() {
          end(this);
        },
        write,
        resume: function() {
          this.error = null;
          return this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          flushBuffers(this);
        }
      };
      var Stream2;
      try {
        Stream2 = require("stream").Stream;
      } catch (ex) {
        Stream2 = function() {
        };
      }
      var streamWraps = sax.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
      });
      function createStream(strict, opt) {
        return new SAXStream(strict, opt);
      }
      function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) {
          return new SAXStream(strict, opt);
        }
        Stream2.apply(this);
        this._parser = new SAXParser(strict, opt);
        this.writable = true;
        this.readable = true;
        var me = this;
        this._parser.onend = function() {
          me.emit("end");
        };
        this._parser.onerror = function(er) {
          me.emit("error", er);
          me._parser.error = null;
        };
        this._decoder = null;
        streamWraps.forEach(function(ev) {
          Object.defineProperty(me, "on" + ev, {
            get: function() {
              return me._parser["on" + ev];
            },
            set: function(h) {
              if (!h) {
                me.removeAllListeners(ev);
                me._parser["on" + ev] = h;
                return h;
              }
              me.on(ev, h);
            },
            enumerable: true,
            configurable: false
          });
        });
      }
      SAXStream.prototype = Object.create(Stream2.prototype, {
        constructor: {
          value: SAXStream
        }
      });
      SAXStream.prototype.write = function(data) {
        if (typeof Buffer === "function" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) {
          if (!this._decoder) {
            var SD = require("string_decoder").StringDecoder;
            this._decoder = new SD("utf8");
          }
          data = this._decoder.write(data);
        }
        this._parser.write(data.toString());
        this.emit("data", data);
        return true;
      };
      SAXStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) {
          this.write(chunk);
        }
        this._parser.end();
        return true;
      };
      SAXStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
          me._parser["on" + ev] = function() {
            var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
          };
        }
        return Stream2.prototype.on.call(me, ev, handler);
      };
      var CDATA = "[CDATA[";
      var DOCTYPE = "DOCTYPE";
      var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
      var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
      var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
      var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function isWhitespace(c) {
        return c === " " || c === "\n" || c === "\r" || c === "	";
      }
      function isQuote(c) {
        return c === '"' || c === "'";
      }
      function isAttribEnd(c) {
        return c === ">" || isWhitespace(c);
      }
      function isMatch(regex, c) {
        return regex.test(c);
      }
      function notMatch(regex, c) {
        return !isMatch(regex, c);
      }
      var S = 0;
      sax.STATE = {
        BEGIN: S++,
        BEGIN_WHITESPACE: S++,
        TEXT: S++,
        TEXT_ENTITY: S++,
        OPEN_WAKA: S++,
        SGML_DECL: S++,
        SGML_DECL_QUOTED: S++,
        DOCTYPE: S++,
        DOCTYPE_QUOTED: S++,
        DOCTYPE_DTD: S++,
        DOCTYPE_DTD_QUOTED: S++,
        COMMENT_STARTING: S++,
        COMMENT: S++,
        COMMENT_ENDING: S++,
        COMMENT_ENDED: S++,
        CDATA: S++,
        CDATA_ENDING: S++,
        CDATA_ENDING_2: S++,
        PROC_INST: S++,
        PROC_INST_BODY: S++,
        PROC_INST_ENDING: S++,
        OPEN_TAG: S++,
        OPEN_TAG_SLASH: S++,
        ATTRIB: S++,
        ATTRIB_NAME: S++,
        ATTRIB_NAME_SAW_WHITE: S++,
        ATTRIB_VALUE: S++,
        ATTRIB_VALUE_QUOTED: S++,
        ATTRIB_VALUE_CLOSED: S++,
        ATTRIB_VALUE_UNQUOTED: S++,
        ATTRIB_VALUE_ENTITY_Q: S++,
        ATTRIB_VALUE_ENTITY_U: S++,
        CLOSE_TAG: S++,
        CLOSE_TAG_SAW_WHITE: S++,
        SCRIPT: S++,
        SCRIPT_ENDING: S++
      };
      sax.XML_ENTITIES = {
        "amp": "&",
        "gt": ">",
        "lt": "<",
        "quot": '"',
        "apos": "'"
      };
      sax.ENTITIES = {
        "amp": "&",
        "gt": ">",
        "lt": "<",
        "quot": '"',
        "apos": "'",
        "AElig": 198,
        "Aacute": 193,
        "Acirc": 194,
        "Agrave": 192,
        "Aring": 197,
        "Atilde": 195,
        "Auml": 196,
        "Ccedil": 199,
        "ETH": 208,
        "Eacute": 201,
        "Ecirc": 202,
        "Egrave": 200,
        "Euml": 203,
        "Iacute": 205,
        "Icirc": 206,
        "Igrave": 204,
        "Iuml": 207,
        "Ntilde": 209,
        "Oacute": 211,
        "Ocirc": 212,
        "Ograve": 210,
        "Oslash": 216,
        "Otilde": 213,
        "Ouml": 214,
        "THORN": 222,
        "Uacute": 218,
        "Ucirc": 219,
        "Ugrave": 217,
        "Uuml": 220,
        "Yacute": 221,
        "aacute": 225,
        "acirc": 226,
        "aelig": 230,
        "agrave": 224,
        "aring": 229,
        "atilde": 227,
        "auml": 228,
        "ccedil": 231,
        "eacute": 233,
        "ecirc": 234,
        "egrave": 232,
        "eth": 240,
        "euml": 235,
        "iacute": 237,
        "icirc": 238,
        "igrave": 236,
        "iuml": 239,
        "ntilde": 241,
        "oacute": 243,
        "ocirc": 244,
        "ograve": 242,
        "oslash": 248,
        "otilde": 245,
        "ouml": 246,
        "szlig": 223,
        "thorn": 254,
        "uacute": 250,
        "ucirc": 251,
        "ugrave": 249,
        "uuml": 252,
        "yacute": 253,
        "yuml": 255,
        "copy": 169,
        "reg": 174,
        "nbsp": 160,
        "iexcl": 161,
        "cent": 162,
        "pound": 163,
        "curren": 164,
        "yen": 165,
        "brvbar": 166,
        "sect": 167,
        "uml": 168,
        "ordf": 170,
        "laquo": 171,
        "not": 172,
        "shy": 173,
        "macr": 175,
        "deg": 176,
        "plusmn": 177,
        "sup1": 185,
        "sup2": 178,
        "sup3": 179,
        "acute": 180,
        "micro": 181,
        "para": 182,
        "middot": 183,
        "cedil": 184,
        "ordm": 186,
        "raquo": 187,
        "frac14": 188,
        "frac12": 189,
        "frac34": 190,
        "iquest": 191,
        "times": 215,
        "divide": 247,
        "OElig": 338,
        "oelig": 339,
        "Scaron": 352,
        "scaron": 353,
        "Yuml": 376,
        "fnof": 402,
        "circ": 710,
        "tilde": 732,
        "Alpha": 913,
        "Beta": 914,
        "Gamma": 915,
        "Delta": 916,
        "Epsilon": 917,
        "Zeta": 918,
        "Eta": 919,
        "Theta": 920,
        "Iota": 921,
        "Kappa": 922,
        "Lambda": 923,
        "Mu": 924,
        "Nu": 925,
        "Xi": 926,
        "Omicron": 927,
        "Pi": 928,
        "Rho": 929,
        "Sigma": 931,
        "Tau": 932,
        "Upsilon": 933,
        "Phi": 934,
        "Chi": 935,
        "Psi": 936,
        "Omega": 937,
        "alpha": 945,
        "beta": 946,
        "gamma": 947,
        "delta": 948,
        "epsilon": 949,
        "zeta": 950,
        "eta": 951,
        "theta": 952,
        "iota": 953,
        "kappa": 954,
        "lambda": 955,
        "mu": 956,
        "nu": 957,
        "xi": 958,
        "omicron": 959,
        "pi": 960,
        "rho": 961,
        "sigmaf": 962,
        "sigma": 963,
        "tau": 964,
        "upsilon": 965,
        "phi": 966,
        "chi": 967,
        "psi": 968,
        "omega": 969,
        "thetasym": 977,
        "upsih": 978,
        "piv": 982,
        "ensp": 8194,
        "emsp": 8195,
        "thinsp": 8201,
        "zwnj": 8204,
        "zwj": 8205,
        "lrm": 8206,
        "rlm": 8207,
        "ndash": 8211,
        "mdash": 8212,
        "lsquo": 8216,
        "rsquo": 8217,
        "sbquo": 8218,
        "ldquo": 8220,
        "rdquo": 8221,
        "bdquo": 8222,
        "dagger": 8224,
        "Dagger": 8225,
        "bull": 8226,
        "hellip": 8230,
        "permil": 8240,
        "prime": 8242,
        "Prime": 8243,
        "lsaquo": 8249,
        "rsaquo": 8250,
        "oline": 8254,
        "frasl": 8260,
        "euro": 8364,
        "image": 8465,
        "weierp": 8472,
        "real": 8476,
        "trade": 8482,
        "alefsym": 8501,
        "larr": 8592,
        "uarr": 8593,
        "rarr": 8594,
        "darr": 8595,
        "harr": 8596,
        "crarr": 8629,
        "lArr": 8656,
        "uArr": 8657,
        "rArr": 8658,
        "dArr": 8659,
        "hArr": 8660,
        "forall": 8704,
        "part": 8706,
        "exist": 8707,
        "empty": 8709,
        "nabla": 8711,
        "isin": 8712,
        "notin": 8713,
        "ni": 8715,
        "prod": 8719,
        "sum": 8721,
        "minus": 8722,
        "lowast": 8727,
        "radic": 8730,
        "prop": 8733,
        "infin": 8734,
        "ang": 8736,
        "and": 8743,
        "or": 8744,
        "cap": 8745,
        "cup": 8746,
        "int": 8747,
        "there4": 8756,
        "sim": 8764,
        "cong": 8773,
        "asymp": 8776,
        "ne": 8800,
        "equiv": 8801,
        "le": 8804,
        "ge": 8805,
        "sub": 8834,
        "sup": 8835,
        "nsub": 8836,
        "sube": 8838,
        "supe": 8839,
        "oplus": 8853,
        "otimes": 8855,
        "perp": 8869,
        "sdot": 8901,
        "lceil": 8968,
        "rceil": 8969,
        "lfloor": 8970,
        "rfloor": 8971,
        "lang": 9001,
        "rang": 9002,
        "loz": 9674,
        "spades": 9824,
        "clubs": 9827,
        "hearts": 9829,
        "diams": 9830
      };
      Object.keys(sax.ENTITIES).forEach(function(key) {
        var e = sax.ENTITIES[key];
        var s3 = typeof e === "number" ? String.fromCharCode(e) : e;
        sax.ENTITIES[key] = s3;
      });
      for (var s2 in sax.STATE) {
        sax.STATE[sax.STATE[s2]] = s2;
      }
      S = sax.STATE;
      function emit(parser2, event, data) {
        parser2[event] && parser2[event](data);
      }
      function emitNode(parser2, nodeType, data) {
        if (parser2.textNode)
          closeText(parser2);
        emit(parser2, nodeType, data);
      }
      function closeText(parser2) {
        parser2.textNode = textopts(parser2.opt, parser2.textNode);
        if (parser2.textNode)
          emit(parser2, "ontext", parser2.textNode);
        parser2.textNode = "";
      }
      function textopts(opt, text) {
        if (opt.trim)
          text = text.trim();
        if (opt.normalize)
          text = text.replace(/\s+/g, " ");
        return text;
      }
      function error3(parser2, er) {
        closeText(parser2);
        if (parser2.trackPosition) {
          er += "\nLine: " + parser2.line + "\nColumn: " + parser2.column + "\nChar: " + parser2.c;
        }
        er = new Error(er);
        parser2.error = er;
        emit(parser2, "onerror", er);
        return parser2;
      }
      function end(parser2) {
        if (parser2.sawRoot && !parser2.closedRoot)
          strictFail(parser2, "Unclosed root tag");
        if (parser2.state !== S.BEGIN && parser2.state !== S.BEGIN_WHITESPACE && parser2.state !== S.TEXT) {
          error3(parser2, "Unexpected end");
        }
        closeText(parser2);
        parser2.c = "";
        parser2.closed = true;
        emit(parser2, "onend");
        SAXParser.call(parser2, parser2.strict, parser2.opt);
        return parser2;
      }
      function strictFail(parser2, message) {
        if (typeof parser2 !== "object" || !(parser2 instanceof SAXParser)) {
          throw new Error("bad call to strictFail");
        }
        if (parser2.strict) {
          error3(parser2, message);
        }
      }
      function newTag(parser2) {
        if (!parser2.strict)
          parser2.tagName = parser2.tagName[parser2.looseCase]();
        var parent = parser2.tags[parser2.tags.length - 1] || parser2;
        var tag = parser2.tag = { name: parser2.tagName, attributes: {} };
        if (parser2.opt.xmlns) {
          tag.ns = parent.ns;
        }
        parser2.attribList.length = 0;
        emitNode(parser2, "onopentagstart", tag);
      }
      function qname(name, attribute) {
        var i = name.indexOf(":");
        var qualName = i < 0 ? ["", name] : name.split(":");
        var prefix = qualName[0];
        var local = qualName[1];
        if (attribute && name === "xmlns") {
          prefix = "xmlns";
          local = "";
        }
        return { prefix, local };
      }
      function attrib(parser2) {
        if (!parser2.strict) {
          parser2.attribName = parser2.attribName[parser2.looseCase]();
        }
        if (parser2.attribList.indexOf(parser2.attribName) !== -1 || parser2.tag.attributes.hasOwnProperty(parser2.attribName)) {
          parser2.attribName = parser2.attribValue = "";
          return;
        }
        if (parser2.opt.xmlns) {
          var qn = qname(parser2.attribName, true);
          var prefix = qn.prefix;
          var local = qn.local;
          if (prefix === "xmlns") {
            if (local === "xml" && parser2.attribValue !== XML_NAMESPACE) {
              strictFail(parser2, "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser2.attribValue);
            } else if (local === "xmlns" && parser2.attribValue !== XMLNS_NAMESPACE) {
              strictFail(parser2, "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser2.attribValue);
            } else {
              var tag = parser2.tag;
              var parent = parser2.tags[parser2.tags.length - 1] || parser2;
              if (tag.ns === parent.ns) {
                tag.ns = Object.create(parent.ns);
              }
              tag.ns[local] = parser2.attribValue;
            }
          }
          parser2.attribList.push([parser2.attribName, parser2.attribValue]);
        } else {
          parser2.tag.attributes[parser2.attribName] = parser2.attribValue;
          emitNode(parser2, "onattribute", {
            name: parser2.attribName,
            value: parser2.attribValue
          });
        }
        parser2.attribName = parser2.attribValue = "";
      }
      function openTag(parser2, selfClosing) {
        if (parser2.opt.xmlns) {
          var tag = parser2.tag;
          var qn = qname(parser2.tagName);
          tag.prefix = qn.prefix;
          tag.local = qn.local;
          tag.uri = tag.ns[qn.prefix] || "";
          if (tag.prefix && !tag.uri) {
            strictFail(parser2, "Unbound namespace prefix: " + JSON.stringify(parser2.tagName));
            tag.uri = qn.prefix;
          }
          var parent = parser2.tags[parser2.tags.length - 1] || parser2;
          if (tag.ns && parent.ns !== tag.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              emitNode(parser2, "onopennamespace", {
                prefix: p,
                uri: tag.ns[p]
              });
            });
          }
          for (var i = 0, l = parser2.attribList.length; i < l; i++) {
            var nv = parser2.attribList[i];
            var name = nv[0];
            var value = nv[1];
            var qualName = qname(name, true);
            var prefix = qualName.prefix;
            var local = qualName.local;
            var uri = prefix === "" ? "" : tag.ns[prefix] || "";
            var a = {
              name,
              value,
              prefix,
              local,
              uri
            };
            if (prefix && prefix !== "xmlns" && !uri) {
              strictFail(parser2, "Unbound namespace prefix: " + JSON.stringify(prefix));
              a.uri = prefix;
            }
            parser2.tag.attributes[name] = a;
            emitNode(parser2, "onattribute", a);
          }
          parser2.attribList.length = 0;
        }
        parser2.tag.isSelfClosing = !!selfClosing;
        parser2.sawRoot = true;
        parser2.tags.push(parser2.tag);
        emitNode(parser2, "onopentag", parser2.tag);
        if (!selfClosing) {
          if (!parser2.noscript && parser2.tagName.toLowerCase() === "script") {
            parser2.state = S.SCRIPT;
          } else {
            parser2.state = S.TEXT;
          }
          parser2.tag = null;
          parser2.tagName = "";
        }
        parser2.attribName = parser2.attribValue = "";
        parser2.attribList.length = 0;
      }
      function closeTag(parser2) {
        if (!parser2.tagName) {
          strictFail(parser2, "Weird empty close tag.");
          parser2.textNode += "</>";
          parser2.state = S.TEXT;
          return;
        }
        if (parser2.script) {
          if (parser2.tagName !== "script") {
            parser2.script += "</" + parser2.tagName + ">";
            parser2.tagName = "";
            parser2.state = S.SCRIPT;
            return;
          }
          emitNode(parser2, "onscript", parser2.script);
          parser2.script = "";
        }
        var t = parser2.tags.length;
        var tagName = parser2.tagName;
        if (!parser2.strict) {
          tagName = tagName[parser2.looseCase]();
        }
        var closeTo = tagName;
        while (t--) {
          var close = parser2.tags[t];
          if (close.name !== closeTo) {
            strictFail(parser2, "Unexpected close tag");
          } else {
            break;
          }
        }
        if (t < 0) {
          strictFail(parser2, "Unmatched closing tag: " + parser2.tagName);
          parser2.textNode += "</" + parser2.tagName + ">";
          parser2.state = S.TEXT;
          return;
        }
        parser2.tagName = tagName;
        var s3 = parser2.tags.length;
        while (s3-- > t) {
          var tag = parser2.tag = parser2.tags.pop();
          parser2.tagName = parser2.tag.name;
          emitNode(parser2, "onclosetag", parser2.tagName);
          var x = {};
          for (var i in tag.ns) {
            x[i] = tag.ns[i];
          }
          var parent = parser2.tags[parser2.tags.length - 1] || parser2;
          if (parser2.opt.xmlns && tag.ns !== parent.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              var n = tag.ns[p];
              emitNode(parser2, "onclosenamespace", { prefix: p, uri: n });
            });
          }
        }
        if (t === 0)
          parser2.closedRoot = true;
        parser2.tagName = parser2.attribValue = parser2.attribName = "";
        parser2.attribList.length = 0;
        parser2.state = S.TEXT;
      }
      function parseEntity(parser2) {
        var entity = parser2.entity;
        var entityLC = entity.toLowerCase();
        var num;
        var numStr = "";
        if (parser2.ENTITIES[entity]) {
          return parser2.ENTITIES[entity];
        }
        if (parser2.ENTITIES[entityLC]) {
          return parser2.ENTITIES[entityLC];
        }
        entity = entityLC;
        if (entity.charAt(0) === "#") {
          if (entity.charAt(1) === "x") {
            entity = entity.slice(2);
            num = parseInt(entity, 16);
            numStr = num.toString(16);
          } else {
            entity = entity.slice(1);
            num = parseInt(entity, 10);
            numStr = num.toString(10);
          }
        }
        entity = entity.replace(/^0+/, "");
        if (isNaN(num) || numStr.toLowerCase() !== entity) {
          strictFail(parser2, "Invalid character entity");
          return "&" + parser2.entity + ";";
        }
        return String.fromCodePoint(num);
      }
      function beginWhiteSpace(parser2, c) {
        if (c === "<") {
          parser2.state = S.OPEN_WAKA;
          parser2.startTagPosition = parser2.position;
        } else if (!isWhitespace(c)) {
          strictFail(parser2, "Non-whitespace before first tag.");
          parser2.textNode = c;
          parser2.state = S.TEXT;
        }
      }
      function charAt(chunk, i) {
        var result = "";
        if (i < chunk.length) {
          result = chunk.charAt(i);
        }
        return result;
      }
      function write(chunk) {
        var parser2 = this;
        if (this.error) {
          throw this.error;
        }
        if (parser2.closed) {
          return error3(parser2, "Cannot write after close. Assign an onready handler.");
        }
        if (chunk === null) {
          return end(parser2);
        }
        if (typeof chunk === "object") {
          chunk = chunk.toString();
        }
        var i = 0;
        var c = "";
        while (true) {
          c = charAt(chunk, i++);
          parser2.c = c;
          if (!c) {
            break;
          }
          if (parser2.trackPosition) {
            parser2.position++;
            if (c === "\n") {
              parser2.line++;
              parser2.column = 0;
            } else {
              parser2.column++;
            }
          }
          switch (parser2.state) {
            case S.BEGIN:
              parser2.state = S.BEGIN_WHITESPACE;
              if (c === "\uFEFF") {
                continue;
              }
              beginWhiteSpace(parser2, c);
              continue;
            case S.BEGIN_WHITESPACE:
              beginWhiteSpace(parser2, c);
              continue;
            case S.TEXT:
              if (parser2.sawRoot && !parser2.closedRoot) {
                var starti = i - 1;
                while (c && c !== "<" && c !== "&") {
                  c = charAt(chunk, i++);
                  if (c && parser2.trackPosition) {
                    parser2.position++;
                    if (c === "\n") {
                      parser2.line++;
                      parser2.column = 0;
                    } else {
                      parser2.column++;
                    }
                  }
                }
                parser2.textNode += chunk.substring(starti, i - 1);
              }
              if (c === "<" && !(parser2.sawRoot && parser2.closedRoot && !parser2.strict)) {
                parser2.state = S.OPEN_WAKA;
                parser2.startTagPosition = parser2.position;
              } else {
                if (!isWhitespace(c) && (!parser2.sawRoot || parser2.closedRoot)) {
                  strictFail(parser2, "Text data outside of root node.");
                }
                if (c === "&") {
                  parser2.state = S.TEXT_ENTITY;
                } else {
                  parser2.textNode += c;
                }
              }
              continue;
            case S.SCRIPT:
              if (c === "<") {
                parser2.state = S.SCRIPT_ENDING;
              } else {
                parser2.script += c;
              }
              continue;
            case S.SCRIPT_ENDING:
              if (c === "/") {
                parser2.state = S.CLOSE_TAG;
              } else {
                parser2.script += "<" + c;
                parser2.state = S.SCRIPT;
              }
              continue;
            case S.OPEN_WAKA:
              if (c === "!") {
                parser2.state = S.SGML_DECL;
                parser2.sgmlDecl = "";
              } else if (isWhitespace(c)) {
              } else if (isMatch(nameStart, c)) {
                parser2.state = S.OPEN_TAG;
                parser2.tagName = c;
              } else if (c === "/") {
                parser2.state = S.CLOSE_TAG;
                parser2.tagName = "";
              } else if (c === "?") {
                parser2.state = S.PROC_INST;
                parser2.procInstName = parser2.procInstBody = "";
              } else {
                strictFail(parser2, "Unencoded <");
                if (parser2.startTagPosition + 1 < parser2.position) {
                  var pad = parser2.position - parser2.startTagPosition;
                  c = new Array(pad).join(" ") + c;
                }
                parser2.textNode += "<" + c;
                parser2.state = S.TEXT;
              }
              continue;
            case S.SGML_DECL:
              if ((parser2.sgmlDecl + c).toUpperCase() === CDATA) {
                emitNode(parser2, "onopencdata");
                parser2.state = S.CDATA;
                parser2.sgmlDecl = "";
                parser2.cdata = "";
              } else if (parser2.sgmlDecl + c === "--") {
                parser2.state = S.COMMENT;
                parser2.comment = "";
                parser2.sgmlDecl = "";
              } else if ((parser2.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                parser2.state = S.DOCTYPE;
                if (parser2.doctype || parser2.sawRoot) {
                  strictFail(parser2, "Inappropriately located doctype declaration");
                }
                parser2.doctype = "";
                parser2.sgmlDecl = "";
              } else if (c === ">") {
                emitNode(parser2, "onsgmldeclaration", parser2.sgmlDecl);
                parser2.sgmlDecl = "";
                parser2.state = S.TEXT;
              } else if (isQuote(c)) {
                parser2.state = S.SGML_DECL_QUOTED;
                parser2.sgmlDecl += c;
              } else {
                parser2.sgmlDecl += c;
              }
              continue;
            case S.SGML_DECL_QUOTED:
              if (c === parser2.q) {
                parser2.state = S.SGML_DECL;
                parser2.q = "";
              }
              parser2.sgmlDecl += c;
              continue;
            case S.DOCTYPE:
              if (c === ">") {
                parser2.state = S.TEXT;
                emitNode(parser2, "ondoctype", parser2.doctype);
                parser2.doctype = true;
              } else {
                parser2.doctype += c;
                if (c === "[") {
                  parser2.state = S.DOCTYPE_DTD;
                } else if (isQuote(c)) {
                  parser2.state = S.DOCTYPE_QUOTED;
                  parser2.q = c;
                }
              }
              continue;
            case S.DOCTYPE_QUOTED:
              parser2.doctype += c;
              if (c === parser2.q) {
                parser2.q = "";
                parser2.state = S.DOCTYPE;
              }
              continue;
            case S.DOCTYPE_DTD:
              parser2.doctype += c;
              if (c === "]") {
                parser2.state = S.DOCTYPE;
              } else if (isQuote(c)) {
                parser2.state = S.DOCTYPE_DTD_QUOTED;
                parser2.q = c;
              }
              continue;
            case S.DOCTYPE_DTD_QUOTED:
              parser2.doctype += c;
              if (c === parser2.q) {
                parser2.state = S.DOCTYPE_DTD;
                parser2.q = "";
              }
              continue;
            case S.COMMENT:
              if (c === "-") {
                parser2.state = S.COMMENT_ENDING;
              } else {
                parser2.comment += c;
              }
              continue;
            case S.COMMENT_ENDING:
              if (c === "-") {
                parser2.state = S.COMMENT_ENDED;
                parser2.comment = textopts(parser2.opt, parser2.comment);
                if (parser2.comment) {
                  emitNode(parser2, "oncomment", parser2.comment);
                }
                parser2.comment = "";
              } else {
                parser2.comment += "-" + c;
                parser2.state = S.COMMENT;
              }
              continue;
            case S.COMMENT_ENDED:
              if (c !== ">") {
                strictFail(parser2, "Malformed comment");
                parser2.comment += "--" + c;
                parser2.state = S.COMMENT;
              } else {
                parser2.state = S.TEXT;
              }
              continue;
            case S.CDATA:
              if (c === "]") {
                parser2.state = S.CDATA_ENDING;
              } else {
                parser2.cdata += c;
              }
              continue;
            case S.CDATA_ENDING:
              if (c === "]") {
                parser2.state = S.CDATA_ENDING_2;
              } else {
                parser2.cdata += "]" + c;
                parser2.state = S.CDATA;
              }
              continue;
            case S.CDATA_ENDING_2:
              if (c === ">") {
                if (parser2.cdata) {
                  emitNode(parser2, "oncdata", parser2.cdata);
                }
                emitNode(parser2, "onclosecdata");
                parser2.cdata = "";
                parser2.state = S.TEXT;
              } else if (c === "]") {
                parser2.cdata += "]";
              } else {
                parser2.cdata += "]]" + c;
                parser2.state = S.CDATA;
              }
              continue;
            case S.PROC_INST:
              if (c === "?") {
                parser2.state = S.PROC_INST_ENDING;
              } else if (isWhitespace(c)) {
                parser2.state = S.PROC_INST_BODY;
              } else {
                parser2.procInstName += c;
              }
              continue;
            case S.PROC_INST_BODY:
              if (!parser2.procInstBody && isWhitespace(c)) {
                continue;
              } else if (c === "?") {
                parser2.state = S.PROC_INST_ENDING;
              } else {
                parser2.procInstBody += c;
              }
              continue;
            case S.PROC_INST_ENDING:
              if (c === ">") {
                emitNode(parser2, "onprocessinginstruction", {
                  name: parser2.procInstName,
                  body: parser2.procInstBody
                });
                parser2.procInstName = parser2.procInstBody = "";
                parser2.state = S.TEXT;
              } else {
                parser2.procInstBody += "?" + c;
                parser2.state = S.PROC_INST_BODY;
              }
              continue;
            case S.OPEN_TAG:
              if (isMatch(nameBody, c)) {
                parser2.tagName += c;
              } else {
                newTag(parser2);
                if (c === ">") {
                  openTag(parser2);
                } else if (c === "/") {
                  parser2.state = S.OPEN_TAG_SLASH;
                } else {
                  if (!isWhitespace(c)) {
                    strictFail(parser2, "Invalid character in tag name");
                  }
                  parser2.state = S.ATTRIB;
                }
              }
              continue;
            case S.OPEN_TAG_SLASH:
              if (c === ">") {
                openTag(parser2, true);
                closeTag(parser2);
              } else {
                strictFail(parser2, "Forward-slash in opening tag not followed by >");
                parser2.state = S.ATTRIB;
              }
              continue;
            case S.ATTRIB:
              if (isWhitespace(c)) {
                continue;
              } else if (c === ">") {
                openTag(parser2);
              } else if (c === "/") {
                parser2.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                parser2.attribName = c;
                parser2.attribValue = "";
                parser2.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser2, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME:
              if (c === "=") {
                parser2.state = S.ATTRIB_VALUE;
              } else if (c === ">") {
                strictFail(parser2, "Attribute without value");
                parser2.attribValue = parser2.attribName;
                attrib(parser2);
                openTag(parser2);
              } else if (isWhitespace(c)) {
                parser2.state = S.ATTRIB_NAME_SAW_WHITE;
              } else if (isMatch(nameBody, c)) {
                parser2.attribName += c;
              } else {
                strictFail(parser2, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME_SAW_WHITE:
              if (c === "=") {
                parser2.state = S.ATTRIB_VALUE;
              } else if (isWhitespace(c)) {
                continue;
              } else {
                strictFail(parser2, "Attribute without value");
                parser2.tag.attributes[parser2.attribName] = "";
                parser2.attribValue = "";
                emitNode(parser2, "onattribute", {
                  name: parser2.attribName,
                  value: ""
                });
                parser2.attribName = "";
                if (c === ">") {
                  openTag(parser2);
                } else if (isMatch(nameStart, c)) {
                  parser2.attribName = c;
                  parser2.state = S.ATTRIB_NAME;
                } else {
                  strictFail(parser2, "Invalid attribute name");
                  parser2.state = S.ATTRIB;
                }
              }
              continue;
            case S.ATTRIB_VALUE:
              if (isWhitespace(c)) {
                continue;
              } else if (isQuote(c)) {
                parser2.q = c;
                parser2.state = S.ATTRIB_VALUE_QUOTED;
              } else {
                strictFail(parser2, "Unquoted attribute value");
                parser2.state = S.ATTRIB_VALUE_UNQUOTED;
                parser2.attribValue = c;
              }
              continue;
            case S.ATTRIB_VALUE_QUOTED:
              if (c !== parser2.q) {
                if (c === "&") {
                  parser2.state = S.ATTRIB_VALUE_ENTITY_Q;
                } else {
                  parser2.attribValue += c;
                }
                continue;
              }
              attrib(parser2);
              parser2.q = "";
              parser2.state = S.ATTRIB_VALUE_CLOSED;
              continue;
            case S.ATTRIB_VALUE_CLOSED:
              if (isWhitespace(c)) {
                parser2.state = S.ATTRIB;
              } else if (c === ">") {
                openTag(parser2);
              } else if (c === "/") {
                parser2.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                strictFail(parser2, "No whitespace between attributes");
                parser2.attribName = c;
                parser2.attribValue = "";
                parser2.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser2, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_VALUE_UNQUOTED:
              if (!isAttribEnd(c)) {
                if (c === "&") {
                  parser2.state = S.ATTRIB_VALUE_ENTITY_U;
                } else {
                  parser2.attribValue += c;
                }
                continue;
              }
              attrib(parser2);
              if (c === ">") {
                openTag(parser2);
              } else {
                parser2.state = S.ATTRIB;
              }
              continue;
            case S.CLOSE_TAG:
              if (!parser2.tagName) {
                if (isWhitespace(c)) {
                  continue;
                } else if (notMatch(nameStart, c)) {
                  if (parser2.script) {
                    parser2.script += "</" + c;
                    parser2.state = S.SCRIPT;
                  } else {
                    strictFail(parser2, "Invalid tagname in closing tag.");
                  }
                } else {
                  parser2.tagName = c;
                }
              } else if (c === ">") {
                closeTag(parser2);
              } else if (isMatch(nameBody, c)) {
                parser2.tagName += c;
              } else if (parser2.script) {
                parser2.script += "</" + parser2.tagName;
                parser2.tagName = "";
                parser2.state = S.SCRIPT;
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser2, "Invalid tagname in closing tag");
                }
                parser2.state = S.CLOSE_TAG_SAW_WHITE;
              }
              continue;
            case S.CLOSE_TAG_SAW_WHITE:
              if (isWhitespace(c)) {
                continue;
              }
              if (c === ">") {
                closeTag(parser2);
              } else {
                strictFail(parser2, "Invalid characters in closing tag");
              }
              continue;
            case S.TEXT_ENTITY:
            case S.ATTRIB_VALUE_ENTITY_Q:
            case S.ATTRIB_VALUE_ENTITY_U:
              var returnState;
              var buffer;
              switch (parser2.state) {
                case S.TEXT_ENTITY:
                  returnState = S.TEXT;
                  buffer = "textNode";
                  break;
                case S.ATTRIB_VALUE_ENTITY_Q:
                  returnState = S.ATTRIB_VALUE_QUOTED;
                  buffer = "attribValue";
                  break;
                case S.ATTRIB_VALUE_ENTITY_U:
                  returnState = S.ATTRIB_VALUE_UNQUOTED;
                  buffer = "attribValue";
                  break;
              }
              if (c === ";") {
                parser2[buffer] += parseEntity(parser2);
                parser2.entity = "";
                parser2.state = returnState;
              } else if (isMatch(parser2.entity.length ? entityBody : entityStart, c)) {
                parser2.entity += c;
              } else {
                strictFail(parser2, "Invalid character in entity name");
                parser2[buffer] += "&" + parser2.entity + c;
                parser2.entity = "";
                parser2.state = returnState;
              }
              continue;
            default:
              throw new Error(parser2, "Unknown state: " + parser2.state);
          }
        }
        if (parser2.position >= parser2.bufferCheckPosition) {
          checkBufferLength(parser2);
        }
        return parser2;
      }
      if (!String.fromCodePoint) {
        (function() {
          var stringFromCharCode = String.fromCharCode;
          var floor = Math.floor;
          var fromCodePoint = function() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index2 = -1;
            var length = arguments.length;
            if (!length) {
              return "";
            }
            var result = "";
            while (++index2 < length) {
              var codePoint = Number(arguments[index2]);
              if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) !== codePoint) {
                throw RangeError("Invalid code point: " + codePoint);
              }
              if (codePoint <= 65535) {
                codeUnits.push(codePoint);
              } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = codePoint % 1024 + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
              }
              if (index2 + 1 === length || codeUnits.length > MAX_SIZE) {
                result += stringFromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
              }
            }
            return result;
          };
          if (Object.defineProperty) {
            Object.defineProperty(String, "fromCodePoint", {
              value: fromCodePoint,
              configurable: true,
              writable: true
            });
          } else {
            String.fromCodePoint = fromCodePoint;
          }
        })();
      }
    })(typeof exports === "undefined" ? exports.sax = {} : exports);
  }
});

// node_modules/xml2js/lib/bom.js
var require_bom = __commonJS({
  "node_modules/xml2js/lib/bom.js"(exports) {
    init_shims();
    (function() {
      "use strict";
      exports.stripBOM = function(str) {
        if (str[0] === "\uFEFF") {
          return str.substring(1);
        } else {
          return str;
        }
      };
    }).call(exports);
  }
});

// node_modules/xml2js/lib/processors.js
var require_processors = __commonJS({
  "node_modules/xml2js/lib/processors.js"(exports) {
    init_shims();
    (function() {
      "use strict";
      var prefixMatch;
      prefixMatch = new RegExp(/(?!xmlns)^.*:/);
      exports.normalize = function(str) {
        return str.toLowerCase();
      };
      exports.firstCharLowerCase = function(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
      };
      exports.stripPrefix = function(str) {
        return str.replace(prefixMatch, "");
      };
      exports.parseNumbers = function(str) {
        if (!isNaN(str)) {
          str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
        }
        return str;
      };
      exports.parseBooleans = function(str) {
        if (/^(?:true|false)$/i.test(str)) {
          str = str.toLowerCase() === "true";
        }
        return str;
      };
    }).call(exports);
  }
});

// node_modules/xml2js/lib/parser.js
var require_parser = __commonJS({
  "node_modules/xml2js/lib/parser.js"(exports) {
    init_shims();
    (function() {
      "use strict";
      var bom, defaults, events, isEmpty, processItem, processors, sax, setImmediate, bind = function(fn, me) {
        return function() {
          return fn.apply(me, arguments);
        };
      }, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      sax = require_sax();
      events = require("events");
      bom = require_bom();
      processors = require_processors();
      setImmediate = require("timers").setImmediate;
      defaults = require_defaults().defaults;
      isEmpty = function(thing) {
        return typeof thing === "object" && thing != null && Object.keys(thing).length === 0;
      };
      processItem = function(processors2, item, key) {
        var i, len, process2;
        for (i = 0, len = processors2.length; i < len; i++) {
          process2 = processors2[i];
          item = process2(item, key);
        }
        return item;
      };
      exports.Parser = function(superClass) {
        extend(Parser2, superClass);
        function Parser2(opts) {
          this.parseStringPromise = bind(this.parseStringPromise, this);
          this.parseString = bind(this.parseString, this);
          this.reset = bind(this.reset, this);
          this.assignOrPush = bind(this.assignOrPush, this);
          this.processAsync = bind(this.processAsync, this);
          var key, ref, value;
          if (!(this instanceof exports.Parser)) {
            return new exports.Parser(opts);
          }
          this.options = {};
          ref = defaults["0.2"];
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this.options[key] = value;
          }
          for (key in opts) {
            if (!hasProp.call(opts, key))
              continue;
            value = opts[key];
            this.options[key] = value;
          }
          if (this.options.xmlns) {
            this.options.xmlnskey = this.options.attrkey + "ns";
          }
          if (this.options.normalizeTags) {
            if (!this.options.tagNameProcessors) {
              this.options.tagNameProcessors = [];
            }
            this.options.tagNameProcessors.unshift(processors.normalize);
          }
          this.reset();
        }
        Parser2.prototype.processAsync = function() {
          var chunk, err;
          try {
            if (this.remaining.length <= this.options.chunkSize) {
              chunk = this.remaining;
              this.remaining = "";
              this.saxParser = this.saxParser.write(chunk);
              return this.saxParser.close();
            } else {
              chunk = this.remaining.substr(0, this.options.chunkSize);
              this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
              this.saxParser = this.saxParser.write(chunk);
              return setImmediate(this.processAsync);
            }
          } catch (error1) {
            err = error1;
            if (!this.saxParser.errThrown) {
              this.saxParser.errThrown = true;
              return this.emit(err);
            }
          }
        };
        Parser2.prototype.assignOrPush = function(obj, key, newValue) {
          if (!(key in obj)) {
            if (!this.options.explicitArray) {
              return obj[key] = newValue;
            } else {
              return obj[key] = [newValue];
            }
          } else {
            if (!(obj[key] instanceof Array)) {
              obj[key] = [obj[key]];
            }
            return obj[key].push(newValue);
          }
        };
        Parser2.prototype.reset = function() {
          var attrkey, charkey, ontext, stack;
          this.removeAllListeners();
          this.saxParser = sax.parser(this.options.strict, {
            trim: false,
            normalize: false,
            xmlns: this.options.xmlns
          });
          this.saxParser.errThrown = false;
          this.saxParser.onerror = function(_this) {
            return function(error3) {
              _this.saxParser.resume();
              if (!_this.saxParser.errThrown) {
                _this.saxParser.errThrown = true;
                return _this.emit("error", error3);
              }
            };
          }(this);
          this.saxParser.onend = function(_this) {
            return function() {
              if (!_this.saxParser.ended) {
                _this.saxParser.ended = true;
                return _this.emit("end", _this.resultObject);
              }
            };
          }(this);
          this.saxParser.ended = false;
          this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
          this.resultObject = null;
          stack = [];
          attrkey = this.options.attrkey;
          charkey = this.options.charkey;
          this.saxParser.onopentag = function(_this) {
            return function(node) {
              var key, newValue, obj, processedKey, ref;
              obj = {};
              obj[charkey] = "";
              if (!_this.options.ignoreAttrs) {
                ref = node.attributes;
                for (key in ref) {
                  if (!hasProp.call(ref, key))
                    continue;
                  if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                    obj[attrkey] = {};
                  }
                  newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
                  processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key;
                  if (_this.options.mergeAttrs) {
                    _this.assignOrPush(obj, processedKey, newValue);
                  } else {
                    obj[attrkey][processedKey] = newValue;
                  }
                }
              }
              obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name;
              if (_this.options.xmlns) {
                obj[_this.options.xmlnskey] = {
                  uri: node.uri,
                  local: node.local
                };
              }
              return stack.push(obj);
            };
          }(this);
          this.saxParser.onclosetag = function(_this) {
            return function() {
              var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s2, xpath;
              obj = stack.pop();
              nodeName = obj["#name"];
              if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
                delete obj["#name"];
              }
              if (obj.cdata === true) {
                cdata = obj.cdata;
                delete obj.cdata;
              }
              s2 = stack[stack.length - 1];
              if (obj[charkey].match(/^\s*$/) && !cdata) {
                emptyStr = obj[charkey];
                delete obj[charkey];
              } else {
                if (_this.options.trim) {
                  obj[charkey] = obj[charkey].trim();
                }
                if (_this.options.normalize) {
                  obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
                }
                obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey];
                if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                  obj = obj[charkey];
                }
              }
              if (isEmpty(obj)) {
                obj = _this.options.emptyTag !== "" ? _this.options.emptyTag : emptyStr;
              }
              if (_this.options.validator != null) {
                xpath = "/" + function() {
                  var i, len, results;
                  results = [];
                  for (i = 0, len = stack.length; i < len; i++) {
                    node = stack[i];
                    results.push(node["#name"]);
                  }
                  return results;
                }().concat(nodeName).join("/");
                (function() {
                  var err;
                  try {
                    return obj = _this.options.validator(xpath, s2 && s2[nodeName], obj);
                  } catch (error1) {
                    err = error1;
                    return _this.emit("error", err);
                  }
                })();
              }
              if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === "object") {
                if (!_this.options.preserveChildrenOrder) {
                  node = {};
                  if (_this.options.attrkey in obj) {
                    node[_this.options.attrkey] = obj[_this.options.attrkey];
                    delete obj[_this.options.attrkey];
                  }
                  if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                    node[_this.options.charkey] = obj[_this.options.charkey];
                    delete obj[_this.options.charkey];
                  }
                  if (Object.getOwnPropertyNames(obj).length > 0) {
                    node[_this.options.childkey] = obj;
                  }
                  obj = node;
                } else if (s2) {
                  s2[_this.options.childkey] = s2[_this.options.childkey] || [];
                  objClone = {};
                  for (key in obj) {
                    if (!hasProp.call(obj, key))
                      continue;
                    objClone[key] = obj[key];
                  }
                  s2[_this.options.childkey].push(objClone);
                  delete obj["#name"];
                  if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                    obj = obj[charkey];
                  }
                }
              }
              if (stack.length > 0) {
                return _this.assignOrPush(s2, nodeName, obj);
              } else {
                if (_this.options.explicitRoot) {
                  old = obj;
                  obj = {};
                  obj[nodeName] = old;
                }
                _this.resultObject = obj;
                _this.saxParser.ended = true;
                return _this.emit("end", _this.resultObject);
              }
            };
          }(this);
          ontext = function(_this) {
            return function(text) {
              var charChild, s2;
              s2 = stack[stack.length - 1];
              if (s2) {
                s2[charkey] += text;
                if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, "").trim() !== "")) {
                  s2[_this.options.childkey] = s2[_this.options.childkey] || [];
                  charChild = {
                    "#name": "__text__"
                  };
                  charChild[charkey] = text;
                  if (_this.options.normalize) {
                    charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
                  }
                  s2[_this.options.childkey].push(charChild);
                }
                return s2;
              }
            };
          }(this);
          this.saxParser.ontext = ontext;
          return this.saxParser.oncdata = function(_this) {
            return function(text) {
              var s2;
              s2 = ontext(text);
              if (s2) {
                return s2.cdata = true;
              }
            };
          }(this);
        };
        Parser2.prototype.parseString = function(str, cb) {
          var err;
          if (cb != null && typeof cb === "function") {
            this.on("end", function(result) {
              this.reset();
              return cb(null, result);
            });
            this.on("error", function(err2) {
              this.reset();
              return cb(err2);
            });
          }
          try {
            str = str.toString();
            if (str.trim() === "") {
              this.emit("end", null);
              return true;
            }
            str = bom.stripBOM(str);
            if (this.options.async) {
              this.remaining = str;
              setImmediate(this.processAsync);
              return this.saxParser;
            }
            return this.saxParser.write(str).close();
          } catch (error1) {
            err = error1;
            if (!(this.saxParser.errThrown || this.saxParser.ended)) {
              this.emit("error", err);
              return this.saxParser.errThrown = true;
            } else if (this.saxParser.ended) {
              throw err;
            }
          }
        };
        Parser2.prototype.parseStringPromise = function(str) {
          return new Promise(function(_this) {
            return function(resolve2, reject) {
              return _this.parseString(str, function(err, value) {
                if (err) {
                  return reject(err);
                } else {
                  return resolve2(value);
                }
              });
            };
          }(this));
        };
        return Parser2;
      }(events);
      exports.parseString = function(str, a, b) {
        var cb, options2, parser2;
        if (b != null) {
          if (typeof b === "function") {
            cb = b;
          }
          if (typeof a === "object") {
            options2 = a;
          }
        } else {
          if (typeof a === "function") {
            cb = a;
          }
          options2 = {};
        }
        parser2 = new exports.Parser(options2);
        return parser2.parseString(str, cb);
      };
      exports.parseStringPromise = function(str, a) {
        var options2, parser2;
        if (typeof a === "object") {
          options2 = a;
        }
        parser2 = new exports.Parser(options2);
        return parser2.parseStringPromise(str);
      };
    }).call(exports);
  }
});

// node_modules/xml2js/lib/xml2js.js
var require_xml2js = __commonJS({
  "node_modules/xml2js/lib/xml2js.js"(exports) {
    init_shims();
    (function() {
      "use strict";
      var builder, defaults, parser2, processors, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      defaults = require_defaults();
      builder = require_builder();
      parser2 = require_parser();
      processors = require_processors();
      exports.defaults = defaults.defaults;
      exports.processors = processors;
      exports.ValidationError = function(superClass) {
        extend(ValidationError, superClass);
        function ValidationError(message) {
          this.message = message;
        }
        return ValidationError;
      }(Error);
      exports.Builder = builder.Builder;
      exports.Parser = parser2.Parser;
      exports.parseString = parser2.parseString;
      exports.parseStringPromise = parser2.parseStringPromise;
    }).call(exports);
  }
});

// node_modules/rss-parser/lib/fields.js
var require_fields = __commonJS({
  "node_modules/rss-parser/lib/fields.js"(exports, module2) {
    init_shims();
    var fields = module2.exports = {};
    fields.feed = [
      ["author", "creator"],
      ["dc:publisher", "publisher"],
      ["dc:creator", "creator"],
      ["dc:source", "source"],
      ["dc:title", "title"],
      ["dc:type", "type"],
      "title",
      "description",
      "author",
      "pubDate",
      "webMaster",
      "managingEditor",
      "generator",
      "link",
      "language",
      "copyright",
      "lastBuildDate",
      "docs",
      "generator",
      "ttl",
      "rating",
      "skipHours",
      "skipDays"
    ];
    fields.item = [
      ["author", "creator"],
      ["dc:creator", "creator"],
      ["dc:date", "date"],
      ["dc:language", "language"],
      ["dc:rights", "rights"],
      ["dc:source", "source"],
      ["dc:title", "title"],
      "title",
      "link",
      "pubDate",
      "author",
      "summary",
      ["content:encoded", "content:encoded", { includeSnippet: true }],
      "enclosure",
      "dc:creator",
      "dc:date",
      "comments"
    ];
    var mapItunesField = function(f) {
      return ["itunes:" + f, f];
    };
    fields.podcastFeed = [
      "author",
      "subtitle",
      "summary",
      "explicit"
    ].map(mapItunesField);
    fields.podcastItem = [
      "author",
      "subtitle",
      "summary",
      "explicit",
      "duration",
      "image",
      "episode",
      "image",
      "season",
      "keywords"
    ].map(mapItunesField);
  }
});

// node_modules/entities/lib/maps/entities.json
var require_entities = __commonJS({
  "node_modules/entities/lib/maps/entities.json"(exports, module2) {
    module2.exports = { Aacute: "\xC1", aacute: "\xE1", Abreve: "\u0102", abreve: "\u0103", ac: "\u223E", acd: "\u223F", acE: "\u223E\u0333", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", Acy: "\u0410", acy: "\u0430", AElig: "\xC6", aelig: "\xE6", af: "\u2061", Afr: "\u{1D504}", afr: "\u{1D51E}", Agrave: "\xC0", agrave: "\xE0", alefsym: "\u2135", aleph: "\u2135", Alpha: "\u0391", alpha: "\u03B1", Amacr: "\u0100", amacr: "\u0101", amalg: "\u2A3F", amp: "&", AMP: "&", andand: "\u2A55", And: "\u2A53", and: "\u2227", andd: "\u2A5C", andslope: "\u2A58", andv: "\u2A5A", ang: "\u2220", ange: "\u29A4", angle: "\u2220", angmsdaa: "\u29A8", angmsdab: "\u29A9", angmsdac: "\u29AA", angmsdad: "\u29AB", angmsdae: "\u29AC", angmsdaf: "\u29AD", angmsdag: "\u29AE", angmsdah: "\u29AF", angmsd: "\u2221", angrt: "\u221F", angrtvb: "\u22BE", angrtvbd: "\u299D", angsph: "\u2222", angst: "\xC5", angzarr: "\u237C", Aogon: "\u0104", aogon: "\u0105", Aopf: "\u{1D538}", aopf: "\u{1D552}", apacir: "\u2A6F", ap: "\u2248", apE: "\u2A70", ape: "\u224A", apid: "\u224B", apos: "'", ApplyFunction: "\u2061", approx: "\u2248", approxeq: "\u224A", Aring: "\xC5", aring: "\xE5", Ascr: "\u{1D49C}", ascr: "\u{1D4B6}", Assign: "\u2254", ast: "*", asymp: "\u2248", asympeq: "\u224D", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", awconint: "\u2233", awint: "\u2A11", backcong: "\u224C", backepsilon: "\u03F6", backprime: "\u2035", backsim: "\u223D", backsimeq: "\u22CD", Backslash: "\u2216", Barv: "\u2AE7", barvee: "\u22BD", barwed: "\u2305", Barwed: "\u2306", barwedge: "\u2305", bbrk: "\u23B5", bbrktbrk: "\u23B6", bcong: "\u224C", Bcy: "\u0411", bcy: "\u0431", bdquo: "\u201E", becaus: "\u2235", because: "\u2235", Because: "\u2235", bemptyv: "\u29B0", bepsi: "\u03F6", bernou: "\u212C", Bernoullis: "\u212C", Beta: "\u0392", beta: "\u03B2", beth: "\u2136", between: "\u226C", Bfr: "\u{1D505}", bfr: "\u{1D51F}", bigcap: "\u22C2", bigcirc: "\u25EF", bigcup: "\u22C3", bigodot: "\u2A00", bigoplus: "\u2A01", bigotimes: "\u2A02", bigsqcup: "\u2A06", bigstar: "\u2605", bigtriangledown: "\u25BD", bigtriangleup: "\u25B3", biguplus: "\u2A04", bigvee: "\u22C1", bigwedge: "\u22C0", bkarow: "\u290D", blacklozenge: "\u29EB", blacksquare: "\u25AA", blacktriangle: "\u25B4", blacktriangledown: "\u25BE", blacktriangleleft: "\u25C2", blacktriangleright: "\u25B8", blank: "\u2423", blk12: "\u2592", blk14: "\u2591", blk34: "\u2593", block: "\u2588", bne: "=\u20E5", bnequiv: "\u2261\u20E5", bNot: "\u2AED", bnot: "\u2310", Bopf: "\u{1D539}", bopf: "\u{1D553}", bot: "\u22A5", bottom: "\u22A5", bowtie: "\u22C8", boxbox: "\u29C9", boxdl: "\u2510", boxdL: "\u2555", boxDl: "\u2556", boxDL: "\u2557", boxdr: "\u250C", boxdR: "\u2552", boxDr: "\u2553", boxDR: "\u2554", boxh: "\u2500", boxH: "\u2550", boxhd: "\u252C", boxHd: "\u2564", boxhD: "\u2565", boxHD: "\u2566", boxhu: "\u2534", boxHu: "\u2567", boxhU: "\u2568", boxHU: "\u2569", boxminus: "\u229F", boxplus: "\u229E", boxtimes: "\u22A0", boxul: "\u2518", boxuL: "\u255B", boxUl: "\u255C", boxUL: "\u255D", boxur: "\u2514", boxuR: "\u2558", boxUr: "\u2559", boxUR: "\u255A", boxv: "\u2502", boxV: "\u2551", boxvh: "\u253C", boxvH: "\u256A", boxVh: "\u256B", boxVH: "\u256C", boxvl: "\u2524", boxvL: "\u2561", boxVl: "\u2562", boxVL: "\u2563", boxvr: "\u251C", boxvR: "\u255E", boxVr: "\u255F", boxVR: "\u2560", bprime: "\u2035", breve: "\u02D8", Breve: "\u02D8", brvbar: "\xA6", bscr: "\u{1D4B7}", Bscr: "\u212C", bsemi: "\u204F", bsim: "\u223D", bsime: "\u22CD", bsolb: "\u29C5", bsol: "\\", bsolhsub: "\u27C8", bull: "\u2022", bullet: "\u2022", bump: "\u224E", bumpE: "\u2AAE", bumpe: "\u224F", Bumpeq: "\u224E", bumpeq: "\u224F", Cacute: "\u0106", cacute: "\u0107", capand: "\u2A44", capbrcup: "\u2A49", capcap: "\u2A4B", cap: "\u2229", Cap: "\u22D2", capcup: "\u2A47", capdot: "\u2A40", CapitalDifferentialD: "\u2145", caps: "\u2229\uFE00", caret: "\u2041", caron: "\u02C7", Cayleys: "\u212D", ccaps: "\u2A4D", Ccaron: "\u010C", ccaron: "\u010D", Ccedil: "\xC7", ccedil: "\xE7", Ccirc: "\u0108", ccirc: "\u0109", Cconint: "\u2230", ccups: "\u2A4C", ccupssm: "\u2A50", Cdot: "\u010A", cdot: "\u010B", cedil: "\xB8", Cedilla: "\xB8", cemptyv: "\u29B2", cent: "\xA2", centerdot: "\xB7", CenterDot: "\xB7", cfr: "\u{1D520}", Cfr: "\u212D", CHcy: "\u0427", chcy: "\u0447", check: "\u2713", checkmark: "\u2713", Chi: "\u03A7", chi: "\u03C7", circ: "\u02C6", circeq: "\u2257", circlearrowleft: "\u21BA", circlearrowright: "\u21BB", circledast: "\u229B", circledcirc: "\u229A", circleddash: "\u229D", CircleDot: "\u2299", circledR: "\xAE", circledS: "\u24C8", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", cir: "\u25CB", cirE: "\u29C3", cire: "\u2257", cirfnint: "\u2A10", cirmid: "\u2AEF", cirscir: "\u29C2", ClockwiseContourIntegral: "\u2232", CloseCurlyDoubleQuote: "\u201D", CloseCurlyQuote: "\u2019", clubs: "\u2663", clubsuit: "\u2663", colon: ":", Colon: "\u2237", Colone: "\u2A74", colone: "\u2254", coloneq: "\u2254", comma: ",", commat: "@", comp: "\u2201", compfn: "\u2218", complement: "\u2201", complexes: "\u2102", cong: "\u2245", congdot: "\u2A6D", Congruent: "\u2261", conint: "\u222E", Conint: "\u222F", ContourIntegral: "\u222E", copf: "\u{1D554}", Copf: "\u2102", coprod: "\u2210", Coproduct: "\u2210", copy: "\xA9", COPY: "\xA9", copysr: "\u2117", CounterClockwiseContourIntegral: "\u2233", crarr: "\u21B5", cross: "\u2717", Cross: "\u2A2F", Cscr: "\u{1D49E}", cscr: "\u{1D4B8}", csub: "\u2ACF", csube: "\u2AD1", csup: "\u2AD0", csupe: "\u2AD2", ctdot: "\u22EF", cudarrl: "\u2938", cudarrr: "\u2935", cuepr: "\u22DE", cuesc: "\u22DF", cularr: "\u21B6", cularrp: "\u293D", cupbrcap: "\u2A48", cupcap: "\u2A46", CupCap: "\u224D", cup: "\u222A", Cup: "\u22D3", cupcup: "\u2A4A", cupdot: "\u228D", cupor: "\u2A45", cups: "\u222A\uFE00", curarr: "\u21B7", curarrm: "\u293C", curlyeqprec: "\u22DE", curlyeqsucc: "\u22DF", curlyvee: "\u22CE", curlywedge: "\u22CF", curren: "\xA4", curvearrowleft: "\u21B6", curvearrowright: "\u21B7", cuvee: "\u22CE", cuwed: "\u22CF", cwconint: "\u2232", cwint: "\u2231", cylcty: "\u232D", dagger: "\u2020", Dagger: "\u2021", daleth: "\u2138", darr: "\u2193", Darr: "\u21A1", dArr: "\u21D3", dash: "\u2010", Dashv: "\u2AE4", dashv: "\u22A3", dbkarow: "\u290F", dblac: "\u02DD", Dcaron: "\u010E", dcaron: "\u010F", Dcy: "\u0414", dcy: "\u0434", ddagger: "\u2021", ddarr: "\u21CA", DD: "\u2145", dd: "\u2146", DDotrahd: "\u2911", ddotseq: "\u2A77", deg: "\xB0", Del: "\u2207", Delta: "\u0394", delta: "\u03B4", demptyv: "\u29B1", dfisht: "\u297F", Dfr: "\u{1D507}", dfr: "\u{1D521}", dHar: "\u2965", dharl: "\u21C3", dharr: "\u21C2", DiacriticalAcute: "\xB4", DiacriticalDot: "\u02D9", DiacriticalDoubleAcute: "\u02DD", DiacriticalGrave: "`", DiacriticalTilde: "\u02DC", diam: "\u22C4", diamond: "\u22C4", Diamond: "\u22C4", diamondsuit: "\u2666", diams: "\u2666", die: "\xA8", DifferentialD: "\u2146", digamma: "\u03DD", disin: "\u22F2", div: "\xF7", divide: "\xF7", divideontimes: "\u22C7", divonx: "\u22C7", DJcy: "\u0402", djcy: "\u0452", dlcorn: "\u231E", dlcrop: "\u230D", dollar: "$", Dopf: "\u{1D53B}", dopf: "\u{1D555}", Dot: "\xA8", dot: "\u02D9", DotDot: "\u20DC", doteq: "\u2250", doteqdot: "\u2251", DotEqual: "\u2250", dotminus: "\u2238", dotplus: "\u2214", dotsquare: "\u22A1", doublebarwedge: "\u2306", DoubleContourIntegral: "\u222F", DoubleDot: "\xA8", DoubleDownArrow: "\u21D3", DoubleLeftArrow: "\u21D0", DoubleLeftRightArrow: "\u21D4", DoubleLeftTee: "\u2AE4", DoubleLongLeftArrow: "\u27F8", DoubleLongLeftRightArrow: "\u27FA", DoubleLongRightArrow: "\u27F9", DoubleRightArrow: "\u21D2", DoubleRightTee: "\u22A8", DoubleUpArrow: "\u21D1", DoubleUpDownArrow: "\u21D5", DoubleVerticalBar: "\u2225", DownArrowBar: "\u2913", downarrow: "\u2193", DownArrow: "\u2193", Downarrow: "\u21D3", DownArrowUpArrow: "\u21F5", DownBreve: "\u0311", downdownarrows: "\u21CA", downharpoonleft: "\u21C3", downharpoonright: "\u21C2", DownLeftRightVector: "\u2950", DownLeftTeeVector: "\u295E", DownLeftVectorBar: "\u2956", DownLeftVector: "\u21BD", DownRightTeeVector: "\u295F", DownRightVectorBar: "\u2957", DownRightVector: "\u21C1", DownTeeArrow: "\u21A7", DownTee: "\u22A4", drbkarow: "\u2910", drcorn: "\u231F", drcrop: "\u230C", Dscr: "\u{1D49F}", dscr: "\u{1D4B9}", DScy: "\u0405", dscy: "\u0455", dsol: "\u29F6", Dstrok: "\u0110", dstrok: "\u0111", dtdot: "\u22F1", dtri: "\u25BF", dtrif: "\u25BE", duarr: "\u21F5", duhar: "\u296F", dwangle: "\u29A6", DZcy: "\u040F", dzcy: "\u045F", dzigrarr: "\u27FF", Eacute: "\xC9", eacute: "\xE9", easter: "\u2A6E", Ecaron: "\u011A", ecaron: "\u011B", Ecirc: "\xCA", ecirc: "\xEA", ecir: "\u2256", ecolon: "\u2255", Ecy: "\u042D", ecy: "\u044D", eDDot: "\u2A77", Edot: "\u0116", edot: "\u0117", eDot: "\u2251", ee: "\u2147", efDot: "\u2252", Efr: "\u{1D508}", efr: "\u{1D522}", eg: "\u2A9A", Egrave: "\xC8", egrave: "\xE8", egs: "\u2A96", egsdot: "\u2A98", el: "\u2A99", Element: "\u2208", elinters: "\u23E7", ell: "\u2113", els: "\u2A95", elsdot: "\u2A97", Emacr: "\u0112", emacr: "\u0113", empty: "\u2205", emptyset: "\u2205", EmptySmallSquare: "\u25FB", emptyv: "\u2205", EmptyVerySmallSquare: "\u25AB", emsp13: "\u2004", emsp14: "\u2005", emsp: "\u2003", ENG: "\u014A", eng: "\u014B", ensp: "\u2002", Eogon: "\u0118", eogon: "\u0119", Eopf: "\u{1D53C}", eopf: "\u{1D556}", epar: "\u22D5", eparsl: "\u29E3", eplus: "\u2A71", epsi: "\u03B5", Epsilon: "\u0395", epsilon: "\u03B5", epsiv: "\u03F5", eqcirc: "\u2256", eqcolon: "\u2255", eqsim: "\u2242", eqslantgtr: "\u2A96", eqslantless: "\u2A95", Equal: "\u2A75", equals: "=", EqualTilde: "\u2242", equest: "\u225F", Equilibrium: "\u21CC", equiv: "\u2261", equivDD: "\u2A78", eqvparsl: "\u29E5", erarr: "\u2971", erDot: "\u2253", escr: "\u212F", Escr: "\u2130", esdot: "\u2250", Esim: "\u2A73", esim: "\u2242", Eta: "\u0397", eta: "\u03B7", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", euro: "\u20AC", excl: "!", exist: "\u2203", Exists: "\u2203", expectation: "\u2130", exponentiale: "\u2147", ExponentialE: "\u2147", fallingdotseq: "\u2252", Fcy: "\u0424", fcy: "\u0444", female: "\u2640", ffilig: "\uFB03", fflig: "\uFB00", ffllig: "\uFB04", Ffr: "\u{1D509}", ffr: "\u{1D523}", filig: "\uFB01", FilledSmallSquare: "\u25FC", FilledVerySmallSquare: "\u25AA", fjlig: "fj", flat: "\u266D", fllig: "\uFB02", fltns: "\u25B1", fnof: "\u0192", Fopf: "\u{1D53D}", fopf: "\u{1D557}", forall: "\u2200", ForAll: "\u2200", fork: "\u22D4", forkv: "\u2AD9", Fouriertrf: "\u2131", fpartint: "\u2A0D", frac12: "\xBD", frac13: "\u2153", frac14: "\xBC", frac15: "\u2155", frac16: "\u2159", frac18: "\u215B", frac23: "\u2154", frac25: "\u2156", frac34: "\xBE", frac35: "\u2157", frac38: "\u215C", frac45: "\u2158", frac56: "\u215A", frac58: "\u215D", frac78: "\u215E", frasl: "\u2044", frown: "\u2322", fscr: "\u{1D4BB}", Fscr: "\u2131", gacute: "\u01F5", Gamma: "\u0393", gamma: "\u03B3", Gammad: "\u03DC", gammad: "\u03DD", gap: "\u2A86", Gbreve: "\u011E", gbreve: "\u011F", Gcedil: "\u0122", Gcirc: "\u011C", gcirc: "\u011D", Gcy: "\u0413", gcy: "\u0433", Gdot: "\u0120", gdot: "\u0121", ge: "\u2265", gE: "\u2267", gEl: "\u2A8C", gel: "\u22DB", geq: "\u2265", geqq: "\u2267", geqslant: "\u2A7E", gescc: "\u2AA9", ges: "\u2A7E", gesdot: "\u2A80", gesdoto: "\u2A82", gesdotol: "\u2A84", gesl: "\u22DB\uFE00", gesles: "\u2A94", Gfr: "\u{1D50A}", gfr: "\u{1D524}", gg: "\u226B", Gg: "\u22D9", ggg: "\u22D9", gimel: "\u2137", GJcy: "\u0403", gjcy: "\u0453", gla: "\u2AA5", gl: "\u2277", glE: "\u2A92", glj: "\u2AA4", gnap: "\u2A8A", gnapprox: "\u2A8A", gne: "\u2A88", gnE: "\u2269", gneq: "\u2A88", gneqq: "\u2269", gnsim: "\u22E7", Gopf: "\u{1D53E}", gopf: "\u{1D558}", grave: "`", GreaterEqual: "\u2265", GreaterEqualLess: "\u22DB", GreaterFullEqual: "\u2267", GreaterGreater: "\u2AA2", GreaterLess: "\u2277", GreaterSlantEqual: "\u2A7E", GreaterTilde: "\u2273", Gscr: "\u{1D4A2}", gscr: "\u210A", gsim: "\u2273", gsime: "\u2A8E", gsiml: "\u2A90", gtcc: "\u2AA7", gtcir: "\u2A7A", gt: ">", GT: ">", Gt: "\u226B", gtdot: "\u22D7", gtlPar: "\u2995", gtquest: "\u2A7C", gtrapprox: "\u2A86", gtrarr: "\u2978", gtrdot: "\u22D7", gtreqless: "\u22DB", gtreqqless: "\u2A8C", gtrless: "\u2277", gtrsim: "\u2273", gvertneqq: "\u2269\uFE00", gvnE: "\u2269\uFE00", Hacek: "\u02C7", hairsp: "\u200A", half: "\xBD", hamilt: "\u210B", HARDcy: "\u042A", hardcy: "\u044A", harrcir: "\u2948", harr: "\u2194", hArr: "\u21D4", harrw: "\u21AD", Hat: "^", hbar: "\u210F", Hcirc: "\u0124", hcirc: "\u0125", hearts: "\u2665", heartsuit: "\u2665", hellip: "\u2026", hercon: "\u22B9", hfr: "\u{1D525}", Hfr: "\u210C", HilbertSpace: "\u210B", hksearow: "\u2925", hkswarow: "\u2926", hoarr: "\u21FF", homtht: "\u223B", hookleftarrow: "\u21A9", hookrightarrow: "\u21AA", hopf: "\u{1D559}", Hopf: "\u210D", horbar: "\u2015", HorizontalLine: "\u2500", hscr: "\u{1D4BD}", Hscr: "\u210B", hslash: "\u210F", Hstrok: "\u0126", hstrok: "\u0127", HumpDownHump: "\u224E", HumpEqual: "\u224F", hybull: "\u2043", hyphen: "\u2010", Iacute: "\xCD", iacute: "\xED", ic: "\u2063", Icirc: "\xCE", icirc: "\xEE", Icy: "\u0418", icy: "\u0438", Idot: "\u0130", IEcy: "\u0415", iecy: "\u0435", iexcl: "\xA1", iff: "\u21D4", ifr: "\u{1D526}", Ifr: "\u2111", Igrave: "\xCC", igrave: "\xEC", ii: "\u2148", iiiint: "\u2A0C", iiint: "\u222D", iinfin: "\u29DC", iiota: "\u2129", IJlig: "\u0132", ijlig: "\u0133", Imacr: "\u012A", imacr: "\u012B", image: "\u2111", ImaginaryI: "\u2148", imagline: "\u2110", imagpart: "\u2111", imath: "\u0131", Im: "\u2111", imof: "\u22B7", imped: "\u01B5", Implies: "\u21D2", incare: "\u2105", in: "\u2208", infin: "\u221E", infintie: "\u29DD", inodot: "\u0131", intcal: "\u22BA", int: "\u222B", Int: "\u222C", integers: "\u2124", Integral: "\u222B", intercal: "\u22BA", Intersection: "\u22C2", intlarhk: "\u2A17", intprod: "\u2A3C", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", IOcy: "\u0401", iocy: "\u0451", Iogon: "\u012E", iogon: "\u012F", Iopf: "\u{1D540}", iopf: "\u{1D55A}", Iota: "\u0399", iota: "\u03B9", iprod: "\u2A3C", iquest: "\xBF", iscr: "\u{1D4BE}", Iscr: "\u2110", isin: "\u2208", isindot: "\u22F5", isinE: "\u22F9", isins: "\u22F4", isinsv: "\u22F3", isinv: "\u2208", it: "\u2062", Itilde: "\u0128", itilde: "\u0129", Iukcy: "\u0406", iukcy: "\u0456", Iuml: "\xCF", iuml: "\xEF", Jcirc: "\u0134", jcirc: "\u0135", Jcy: "\u0419", jcy: "\u0439", Jfr: "\u{1D50D}", jfr: "\u{1D527}", jmath: "\u0237", Jopf: "\u{1D541}", jopf: "\u{1D55B}", Jscr: "\u{1D4A5}", jscr: "\u{1D4BF}", Jsercy: "\u0408", jsercy: "\u0458", Jukcy: "\u0404", jukcy: "\u0454", Kappa: "\u039A", kappa: "\u03BA", kappav: "\u03F0", Kcedil: "\u0136", kcedil: "\u0137", Kcy: "\u041A", kcy: "\u043A", Kfr: "\u{1D50E}", kfr: "\u{1D528}", kgreen: "\u0138", KHcy: "\u0425", khcy: "\u0445", KJcy: "\u040C", kjcy: "\u045C", Kopf: "\u{1D542}", kopf: "\u{1D55C}", Kscr: "\u{1D4A6}", kscr: "\u{1D4C0}", lAarr: "\u21DA", Lacute: "\u0139", lacute: "\u013A", laemptyv: "\u29B4", lagran: "\u2112", Lambda: "\u039B", lambda: "\u03BB", lang: "\u27E8", Lang: "\u27EA", langd: "\u2991", langle: "\u27E8", lap: "\u2A85", Laplacetrf: "\u2112", laquo: "\xAB", larrb: "\u21E4", larrbfs: "\u291F", larr: "\u2190", Larr: "\u219E", lArr: "\u21D0", larrfs: "\u291D", larrhk: "\u21A9", larrlp: "\u21AB", larrpl: "\u2939", larrsim: "\u2973", larrtl: "\u21A2", latail: "\u2919", lAtail: "\u291B", lat: "\u2AAB", late: "\u2AAD", lates: "\u2AAD\uFE00", lbarr: "\u290C", lBarr: "\u290E", lbbrk: "\u2772", lbrace: "{", lbrack: "[", lbrke: "\u298B", lbrksld: "\u298F", lbrkslu: "\u298D", Lcaron: "\u013D", lcaron: "\u013E", Lcedil: "\u013B", lcedil: "\u013C", lceil: "\u2308", lcub: "{", Lcy: "\u041B", lcy: "\u043B", ldca: "\u2936", ldquo: "\u201C", ldquor: "\u201E", ldrdhar: "\u2967", ldrushar: "\u294B", ldsh: "\u21B2", le: "\u2264", lE: "\u2266", LeftAngleBracket: "\u27E8", LeftArrowBar: "\u21E4", leftarrow: "\u2190", LeftArrow: "\u2190", Leftarrow: "\u21D0", LeftArrowRightArrow: "\u21C6", leftarrowtail: "\u21A2", LeftCeiling: "\u2308", LeftDoubleBracket: "\u27E6", LeftDownTeeVector: "\u2961", LeftDownVectorBar: "\u2959", LeftDownVector: "\u21C3", LeftFloor: "\u230A", leftharpoondown: "\u21BD", leftharpoonup: "\u21BC", leftleftarrows: "\u21C7", leftrightarrow: "\u2194", LeftRightArrow: "\u2194", Leftrightarrow: "\u21D4", leftrightarrows: "\u21C6", leftrightharpoons: "\u21CB", leftrightsquigarrow: "\u21AD", LeftRightVector: "\u294E", LeftTeeArrow: "\u21A4", LeftTee: "\u22A3", LeftTeeVector: "\u295A", leftthreetimes: "\u22CB", LeftTriangleBar: "\u29CF", LeftTriangle: "\u22B2", LeftTriangleEqual: "\u22B4", LeftUpDownVector: "\u2951", LeftUpTeeVector: "\u2960", LeftUpVectorBar: "\u2958", LeftUpVector: "\u21BF", LeftVectorBar: "\u2952", LeftVector: "\u21BC", lEg: "\u2A8B", leg: "\u22DA", leq: "\u2264", leqq: "\u2266", leqslant: "\u2A7D", lescc: "\u2AA8", les: "\u2A7D", lesdot: "\u2A7F", lesdoto: "\u2A81", lesdotor: "\u2A83", lesg: "\u22DA\uFE00", lesges: "\u2A93", lessapprox: "\u2A85", lessdot: "\u22D6", lesseqgtr: "\u22DA", lesseqqgtr: "\u2A8B", LessEqualGreater: "\u22DA", LessFullEqual: "\u2266", LessGreater: "\u2276", lessgtr: "\u2276", LessLess: "\u2AA1", lesssim: "\u2272", LessSlantEqual: "\u2A7D", LessTilde: "\u2272", lfisht: "\u297C", lfloor: "\u230A", Lfr: "\u{1D50F}", lfr: "\u{1D529}", lg: "\u2276", lgE: "\u2A91", lHar: "\u2962", lhard: "\u21BD", lharu: "\u21BC", lharul: "\u296A", lhblk: "\u2584", LJcy: "\u0409", ljcy: "\u0459", llarr: "\u21C7", ll: "\u226A", Ll: "\u22D8", llcorner: "\u231E", Lleftarrow: "\u21DA", llhard: "\u296B", lltri: "\u25FA", Lmidot: "\u013F", lmidot: "\u0140", lmoustache: "\u23B0", lmoust: "\u23B0", lnap: "\u2A89", lnapprox: "\u2A89", lne: "\u2A87", lnE: "\u2268", lneq: "\u2A87", lneqq: "\u2268", lnsim: "\u22E6", loang: "\u27EC", loarr: "\u21FD", lobrk: "\u27E6", longleftarrow: "\u27F5", LongLeftArrow: "\u27F5", Longleftarrow: "\u27F8", longleftrightarrow: "\u27F7", LongLeftRightArrow: "\u27F7", Longleftrightarrow: "\u27FA", longmapsto: "\u27FC", longrightarrow: "\u27F6", LongRightArrow: "\u27F6", Longrightarrow: "\u27F9", looparrowleft: "\u21AB", looparrowright: "\u21AC", lopar: "\u2985", Lopf: "\u{1D543}", lopf: "\u{1D55D}", loplus: "\u2A2D", lotimes: "\u2A34", lowast: "\u2217", lowbar: "_", LowerLeftArrow: "\u2199", LowerRightArrow: "\u2198", loz: "\u25CA", lozenge: "\u25CA", lozf: "\u29EB", lpar: "(", lparlt: "\u2993", lrarr: "\u21C6", lrcorner: "\u231F", lrhar: "\u21CB", lrhard: "\u296D", lrm: "\u200E", lrtri: "\u22BF", lsaquo: "\u2039", lscr: "\u{1D4C1}", Lscr: "\u2112", lsh: "\u21B0", Lsh: "\u21B0", lsim: "\u2272", lsime: "\u2A8D", lsimg: "\u2A8F", lsqb: "[", lsquo: "\u2018", lsquor: "\u201A", Lstrok: "\u0141", lstrok: "\u0142", ltcc: "\u2AA6", ltcir: "\u2A79", lt: "<", LT: "<", Lt: "\u226A", ltdot: "\u22D6", lthree: "\u22CB", ltimes: "\u22C9", ltlarr: "\u2976", ltquest: "\u2A7B", ltri: "\u25C3", ltrie: "\u22B4", ltrif: "\u25C2", ltrPar: "\u2996", lurdshar: "\u294A", luruhar: "\u2966", lvertneqq: "\u2268\uFE00", lvnE: "\u2268\uFE00", macr: "\xAF", male: "\u2642", malt: "\u2720", maltese: "\u2720", Map: "\u2905", map: "\u21A6", mapsto: "\u21A6", mapstodown: "\u21A7", mapstoleft: "\u21A4", mapstoup: "\u21A5", marker: "\u25AE", mcomma: "\u2A29", Mcy: "\u041C", mcy: "\u043C", mdash: "\u2014", mDDot: "\u223A", measuredangle: "\u2221", MediumSpace: "\u205F", Mellintrf: "\u2133", Mfr: "\u{1D510}", mfr: "\u{1D52A}", mho: "\u2127", micro: "\xB5", midast: "*", midcir: "\u2AF0", mid: "\u2223", middot: "\xB7", minusb: "\u229F", minus: "\u2212", minusd: "\u2238", minusdu: "\u2A2A", MinusPlus: "\u2213", mlcp: "\u2ADB", mldr: "\u2026", mnplus: "\u2213", models: "\u22A7", Mopf: "\u{1D544}", mopf: "\u{1D55E}", mp: "\u2213", mscr: "\u{1D4C2}", Mscr: "\u2133", mstpos: "\u223E", Mu: "\u039C", mu: "\u03BC", multimap: "\u22B8", mumap: "\u22B8", nabla: "\u2207", Nacute: "\u0143", nacute: "\u0144", nang: "\u2220\u20D2", nap: "\u2249", napE: "\u2A70\u0338", napid: "\u224B\u0338", napos: "\u0149", napprox: "\u2249", natural: "\u266E", naturals: "\u2115", natur: "\u266E", nbsp: "\xA0", nbump: "\u224E\u0338", nbumpe: "\u224F\u0338", ncap: "\u2A43", Ncaron: "\u0147", ncaron: "\u0148", Ncedil: "\u0145", ncedil: "\u0146", ncong: "\u2247", ncongdot: "\u2A6D\u0338", ncup: "\u2A42", Ncy: "\u041D", ncy: "\u043D", ndash: "\u2013", nearhk: "\u2924", nearr: "\u2197", neArr: "\u21D7", nearrow: "\u2197", ne: "\u2260", nedot: "\u2250\u0338", NegativeMediumSpace: "\u200B", NegativeThickSpace: "\u200B", NegativeThinSpace: "\u200B", NegativeVeryThinSpace: "\u200B", nequiv: "\u2262", nesear: "\u2928", nesim: "\u2242\u0338", NestedGreaterGreater: "\u226B", NestedLessLess: "\u226A", NewLine: "\n", nexist: "\u2204", nexists: "\u2204", Nfr: "\u{1D511}", nfr: "\u{1D52B}", ngE: "\u2267\u0338", nge: "\u2271", ngeq: "\u2271", ngeqq: "\u2267\u0338", ngeqslant: "\u2A7E\u0338", nges: "\u2A7E\u0338", nGg: "\u22D9\u0338", ngsim: "\u2275", nGt: "\u226B\u20D2", ngt: "\u226F", ngtr: "\u226F", nGtv: "\u226B\u0338", nharr: "\u21AE", nhArr: "\u21CE", nhpar: "\u2AF2", ni: "\u220B", nis: "\u22FC", nisd: "\u22FA", niv: "\u220B", NJcy: "\u040A", njcy: "\u045A", nlarr: "\u219A", nlArr: "\u21CD", nldr: "\u2025", nlE: "\u2266\u0338", nle: "\u2270", nleftarrow: "\u219A", nLeftarrow: "\u21CD", nleftrightarrow: "\u21AE", nLeftrightarrow: "\u21CE", nleq: "\u2270", nleqq: "\u2266\u0338", nleqslant: "\u2A7D\u0338", nles: "\u2A7D\u0338", nless: "\u226E", nLl: "\u22D8\u0338", nlsim: "\u2274", nLt: "\u226A\u20D2", nlt: "\u226E", nltri: "\u22EA", nltrie: "\u22EC", nLtv: "\u226A\u0338", nmid: "\u2224", NoBreak: "\u2060", NonBreakingSpace: "\xA0", nopf: "\u{1D55F}", Nopf: "\u2115", Not: "\u2AEC", not: "\xAC", NotCongruent: "\u2262", NotCupCap: "\u226D", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotEqualTilde: "\u2242\u0338", NotExists: "\u2204", NotGreater: "\u226F", NotGreaterEqual: "\u2271", NotGreaterFullEqual: "\u2267\u0338", NotGreaterGreater: "\u226B\u0338", NotGreaterLess: "\u2279", NotGreaterSlantEqual: "\u2A7E\u0338", NotGreaterTilde: "\u2275", NotHumpDownHump: "\u224E\u0338", NotHumpEqual: "\u224F\u0338", notin: "\u2209", notindot: "\u22F5\u0338", notinE: "\u22F9\u0338", notinva: "\u2209", notinvb: "\u22F7", notinvc: "\u22F6", NotLeftTriangleBar: "\u29CF\u0338", NotLeftTriangle: "\u22EA", NotLeftTriangleEqual: "\u22EC", NotLess: "\u226E", NotLessEqual: "\u2270", NotLessGreater: "\u2278", NotLessLess: "\u226A\u0338", NotLessSlantEqual: "\u2A7D\u0338", NotLessTilde: "\u2274", NotNestedGreaterGreater: "\u2AA2\u0338", NotNestedLessLess: "\u2AA1\u0338", notni: "\u220C", notniva: "\u220C", notnivb: "\u22FE", notnivc: "\u22FD", NotPrecedes: "\u2280", NotPrecedesEqual: "\u2AAF\u0338", NotPrecedesSlantEqual: "\u22E0", NotReverseElement: "\u220C", NotRightTriangleBar: "\u29D0\u0338", NotRightTriangle: "\u22EB", NotRightTriangleEqual: "\u22ED", NotSquareSubset: "\u228F\u0338", NotSquareSubsetEqual: "\u22E2", NotSquareSuperset: "\u2290\u0338", NotSquareSupersetEqual: "\u22E3", NotSubset: "\u2282\u20D2", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsEqual: "\u2AB0\u0338", NotSucceedsSlantEqual: "\u22E1", NotSucceedsTilde: "\u227F\u0338", NotSuperset: "\u2283\u20D2", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotTildeEqual: "\u2244", NotTildeFullEqual: "\u2247", NotTildeTilde: "\u2249", NotVerticalBar: "\u2224", nparallel: "\u2226", npar: "\u2226", nparsl: "\u2AFD\u20E5", npart: "\u2202\u0338", npolint: "\u2A14", npr: "\u2280", nprcue: "\u22E0", nprec: "\u2280", npreceq: "\u2AAF\u0338", npre: "\u2AAF\u0338", nrarrc: "\u2933\u0338", nrarr: "\u219B", nrArr: "\u21CF", nrarrw: "\u219D\u0338", nrightarrow: "\u219B", nRightarrow: "\u21CF", nrtri: "\u22EB", nrtrie: "\u22ED", nsc: "\u2281", nsccue: "\u22E1", nsce: "\u2AB0\u0338", Nscr: "\u{1D4A9}", nscr: "\u{1D4C3}", nshortmid: "\u2224", nshortparallel: "\u2226", nsim: "\u2241", nsime: "\u2244", nsimeq: "\u2244", nsmid: "\u2224", nspar: "\u2226", nsqsube: "\u22E2", nsqsupe: "\u22E3", nsub: "\u2284", nsubE: "\u2AC5\u0338", nsube: "\u2288", nsubset: "\u2282\u20D2", nsubseteq: "\u2288", nsubseteqq: "\u2AC5\u0338", nsucc: "\u2281", nsucceq: "\u2AB0\u0338", nsup: "\u2285", nsupE: "\u2AC6\u0338", nsupe: "\u2289", nsupset: "\u2283\u20D2", nsupseteq: "\u2289", nsupseteqq: "\u2AC6\u0338", ntgl: "\u2279", Ntilde: "\xD1", ntilde: "\xF1", ntlg: "\u2278", ntriangleleft: "\u22EA", ntrianglelefteq: "\u22EC", ntriangleright: "\u22EB", ntrianglerighteq: "\u22ED", Nu: "\u039D", nu: "\u03BD", num: "#", numero: "\u2116", numsp: "\u2007", nvap: "\u224D\u20D2", nvdash: "\u22AC", nvDash: "\u22AD", nVdash: "\u22AE", nVDash: "\u22AF", nvge: "\u2265\u20D2", nvgt: ">\u20D2", nvHarr: "\u2904", nvinfin: "\u29DE", nvlArr: "\u2902", nvle: "\u2264\u20D2", nvlt: "<\u20D2", nvltrie: "\u22B4\u20D2", nvrArr: "\u2903", nvrtrie: "\u22B5\u20D2", nvsim: "\u223C\u20D2", nwarhk: "\u2923", nwarr: "\u2196", nwArr: "\u21D6", nwarrow: "\u2196", nwnear: "\u2927", Oacute: "\xD3", oacute: "\xF3", oast: "\u229B", Ocirc: "\xD4", ocirc: "\xF4", ocir: "\u229A", Ocy: "\u041E", ocy: "\u043E", odash: "\u229D", Odblac: "\u0150", odblac: "\u0151", odiv: "\u2A38", odot: "\u2299", odsold: "\u29BC", OElig: "\u0152", oelig: "\u0153", ofcir: "\u29BF", Ofr: "\u{1D512}", ofr: "\u{1D52C}", ogon: "\u02DB", Ograve: "\xD2", ograve: "\xF2", ogt: "\u29C1", ohbar: "\u29B5", ohm: "\u03A9", oint: "\u222E", olarr: "\u21BA", olcir: "\u29BE", olcross: "\u29BB", oline: "\u203E", olt: "\u29C0", Omacr: "\u014C", omacr: "\u014D", Omega: "\u03A9", omega: "\u03C9", Omicron: "\u039F", omicron: "\u03BF", omid: "\u29B6", ominus: "\u2296", Oopf: "\u{1D546}", oopf: "\u{1D560}", opar: "\u29B7", OpenCurlyDoubleQuote: "\u201C", OpenCurlyQuote: "\u2018", operp: "\u29B9", oplus: "\u2295", orarr: "\u21BB", Or: "\u2A54", or: "\u2228", ord: "\u2A5D", order: "\u2134", orderof: "\u2134", ordf: "\xAA", ordm: "\xBA", origof: "\u22B6", oror: "\u2A56", orslope: "\u2A57", orv: "\u2A5B", oS: "\u24C8", Oscr: "\u{1D4AA}", oscr: "\u2134", Oslash: "\xD8", oslash: "\xF8", osol: "\u2298", Otilde: "\xD5", otilde: "\xF5", otimesas: "\u2A36", Otimes: "\u2A37", otimes: "\u2297", Ouml: "\xD6", ouml: "\xF6", ovbar: "\u233D", OverBar: "\u203E", OverBrace: "\u23DE", OverBracket: "\u23B4", OverParenthesis: "\u23DC", para: "\xB6", parallel: "\u2225", par: "\u2225", parsim: "\u2AF3", parsl: "\u2AFD", part: "\u2202", PartialD: "\u2202", Pcy: "\u041F", pcy: "\u043F", percnt: "%", period: ".", permil: "\u2030", perp: "\u22A5", pertenk: "\u2031", Pfr: "\u{1D513}", pfr: "\u{1D52D}", Phi: "\u03A6", phi: "\u03C6", phiv: "\u03D5", phmmat: "\u2133", phone: "\u260E", Pi: "\u03A0", pi: "\u03C0", pitchfork: "\u22D4", piv: "\u03D6", planck: "\u210F", planckh: "\u210E", plankv: "\u210F", plusacir: "\u2A23", plusb: "\u229E", pluscir: "\u2A22", plus: "+", plusdo: "\u2214", plusdu: "\u2A25", pluse: "\u2A72", PlusMinus: "\xB1", plusmn: "\xB1", plussim: "\u2A26", plustwo: "\u2A27", pm: "\xB1", Poincareplane: "\u210C", pointint: "\u2A15", popf: "\u{1D561}", Popf: "\u2119", pound: "\xA3", prap: "\u2AB7", Pr: "\u2ABB", pr: "\u227A", prcue: "\u227C", precapprox: "\u2AB7", prec: "\u227A", preccurlyeq: "\u227C", Precedes: "\u227A", PrecedesEqual: "\u2AAF", PrecedesSlantEqual: "\u227C", PrecedesTilde: "\u227E", preceq: "\u2AAF", precnapprox: "\u2AB9", precneqq: "\u2AB5", precnsim: "\u22E8", pre: "\u2AAF", prE: "\u2AB3", precsim: "\u227E", prime: "\u2032", Prime: "\u2033", primes: "\u2119", prnap: "\u2AB9", prnE: "\u2AB5", prnsim: "\u22E8", prod: "\u220F", Product: "\u220F", profalar: "\u232E", profline: "\u2312", profsurf: "\u2313", prop: "\u221D", Proportional: "\u221D", Proportion: "\u2237", propto: "\u221D", prsim: "\u227E", prurel: "\u22B0", Pscr: "\u{1D4AB}", pscr: "\u{1D4C5}", Psi: "\u03A8", psi: "\u03C8", puncsp: "\u2008", Qfr: "\u{1D514}", qfr: "\u{1D52E}", qint: "\u2A0C", qopf: "\u{1D562}", Qopf: "\u211A", qprime: "\u2057", Qscr: "\u{1D4AC}", qscr: "\u{1D4C6}", quaternions: "\u210D", quatint: "\u2A16", quest: "?", questeq: "\u225F", quot: '"', QUOT: '"', rAarr: "\u21DB", race: "\u223D\u0331", Racute: "\u0154", racute: "\u0155", radic: "\u221A", raemptyv: "\u29B3", rang: "\u27E9", Rang: "\u27EB", rangd: "\u2992", range: "\u29A5", rangle: "\u27E9", raquo: "\xBB", rarrap: "\u2975", rarrb: "\u21E5", rarrbfs: "\u2920", rarrc: "\u2933", rarr: "\u2192", Rarr: "\u21A0", rArr: "\u21D2", rarrfs: "\u291E", rarrhk: "\u21AA", rarrlp: "\u21AC", rarrpl: "\u2945", rarrsim: "\u2974", Rarrtl: "\u2916", rarrtl: "\u21A3", rarrw: "\u219D", ratail: "\u291A", rAtail: "\u291C", ratio: "\u2236", rationals: "\u211A", rbarr: "\u290D", rBarr: "\u290F", RBarr: "\u2910", rbbrk: "\u2773", rbrace: "}", rbrack: "]", rbrke: "\u298C", rbrksld: "\u298E", rbrkslu: "\u2990", Rcaron: "\u0158", rcaron: "\u0159", Rcedil: "\u0156", rcedil: "\u0157", rceil: "\u2309", rcub: "}", Rcy: "\u0420", rcy: "\u0440", rdca: "\u2937", rdldhar: "\u2969", rdquo: "\u201D", rdquor: "\u201D", rdsh: "\u21B3", real: "\u211C", realine: "\u211B", realpart: "\u211C", reals: "\u211D", Re: "\u211C", rect: "\u25AD", reg: "\xAE", REG: "\xAE", ReverseElement: "\u220B", ReverseEquilibrium: "\u21CB", ReverseUpEquilibrium: "\u296F", rfisht: "\u297D", rfloor: "\u230B", rfr: "\u{1D52F}", Rfr: "\u211C", rHar: "\u2964", rhard: "\u21C1", rharu: "\u21C0", rharul: "\u296C", Rho: "\u03A1", rho: "\u03C1", rhov: "\u03F1", RightAngleBracket: "\u27E9", RightArrowBar: "\u21E5", rightarrow: "\u2192", RightArrow: "\u2192", Rightarrow: "\u21D2", RightArrowLeftArrow: "\u21C4", rightarrowtail: "\u21A3", RightCeiling: "\u2309", RightDoubleBracket: "\u27E7", RightDownTeeVector: "\u295D", RightDownVectorBar: "\u2955", RightDownVector: "\u21C2", RightFloor: "\u230B", rightharpoondown: "\u21C1", rightharpoonup: "\u21C0", rightleftarrows: "\u21C4", rightleftharpoons: "\u21CC", rightrightarrows: "\u21C9", rightsquigarrow: "\u219D", RightTeeArrow: "\u21A6", RightTee: "\u22A2", RightTeeVector: "\u295B", rightthreetimes: "\u22CC", RightTriangleBar: "\u29D0", RightTriangle: "\u22B3", RightTriangleEqual: "\u22B5", RightUpDownVector: "\u294F", RightUpTeeVector: "\u295C", RightUpVectorBar: "\u2954", RightUpVector: "\u21BE", RightVectorBar: "\u2953", RightVector: "\u21C0", ring: "\u02DA", risingdotseq: "\u2253", rlarr: "\u21C4", rlhar: "\u21CC", rlm: "\u200F", rmoustache: "\u23B1", rmoust: "\u23B1", rnmid: "\u2AEE", roang: "\u27ED", roarr: "\u21FE", robrk: "\u27E7", ropar: "\u2986", ropf: "\u{1D563}", Ropf: "\u211D", roplus: "\u2A2E", rotimes: "\u2A35", RoundImplies: "\u2970", rpar: ")", rpargt: "\u2994", rppolint: "\u2A12", rrarr: "\u21C9", Rrightarrow: "\u21DB", rsaquo: "\u203A", rscr: "\u{1D4C7}", Rscr: "\u211B", rsh: "\u21B1", Rsh: "\u21B1", rsqb: "]", rsquo: "\u2019", rsquor: "\u2019", rthree: "\u22CC", rtimes: "\u22CA", rtri: "\u25B9", rtrie: "\u22B5", rtrif: "\u25B8", rtriltri: "\u29CE", RuleDelayed: "\u29F4", ruluhar: "\u2968", rx: "\u211E", Sacute: "\u015A", sacute: "\u015B", sbquo: "\u201A", scap: "\u2AB8", Scaron: "\u0160", scaron: "\u0161", Sc: "\u2ABC", sc: "\u227B", sccue: "\u227D", sce: "\u2AB0", scE: "\u2AB4", Scedil: "\u015E", scedil: "\u015F", Scirc: "\u015C", scirc: "\u015D", scnap: "\u2ABA", scnE: "\u2AB6", scnsim: "\u22E9", scpolint: "\u2A13", scsim: "\u227F", Scy: "\u0421", scy: "\u0441", sdotb: "\u22A1", sdot: "\u22C5", sdote: "\u2A66", searhk: "\u2925", searr: "\u2198", seArr: "\u21D8", searrow: "\u2198", sect: "\xA7", semi: ";", seswar: "\u2929", setminus: "\u2216", setmn: "\u2216", sext: "\u2736", Sfr: "\u{1D516}", sfr: "\u{1D530}", sfrown: "\u2322", sharp: "\u266F", SHCHcy: "\u0429", shchcy: "\u0449", SHcy: "\u0428", shcy: "\u0448", ShortDownArrow: "\u2193", ShortLeftArrow: "\u2190", shortmid: "\u2223", shortparallel: "\u2225", ShortRightArrow: "\u2192", ShortUpArrow: "\u2191", shy: "\xAD", Sigma: "\u03A3", sigma: "\u03C3", sigmaf: "\u03C2", sigmav: "\u03C2", sim: "\u223C", simdot: "\u2A6A", sime: "\u2243", simeq: "\u2243", simg: "\u2A9E", simgE: "\u2AA0", siml: "\u2A9D", simlE: "\u2A9F", simne: "\u2246", simplus: "\u2A24", simrarr: "\u2972", slarr: "\u2190", SmallCircle: "\u2218", smallsetminus: "\u2216", smashp: "\u2A33", smeparsl: "\u29E4", smid: "\u2223", smile: "\u2323", smt: "\u2AAA", smte: "\u2AAC", smtes: "\u2AAC\uFE00", SOFTcy: "\u042C", softcy: "\u044C", solbar: "\u233F", solb: "\u29C4", sol: "/", Sopf: "\u{1D54A}", sopf: "\u{1D564}", spades: "\u2660", spadesuit: "\u2660", spar: "\u2225", sqcap: "\u2293", sqcaps: "\u2293\uFE00", sqcup: "\u2294", sqcups: "\u2294\uFE00", Sqrt: "\u221A", sqsub: "\u228F", sqsube: "\u2291", sqsubset: "\u228F", sqsubseteq: "\u2291", sqsup: "\u2290", sqsupe: "\u2292", sqsupset: "\u2290", sqsupseteq: "\u2292", square: "\u25A1", Square: "\u25A1", SquareIntersection: "\u2293", SquareSubset: "\u228F", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", squarf: "\u25AA", squ: "\u25A1", squf: "\u25AA", srarr: "\u2192", Sscr: "\u{1D4AE}", sscr: "\u{1D4C8}", ssetmn: "\u2216", ssmile: "\u2323", sstarf: "\u22C6", Star: "\u22C6", star: "\u2606", starf: "\u2605", straightepsilon: "\u03F5", straightphi: "\u03D5", strns: "\xAF", sub: "\u2282", Sub: "\u22D0", subdot: "\u2ABD", subE: "\u2AC5", sube: "\u2286", subedot: "\u2AC3", submult: "\u2AC1", subnE: "\u2ACB", subne: "\u228A", subplus: "\u2ABF", subrarr: "\u2979", subset: "\u2282", Subset: "\u22D0", subseteq: "\u2286", subseteqq: "\u2AC5", SubsetEqual: "\u2286", subsetneq: "\u228A", subsetneqq: "\u2ACB", subsim: "\u2AC7", subsub: "\u2AD5", subsup: "\u2AD3", succapprox: "\u2AB8", succ: "\u227B", succcurlyeq: "\u227D", Succeeds: "\u227B", SucceedsEqual: "\u2AB0", SucceedsSlantEqual: "\u227D", SucceedsTilde: "\u227F", succeq: "\u2AB0", succnapprox: "\u2ABA", succneqq: "\u2AB6", succnsim: "\u22E9", succsim: "\u227F", SuchThat: "\u220B", sum: "\u2211", Sum: "\u2211", sung: "\u266A", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", sup: "\u2283", Sup: "\u22D1", supdot: "\u2ABE", supdsub: "\u2AD8", supE: "\u2AC6", supe: "\u2287", supedot: "\u2AC4", Superset: "\u2283", SupersetEqual: "\u2287", suphsol: "\u27C9", suphsub: "\u2AD7", suplarr: "\u297B", supmult: "\u2AC2", supnE: "\u2ACC", supne: "\u228B", supplus: "\u2AC0", supset: "\u2283", Supset: "\u22D1", supseteq: "\u2287", supseteqq: "\u2AC6", supsetneq: "\u228B", supsetneqq: "\u2ACC", supsim: "\u2AC8", supsub: "\u2AD4", supsup: "\u2AD6", swarhk: "\u2926", swarr: "\u2199", swArr: "\u21D9", swarrow: "\u2199", swnwar: "\u292A", szlig: "\xDF", Tab: "	", target: "\u2316", Tau: "\u03A4", tau: "\u03C4", tbrk: "\u23B4", Tcaron: "\u0164", tcaron: "\u0165", Tcedil: "\u0162", tcedil: "\u0163", Tcy: "\u0422", tcy: "\u0442", tdot: "\u20DB", telrec: "\u2315", Tfr: "\u{1D517}", tfr: "\u{1D531}", there4: "\u2234", therefore: "\u2234", Therefore: "\u2234", Theta: "\u0398", theta: "\u03B8", thetasym: "\u03D1", thetav: "\u03D1", thickapprox: "\u2248", thicksim: "\u223C", ThickSpace: "\u205F\u200A", ThinSpace: "\u2009", thinsp: "\u2009", thkap: "\u2248", thksim: "\u223C", THORN: "\xDE", thorn: "\xFE", tilde: "\u02DC", Tilde: "\u223C", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", timesbar: "\u2A31", timesb: "\u22A0", times: "\xD7", timesd: "\u2A30", tint: "\u222D", toea: "\u2928", topbot: "\u2336", topcir: "\u2AF1", top: "\u22A4", Topf: "\u{1D54B}", topf: "\u{1D565}", topfork: "\u2ADA", tosa: "\u2929", tprime: "\u2034", trade: "\u2122", TRADE: "\u2122", triangle: "\u25B5", triangledown: "\u25BF", triangleleft: "\u25C3", trianglelefteq: "\u22B4", triangleq: "\u225C", triangleright: "\u25B9", trianglerighteq: "\u22B5", tridot: "\u25EC", trie: "\u225C", triminus: "\u2A3A", TripleDot: "\u20DB", triplus: "\u2A39", trisb: "\u29CD", tritime: "\u2A3B", trpezium: "\u23E2", Tscr: "\u{1D4AF}", tscr: "\u{1D4C9}", TScy: "\u0426", tscy: "\u0446", TSHcy: "\u040B", tshcy: "\u045B", Tstrok: "\u0166", tstrok: "\u0167", twixt: "\u226C", twoheadleftarrow: "\u219E", twoheadrightarrow: "\u21A0", Uacute: "\xDA", uacute: "\xFA", uarr: "\u2191", Uarr: "\u219F", uArr: "\u21D1", Uarrocir: "\u2949", Ubrcy: "\u040E", ubrcy: "\u045E", Ubreve: "\u016C", ubreve: "\u016D", Ucirc: "\xDB", ucirc: "\xFB", Ucy: "\u0423", ucy: "\u0443", udarr: "\u21C5", Udblac: "\u0170", udblac: "\u0171", udhar: "\u296E", ufisht: "\u297E", Ufr: "\u{1D518}", ufr: "\u{1D532}", Ugrave: "\xD9", ugrave: "\xF9", uHar: "\u2963", uharl: "\u21BF", uharr: "\u21BE", uhblk: "\u2580", ulcorn: "\u231C", ulcorner: "\u231C", ulcrop: "\u230F", ultri: "\u25F8", Umacr: "\u016A", umacr: "\u016B", uml: "\xA8", UnderBar: "_", UnderBrace: "\u23DF", UnderBracket: "\u23B5", UnderParenthesis: "\u23DD", Union: "\u22C3", UnionPlus: "\u228E", Uogon: "\u0172", uogon: "\u0173", Uopf: "\u{1D54C}", uopf: "\u{1D566}", UpArrowBar: "\u2912", uparrow: "\u2191", UpArrow: "\u2191", Uparrow: "\u21D1", UpArrowDownArrow: "\u21C5", updownarrow: "\u2195", UpDownArrow: "\u2195", Updownarrow: "\u21D5", UpEquilibrium: "\u296E", upharpoonleft: "\u21BF", upharpoonright: "\u21BE", uplus: "\u228E", UpperLeftArrow: "\u2196", UpperRightArrow: "\u2197", upsi: "\u03C5", Upsi: "\u03D2", upsih: "\u03D2", Upsilon: "\u03A5", upsilon: "\u03C5", UpTeeArrow: "\u21A5", UpTee: "\u22A5", upuparrows: "\u21C8", urcorn: "\u231D", urcorner: "\u231D", urcrop: "\u230E", Uring: "\u016E", uring: "\u016F", urtri: "\u25F9", Uscr: "\u{1D4B0}", uscr: "\u{1D4CA}", utdot: "\u22F0", Utilde: "\u0168", utilde: "\u0169", utri: "\u25B5", utrif: "\u25B4", uuarr: "\u21C8", Uuml: "\xDC", uuml: "\xFC", uwangle: "\u29A7", vangrt: "\u299C", varepsilon: "\u03F5", varkappa: "\u03F0", varnothing: "\u2205", varphi: "\u03D5", varpi: "\u03D6", varpropto: "\u221D", varr: "\u2195", vArr: "\u21D5", varrho: "\u03F1", varsigma: "\u03C2", varsubsetneq: "\u228A\uFE00", varsubsetneqq: "\u2ACB\uFE00", varsupsetneq: "\u228B\uFE00", varsupsetneqq: "\u2ACC\uFE00", vartheta: "\u03D1", vartriangleleft: "\u22B2", vartriangleright: "\u22B3", vBar: "\u2AE8", Vbar: "\u2AEB", vBarv: "\u2AE9", Vcy: "\u0412", vcy: "\u0432", vdash: "\u22A2", vDash: "\u22A8", Vdash: "\u22A9", VDash: "\u22AB", Vdashl: "\u2AE6", veebar: "\u22BB", vee: "\u2228", Vee: "\u22C1", veeeq: "\u225A", vellip: "\u22EE", verbar: "|", Verbar: "\u2016", vert: "|", Vert: "\u2016", VerticalBar: "\u2223", VerticalLine: "|", VerticalSeparator: "\u2758", VerticalTilde: "\u2240", VeryThinSpace: "\u200A", Vfr: "\u{1D519}", vfr: "\u{1D533}", vltri: "\u22B2", vnsub: "\u2282\u20D2", vnsup: "\u2283\u20D2", Vopf: "\u{1D54D}", vopf: "\u{1D567}", vprop: "\u221D", vrtri: "\u22B3", Vscr: "\u{1D4B1}", vscr: "\u{1D4CB}", vsubnE: "\u2ACB\uFE00", vsubne: "\u228A\uFE00", vsupnE: "\u2ACC\uFE00", vsupne: "\u228B\uFE00", Vvdash: "\u22AA", vzigzag: "\u299A", Wcirc: "\u0174", wcirc: "\u0175", wedbar: "\u2A5F", wedge: "\u2227", Wedge: "\u22C0", wedgeq: "\u2259", weierp: "\u2118", Wfr: "\u{1D51A}", wfr: "\u{1D534}", Wopf: "\u{1D54E}", wopf: "\u{1D568}", wp: "\u2118", wr: "\u2240", wreath: "\u2240", Wscr: "\u{1D4B2}", wscr: "\u{1D4CC}", xcap: "\u22C2", xcirc: "\u25EF", xcup: "\u22C3", xdtri: "\u25BD", Xfr: "\u{1D51B}", xfr: "\u{1D535}", xharr: "\u27F7", xhArr: "\u27FA", Xi: "\u039E", xi: "\u03BE", xlarr: "\u27F5", xlArr: "\u27F8", xmap: "\u27FC", xnis: "\u22FB", xodot: "\u2A00", Xopf: "\u{1D54F}", xopf: "\u{1D569}", xoplus: "\u2A01", xotime: "\u2A02", xrarr: "\u27F6", xrArr: "\u27F9", Xscr: "\u{1D4B3}", xscr: "\u{1D4CD}", xsqcup: "\u2A06", xuplus: "\u2A04", xutri: "\u25B3", xvee: "\u22C1", xwedge: "\u22C0", Yacute: "\xDD", yacute: "\xFD", YAcy: "\u042F", yacy: "\u044F", Ycirc: "\u0176", ycirc: "\u0177", Ycy: "\u042B", ycy: "\u044B", yen: "\xA5", Yfr: "\u{1D51C}", yfr: "\u{1D536}", YIcy: "\u0407", yicy: "\u0457", Yopf: "\u{1D550}", yopf: "\u{1D56A}", Yscr: "\u{1D4B4}", yscr: "\u{1D4CE}", YUcy: "\u042E", yucy: "\u044E", yuml: "\xFF", Yuml: "\u0178", Zacute: "\u0179", zacute: "\u017A", Zcaron: "\u017D", zcaron: "\u017E", Zcy: "\u0417", zcy: "\u0437", Zdot: "\u017B", zdot: "\u017C", zeetrf: "\u2128", ZeroWidthSpace: "\u200B", Zeta: "\u0396", zeta: "\u03B6", zfr: "\u{1D537}", Zfr: "\u2128", ZHcy: "\u0416", zhcy: "\u0436", zigrarr: "\u21DD", zopf: "\u{1D56B}", Zopf: "\u2124", Zscr: "\u{1D4B5}", zscr: "\u{1D4CF}", zwj: "\u200D", zwnj: "\u200C" };
  }
});

// node_modules/entities/lib/maps/legacy.json
var require_legacy = __commonJS({
  "node_modules/entities/lib/maps/legacy.json"(exports, module2) {
    module2.exports = { Aacute: "\xC1", aacute: "\xE1", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", AElig: "\xC6", aelig: "\xE6", Agrave: "\xC0", agrave: "\xE0", amp: "&", AMP: "&", Aring: "\xC5", aring: "\xE5", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", brvbar: "\xA6", Ccedil: "\xC7", ccedil: "\xE7", cedil: "\xB8", cent: "\xA2", copy: "\xA9", COPY: "\xA9", curren: "\xA4", deg: "\xB0", divide: "\xF7", Eacute: "\xC9", eacute: "\xE9", Ecirc: "\xCA", ecirc: "\xEA", Egrave: "\xC8", egrave: "\xE8", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", frac12: "\xBD", frac14: "\xBC", frac34: "\xBE", gt: ">", GT: ">", Iacute: "\xCD", iacute: "\xED", Icirc: "\xCE", icirc: "\xEE", iexcl: "\xA1", Igrave: "\xCC", igrave: "\xEC", iquest: "\xBF", Iuml: "\xCF", iuml: "\xEF", laquo: "\xAB", lt: "<", LT: "<", macr: "\xAF", micro: "\xB5", middot: "\xB7", nbsp: "\xA0", not: "\xAC", Ntilde: "\xD1", ntilde: "\xF1", Oacute: "\xD3", oacute: "\xF3", Ocirc: "\xD4", ocirc: "\xF4", Ograve: "\xD2", ograve: "\xF2", ordf: "\xAA", ordm: "\xBA", Oslash: "\xD8", oslash: "\xF8", Otilde: "\xD5", otilde: "\xF5", Ouml: "\xD6", ouml: "\xF6", para: "\xB6", plusmn: "\xB1", pound: "\xA3", quot: '"', QUOT: '"', raquo: "\xBB", reg: "\xAE", REG: "\xAE", sect: "\xA7", shy: "\xAD", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", szlig: "\xDF", THORN: "\xDE", thorn: "\xFE", times: "\xD7", Uacute: "\xDA", uacute: "\xFA", Ucirc: "\xDB", ucirc: "\xFB", Ugrave: "\xD9", ugrave: "\xF9", uml: "\xA8", Uuml: "\xDC", uuml: "\xFC", Yacute: "\xDD", yacute: "\xFD", yen: "\xA5", yuml: "\xFF" };
  }
});

// node_modules/entities/lib/maps/xml.json
var require_xml = __commonJS({
  "node_modules/entities/lib/maps/xml.json"(exports, module2) {
    module2.exports = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };
  }
});

// node_modules/entities/lib/maps/decode.json
var require_decode = __commonJS({
  "node_modules/entities/lib/maps/decode.json"(exports, module2) {
    module2.exports = { "0": 65533, "128": 8364, "130": 8218, "131": 402, "132": 8222, "133": 8230, "134": 8224, "135": 8225, "136": 710, "137": 8240, "138": 352, "139": 8249, "140": 338, "142": 381, "145": 8216, "146": 8217, "147": 8220, "148": 8221, "149": 8226, "150": 8211, "151": 8212, "152": 732, "153": 8482, "154": 353, "155": 8250, "156": 339, "158": 382, "159": 376 };
  }
});

// node_modules/entities/lib/decode_codepoint.js
var require_decode_codepoint = __commonJS({
  "node_modules/entities/lib/decode_codepoint.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var decode_json_1 = __importDefault(require_decode());
    var fromCodePoint = String.fromCodePoint || function(codePoint) {
      var output = "";
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += String.fromCharCode(codePoint);
      return output;
    };
    function decodeCodePoint(codePoint) {
      if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
        return "\uFFFD";
      }
      if (codePoint in decode_json_1.default) {
        codePoint = decode_json_1.default[codePoint];
      }
      return fromCodePoint(codePoint);
    }
    exports.default = decodeCodePoint;
  }
});

// node_modules/entities/lib/decode.js
var require_decode2 = __commonJS({
  "node_modules/entities/lib/decode.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
    var entities_json_1 = __importDefault(require_entities());
    var legacy_json_1 = __importDefault(require_legacy());
    var xml_json_1 = __importDefault(require_xml());
    var decode_codepoint_1 = __importDefault(require_decode_codepoint());
    var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
    exports.decodeXML = getStrictDecoder(xml_json_1.default);
    exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
    function getStrictDecoder(map) {
      var replace = getReplacer(map);
      return function(str) {
        return String(str).replace(strictEntityRe, replace);
      };
    }
    var sorter = function(a, b) {
      return a < b ? 1 : -1;
    };
    exports.decodeHTML = function() {
      var legacy = Object.keys(legacy_json_1.default).sort(sorter);
      var keys = Object.keys(entities_json_1.default).sort(sorter);
      for (var i = 0, j = 0; i < keys.length; i++) {
        if (legacy[j] === keys[i]) {
          keys[i] += ";?";
          j++;
        } else {
          keys[i] += ";";
        }
      }
      var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
      var replace = getReplacer(entities_json_1.default);
      function replacer(str) {
        if (str.substr(-1) !== ";")
          str += ";";
        return replace(str);
      }
      return function(str) {
        return String(str).replace(re, replacer);
      };
    }();
    function getReplacer(map) {
      return function replace(str) {
        if (str.charAt(1) === "#") {
          var secondChar = str.charAt(2);
          if (secondChar === "X" || secondChar === "x") {
            return decode_codepoint_1.default(parseInt(str.substr(3), 16));
          }
          return decode_codepoint_1.default(parseInt(str.substr(2), 10));
        }
        return map[str.slice(1, -1)] || str;
      };
    }
  }
});

// node_modules/entities/lib/encode.js
var require_encode = __commonJS({
  "node_modules/entities/lib/encode.js"(exports) {
    init_shims();
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = void 0;
    var xml_json_1 = __importDefault(require_xml());
    var inverseXML = getInverseObj(xml_json_1.default);
    var xmlReplacer = getInverseReplacer(inverseXML);
    exports.encodeXML = getASCIIEncoder(inverseXML);
    var entities_json_1 = __importDefault(require_entities());
    var inverseHTML = getInverseObj(entities_json_1.default);
    var htmlReplacer = getInverseReplacer(inverseHTML);
    exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
    exports.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
    function getInverseObj(obj) {
      return Object.keys(obj).sort().reduce(function(inverse, name) {
        inverse[obj[name]] = "&" + name + ";";
        return inverse;
      }, {});
    }
    function getInverseReplacer(inverse) {
      var single = [];
      var multiple = [];
      for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
        var k = _a[_i];
        if (k.length === 1) {
          single.push("\\" + k);
        } else {
          multiple.push(k);
        }
      }
      single.sort();
      for (var start = 0; start < single.length - 1; start++) {
        var end = start;
        while (end < single.length - 1 && single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
          end += 1;
        }
        var count = 1 + end - start;
        if (count < 3)
          continue;
        single.splice(start, count, single[start] + "-" + single[end]);
      }
      multiple.unshift("[" + single.join("") + "]");
      return new RegExp(multiple.join("|"), "g");
    }
    var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
    var getCodePoint = String.prototype.codePointAt != null ? function(str) {
      return str.codePointAt(0);
    } : function(c) {
      return (c.charCodeAt(0) - 55296) * 1024 + c.charCodeAt(1) - 56320 + 65536;
    };
    function singleCharReplacer(c) {
      return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0)).toString(16).toUpperCase() + ";";
    }
    function getInverse(inverse, re) {
      return function(data) {
        return data.replace(re, function(name) {
          return inverse[name];
        }).replace(reNonASCII, singleCharReplacer);
      };
    }
    var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
    function escape3(data) {
      return data.replace(reEscapeChars, singleCharReplacer);
    }
    exports.escape = escape3;
    function escapeUTF8(data) {
      return data.replace(xmlReplacer, singleCharReplacer);
    }
    exports.escapeUTF8 = escapeUTF8;
    function getASCIIEncoder(obj) {
      return function(data) {
        return data.replace(reEscapeChars, function(c) {
          return obj[c] || singleCharReplacer(c);
        });
      };
    }
  }
});

// node_modules/entities/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/entities/lib/index.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
    var decode_1 = require_decode2();
    var encode_1 = require_encode();
    function decode(data, level) {
      return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
    }
    exports.decode = decode;
    function decodeStrict(data, level) {
      return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
    }
    exports.decodeStrict = decodeStrict;
    function encode(data, level) {
      return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
    }
    exports.encode = encode;
    var encode_2 = require_encode();
    Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function() {
      return encode_2.encodeXML;
    } });
    Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function() {
      return encode_2.encodeHTML;
    } });
    Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function() {
      return encode_2.encodeNonAsciiHTML;
    } });
    Object.defineProperty(exports, "escape", { enumerable: true, get: function() {
      return encode_2.escape;
    } });
    Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function() {
      return encode_2.escapeUTF8;
    } });
    Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function() {
      return encode_2.encodeHTML;
    } });
    Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function() {
      return encode_2.encodeHTML;
    } });
    var decode_2 = require_decode2();
    Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function() {
      return decode_2.decodeXML;
    } });
    Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function() {
      return decode_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function() {
      return decode_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function() {
      return decode_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function() {
      return decode_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function() {
      return decode_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function() {
      return decode_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function() {
      return decode_2.decodeXML;
    } });
  }
});

// node_modules/rss-parser/lib/utils.js
var require_utils = __commonJS({
  "node_modules/rss-parser/lib/utils.js"(exports, module2) {
    init_shims();
    var utils = module2.exports = {};
    var entities = require_lib2();
    var xml2js = require_xml2js();
    utils.stripHtml = function(str) {
      str = str.replace(/([^\n])<\/?(h|br|p|ul|ol|li|blockquote|section|table|tr|div)(?:.|\n)*?>([^\n])/gm, "$1\n$3");
      str = str.replace(/<(?:.|\n)*?>/gm, "");
      return str;
    };
    utils.getSnippet = function(str) {
      return entities.decodeHTML(utils.stripHtml(str)).trim();
    };
    utils.getLink = function(links, rel, fallbackIdx) {
      if (!links)
        return;
      for (let i = 0; i < links.length; ++i) {
        if (links[i].$.rel === rel)
          return links[i].$.href;
      }
      if (links[fallbackIdx])
        return links[fallbackIdx].$.href;
    };
    utils.getContent = function(content) {
      if (typeof content._ === "string") {
        return content._;
      } else if (typeof content === "object") {
        let builder = new xml2js.Builder({ headless: true, explicitRoot: true, rootName: "div", renderOpts: { pretty: false } });
        return builder.buildObject(content);
      } else {
        return content;
      }
    };
    utils.copyFromXML = function(xml, dest, fields) {
      fields.forEach(function(f) {
        let from = f;
        let to = f;
        let options2 = {};
        if (Array.isArray(f)) {
          from = f[0];
          to = f[1];
          if (f.length > 2) {
            options2 = f[2];
          }
        }
        const { keepArray, includeSnippet } = options2;
        if (xml[from] !== void 0) {
          dest[to] = keepArray ? xml[from] : xml[from][0];
        }
        if (dest[to] && typeof dest[to]._ === "string") {
          dest[to] = dest[to]._;
        }
        if (includeSnippet && dest[to] && typeof dest[to] === "string") {
          dest[to + "Snippet"] = utils.getSnippet(dest[to]);
        }
      });
    };
    utils.maybePromisify = function(callback, promise) {
      if (!callback)
        return promise;
      return promise.then((data) => setTimeout(() => callback(null, data)), (err) => setTimeout(() => callback(err)));
    };
    var DEFAULT_ENCODING = "utf8";
    var ENCODING_REGEX = /(encoding|charset)\s*=\s*(\S+)/;
    var SUPPORTED_ENCODINGS = ["ascii", "utf8", "utf16le", "ucs2", "base64", "latin1", "binary", "hex"];
    var ENCODING_ALIASES = {
      "utf-8": "utf8",
      "iso-8859-1": "latin1"
    };
    utils.getEncodingFromContentType = function(contentType) {
      contentType = contentType || "";
      let match = contentType.match(ENCODING_REGEX);
      let encoding = (match || [])[2] || "";
      encoding = encoding.toLowerCase();
      encoding = ENCODING_ALIASES[encoding] || encoding;
      if (!encoding || SUPPORTED_ENCODINGS.indexOf(encoding) === -1) {
        encoding = DEFAULT_ENCODING;
      }
      return encoding;
    };
  }
});

// node_modules/rss-parser/lib/parser.js
var require_parser2 = __commonJS({
  "node_modules/rss-parser/lib/parser.js"(exports, module2) {
    init_shims();
    "use strict";
    var http2 = require("http");
    var https2 = require("https");
    var xml2js = require_xml2js();
    var url = require("url");
    var fields = require_fields();
    var utils = require_utils();
    var DEFAULT_HEADERS = {
      "User-Agent": "rss-parser",
      "Accept": "application/rss+xml"
    };
    var DEFAULT_MAX_REDIRECTS = 5;
    var DEFAULT_TIMEOUT = 6e4;
    var Parser2 = class {
      constructor(options2 = {}) {
        options2.headers = options2.headers || {};
        options2.xml2js = options2.xml2js || {};
        options2.customFields = options2.customFields || {};
        options2.customFields.item = options2.customFields.item || [];
        options2.customFields.feed = options2.customFields.feed || [];
        options2.requestOptions = options2.requestOptions || {};
        if (!options2.maxRedirects)
          options2.maxRedirects = DEFAULT_MAX_REDIRECTS;
        if (!options2.timeout)
          options2.timeout = DEFAULT_TIMEOUT;
        this.options = options2;
        this.xmlParser = new xml2js.Parser(this.options.xml2js);
      }
      parseString(xml, callback) {
        let prom = new Promise((resolve2, reject) => {
          this.xmlParser.parseString(xml, (err, result) => {
            if (err)
              return reject(err);
            if (!result) {
              return reject(new Error("Unable to parse XML."));
            }
            let feed = null;
            if (result.feed) {
              feed = this.buildAtomFeed(result);
            } else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/^2/)) {
              feed = this.buildRSS2(result);
            } else if (result["rdf:RDF"]) {
              feed = this.buildRSS1(result);
            } else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/0\.9/)) {
              feed = this.buildRSS0_9(result);
            } else if (result.rss && this.options.defaultRSS) {
              switch (this.options.defaultRSS) {
                case 0.9:
                  feed = this.buildRSS0_9(result);
                  break;
                case 1:
                  feed = this.buildRSS1(result);
                  break;
                case 2:
                  feed = this.buildRSS2(result);
                  break;
                default:
                  return reject(new Error("default RSS version not recognized."));
              }
            } else {
              return reject(new Error("Feed not recognized as RSS 1 or 2."));
            }
            resolve2(feed);
          });
        });
        prom = utils.maybePromisify(callback, prom);
        return prom;
      }
      parseURL(feedUrl, callback, redirectCount = 0) {
        let xml = "";
        let get2 = feedUrl.indexOf("https") === 0 ? https2.get : http2.get;
        let urlParts = url.parse(feedUrl);
        let headers = Object.assign({}, DEFAULT_HEADERS, this.options.headers);
        let timeout = null;
        let prom = new Promise((resolve2, reject) => {
          const requestOpts = Object.assign({ headers }, urlParts, this.options.requestOptions);
          let req = get2(requestOpts, (res) => {
            if (this.options.maxRedirects && res.statusCode >= 300 && res.statusCode < 400 && res.headers["location"]) {
              if (redirectCount === this.options.maxRedirects) {
                return reject(new Error("Too many redirects"));
              } else {
                const newLocation = url.resolve(feedUrl, res.headers["location"]);
                return this.parseURL(newLocation, null, redirectCount + 1).then(resolve2, reject);
              }
            } else if (res.statusCode >= 300) {
              return reject(new Error("Status code " + res.statusCode));
            }
            let encoding = utils.getEncodingFromContentType(res.headers["content-type"]);
            res.setEncoding(encoding);
            res.on("data", (chunk) => {
              xml += chunk;
            });
            res.on("end", () => {
              return this.parseString(xml).then(resolve2, reject);
            });
          });
          req.on("error", reject);
          timeout = setTimeout(() => {
            return reject(new Error("Request timed out after " + this.options.timeout + "ms"));
          }, this.options.timeout);
        }).then((data) => {
          clearTimeout(timeout);
          return Promise.resolve(data);
        }, (e) => {
          clearTimeout(timeout);
          return Promise.reject(e);
        });
        prom = utils.maybePromisify(callback, prom);
        return prom;
      }
      buildAtomFeed(xmlObj) {
        let feed = { items: [] };
        utils.copyFromXML(xmlObj.feed, feed, this.options.customFields.feed);
        if (xmlObj.feed.link) {
          feed.link = utils.getLink(xmlObj.feed.link, "alternate", 0);
          feed.feedUrl = utils.getLink(xmlObj.feed.link, "self", 1);
        }
        if (xmlObj.feed.title) {
          let title = xmlObj.feed.title[0] || "";
          if (title._)
            title = title._;
          if (title)
            feed.title = title;
        }
        if (xmlObj.feed.updated) {
          feed.lastBuildDate = xmlObj.feed.updated[0];
        }
        feed.items = (xmlObj.feed.entry || []).map((entry) => this.parseItemAtom(entry));
        return feed;
      }
      parseItemAtom(entry) {
        let item = {};
        utils.copyFromXML(entry, item, this.options.customFields.item);
        if (entry.title) {
          let title = entry.title[0] || "";
          if (title._)
            title = title._;
          if (title)
            item.title = title;
        }
        if (entry.link && entry.link.length) {
          item.link = utils.getLink(entry.link, "alternate", 0);
        }
        if (entry.published && entry.published.length && entry.published[0].length)
          item.pubDate = new Date(entry.published[0]).toISOString();
        if (!item.pubDate && entry.updated && entry.updated.length && entry.updated[0].length)
          item.pubDate = new Date(entry.updated[0]).toISOString();
        if (entry.author && entry.author.length && entry.author[0].name && entry.author[0].name.length)
          item.author = entry.author[0].name[0];
        if (entry.content && entry.content.length) {
          item.content = utils.getContent(entry.content[0]);
          item.contentSnippet = utils.getSnippet(item.content);
        }
        if (entry.summary && entry.summary.length) {
          item.summary = utils.getContent(entry.summary[0]);
        }
        if (entry.id) {
          item.id = entry.id[0];
        }
        this.setISODate(item);
        return item;
      }
      buildRSS0_9(xmlObj) {
        var channel = xmlObj.rss.channel[0];
        var items = channel.item;
        return this.buildRSS(channel, items);
      }
      buildRSS1(xmlObj) {
        xmlObj = xmlObj["rdf:RDF"];
        let channel = xmlObj.channel[0];
        let items = xmlObj.item;
        return this.buildRSS(channel, items);
      }
      buildRSS2(xmlObj) {
        let channel = xmlObj.rss.channel[0];
        let items = channel.item;
        let feed = this.buildRSS(channel, items);
        if (xmlObj.rss.$ && xmlObj.rss.$["xmlns:itunes"]) {
          this.decorateItunes(feed, channel);
        }
        return feed;
      }
      buildRSS(channel, items) {
        items = items || [];
        let feed = { items: [] };
        let feedFields = fields.feed.concat(this.options.customFields.feed);
        let itemFields = fields.item.concat(this.options.customFields.item);
        if (channel["atom:link"] && channel["atom:link"][0] && channel["atom:link"][0].$) {
          feed.feedUrl = channel["atom:link"][0].$.href;
        }
        if (channel.image && channel.image[0] && channel.image[0].url) {
          feed.image = {};
          let image = channel.image[0];
          if (image.link)
            feed.image.link = image.link[0];
          if (image.url)
            feed.image.url = image.url[0];
          if (image.title)
            feed.image.title = image.title[0];
          if (image.width)
            feed.image.width = image.width[0];
          if (image.height)
            feed.image.height = image.height[0];
        }
        const paginationLinks = this.generatePaginationLinks(channel);
        if (Object.keys(paginationLinks).length) {
          feed.paginationLinks = paginationLinks;
        }
        utils.copyFromXML(channel, feed, feedFields);
        feed.items = items.map((xmlItem) => this.parseItemRss(xmlItem, itemFields));
        return feed;
      }
      parseItemRss(xmlItem, itemFields) {
        let item = {};
        utils.copyFromXML(xmlItem, item, itemFields);
        if (xmlItem.enclosure) {
          item.enclosure = xmlItem.enclosure[0].$;
        }
        if (xmlItem.description) {
          item.content = utils.getContent(xmlItem.description[0]);
          item.contentSnippet = utils.getSnippet(item.content);
        }
        if (xmlItem.guid) {
          item.guid = xmlItem.guid[0];
          if (item.guid._)
            item.guid = item.guid._;
        }
        if (xmlItem.category)
          item.categories = xmlItem.category;
        this.setISODate(item);
        return item;
      }
      decorateItunes(feed, channel) {
        let items = channel.item || [];
        let categories = [];
        feed.itunes = {};
        if (channel["itunes:owner"]) {
          let owner = {};
          if (channel["itunes:owner"][0]["itunes:name"]) {
            owner.name = channel["itunes:owner"][0]["itunes:name"][0];
          }
          if (channel["itunes:owner"][0]["itunes:email"]) {
            owner.email = channel["itunes:owner"][0]["itunes:email"][0];
          }
          feed.itunes.owner = owner;
        }
        if (channel["itunes:image"]) {
          let image;
          let hasImageHref = channel["itunes:image"][0] && channel["itunes:image"][0].$ && channel["itunes:image"][0].$.href;
          image = hasImageHref ? channel["itunes:image"][0].$.href : null;
          if (image) {
            feed.itunes.image = image;
          }
        }
        if (channel["itunes:category"]) {
          const categoriesWithSubs = channel["itunes:category"].map((category) => {
            return {
              name: category.$.text,
              subs: category["itunes:category"] ? category["itunes:category"].map((subcategory) => ({ name: subcategory.$.text })) : null
            };
          });
          feed.itunes.categories = categoriesWithSubs.map((category) => category.name);
          feed.itunes.categoriesWithSubs = categoriesWithSubs;
        }
        if (channel["itunes:keywords"]) {
          if (channel["itunes:keywords"].length > 1) {
            feed.itunes.keywords = channel["itunes:keywords"].map((keyword) => keyword.$.text);
          } else {
            let keywords = channel["itunes:keywords"][0];
            if (keywords && typeof keywords._ === "string") {
              keywords = keywords._;
            }
            if (keywords && keywords.$ && keywords.$.text) {
              feed.itunes.keywords = keywords.$.text.split(",");
            } else if (typeof keywords === "string") {
              feed.itunes.keywords = keywords.split(",");
            }
          }
        }
        utils.copyFromXML(channel, feed.itunes, fields.podcastFeed);
        items.forEach((item, index2) => {
          let entry = feed.items[index2];
          entry.itunes = {};
          utils.copyFromXML(item, entry.itunes, fields.podcastItem);
          let image = item["itunes:image"];
          if (image && image[0] && image[0].$ && image[0].$.href) {
            entry.itunes.image = image[0].$.href;
          }
        });
      }
      setISODate(item) {
        let date = item.pubDate || item.date;
        if (date) {
          try {
            item.isoDate = new Date(date.trim()).toISOString();
          } catch (e) {
          }
        }
      }
      generatePaginationLinks(channel) {
        if (!channel["atom:link"]) {
          return {};
        }
        const paginationRelAttributes = ["self", "first", "next", "prev", "last"];
        return channel["atom:link"].reduce((paginationLinks, link) => {
          if (!link.$ || !paginationRelAttributes.includes(link.$.rel)) {
            return paginationLinks;
          }
          paginationLinks[link.$.rel] = link.$.href;
          return paginationLinks;
        }, {});
      }
    };
    module2.exports = Parser2;
  }
});

// node_modules/rss-parser/index.js
var require_rss_parser = __commonJS({
  "node_modules/rss-parser/index.js"(exports, module2) {
    init_shims();
    "use strict";
    module2.exports = require_parser2();
  }
});

// .svelte-kit/vercel/entry.js
__export(exports, {
  default: () => entry_default
});
init_shims();

// node_modules/@sveltejs/kit/dist/node.js
init_shims();

// node_modules/@sveltejs/kit/dist/adapter-utils.js
init_shims();
function isContentTypeTextual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}

// node_modules/@sveltejs/kit/dist/node.js
function getRawBody(req) {
  return new Promise((fulfil, reject) => {
    const h = req.headers;
    if (!h["content-type"]) {
      return fulfil("");
    }
    req.on("error", reject);
    const length = Number(h["content-length"]);
    if (isNaN(length) && h["transfer-encoding"] == null) {
      return fulfil("");
    }
    let data = new Uint8Array(length || 0);
    if (length > 0) {
      let offset = 0;
      req.on("data", (chunk) => {
        const new_len = offset + Buffer.byteLength(chunk);
        if (new_len > length) {
          return reject({
            status: 413,
            reason: 'Exceeded "Content-Length" limit'
          });
        }
        data.set(chunk, offset);
        offset = new_len;
      });
    } else {
      req.on("data", (chunk) => {
        const new_data = new Uint8Array(data.length + chunk.length);
        new_data.set(data, 0);
        new_data.set(chunk, data.length);
        data = new_data;
      });
    }
    req.on("end", () => {
      const [type] = (h["content-type"] || "").split(/;\s*/);
      if (isContentTypeTextual(type)) {
        const encoding = h["content-encoding"] || "utf-8";
        return fulfil(new TextDecoder(encoding).decode(data));
      }
      fulfil(data);
    });
  });
}

// .svelte-kit/output/server/app.js
init_shims();

// node_modules/@sveltejs/kit/dist/ssr.js
init_shims();
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ ...error3, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base, path) {
  const base_match = absolute.exec(base);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base}"`);
  }
  const baseparts = path_match ? [] : base.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? {
              "content-type": asset.type
            } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith(options2.paths.base || "/") && !resolved.startsWith("//")) {
          const relative = resolved.replace(options2.paths.base, "");
          const headers = { ...opts.headers };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body,
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.serverFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function coalesce_to_error(err) {
  return err instanceof Error ? err : new Error(JSON.stringify(err));
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => options2.load_component(id)));
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            } else {
              branch.push(loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page
    });
  } catch (err) {
    const error4 = coalesce_to_error(err);
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return error("no handler");
  }
  const match = route.pattern.exec(request.path);
  if (!match) {
    return error("could not parse parameters from request path");
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return error("no response");
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = headers["content-type"];
  const is_type_textual = isContentTypeTextual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of this.#map)
      yield key;
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw || typeof raw !== "string")
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  switch (type) {
    case "text/plain":
      return raw;
    case "application/json":
      return JSON.parse(raw);
    case "application/x-www-form-urlencoded":
      return get_urlencoded(raw);
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(raw, boundary.slice("boundary=".length));
    }
    default:
      throw new Error(`Invalid Content-Type ${type}`);
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: {},
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body || "")}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// .svelte-kit/output/server/app.js
var import_rss_parser = __toModule(require_rss_parser());
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$8 = {
  code: "#svelte-announcer.svelte-1pdgbjn{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>#svelte-announcer{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;left:0;overflow:hidden;position:absolute;top:0;white-space:nowrap;width:1px}</style>"],"names":[],"mappings":"AAqDO,gCAAiB,CAAC,KAAK,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,kBAAkB,MAAM,GAAG,CAAC,CAAC,UAAU,MAAM,GAAG,CAAC,CAAC,OAAO,GAAG,CAAC,KAAK,CAAC,CAAC,SAAS,MAAM,CAAC,SAAS,QAAQ,CAAC,IAAI,CAAC,CAAC,YAAY,MAAM,CAAC,MAAM,GAAG,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$8);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en" class="dark">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body class="dark:bg-ebony-clay-600 bg-white transition duration-500 bg-gradient-to-r from-ebony-clay-600 via-ebony-clay-400 to-ebony-clay-600">\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "/." } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-03c55644.js",
      css: ["/./_app/assets/start-0826e215.css"],
      js: ["/./_app/start-03c55644.js", "/./_app/chunks/vendor-64eebebd.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      if (error22.frame) {
        console.error(error22.frame);
      }
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/4-habilidades-blandas-esenciales-para-un-desarrollador\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/4-habilidades-blandas-esenciales-para-un-desarrollador.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/overview-de-algunos-modernos-lenguajes-de-programacion\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/overview-de-algunos-modernos-lenguajes-de-programacion.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/agregar-modulos-nativos-a-una-aplicacion-react-native\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/agregar-modulos-nativos-a-una-aplicacion-react-native.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/react-native-promesas-y-callbacks-en-modulos-nativos\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/react-native-promesas-y-callbacks-en-modulos-nativos.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/algunos-errores-comunes-al-utilizar-react-hooks\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/algunos-errores-comunes-al-utilizar-react-hooks.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/como-crear-animaciones-con-react-native\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/como-crear-animaciones-con-react-native.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/use-state-para-crear-component-wizard\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/use-state-para-crear-component-wizard.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/measuring-your-react-app-performance\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/measuring-your-react-app-performance.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/useState-para-crear-component-wizard\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/useState-para-crear-component-wizard.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/cuando-usar-el-hook-uselayouteffect\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/cuando-usar-el-hook-uselayouteffect.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/definir-la-version-de-node-con-nvm\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/definir-la-version-de-node-con-nvm.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/que-es-un-closure-en-javascript\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/que-es-un-closure-en-javascript.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/por-que-jamstack-es-tan-cool\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/por-que-jamstack-es-tan-cool.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/comenzando-con-react-native\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/comenzando-con-react-native.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/jamstack-que-es-ssg-y-ssr\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/jamstack-que-es-ssg-y-ssr.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/que-es-linting-y-eslint\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/que-es-linting-y-eslint.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/fijando-expectativas\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/fijando-expectativas.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/no-necesitas-redux\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/no-necesitas-redux.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/que-es-typescript\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/que-es-typescript.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/que-son-los-hooks\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/que-son-los-hooks.mdx"],
      b: []
    },
    {
      type: "page",
      pattern: /^\/blog\/post\/por-que-clojure\/?$/,
      params: empty,
      a: ["src/routes/blog/post/__layout.reset.svelte", "src/routes/blog/post/por-que-clojure.mdx"],
      b: []
    },
    {
      type: "endpoint",
      pattern: /^\/api\/cafecontech\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_json$1;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/api\/blog\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_json;
      })
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  serverFetch: hooks.serverFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/blog/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/blog/post/__layout.reset.svelte": () => Promise.resolve().then(function() {
    return __layout_reset;
  }),
  "src/routes/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript.mdx": () => Promise.resolve().then(function() {
    return _4FormasDeEliminarElementosDuplicadosEnUnArregloConJavascript;
  }),
  "src/routes/blog/post/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido.mdx": () => Promise.resolve().then(function() {
    return arreglosDeObjetosEnJavascriptComoCrearYActualizarSuContenido;
  }),
  "src/routes/blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida.mdx": () => Promise.resolve().then(function() {
    return reactUseeffectHookComparadoConLosEstadosDelCicloDeVida;
  }),
  "src/routes/blog/post/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante.mdx": () => Promise.resolve().then(function() {
    return reactUseeffectPorQueElArregloDeDependenciasEsImportante;
  }),
  "src/routes/blog/post/4-habilidades-blandas-esenciales-para-un-desarrollador.mdx": () => Promise.resolve().then(function() {
    return _4HabilidadesBlandasEsencialesParaUnDesarrollador;
  }),
  "src/routes/blog/post/overview-de-algunos-modernos-lenguajes-de-programacion.mdx": () => Promise.resolve().then(function() {
    return overviewDeAlgunosModernosLenguajesDeProgramacion;
  }),
  "src/routes/blog/post/agregar-modulos-nativos-a-una-aplicacion-react-native.mdx": () => Promise.resolve().then(function() {
    return agregarModulosNativosAUnaAplicacionReactNative;
  }),
  "src/routes/blog/post/react-native-promesas-y-callbacks-en-modulos-nativos.mdx": () => Promise.resolve().then(function() {
    return reactNativePromesasYCallbacksEnModulosNativos;
  }),
  "src/routes/blog/post/algunos-errores-comunes-al-utilizar-react-hooks.mdx": () => Promise.resolve().then(function() {
    return algunosErroresComunesAlUtilizarReactHooks;
  }),
  "src/routes/blog/post/como-crear-animaciones-con-react-native.mdx": () => Promise.resolve().then(function() {
    return comoCrearAnimacionesConReactNative;
  }),
  "src/routes/blog/post/use-state-para-crear-component-wizard.mdx": () => Promise.resolve().then(function() {
    return useStateParaCrearComponentWizard$1;
  }),
  "src/routes/blog/post/measuring-your-react-app-performance.mdx": () => Promise.resolve().then(function() {
    return measuringYourReactAppPerformance;
  }),
  "src/routes/blog/post/useState-para-crear-component-wizard.mdx": () => Promise.resolve().then(function() {
    return useStateParaCrearComponentWizard;
  }),
  "src/routes/blog/post/cuando-usar-el-hook-uselayouteffect.mdx": () => Promise.resolve().then(function() {
    return cuandoUsarElHookUselayouteffect;
  }),
  "src/routes/blog/post/definir-la-version-de-node-con-nvm.mdx": () => Promise.resolve().then(function() {
    return definirLaVersionDeNodeConNvm;
  }),
  "src/routes/blog/post/que-es-un-closure-en-javascript.mdx": () => Promise.resolve().then(function() {
    return queEsUnClosureEnJavascript;
  }),
  "src/routes/blog/post/por-que-jamstack-es-tan-cool.mdx": () => Promise.resolve().then(function() {
    return porQueJamstackEsTanCool;
  }),
  "src/routes/blog/post/comenzando-con-react-native.mdx": () => Promise.resolve().then(function() {
    return comenzandoConReactNative;
  }),
  "src/routes/blog/post/jamstack-que-es-ssg-y-ssr.mdx": () => Promise.resolve().then(function() {
    return jamstackQueEsSsgYSsr;
  }),
  "src/routes/blog/post/que-es-linting-y-eslint.mdx": () => Promise.resolve().then(function() {
    return queEsLintingYEslint;
  }),
  "src/routes/blog/post/fijando-expectativas.mdx": () => Promise.resolve().then(function() {
    return fijandoExpectativas;
  }),
  "src/routes/blog/post/no-necesitas-redux.mdx": () => Promise.resolve().then(function() {
    return noNecesitasRedux;
  }),
  "src/routes/blog/post/que-es-typescript.mdx": () => Promise.resolve().then(function() {
    return queEsTypescript;
  }),
  "src/routes/blog/post/que-son-los-hooks.mdx": () => Promise.resolve().then(function() {
    return queSonLosHooks;
  }),
  "src/routes/blog/post/por-que-clojure.mdx": () => Promise.resolve().then(function() {
    return porQueClojure;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-cc212e28.js", "css": ["/./_app/assets/pages/__layout.svelte-a0cc9a09.css", "/./_app/assets/Footer-2bf32a06.css"], "js": ["/./_app/pages/__layout.svelte-cc212e28.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/Footer-f6afcdba.js", "/./_app/chunks/escuelafrontend-760acb3e.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-0fcca945.js", "css": [], "js": ["/./_app/error.svelte-0fcca945.js", "/./_app/chunks/vendor-64eebebd.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-dbc0faab.js", "css": ["/./_app/assets/pages/index.svelte-55522939.css"], "js": ["/./_app/pages/index.svelte-dbc0faab.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/escuelafrontend-760acb3e.js", "/./_app/chunks/Featured-1ca30a01.js"], "styles": [] }, "src/routes/blog/index.svelte": { "entry": "/./_app/pages/blog/index.svelte-15648f4c.js", "css": [], "js": ["/./_app/pages/blog/index.svelte-15648f4c.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/Featured-1ca30a01.js"], "styles": [] }, "src/routes/blog/post/__layout.reset.svelte": { "entry": "/./_app/pages/blog/post/__layout.reset.svelte-ffd6210a.js", "css": ["/./_app/assets/pages/__layout.svelte-a0cc9a09.css", "/./_app/assets/Footer-2bf32a06.css"], "js": ["/./_app/pages/blog/post/__layout.reset.svelte-ffd6210a.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/Footer-f6afcdba.js", "/./_app/chunks/escuelafrontend-760acb3e.js"], "styles": [] }, "src/routes/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript.mdx": { "entry": "/./_app/pages/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript.mdx-3d95a604.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript.mdx-3d95a604.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/EggheadLesson-5d77fb7e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido.mdx": { "entry": "/./_app/pages/blog/post/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido.mdx-cc6c5953.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido.mdx-cc6c5953.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/EggheadLesson-5d77fb7e.js"], "styles": [] }, "src/routes/blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida.mdx": { "entry": "/./_app/pages/blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida.mdx-9b6302e1.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida.mdx-9b6302e1.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante.mdx": { "entry": "/./_app/pages/blog/post/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante.mdx-bbe359c5.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante.mdx-bbe359c5.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/4-habilidades-blandas-esenciales-para-un-desarrollador.mdx": { "entry": "/./_app/pages/blog/post/4-habilidades-blandas-esenciales-para-un-desarrollador.mdx-ee4f3946.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/4-habilidades-blandas-esenciales-para-un-desarrollador.mdx-ee4f3946.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/overview-de-algunos-modernos-lenguajes-de-programacion.mdx": { "entry": "/./_app/pages/blog/post/overview-de-algunos-modernos-lenguajes-de-programacion.mdx-aeb2d252.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/overview-de-algunos-modernos-lenguajes-de-programacion.mdx-aeb2d252.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/agregar-modulos-nativos-a-una-aplicacion-react-native.mdx": { "entry": "/./_app/pages/blog/post/agregar-modulos-nativos-a-una-aplicacion-react-native.mdx-788d717b.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/agregar-modulos-nativos-a-una-aplicacion-react-native.mdx-788d717b.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js"], "styles": [] }, "src/routes/blog/post/react-native-promesas-y-callbacks-en-modulos-nativos.mdx": { "entry": "/./_app/pages/blog/post/react-native-promesas-y-callbacks-en-modulos-nativos.mdx-80326412.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/react-native-promesas-y-callbacks-en-modulos-nativos.mdx-80326412.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/algunos-errores-comunes-al-utilizar-react-hooks.mdx": { "entry": "/./_app/pages/blog/post/algunos-errores-comunes-al-utilizar-react-hooks.mdx-94dd76e7.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/algunos-errores-comunes-al-utilizar-react-hooks.mdx-94dd76e7.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/como-crear-animaciones-con-react-native.mdx": { "entry": "/./_app/pages/blog/post/como-crear-animaciones-con-react-native.mdx-36791481.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/como-crear-animaciones-con-react-native.mdx-36791481.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/EggheadLesson-5d77fb7e.js"], "styles": [] }, "src/routes/blog/post/use-state-para-crear-component-wizard.mdx": { "entry": "/./_app/pages/blog/post/use-state-para-crear-component-wizard.mdx-d3e9c256.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/use-state-para-crear-component-wizard.mdx-d3e9c256.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/EggheadLesson-5d77fb7e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/measuring-your-react-app-performance.mdx": { "entry": "/./_app/pages/blog/post/measuring-your-react-app-performance.mdx-70e8dd08.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/measuring-your-react-app-performance.mdx-70e8dd08.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/useState-para-crear-component-wizard.mdx": { "entry": "/./_app/pages/blog/post/useState-para-crear-component-wizard.mdx-a11ccba2.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/useState-para-crear-component-wizard.mdx-a11ccba2.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/EggheadLesson-5d77fb7e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/cuando-usar-el-hook-uselayouteffect.mdx": { "entry": "/./_app/pages/blog/post/cuando-usar-el-hook-uselayouteffect.mdx-d46a0a29.js", "css": ["/./_app/assets/pages/blog/post/cuando-usar-el-hook-uselayouteffect.mdx-409478d0.css", "/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/cuando-usar-el-hook-uselayouteffect.mdx-d46a0a29.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/definir-la-version-de-node-con-nvm.mdx": { "entry": "/./_app/pages/blog/post/definir-la-version-de-node-con-nvm.mdx-fe6e517f.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/definir-la-version-de-node-con-nvm.mdx-fe6e517f.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/que-es-un-closure-en-javascript.mdx": { "entry": "/./_app/pages/blog/post/que-es-un-closure-en-javascript.mdx-09b318f6.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/que-es-un-closure-en-javascript.mdx-09b318f6.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/por-que-jamstack-es-tan-cool.mdx": { "entry": "/./_app/pages/blog/post/por-que-jamstack-es-tan-cool.mdx-7d9062e6.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/por-que-jamstack-es-tan-cool.mdx-7d9062e6.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/comenzando-con-react-native.mdx": { "entry": "/./_app/pages/blog/post/comenzando-con-react-native.mdx-6abf8d41.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/comenzando-con-react-native.mdx-6abf8d41.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js"], "styles": [] }, "src/routes/blog/post/jamstack-que-es-ssg-y-ssr.mdx": { "entry": "/./_app/pages/blog/post/jamstack-que-es-ssg-y-ssr.mdx-3ac8e37d.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/jamstack-que-es-ssg-y-ssr.mdx-3ac8e37d.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/que-es-linting-y-eslint.mdx": { "entry": "/./_app/pages/blog/post/que-es-linting-y-eslint.mdx-12bff3c3.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/que-es-linting-y-eslint.mdx-12bff3c3.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/fijando-expectativas.mdx": { "entry": "/./_app/pages/blog/post/fijando-expectativas.mdx-95694ad2.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/fijando-expectativas.mdx-95694ad2.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/no-necesitas-redux.mdx": { "entry": "/./_app/pages/blog/post/no-necesitas-redux.mdx-01cbae48.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/no-necesitas-redux.mdx-01cbae48.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js"], "styles": [] }, "src/routes/blog/post/que-es-typescript.mdx": { "entry": "/./_app/pages/blog/post/que-es-typescript.mdx-1a171c74.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/que-es-typescript.mdx-1a171c74.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js"], "styles": [] }, "src/routes/blog/post/que-son-los-hooks.mdx": { "entry": "/./_app/pages/blog/post/que-son-los-hooks.mdx-e2530eb7.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/que-son-los-hooks.mdx-e2530eb7.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Buzzsprout-a39d13f8.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] }, "src/routes/blog/post/por-que-clojure.mdx": { "entry": "/./_app/pages/blog/post/por-que-clojure.mdx-22989e16.js", "css": ["/./_app/assets/PostLayout-89eef53b.css"], "js": ["/./_app/pages/blog/post/por-que-clojure.mdx-22989e16.js", "/./_app/chunks/vendor-64eebebd.js", "/./_app/chunks/PostLayout-1d1b8b8e.js", "/./_app/chunks/Quote-982ae035.js"], "styles": [] } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var parser = new import_rss_parser.default();
async function get$1() {
  const feed = await parser.parseURL("https://feeds.buzzsprout.com/1081172.rss");
  return {
    body: feed.items
  };
}
var index_json$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
async function get() {
  const modules = { "../../blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript.mdx": () => Promise.resolve().then(function() {
    return _4FormasDeEliminarElementosDuplicadosEnUnArregloConJavascript;
  }), "../../blog/post/4-habilidades-blandas-esenciales-para-un-desarrollador.mdx": () => Promise.resolve().then(function() {
    return _4HabilidadesBlandasEsencialesParaUnDesarrollador;
  }), "../../blog/post/agregar-modulos-nativos-a-una-aplicacion-react-native.mdx": () => Promise.resolve().then(function() {
    return agregarModulosNativosAUnaAplicacionReactNative;
  }), "../../blog/post/algunos-errores-comunes-al-utilizar-react-hooks.mdx": () => Promise.resolve().then(function() {
    return algunosErroresComunesAlUtilizarReactHooks;
  }), "../../blog/post/arreglos-de-objetos-en-javascript-como-crear-y-actualizar-su-contenido.mdx": () => Promise.resolve().then(function() {
    return arreglosDeObjetosEnJavascriptComoCrearYActualizarSuContenido;
  }), "../../blog/post/comenzando-con-react-native.mdx": () => Promise.resolve().then(function() {
    return comenzandoConReactNative;
  }), "../../blog/post/como-crear-animaciones-con-react-native.mdx": () => Promise.resolve().then(function() {
    return comoCrearAnimacionesConReactNative;
  }), "../../blog/post/cuando-usar-el-hook-uselayouteffect.mdx": () => Promise.resolve().then(function() {
    return cuandoUsarElHookUselayouteffect;
  }), "../../blog/post/definir-la-version-de-node-con-nvm.mdx": () => Promise.resolve().then(function() {
    return definirLaVersionDeNodeConNvm;
  }), "../../blog/post/fijando-expectativas.mdx": () => Promise.resolve().then(function() {
    return fijandoExpectativas;
  }), "../../blog/post/jamstack-que-es-ssg-y-ssr.mdx": () => Promise.resolve().then(function() {
    return jamstackQueEsSsgYSsr;
  }), "../../blog/post/measuring-your-react-app-performance.mdx": () => Promise.resolve().then(function() {
    return measuringYourReactAppPerformance;
  }), "../../blog/post/no-necesitas-redux.mdx": () => Promise.resolve().then(function() {
    return noNecesitasRedux;
  }), "../../blog/post/overview-de-algunos-modernos-lenguajes-de-programacion.mdx": () => Promise.resolve().then(function() {
    return overviewDeAlgunosModernosLenguajesDeProgramacion;
  }), "../../blog/post/por-que-clojure.mdx": () => Promise.resolve().then(function() {
    return porQueClojure;
  }), "../../blog/post/por-que-jamstack-es-tan-cool.mdx": () => Promise.resolve().then(function() {
    return porQueJamstackEsTanCool;
  }), "../../blog/post/que-es-linting-y-eslint.mdx": () => Promise.resolve().then(function() {
    return queEsLintingYEslint;
  }), "../../blog/post/que-es-typescript.mdx": () => Promise.resolve().then(function() {
    return queEsTypescript;
  }), "../../blog/post/que-es-un-closure-en-javascript.mdx": () => Promise.resolve().then(function() {
    return queEsUnClosureEnJavascript;
  }), "../../blog/post/que-son-los-hooks.mdx": () => Promise.resolve().then(function() {
    return queSonLosHooks;
  }), "../../blog/post/react-native-promesas-y-callbacks-en-modulos-nativos.mdx": () => Promise.resolve().then(function() {
    return reactNativePromesasYCallbacksEnModulosNativos;
  }), "../../blog/post/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida.mdx": () => Promise.resolve().then(function() {
    return reactUseeffectHookComparadoConLosEstadosDelCicloDeVida;
  }), "../../blog/post/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante.mdx": () => Promise.resolve().then(function() {
    return reactUseeffectPorQueElArregloDeDependenciasEsImportante;
  }), "../../blog/post/use-state-para-crear-component-wizard.mdx": () => Promise.resolve().then(function() {
    return useStateParaCrearComponentWizard$1;
  }), "../../blog/post/useState-para-crear-component-wizard.mdx": () => Promise.resolve().then(function() {
    return useStateParaCrearComponentWizard;
  }) };
  const postPromises = [];
  for (const [path, resolver] of Object.entries(modules)) {
    const promise = resolver().then((post) => {
      var _a, _b;
      const slug = (_b = (_a = path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)) == null ? void 0 : _a[1]) != null ? _b : null;
      return {
        slug,
        ...post.metadata
      };
    });
    postPromises.push(promise);
  }
  const posts = await Promise.all(postPromises);
  return {
    body: posts
  };
}
var index_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var logo = "/_app/assets/logo.cf38c319.png";
var escuelaFrontend = "/_app/assets/escuelafrontend.dda6df40.png";
var css$7 = {
  code: "#githubLogo.svelte-1a9n1br{transform:invert(-1)}",
  map: `{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<script>\\n\\timport escuelaFrontend from '$lib/images/escuelafrontend.png';\\n<\/script>\\n\\n<footer\\n\\tclass=\\"pb-16 mt-32 pt-32 border-t border-gray-200 dark:border-gray-800 px-10 bg-ebony-clay-600\\"\\n>\\n\\t<div class=\\"relative\\">\\n\\t\\t<div\\n\\t\\t\\tclass=\\"relative grid gap-x-4 grid-cols-4 md:grid-cols-8 lg:gap-x-6 lg:grid-cols-12 mx-auto max-w-8xl grid-rows-max-content\\"\\n\\t\\t>\\n\\t\\t\\t<div class=\\"col-span-full md:col-span-3 lg:row-span-2\\">\\n\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t<div class=\\"text-xl font-medium md:text-2xl text-black dark:text-white\\">\\n\\t\\t\\t\\t\\t\\tMat\xEDas Hern\xE1ndez\\n\\t\\t\\t\\t\\t</div>\\n\\n\\t\\t\\t\\t\\t<div\\n\\t\\t\\t\\t\\t\\tclass=\\"text-secondary flex items-center justify-between mt-6 lg:flex-col lg:items-start\\"\\n\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t<div class=\\"flex space-x-4\\">\\n\\t\\t\\t\\t\\t\\t\\t<a href=\\"https://twitter.com/matiasfha\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t><svg\\n\\t\\t\\t\\t\\t\\t\\t\\t\\twidth=\\"40px\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\theight=\\"40px\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\taria-hidden=\\"true\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tfocusable=\\"false\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tdata-prefix=\\"fab\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tdata-icon=\\"twitter\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"svg-inline--fa fa-twitter fa-w-16 fa-3x\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\trole=\\"img\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tviewBox=\\"0 0 512 512\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\taria-label=\\"Link to twitter\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#49a1eb\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t/></svg\\n\\t\\t\\t\\t\\t\\t\\t\\t></a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t\\t<a href=\\"http://egghead.io/instructors/matias-francisco-hernandez-arellano?af=4cexzz\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t><svg\\n\\t\\t\\t\\t\\t\\t\\t\\t\\twidth=\\"40px\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\theight=\\"40px\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tviewBox=\\"0 0 256 263\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tversion=\\"1.1\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tpreserveAspectRatio=\\"xMidYMid\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t><g\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M128,262.399221 C113.6,262.399221 100,259.208957 87.2,254.423561 C74.4,248.840599 63.2,241.662505 54.4,231.294146 C44.8,221.723354 37.6,210.55743 32.8,197.796373 C31.2,193.010977 29.6,188.225581 28,182.642619 L27.2,182.642619 L26.4,174.666959 C16.8,170.679129 9.6,161.108336 7.2,152.33511 C4,141.169186 0.8,124.420299 0,109.266545 C0,97.3030546 6.4,86.1371303 17.6,81.3517342 C24.8,78.1614701 35.2,74.971206 47.2,73.376074 C55.2,56.6271875 64,41.4734331 73.6,30.3075088 C90.4,10.3683583 108.8,0 128,0 C147.2,0 165.6,10.3683583 182.4,30.3075088 C192,41.4734331 200.8,55.8296215 208,73.376074 C220,75.7687721 230.4,78.1614701 238.4,81.3517342 C249.6,86.1371303 256,97.3030546 256,109.266545 C255.2,126.812997 251.2,145.954582 248.8,153.132676 C246.4,162.703468 239.2,172.274261 229.6,175.464525 L228.8,183.440185 L228,183.440185 C227.2,188.225581 225.6,193.808543 223.2,198.593939 C218.4,211.354996 211.2,222.52092 201.6,232.091712 C192,241.662505 180.8,249.638165 168.8,255.221127 C156,260.006523 142.4,262.399221 128,262.399221 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#FFFFFF\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M126.918924,19.2475113 C172.380187,19.2475113 209.068224,116.550566 209.068224,162.011829 C209.068224,207.473092 172.380187,244.161129 126.918924,244.161129 C81.4576609,244.161129 44.769624,207.473092 44.769624,162.011829 C44.769624,116.550566 81.4576609,19.2475113 126.918924,19.2475113 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#FCFBFA\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M231.400073,97.4089814 L197.9023,109.372472 C197.9023,109.372472 202.687696,125.323792 203.485262,125.323792 L236.983035,121.335962 L231.400073,97.4089814 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M23.2353414,97.4089814 L56.7331143,109.372472 C56.7331143,109.372472 51.9477181,125.323792 51.1501521,125.323792 L17.6523792,121.335962 L23.2353414,97.4089814 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M92.6235853,95.0162833 C101.396811,95.0162833 102.991944,102.194378 102.991944,103.78951 C103.78951,108.574906 104.587076,114.955434 105.384642,121.335962 C105.384642,122.931094 105.384642,124.526226 104.587076,126.121358 C103.78951,122.133528 103.78951,118.145698 102.991944,114.157868 C102.991944,112.562736 100.599245,105.384642 92.6235853,105.384642 C87.8381891,105.384642 71.0893027,106.182208 55.1379822,108.574906 C55.9355483,104.587076 57.5306803,101.396811 59.1258123,97.4089814 C73.4820007,95.0162833 87.8381891,94.2187173 92.6235853,95.0162833 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M209.068224,158.023999 C179.558282,156.428867 154.036169,146.858075 148.453207,143.667811 C143.667811,141.275113 138.084848,137.287282 136.489716,126.121358 C135.69215,138.882415 138.084848,150.048339 149.250773,155.631301 C150.048339,156.428867 172.380187,166.797225 208.270658,169.189923 L208.270658,162.011829 C209.068224,160.416697 209.068224,158.821565 209.068224,158.023999 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M45.56719,158.023999 C75.0771328,156.428867 100.599245,146.858075 106.182208,143.667811 C110.967604,141.275113 116.550566,137.287282 118.145698,126.121358 C118.943264,138.882415 116.550566,150.048339 105.384642,155.631301 C104.587076,156.428867 82.255227,166.797225 46.364756,169.189923 L46.364756,162.011829 C45.56719,160.416697 45.56719,158.821565 45.56719,158.023999 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M161.214263,95.0162833 C152.441037,95.0162833 150.845905,102.194378 150.845905,103.78951 C150.048339,108.574906 149.250773,114.955434 148.453207,121.335962 C148.453207,122.931094 148.453207,124.526226 149.250773,126.121358 C150.048339,122.133528 150.048339,118.145698 150.845905,114.157868 C150.845905,112.562736 153.238603,105.384642 161.214263,105.384642 C165.999659,105.384642 182.748546,106.182208 198.699866,108.574906 C197.9023,104.587076 196.307168,101.396811 194.712036,97.4089814 C180.355848,95.0162833 165.999659,94.2187173 161.214263,95.0162833 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M55.1379822,85.4454911 C63.1136424,66.3039065 72.6844347,48.7574541 83.052793,36.7939637 C96.6114154,20.0450773 111.76517,11.271851 126.918924,11.271851 C142.072679,11.271851 156.428867,20.0450773 170.785055,36.7939637 C181.153414,49.5550201 190.724206,66.3039065 198.699866,85.4454911 L198.699866,86.2430571 L197.9023,86.2430571 C194.712036,86.2430571 193.116904,85.4454911 189.92664,85.4454911 L189.92664,85.4454911 L189.92664,85.4454911 C181.153414,63.9112085 165.202093,36.7939637 145.262943,24.8304734 C138.882415,21.6402093 133.299452,19.2475113 126.918924,19.2475113 C120.538396,19.2475113 114.955434,20.8426433 108.574906,24.8304734 C88.6357551,35.9963977 73.4820007,63.9112085 63.9112085,85.4454911 L63.9112085,85.4454911 L63.9112085,85.4454911 C60.7209444,85.4454911 59.1258123,86.2430571 55.9355483,86.2430571 L55.1379822,86.2430571 L55.1379822,85.4454911 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M209.86579,147.655641 L203.485262,147.655641 L202.687696,147.655641 L202.687696,146.858075 C201.092564,130.906754 196.307168,113.360302 189.92664,95.8138493 L189.129074,94.2187173 L190.724206,94.2187173 C193.116904,94.2187173 195.509602,95.0162833 197.9023,95.0162833 L198.699866,95.0162833 L198.699866,95.8138493 C204.282828,113.360302 209.068224,131.70432 210.663356,146.858075 L210.663356,147.655641 L209.86579,147.655641 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M202.687696,108.574906 C201.092564,104.587076 200.294998,100.599245 198.699866,96.6114154 L198.699866,95.8138493 L197.9023,95.8138493 C195.509602,95.0162833 193.116904,95.0162833 190.724206,95.0162833 L189.129074,95.0162833 L189.92664,96.6114154 C191.521772,100.599245 192.319338,104.587076 193.91447,108.574906 C197.9023,107.77734 200.294998,107.77734 202.687696,108.574906 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M43.9720579,146.060509 C45.56719,130.906754 50.3525861,112.562736 55.9355483,95.0162833 L55.9355483,94.2187173 L56.7331143,94.2187173 C59.1258123,94.2187173 61.5185104,93.4211513 63.9112085,93.4211513 L65.5063405,93.4211513 L64.7087745,95.0162833 C58.3282463,112.562736 54.3404162,130.906754 51.9477181,146.060509 L51.9477181,146.858075 L51.1501521,146.858075 L44.769624,146.858075 L43.9720579,146.858075 L43.9720579,146.060509 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M56.7331143,95.0162833 L56.7331143,95.0162833 L56.7331143,95.0162833 C54.3404162,99.8016794 53.5428502,103.78951 51.9477181,107.77734 C55.9355483,106.979774 57.5306803,106.979774 60.7209444,106.979774 C62.3160764,102.991944 63.1136424,99.0041134 64.7087745,95.0162833 L65.5063405,93.4211513 L63.9112085,93.4211513 C61.5185104,94.2187173 59.1258123,95.0162833 56.7331143,95.0162833 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M126.918924,251.339224 C114.955434,251.339224 102.991944,248.946525 91.8260192,244.161129 C80.6600949,239.375733 71.0893027,232.995205 63.1136424,224.221979 C55.1379822,215.448753 48.7574541,205.87796 43.9720579,194.712036 C39.1866618,183.546112 37.5915298,170.785055 37.5915298,158.023999 L37.5915298,157.226433 L38.3890958,157.226433 L45.56719,157.226433 L46.364756,157.226433 L46.364756,158.023999 C45.56719,169.987489 47.959888,180.355848 51.9477181,191.521772 C55.9355483,201.89013 61.5185104,210.663356 68.6966046,218.639017 C75.8746988,226.614677 85.4454911,232.995205 95.0162833,236.983035 C105.384642,241.768431 115.753,243.363563 126.918924,243.363563 C138.084848,243.363563 149.250773,240.970865 158.821565,236.983035 C168.392357,232.995205 177.96315,226.614677 185.141244,218.639017 C192.319338,210.663356 198.699866,201.89013 201.89013,191.521772 C205.87796,181.153414 207.473092,169.987489 207.473092,158.023999 L207.473092,157.226433 L208.270658,157.226433 L215.448753,157.226433 L216.246319,157.226433 L216.246319,158.023999 C217.043885,170.785055 214.651187,182.748546 209.86579,194.712036 C205.87796,205.87796 199.497432,215.448753 190.724206,224.221979 C182.748546,232.995205 172.380187,239.375733 162.011829,244.161129 C151.643471,248.148959 139.679981,251.339224 126.918924,251.339224 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M46.364756,168.392357 L46.364756,158.023999 L46.364756,157.226433 L45.56719,157.226433 L38.3890958,157.226433 L37.5915298,157.226433 L37.5915298,158.023999 L37.5915298,168.392357 L37.5915298,168.392357 L46.364756,168.392357 L46.364756,168.392357 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M216.246319,157.226433 L216.246319,157.226433 L209.068224,157.226433 L208.270658,157.226433 L208.270658,158.023999 L208.270658,168.392357 L216.246319,168.392357 L216.246319,157.226433 L216.246319,157.226433 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M221.031715,164.404527 C202.687696,164.404527 185.93881,159.619131 169.987489,155.631301 C162.011829,153.238603 154.833735,149.250773 149.250773,146.858075 L149.250773,146.060509 C135.69215,139.679981 134.894584,125.323792 135.69215,113.360302 C135.69215,110.170038 134.894584,106.182208 131.70432,103.78951 C130.109188,102.991944 128.514056,102.194378 126.918924,102.194378 C125.323792,102.194378 122.931094,102.991944 122.133528,103.78951 C118.943264,106.182208 118.145698,110.170038 118.145698,113.360302 C119.74083,125.323792 118.943264,138.882415 104.587076,145.262943 L104.587076,145.262943 C99.0041134,147.655641 91.8260192,153.238603 83.850359,155.631301 C67.8990386,159.619131 51.1501521,164.404527 32.8061336,164.404527 L32.8061336,164.404527 C25.6280394,164.404527 19.2475113,157.226433 17.6523792,150.048339 C15.2596811,139.679981 11.271851,122.931094 11.271851,108.574906 C11.271851,102.991944 14.4621151,96.6114154 20.0450773,94.2187173 C39.1866618,85.4454911 78.2673969,82.255227 95.0162833,82.255227 C101.396811,82.255227 106.182208,84.647925 110.170038,88.6357551 C115.753,86.2430571 121.335962,84.647925 126.918924,84.647925 C132.501886,84.647925 138.084848,86.2430571 143.667811,88.6357551 C146.858075,85.4454911 151.643471,82.255227 158.821565,82.255227 C168.392357,82.255227 211.460922,83.850359 233.792771,93.4211513 C239.375733,95.8138493 242.565997,101.396811 242.565997,106.979774 C241.768431,121.335962 238.578167,139.679981 236.185469,150.048339 C234.590337,157.226433 228.209809,164.404527 221.031715,164.404527 L221.031715,164.404527 Z M161.214263,95.0162833 C153.238603,95.0162833 151.643471,102.194378 150.845905,102.991944 C150.048339,106.979774 149.250773,113.360302 148.453207,120.538396 C148.453207,126.918924 150.845905,131.70432 155.631301,134.097018 C173.177753,142.072679 193.91447,146.060509 217.841451,146.060509 C219.436583,146.060509 221.031715,144.465377 221.829281,142.870245 C224.221979,134.097018 227.412243,120.538396 227.412243,107.77734 C227.412243,106.979774 226.614677,105.384642 225.817111,105.384642 C210.663356,97.4089814 174.772885,95.0162833 161.214263,95.0162833 Z M27.2231715,105.384642 C26.4256055,106.182208 25.6280394,106.979774 25.6280394,107.77734 C25.6280394,120.538396 28.8183035,134.097018 31.2110016,142.870245 C32.0085676,144.465377 33.6036996,146.060509 35.1988317,146.060509 C59.9233784,146.060509 79.8625289,142.072679 97.4089814,134.097018 C102.194378,131.70432 104.587076,126.918924 104.587076,120.538396 C104.587076,114.955434 103.78951,109.372472 102.194378,102.991944 C102.194378,101.396811 100.599245,95.0162833 91.8260192,95.0162833 C85.4454911,95.0162833 46.364756,96.6114154 27.2231715,105.384642 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t/></g\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t></svg\\n\\t\\t\\t\\t\\t\\t\\t\\t></a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t\\t<a href=\\"http://egghead.io/instructors/matias-francisco-hernandez-arellano?af=4cexzz\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t<img src={escuelaFrontend} alt=\\"Escuela frontend logo\\" width=\\"40\\" height=\\"40\\" />\\n\\t\\t\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t\\t\\t\\t<a href=\\"https://github.com/matiasfha\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t<svg width=\\"40px\\" height=\\"40px\\" viewBox=\\"0 0 1024 1024\\" fill=\\"none\\" id=\\"githubLogo\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t><path\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill-rule=\\"evenodd\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tclip-rule=\\"evenodd\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\td=\\"M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\ttransform=\\"scale(64)\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#1B1F23\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t/></svg\\n\\t\\t\\t\\t\\t\\t\\t\\t></a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t\\t<div class=\\"col-span-2 mt-20 md:col-start-7 md:row-start-1 md:mt-0\\">\\n\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t<div class=\\"text-lg font-medium text-black dark:text-white\\">Contact</div>\\n\\t\\t\\t\\t\\t<ul class=\\"mt-4 text-gray-900 dark:text-white\\">\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Contact page</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Consulting & Mentoring</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Ask Me Anything</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t</ul>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<div\\n\\t\\t\\t\\tclass=\\"col-span-full mt-20 md:col-span-2 col-start-9 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:ml-56 lg:mt-0\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t<div class=\\"text-lg font-medium text-black dark:text-white\\">Sitemap</div>\\n\\t\\t\\t\\t\\t<ul class=\\"mt-4 text-gray-900 dark:text-white\\">\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Home</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/blog\\">Blog</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Podcast</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Art\xEDculos</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Cursos</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Workshops</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Newsletter</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t\\t<li class=\\"py-1\\">\\n\\t\\t\\t\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\t\\t\\t\\tclass=\\"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none\\"\\n\\t\\t\\t\\t\\t\\t\\t\\thref=\\"/\\">Sobre M\xED</a\\n\\t\\t\\t\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t\\t</li>\\n\\t\\t\\t\\t\\t</ul>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<div class=\\"col-span-full mt-24 dark:text-blueGray-500 text-gray-500 text-lg md:mt-44\\">\\n\\t\\t\\t\\t<span>All rights reserved</span>\\n\\t\\t\\t\\t<span class=\\"block md:inline\\">\xA9 Mat\xEDas Hern\xE1ndez 2021</span>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</div>\\n</footer>\\n\\n<style>#githubLogo{transform:invert(-1)}</style>\\n"],"names":[],"mappings":"AAoNO,0BAAW,CAAC,UAAU,OAAO,EAAE,CAAC,CAAC"}`
};
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$7);
  return `<footer class="${"pb-16 mt-32 pt-32 border-t border-gray-200 dark:border-gray-800 px-10 bg-ebony-clay-600"}"><div class="${"relative"}"><div class="${"relative grid gap-x-4 grid-cols-4 md:grid-cols-8 lg:gap-x-6 lg:grid-cols-12 mx-auto max-w-8xl grid-rows-max-content"}"><div class="${"col-span-full md:col-span-3 lg:row-span-2"}"><div><div class="${"text-xl font-medium md:text-2xl text-black dark:text-white"}">Mat\xEDas Hern\xE1ndez
					</div>

					<div class="${"text-secondary flex items-center justify-between mt-6 lg:flex-col lg:items-start"}"><div class="${"flex space-x-4"}"><a href="${"https://twitter.com/matiasfha"}"><svg width="${"40px"}" height="${"40px"}" aria-hidden="${"true"}" focusable="${"false"}" data-prefix="${"fab"}" data-icon="${"twitter"}" class="${"svg-inline--fa fa-twitter fa-w-16 fa-3x"}" role="${"img"}" viewBox="${"0 0 512 512"}" aria-label="${"Link to twitter"}"><path fill="${"#49a1eb"}" d="${"M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"}"></path></svg></a>
							<a href="${"http://egghead.io/instructors/matias-francisco-hernandez-arellano?af=4cexzz"}"><svg width="${"40px"}" height="${"40px"}" viewBox="${"0 0 256 263"}" version="${"1.1"}" preserveAspectRatio="${"xMidYMid"}"><g><path d="${"M128,262.399221 C113.6,262.399221 100,259.208957 87.2,254.423561 C74.4,248.840599 63.2,241.662505 54.4,231.294146 C44.8,221.723354 37.6,210.55743 32.8,197.796373 C31.2,193.010977 29.6,188.225581 28,182.642619 L27.2,182.642619 L26.4,174.666959 C16.8,170.679129 9.6,161.108336 7.2,152.33511 C4,141.169186 0.8,124.420299 0,109.266545 C0,97.3030546 6.4,86.1371303 17.6,81.3517342 C24.8,78.1614701 35.2,74.971206 47.2,73.376074 C55.2,56.6271875 64,41.4734331 73.6,30.3075088 C90.4,10.3683583 108.8,0 128,0 C147.2,0 165.6,10.3683583 182.4,30.3075088 C192,41.4734331 200.8,55.8296215 208,73.376074 C220,75.7687721 230.4,78.1614701 238.4,81.3517342 C249.6,86.1371303 256,97.3030546 256,109.266545 C255.2,126.812997 251.2,145.954582 248.8,153.132676 C246.4,162.703468 239.2,172.274261 229.6,175.464525 L228.8,183.440185 L228,183.440185 C227.2,188.225581 225.6,193.808543 223.2,198.593939 C218.4,211.354996 211.2,222.52092 201.6,232.091712 C192,241.662505 180.8,249.638165 168.8,255.221127 C156,260.006523 142.4,262.399221 128,262.399221 Z"}" fill="${"#FFFFFF"}"></path><path d="${"M126.918924,19.2475113 C172.380187,19.2475113 209.068224,116.550566 209.068224,162.011829 C209.068224,207.473092 172.380187,244.161129 126.918924,244.161129 C81.4576609,244.161129 44.769624,207.473092 44.769624,162.011829 C44.769624,116.550566 81.4576609,19.2475113 126.918924,19.2475113 Z"}" fill="${"#FCFBFA"}"></path><path d="${"M231.400073,97.4089814 L197.9023,109.372472 C197.9023,109.372472 202.687696,125.323792 203.485262,125.323792 L236.983035,121.335962 L231.400073,97.4089814 Z"}" fill="${"#252526"}"></path><path d="${"M23.2353414,97.4089814 L56.7331143,109.372472 C56.7331143,109.372472 51.9477181,125.323792 51.1501521,125.323792 L17.6523792,121.335962 L23.2353414,97.4089814 Z"}" fill="${"#252526"}"></path><path d="${"M92.6235853,95.0162833 C101.396811,95.0162833 102.991944,102.194378 102.991944,103.78951 C103.78951,108.574906 104.587076,114.955434 105.384642,121.335962 C105.384642,122.931094 105.384642,124.526226 104.587076,126.121358 C103.78951,122.133528 103.78951,118.145698 102.991944,114.157868 C102.991944,112.562736 100.599245,105.384642 92.6235853,105.384642 C87.8381891,105.384642 71.0893027,106.182208 55.1379822,108.574906 C55.9355483,104.587076 57.5306803,101.396811 59.1258123,97.4089814 C73.4820007,95.0162833 87.8381891,94.2187173 92.6235853,95.0162833 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M209.068224,158.023999 C179.558282,156.428867 154.036169,146.858075 148.453207,143.667811 C143.667811,141.275113 138.084848,137.287282 136.489716,126.121358 C135.69215,138.882415 138.084848,150.048339 149.250773,155.631301 C150.048339,156.428867 172.380187,166.797225 208.270658,169.189923 L208.270658,162.011829 C209.068224,160.416697 209.068224,158.821565 209.068224,158.023999 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M45.56719,158.023999 C75.0771328,156.428867 100.599245,146.858075 106.182208,143.667811 C110.967604,141.275113 116.550566,137.287282 118.145698,126.121358 C118.943264,138.882415 116.550566,150.048339 105.384642,155.631301 C104.587076,156.428867 82.255227,166.797225 46.364756,169.189923 L46.364756,162.011829 C45.56719,160.416697 45.56719,158.821565 45.56719,158.023999 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M161.214263,95.0162833 C152.441037,95.0162833 150.845905,102.194378 150.845905,103.78951 C150.048339,108.574906 149.250773,114.955434 148.453207,121.335962 C148.453207,122.931094 148.453207,124.526226 149.250773,126.121358 C150.048339,122.133528 150.048339,118.145698 150.845905,114.157868 C150.845905,112.562736 153.238603,105.384642 161.214263,105.384642 C165.999659,105.384642 182.748546,106.182208 198.699866,108.574906 C197.9023,104.587076 196.307168,101.396811 194.712036,97.4089814 C180.355848,95.0162833 165.999659,94.2187173 161.214263,95.0162833 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M55.1379822,85.4454911 C63.1136424,66.3039065 72.6844347,48.7574541 83.052793,36.7939637 C96.6114154,20.0450773 111.76517,11.271851 126.918924,11.271851 C142.072679,11.271851 156.428867,20.0450773 170.785055,36.7939637 C181.153414,49.5550201 190.724206,66.3039065 198.699866,85.4454911 L198.699866,86.2430571 L197.9023,86.2430571 C194.712036,86.2430571 193.116904,85.4454911 189.92664,85.4454911 L189.92664,85.4454911 L189.92664,85.4454911 C181.153414,63.9112085 165.202093,36.7939637 145.262943,24.8304734 C138.882415,21.6402093 133.299452,19.2475113 126.918924,19.2475113 C120.538396,19.2475113 114.955434,20.8426433 108.574906,24.8304734 C88.6357551,35.9963977 73.4820007,63.9112085 63.9112085,85.4454911 L63.9112085,85.4454911 L63.9112085,85.4454911 C60.7209444,85.4454911 59.1258123,86.2430571 55.9355483,86.2430571 L55.1379822,86.2430571 L55.1379822,85.4454911 Z"}" fill="${"#56555C"}"></path><path d="${"M209.86579,147.655641 L203.485262,147.655641 L202.687696,147.655641 L202.687696,146.858075 C201.092564,130.906754 196.307168,113.360302 189.92664,95.8138493 L189.129074,94.2187173 L190.724206,94.2187173 C193.116904,94.2187173 195.509602,95.0162833 197.9023,95.0162833 L198.699866,95.0162833 L198.699866,95.8138493 C204.282828,113.360302 209.068224,131.70432 210.663356,146.858075 L210.663356,147.655641 L209.86579,147.655641 Z"}" fill="${"#56555C"}"></path><path d="${"M202.687696,108.574906 C201.092564,104.587076 200.294998,100.599245 198.699866,96.6114154 L198.699866,95.8138493 L197.9023,95.8138493 C195.509602,95.0162833 193.116904,95.0162833 190.724206,95.0162833 L189.129074,95.0162833 L189.92664,96.6114154 C191.521772,100.599245 192.319338,104.587076 193.91447,108.574906 C197.9023,107.77734 200.294998,107.77734 202.687696,108.574906 Z"}" fill="${"#252526"}"></path><path d="${"M43.9720579,146.060509 C45.56719,130.906754 50.3525861,112.562736 55.9355483,95.0162833 L55.9355483,94.2187173 L56.7331143,94.2187173 C59.1258123,94.2187173 61.5185104,93.4211513 63.9112085,93.4211513 L65.5063405,93.4211513 L64.7087745,95.0162833 C58.3282463,112.562736 54.3404162,130.906754 51.9477181,146.060509 L51.9477181,146.858075 L51.1501521,146.858075 L44.769624,146.858075 L43.9720579,146.858075 L43.9720579,146.060509 Z"}" fill="${"#56555C"}"></path><path d="${"M56.7331143,95.0162833 L56.7331143,95.0162833 L56.7331143,95.0162833 C54.3404162,99.8016794 53.5428502,103.78951 51.9477181,107.77734 C55.9355483,106.979774 57.5306803,106.979774 60.7209444,106.979774 C62.3160764,102.991944 63.1136424,99.0041134 64.7087745,95.0162833 L65.5063405,93.4211513 L63.9112085,93.4211513 C61.5185104,94.2187173 59.1258123,95.0162833 56.7331143,95.0162833 Z"}" fill="${"#252526"}"></path><path d="${"M126.918924,251.339224 C114.955434,251.339224 102.991944,248.946525 91.8260192,244.161129 C80.6600949,239.375733 71.0893027,232.995205 63.1136424,224.221979 C55.1379822,215.448753 48.7574541,205.87796 43.9720579,194.712036 C39.1866618,183.546112 37.5915298,170.785055 37.5915298,158.023999 L37.5915298,157.226433 L38.3890958,157.226433 L45.56719,157.226433 L46.364756,157.226433 L46.364756,158.023999 C45.56719,169.987489 47.959888,180.355848 51.9477181,191.521772 C55.9355483,201.89013 61.5185104,210.663356 68.6966046,218.639017 C75.8746988,226.614677 85.4454911,232.995205 95.0162833,236.983035 C105.384642,241.768431 115.753,243.363563 126.918924,243.363563 C138.084848,243.363563 149.250773,240.970865 158.821565,236.983035 C168.392357,232.995205 177.96315,226.614677 185.141244,218.639017 C192.319338,210.663356 198.699866,201.89013 201.89013,191.521772 C205.87796,181.153414 207.473092,169.987489 207.473092,158.023999 L207.473092,157.226433 L208.270658,157.226433 L215.448753,157.226433 L216.246319,157.226433 L216.246319,158.023999 C217.043885,170.785055 214.651187,182.748546 209.86579,194.712036 C205.87796,205.87796 199.497432,215.448753 190.724206,224.221979 C182.748546,232.995205 172.380187,239.375733 162.011829,244.161129 C151.643471,248.148959 139.679981,251.339224 126.918924,251.339224 Z"}" fill="${"#56555C"}"></path><path d="${"M46.364756,168.392357 L46.364756,158.023999 L46.364756,157.226433 L45.56719,157.226433 L38.3890958,157.226433 L37.5915298,157.226433 L37.5915298,158.023999 L37.5915298,168.392357 L37.5915298,168.392357 L46.364756,168.392357 L46.364756,168.392357 Z"}" fill="${"#252526"}"></path><path d="${"M216.246319,157.226433 L216.246319,157.226433 L209.068224,157.226433 L208.270658,157.226433 L208.270658,158.023999 L208.270658,168.392357 L216.246319,168.392357 L216.246319,157.226433 L216.246319,157.226433 Z"}" fill="${"#252526"}"></path><path d="${"M221.031715,164.404527 C202.687696,164.404527 185.93881,159.619131 169.987489,155.631301 C162.011829,153.238603 154.833735,149.250773 149.250773,146.858075 L149.250773,146.060509 C135.69215,139.679981 134.894584,125.323792 135.69215,113.360302 C135.69215,110.170038 134.894584,106.182208 131.70432,103.78951 C130.109188,102.991944 128.514056,102.194378 126.918924,102.194378 C125.323792,102.194378 122.931094,102.991944 122.133528,103.78951 C118.943264,106.182208 118.145698,110.170038 118.145698,113.360302 C119.74083,125.323792 118.943264,138.882415 104.587076,145.262943 L104.587076,145.262943 C99.0041134,147.655641 91.8260192,153.238603 83.850359,155.631301 C67.8990386,159.619131 51.1501521,164.404527 32.8061336,164.404527 L32.8061336,164.404527 C25.6280394,164.404527 19.2475113,157.226433 17.6523792,150.048339 C15.2596811,139.679981 11.271851,122.931094 11.271851,108.574906 C11.271851,102.991944 14.4621151,96.6114154 20.0450773,94.2187173 C39.1866618,85.4454911 78.2673969,82.255227 95.0162833,82.255227 C101.396811,82.255227 106.182208,84.647925 110.170038,88.6357551 C115.753,86.2430571 121.335962,84.647925 126.918924,84.647925 C132.501886,84.647925 138.084848,86.2430571 143.667811,88.6357551 C146.858075,85.4454911 151.643471,82.255227 158.821565,82.255227 C168.392357,82.255227 211.460922,83.850359 233.792771,93.4211513 C239.375733,95.8138493 242.565997,101.396811 242.565997,106.979774 C241.768431,121.335962 238.578167,139.679981 236.185469,150.048339 C234.590337,157.226433 228.209809,164.404527 221.031715,164.404527 L221.031715,164.404527 Z M161.214263,95.0162833 C153.238603,95.0162833 151.643471,102.194378 150.845905,102.991944 C150.048339,106.979774 149.250773,113.360302 148.453207,120.538396 C148.453207,126.918924 150.845905,131.70432 155.631301,134.097018 C173.177753,142.072679 193.91447,146.060509 217.841451,146.060509 C219.436583,146.060509 221.031715,144.465377 221.829281,142.870245 C224.221979,134.097018 227.412243,120.538396 227.412243,107.77734 C227.412243,106.979774 226.614677,105.384642 225.817111,105.384642 C210.663356,97.4089814 174.772885,95.0162833 161.214263,95.0162833 Z M27.2231715,105.384642 C26.4256055,106.182208 25.6280394,106.979774 25.6280394,107.77734 C25.6280394,120.538396 28.8183035,134.097018 31.2110016,142.870245 C32.0085676,144.465377 33.6036996,146.060509 35.1988317,146.060509 C59.9233784,146.060509 79.8625289,142.072679 97.4089814,134.097018 C102.194378,131.70432 104.587076,126.918924 104.587076,120.538396 C104.587076,114.955434 103.78951,109.372472 102.194378,102.991944 C102.194378,101.396811 100.599245,95.0162833 91.8260192,95.0162833 C85.4454911,95.0162833 46.364756,96.6114154 27.2231715,105.384642 Z"}" fill="${"#252526"}"></path></g></svg></a>
							<a href="${"http://egghead.io/instructors/matias-francisco-hernandez-arellano?af=4cexzz"}"><img${add_attribute("src", escuelaFrontend, 0)} alt="${"Escuela frontend logo"}" width="${"40"}" height="${"40"}"></a>
							<a href="${"https://github.com/matiasfha"}"><svg width="${"40px"}" height="${"40px"}" viewBox="${"0 0 1024 1024"}" fill="${"none"}" id="${"githubLogo"}" class="${"svelte-1a9n1br"}"><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"}" transform="${"scale(64)"}" fill="${"#1B1F23"}"></path></svg></a></div></div></div></div>
			<div class="${"col-span-2 mt-20 md:col-start-7 md:row-start-1 md:mt-0"}"><div><div class="${"text-lg font-medium text-black dark:text-white"}">Contact</div>
					<ul class="${"mt-4 text-gray-900 dark:text-white"}"><li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Contact page</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Consulting &amp; Mentoring</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Ask Me Anything</a></li></ul></div></div>

			<div class="${"col-span-full mt-20 md:col-span-2 col-start-9 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:ml-56 lg:mt-0"}"><div><div class="${"text-lg font-medium text-black dark:text-white"}">Sitemap</div>
					<ul class="${"mt-4 text-gray-900 dark:text-white"}"><li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Home</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/blog"}">Blog</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Podcast</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Art\xEDculos</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Cursos</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Workshops</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Newsletter</a></li>
						<li class="${"py-1"}"><a class="${"text-secondary hover:text-primary focus:text-primary underlined inline-block whitespace-nowrap text-lg focus:outline-none"}" href="${"/"}">Sobre M\xED</a></li></ul></div></div>

			<div class="${"col-span-full mt-24 dark:text-blueGray-500 text-gray-500 text-lg md:mt-44"}"><span>All rights reserved</span>
				<span class="${"block md:inline"}">\xA9 Mat\xEDas Hern\xE1ndez 2021</span></div></div></div>
</footer>`;
});
var css$6 = {
  code: "button.svelte-1sxrfbn{background-color:#000;border-radius:9999px;border-width:0;color:#c4ac93;cursor:pointer;height:2.5rem;outline:2px solid transparent;outline-offset:2px;padding-left:.7rem;width:2.5rem}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\n\\timport '../app.postcss';\\n\\timport logo from '$lib/images/logo.png';\\n\\timport Footer from '$lib/components/Footer.svelte';\\n<\/script>\\n\\n<!-- Navbar -->\\n<div class=\\"px-10 pt-9 pb-4 lg:pt-12  border-b border-gray-100 dark:border-gray-800\\">\\n\\t<nav class=\\"dark:text-gray-50 text-gray-900 flex items-center justify-between mx-auto max-w-8xl\\">\\n\\t\\t<div class=\\"flex flex-row items-center gap-8 justify-between\\">\\n\\t\\t\\t<a href=\\"/\\">\\n\\t\\t\\t\\t<img src={logo} alt=\\"Matias Hern\xE1ndez Logo\\" width=\\"48\\" height=\\"48\\" />\\n\\t\\t\\t</a>\\n\\t\\t\\t<a\\n\\t\\t\\t\\tclass=\\"underlined block whitespace-nowrap text-2xl font-medium focus:outline-none transition\\"\\n\\t\\t\\t\\thref=\\"/\\"><h1>Matias Hern\xE1ndez</h1></a\\n\\t\\t\\t>\\n\\t\\t</div>\\n\\t\\t<ul class=\\"hidden lg:flex\\">\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Podcast</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/blog\\">Blog</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/blog\\">Art\xEDculos</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Cursos</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Workshops</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"https://microbytes.dev\\">newsletter</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Sobre M\xED</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li>\\n\\t\\t\\t\\t<button\\n\\t\\t\\t\\t\\tid=\\"dark-mode-toggler\\"\\n\\t\\t\\t\\t\\taria-label=\\"Switch to dark mode\\"\\n\\t\\t\\t\\t\\tclass=\\"css-1xg1y4o-ButtonToggler e5j3spd0\\"\\n\\t\\t\\t\\t\\t><svg\\n\\t\\t\\t\\t\\t\\tstroke=\\"currentColor\\"\\n\\t\\t\\t\\t\\t\\tfill=\\"none\\"\\n\\t\\t\\t\\t\\t\\tstroke-width=\\"2\\"\\n\\t\\t\\t\\t\\t\\tviewBox=\\"0 0 24 24\\"\\n\\t\\t\\t\\t\\t\\tstroke-linecap=\\"round\\"\\n\\t\\t\\t\\t\\t\\tstroke-linejoin=\\"round\\"\\n\\t\\t\\t\\t\\t\\theight=\\"1em\\"\\n\\t\\t\\t\\t\\t\\twidth=\\"1em\\"\\n\\t\\t\\t\\t\\t\\t><circle cx=\\"12\\" cy=\\"12\\" r=\\"5\\" /><line x1=\\"12\\" y1=\\"1\\" x2=\\"12\\" y2=\\"3\\" /><line\\n\\t\\t\\t\\t\\t\\t\\tx1=\\"12\\"\\n\\t\\t\\t\\t\\t\\t\\ty1=\\"21\\"\\n\\t\\t\\t\\t\\t\\t\\tx2=\\"12\\"\\n\\t\\t\\t\\t\\t\\t\\ty2=\\"23\\"\\n\\t\\t\\t\\t\\t\\t/><line x1=\\"4.22\\" y1=\\"4.22\\" x2=\\"5.64\\" y2=\\"5.64\\" /><line\\n\\t\\t\\t\\t\\t\\t\\tx1=\\"18.36\\"\\n\\t\\t\\t\\t\\t\\t\\ty1=\\"18.36\\"\\n\\t\\t\\t\\t\\t\\t\\tx2=\\"19.78\\"\\n\\t\\t\\t\\t\\t\\t\\ty2=\\"19.78\\"\\n\\t\\t\\t\\t\\t\\t/><line x1=\\"1\\" y1=\\"12\\" x2=\\"3\\" y2=\\"12\\" /><line x1=\\"21\\" y1=\\"12\\" x2=\\"23\\" y2=\\"12\\" /><line\\n\\t\\t\\t\\t\\t\\t\\tx1=\\"4.22\\"\\n\\t\\t\\t\\t\\t\\t\\ty1=\\"19.78\\"\\n\\t\\t\\t\\t\\t\\t\\tx2=\\"5.64\\"\\n\\t\\t\\t\\t\\t\\t\\ty2=\\"18.36\\"\\n\\t\\t\\t\\t\\t\\t/><line x1=\\"18.36\\" y1=\\"5.64\\" x2=\\"19.78\\" y2=\\"4.22\\" /></svg\\n\\t\\t\\t\\t\\t></button\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t</ul>\\n\\t</nav>\\n</div>\\n<main class=\\"relative mx-auto max-w-screen-lg\\">\\n\\t<slot />\\n</main>\\n\\n<Footer />\\n\\n<style>button{background-color:#000;border-radius:9999px;border-width:0;color:#c4ac93;cursor:pointer;height:2.5rem;outline:2px solid transparent;outline-offset:2px;padding-left:.7rem;width:2.5rem}</style>\\n"],"names":[],"mappings":"AAuGO,qBAAM,CAAC,iBAAiB,IAAI,CAAC,cAAc,MAAM,CAAC,aAAa,CAAC,CAAC,MAAM,OAAO,CAAC,OAAO,OAAO,CAAC,OAAO,MAAM,CAAC,QAAQ,GAAG,CAAC,KAAK,CAAC,WAAW,CAAC,eAAe,GAAG,CAAC,aAAa,KAAK,CAAC,MAAM,MAAM,CAAC"}`
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$6);
  return `
<div class="${"px-10 pt-9 pb-4 lg:pt-12  border-b border-gray-100 dark:border-gray-800"}"><nav class="${"dark:text-gray-50 text-gray-900 flex items-center justify-between mx-auto max-w-8xl"}"><div class="${"flex flex-row items-center gap-8 justify-between"}"><a href="${"/"}"><img${add_attribute("src", logo, 0)} alt="${"Matias Hern\xE1ndez Logo"}" width="${"48"}" height="${"48"}"></a>
			<a class="${"underlined block whitespace-nowrap text-2xl font-medium focus:outline-none transition"}" href="${"/"}"><h1>Matias Hern\xE1ndez</h1></a></div>
		<ul class="${"hidden lg:flex"}"><li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Podcast</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/blog"}">Blog</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/blog"}">Art\xEDculos</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Cursos</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Workshops</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"https://microbytes.dev"}">newsletter</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Sobre M\xED</a></li>
			<li><button id="${"dark-mode-toggler"}" aria-label="${"Switch to dark mode"}" class="${"css-1xg1y4o-ButtonToggler e5j3spd0 svelte-1sxrfbn"}"><svg stroke="${"currentColor"}" fill="${"none"}" stroke-width="${"2"}" viewBox="${"0 0 24 24"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" height="${"1em"}" width="${"1em"}"><circle cx="${"12"}" cy="${"12"}" r="${"5"}"></circle><line x1="${"12"}" y1="${"1"}" x2="${"12"}" y2="${"3"}"></line><line x1="${"12"}" y1="${"21"}" x2="${"12"}" y2="${"23"}"></line><line x1="${"4.22"}" y1="${"4.22"}" x2="${"5.64"}" y2="${"5.64"}"></line><line x1="${"18.36"}" y1="${"18.36"}" x2="${"19.78"}" y2="${"19.78"}"></line><line x1="${"1"}" y1="${"12"}" x2="${"3"}" y2="${"12"}"></line><line x1="${"21"}" y1="${"12"}" x2="${"23"}" y2="${"12"}"></line><line x1="${"4.22"}" y1="${"19.78"}" x2="${"5.64"}" y2="${"18.36"}"></line><line x1="${"18.36"}" y1="${"5.64"}" x2="${"19.78"}" y2="${"4.22"}"></line></svg></button></li></ul></nav></div>
<main class="${"relative mx-auto max-w-screen-lg"}">${slots.default ? slots.default({}) : ``}</main>

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load$2({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<pre>${escape2(error22.message)}</pre>



${error22.frame ? `<pre>${escape2(error22.frame)}</pre>` : ``}
${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load: load$2
});
var photo = "/_app/assets/photo.b6e79c2c.jpg";
var css$5 = {
  code: "#escuelafrontend.svelte-1pzzx9l,#githubLogo.svelte-1pzzx9l{filter:invert(1)}",
  map: `{"version":3,"file":"Hero.svelte","sources":["Hero.svelte"],"sourcesContent":["<script>\\n\\timport photo from '$lib/images/photo.jpg';\\n\\timport escuelaFrontend from '$lib/images/escuelafrontend.png';\\n<\/script>\\n\\n<div class=\\"flex flex-row items-center justify-between lg:min-h-[12rem] pb-12 lg:pb-24 pt-12\\">\\n\\t<div class=\\"pt-6 lg:flex lg:flex-col lg:h-full w-96\\">\\n\\t\\t<div class=\\"flex flex-auto flex-col\\" style=\\"opacity: 1;\\">\\n\\t\\t\\t<div style=\\"opacity: 1; transform: none;\\">\\n\\t\\t\\t\\t<h2 class=\\"leading-tight text-3xl md:text-4xl text-black dark:text-white\\">\\n\\t\\t\\t\\t\\tI'm build things and help devs to level up their careers\\n\\t\\t\\t\\t</h2>\\n\\t\\t\\t</div>\\n\\t\\t\\t<div\\n\\t\\t\\t\\tclass=\\"flex flex-col mt-14 space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0\\"\\n\\t\\t\\t\\tstyle=\\"opacity: 1; transform: none;\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<a href=\\"https://twitter.com/matiasfha\\"\\n\\t\\t\\t\\t\\t><svg\\n\\t\\t\\t\\t\\t\\twidth=\\"40px\\"\\n\\t\\t\\t\\t\\t\\theight=\\"40px\\"\\n\\t\\t\\t\\t\\t\\taria-hidden=\\"true\\"\\n\\t\\t\\t\\t\\t\\tfocusable=\\"false\\"\\n\\t\\t\\t\\t\\t\\tdata-prefix=\\"fab\\"\\n\\t\\t\\t\\t\\t\\tdata-icon=\\"twitter\\"\\n\\t\\t\\t\\t\\t\\tclass=\\"svg-inline--fa fa-twitter fa-w-16 fa-3x\\"\\n\\t\\t\\t\\t\\t\\trole=\\"img\\"\\n\\t\\t\\t\\t\\t\\tviewBox=\\"0 0 512 512\\"\\n\\t\\t\\t\\t\\t\\taria-label=\\"Link to twitter\\"\\n\\t\\t\\t\\t\\t\\t><path\\n\\t\\t\\t\\t\\t\\t\\tfill=\\"#49a1eb\\"\\n\\t\\t\\t\\t\\t\\t\\td=\\"M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z\\"\\n\\t\\t\\t\\t\\t\\t/></svg\\n\\t\\t\\t\\t\\t></a\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t<a href=\\"http://egghead.io/instructors/matias-francisco-hernandez-arellano?af=4cexzz\\"\\n\\t\\t\\t\\t\\t><svg\\n\\t\\t\\t\\t\\t\\twidth=\\"40px\\"\\n\\t\\t\\t\\t\\t\\theight=\\"40px\\"\\n\\t\\t\\t\\t\\t\\tviewBox=\\"0 0 256 263\\"\\n\\t\\t\\t\\t\\t\\tversion=\\"1.1\\"\\n\\t\\t\\t\\t\\t\\tpreserveAspectRatio=\\"xMidYMid\\"\\n\\t\\t\\t\\t\\t\\t><g\\n\\t\\t\\t\\t\\t\\t\\t><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M128,262.399221 C113.6,262.399221 100,259.208957 87.2,254.423561 C74.4,248.840599 63.2,241.662505 54.4,231.294146 C44.8,221.723354 37.6,210.55743 32.8,197.796373 C31.2,193.010977 29.6,188.225581 28,182.642619 L27.2,182.642619 L26.4,174.666959 C16.8,170.679129 9.6,161.108336 7.2,152.33511 C4,141.169186 0.8,124.420299 0,109.266545 C0,97.3030546 6.4,86.1371303 17.6,81.3517342 C24.8,78.1614701 35.2,74.971206 47.2,73.376074 C55.2,56.6271875 64,41.4734331 73.6,30.3075088 C90.4,10.3683583 108.8,0 128,0 C147.2,0 165.6,10.3683583 182.4,30.3075088 C192,41.4734331 200.8,55.8296215 208,73.376074 C220,75.7687721 230.4,78.1614701 238.4,81.3517342 C249.6,86.1371303 256,97.3030546 256,109.266545 C255.2,126.812997 251.2,145.954582 248.8,153.132676 C246.4,162.703468 239.2,172.274261 229.6,175.464525 L228.8,183.440185 L228,183.440185 C227.2,188.225581 225.6,193.808543 223.2,198.593939 C218.4,211.354996 211.2,222.52092 201.6,232.091712 C192,241.662505 180.8,249.638165 168.8,255.221127 C156,260.006523 142.4,262.399221 128,262.399221 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#FFFFFF\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M126.918924,19.2475113 C172.380187,19.2475113 209.068224,116.550566 209.068224,162.011829 C209.068224,207.473092 172.380187,244.161129 126.918924,244.161129 C81.4576609,244.161129 44.769624,207.473092 44.769624,162.011829 C44.769624,116.550566 81.4576609,19.2475113 126.918924,19.2475113 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#FCFBFA\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M231.400073,97.4089814 L197.9023,109.372472 C197.9023,109.372472 202.687696,125.323792 203.485262,125.323792 L236.983035,121.335962 L231.400073,97.4089814 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M23.2353414,97.4089814 L56.7331143,109.372472 C56.7331143,109.372472 51.9477181,125.323792 51.1501521,125.323792 L17.6523792,121.335962 L23.2353414,97.4089814 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M92.6235853,95.0162833 C101.396811,95.0162833 102.991944,102.194378 102.991944,103.78951 C103.78951,108.574906 104.587076,114.955434 105.384642,121.335962 C105.384642,122.931094 105.384642,124.526226 104.587076,126.121358 C103.78951,122.133528 103.78951,118.145698 102.991944,114.157868 C102.991944,112.562736 100.599245,105.384642 92.6235853,105.384642 C87.8381891,105.384642 71.0893027,106.182208 55.1379822,108.574906 C55.9355483,104.587076 57.5306803,101.396811 59.1258123,97.4089814 C73.4820007,95.0162833 87.8381891,94.2187173 92.6235853,95.0162833 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M209.068224,158.023999 C179.558282,156.428867 154.036169,146.858075 148.453207,143.667811 C143.667811,141.275113 138.084848,137.287282 136.489716,126.121358 C135.69215,138.882415 138.084848,150.048339 149.250773,155.631301 C150.048339,156.428867 172.380187,166.797225 208.270658,169.189923 L208.270658,162.011829 C209.068224,160.416697 209.068224,158.821565 209.068224,158.023999 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M45.56719,158.023999 C75.0771328,156.428867 100.599245,146.858075 106.182208,143.667811 C110.967604,141.275113 116.550566,137.287282 118.145698,126.121358 C118.943264,138.882415 116.550566,150.048339 105.384642,155.631301 C104.587076,156.428867 82.255227,166.797225 46.364756,169.189923 L46.364756,162.011829 C45.56719,160.416697 45.56719,158.821565 45.56719,158.023999 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M161.214263,95.0162833 C152.441037,95.0162833 150.845905,102.194378 150.845905,103.78951 C150.048339,108.574906 149.250773,114.955434 148.453207,121.335962 C148.453207,122.931094 148.453207,124.526226 149.250773,126.121358 C150.048339,122.133528 150.048339,118.145698 150.845905,114.157868 C150.845905,112.562736 153.238603,105.384642 161.214263,105.384642 C165.999659,105.384642 182.748546,106.182208 198.699866,108.574906 C197.9023,104.587076 196.307168,101.396811 194.712036,97.4089814 C180.355848,95.0162833 165.999659,94.2187173 161.214263,95.0162833 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#E0E0E0\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M55.1379822,85.4454911 C63.1136424,66.3039065 72.6844347,48.7574541 83.052793,36.7939637 C96.6114154,20.0450773 111.76517,11.271851 126.918924,11.271851 C142.072679,11.271851 156.428867,20.0450773 170.785055,36.7939637 C181.153414,49.5550201 190.724206,66.3039065 198.699866,85.4454911 L198.699866,86.2430571 L197.9023,86.2430571 C194.712036,86.2430571 193.116904,85.4454911 189.92664,85.4454911 L189.92664,85.4454911 L189.92664,85.4454911 C181.153414,63.9112085 165.202093,36.7939637 145.262943,24.8304734 C138.882415,21.6402093 133.299452,19.2475113 126.918924,19.2475113 C120.538396,19.2475113 114.955434,20.8426433 108.574906,24.8304734 C88.6357551,35.9963977 73.4820007,63.9112085 63.9112085,85.4454911 L63.9112085,85.4454911 L63.9112085,85.4454911 C60.7209444,85.4454911 59.1258123,86.2430571 55.9355483,86.2430571 L55.1379822,86.2430571 L55.1379822,85.4454911 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M209.86579,147.655641 L203.485262,147.655641 L202.687696,147.655641 L202.687696,146.858075 C201.092564,130.906754 196.307168,113.360302 189.92664,95.8138493 L189.129074,94.2187173 L190.724206,94.2187173 C193.116904,94.2187173 195.509602,95.0162833 197.9023,95.0162833 L198.699866,95.0162833 L198.699866,95.8138493 C204.282828,113.360302 209.068224,131.70432 210.663356,146.858075 L210.663356,147.655641 L209.86579,147.655641 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M202.687696,108.574906 C201.092564,104.587076 200.294998,100.599245 198.699866,96.6114154 L198.699866,95.8138493 L197.9023,95.8138493 C195.509602,95.0162833 193.116904,95.0162833 190.724206,95.0162833 L189.129074,95.0162833 L189.92664,96.6114154 C191.521772,100.599245 192.319338,104.587076 193.91447,108.574906 C197.9023,107.77734 200.294998,107.77734 202.687696,108.574906 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M43.9720579,146.060509 C45.56719,130.906754 50.3525861,112.562736 55.9355483,95.0162833 L55.9355483,94.2187173 L56.7331143,94.2187173 C59.1258123,94.2187173 61.5185104,93.4211513 63.9112085,93.4211513 L65.5063405,93.4211513 L64.7087745,95.0162833 C58.3282463,112.562736 54.3404162,130.906754 51.9477181,146.060509 L51.9477181,146.858075 L51.1501521,146.858075 L44.769624,146.858075 L43.9720579,146.858075 L43.9720579,146.060509 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M56.7331143,95.0162833 L56.7331143,95.0162833 L56.7331143,95.0162833 C54.3404162,99.8016794 53.5428502,103.78951 51.9477181,107.77734 C55.9355483,106.979774 57.5306803,106.979774 60.7209444,106.979774 C62.3160764,102.991944 63.1136424,99.0041134 64.7087745,95.0162833 L65.5063405,93.4211513 L63.9112085,93.4211513 C61.5185104,94.2187173 59.1258123,95.0162833 56.7331143,95.0162833 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M126.918924,251.339224 C114.955434,251.339224 102.991944,248.946525 91.8260192,244.161129 C80.6600949,239.375733 71.0893027,232.995205 63.1136424,224.221979 C55.1379822,215.448753 48.7574541,205.87796 43.9720579,194.712036 C39.1866618,183.546112 37.5915298,170.785055 37.5915298,158.023999 L37.5915298,157.226433 L38.3890958,157.226433 L45.56719,157.226433 L46.364756,157.226433 L46.364756,158.023999 C45.56719,169.987489 47.959888,180.355848 51.9477181,191.521772 C55.9355483,201.89013 61.5185104,210.663356 68.6966046,218.639017 C75.8746988,226.614677 85.4454911,232.995205 95.0162833,236.983035 C105.384642,241.768431 115.753,243.363563 126.918924,243.363563 C138.084848,243.363563 149.250773,240.970865 158.821565,236.983035 C168.392357,232.995205 177.96315,226.614677 185.141244,218.639017 C192.319338,210.663356 198.699866,201.89013 201.89013,191.521772 C205.87796,181.153414 207.473092,169.987489 207.473092,158.023999 L207.473092,157.226433 L208.270658,157.226433 L215.448753,157.226433 L216.246319,157.226433 L216.246319,158.023999 C217.043885,170.785055 214.651187,182.748546 209.86579,194.712036 C205.87796,205.87796 199.497432,215.448753 190.724206,224.221979 C182.748546,232.995205 172.380187,239.375733 162.011829,244.161129 C151.643471,248.148959 139.679981,251.339224 126.918924,251.339224 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#56555C\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M46.364756,168.392357 L46.364756,158.023999 L46.364756,157.226433 L45.56719,157.226433 L38.3890958,157.226433 L37.5915298,157.226433 L37.5915298,158.023999 L37.5915298,168.392357 L37.5915298,168.392357 L46.364756,168.392357 L46.364756,168.392357 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M216.246319,157.226433 L216.246319,157.226433 L209.068224,157.226433 L208.270658,157.226433 L208.270658,158.023999 L208.270658,168.392357 L216.246319,168.392357 L216.246319,157.226433 L216.246319,157.226433 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/><path\\n\\t\\t\\t\\t\\t\\t\\t\\td=\\"M221.031715,164.404527 C202.687696,164.404527 185.93881,159.619131 169.987489,155.631301 C162.011829,153.238603 154.833735,149.250773 149.250773,146.858075 L149.250773,146.060509 C135.69215,139.679981 134.894584,125.323792 135.69215,113.360302 C135.69215,110.170038 134.894584,106.182208 131.70432,103.78951 C130.109188,102.991944 128.514056,102.194378 126.918924,102.194378 C125.323792,102.194378 122.931094,102.991944 122.133528,103.78951 C118.943264,106.182208 118.145698,110.170038 118.145698,113.360302 C119.74083,125.323792 118.943264,138.882415 104.587076,145.262943 L104.587076,145.262943 C99.0041134,147.655641 91.8260192,153.238603 83.850359,155.631301 C67.8990386,159.619131 51.1501521,164.404527 32.8061336,164.404527 L32.8061336,164.404527 C25.6280394,164.404527 19.2475113,157.226433 17.6523792,150.048339 C15.2596811,139.679981 11.271851,122.931094 11.271851,108.574906 C11.271851,102.991944 14.4621151,96.6114154 20.0450773,94.2187173 C39.1866618,85.4454911 78.2673969,82.255227 95.0162833,82.255227 C101.396811,82.255227 106.182208,84.647925 110.170038,88.6357551 C115.753,86.2430571 121.335962,84.647925 126.918924,84.647925 C132.501886,84.647925 138.084848,86.2430571 143.667811,88.6357551 C146.858075,85.4454911 151.643471,82.255227 158.821565,82.255227 C168.392357,82.255227 211.460922,83.850359 233.792771,93.4211513 C239.375733,95.8138493 242.565997,101.396811 242.565997,106.979774 C241.768431,121.335962 238.578167,139.679981 236.185469,150.048339 C234.590337,157.226433 228.209809,164.404527 221.031715,164.404527 L221.031715,164.404527 Z M161.214263,95.0162833 C153.238603,95.0162833 151.643471,102.194378 150.845905,102.991944 C150.048339,106.979774 149.250773,113.360302 148.453207,120.538396 C148.453207,126.918924 150.845905,131.70432 155.631301,134.097018 C173.177753,142.072679 193.91447,146.060509 217.841451,146.060509 C219.436583,146.060509 221.031715,144.465377 221.829281,142.870245 C224.221979,134.097018 227.412243,120.538396 227.412243,107.77734 C227.412243,106.979774 226.614677,105.384642 225.817111,105.384642 C210.663356,97.4089814 174.772885,95.0162833 161.214263,95.0162833 Z M27.2231715,105.384642 C26.4256055,106.182208 25.6280394,106.979774 25.6280394,107.77734 C25.6280394,120.538396 28.8183035,134.097018 31.2110016,142.870245 C32.0085676,144.465377 33.6036996,146.060509 35.1988317,146.060509 C59.9233784,146.060509 79.8625289,142.072679 97.4089814,134.097018 C102.194378,131.70432 104.587076,126.918924 104.587076,120.538396 C104.587076,114.955434 103.78951,109.372472 102.194378,102.991944 C102.194378,101.396811 100.599245,95.0162833 91.8260192,95.0162833 C85.4454911,95.0162833 46.364756,96.6114154 27.2231715,105.384642 Z\\"\\n\\t\\t\\t\\t\\t\\t\\t\\tfill=\\"#252526\\"\\n\\t\\t\\t\\t\\t\\t\\t/></g\\n\\t\\t\\t\\t\\t\\t></svg\\n\\t\\t\\t\\t\\t></a\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t<a href=\\"https://escuelafrontend.com\\">\\n\\t\\t\\t\\t\\t<img\\n\\t\\t\\t\\t\\t\\tsrc={escuelaFrontend}\\n\\t\\t\\t\\t\\t\\talt=\\"Escuela frontend logo\\"\\n\\t\\t\\t\\t\\t\\twidth=\\"40\\"\\n\\t\\t\\t\\t\\t\\theight=\\"40\\"\\n\\t\\t\\t\\t\\t\\tid=\\"escuelafrontend\\"\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t<a href=\\"https://github.com/matiasfha\\">\\n\\t\\t\\t\\t\\t<svg width=\\"40px\\" height=\\"40px\\" viewBox=\\"0 0 1024 1024\\" fill=\\"none\\" id=\\"githubLogo\\"\\n\\t\\t\\t\\t\\t\\t><path\\n\\t\\t\\t\\t\\t\\t\\tfill-rule=\\"evenodd\\"\\n\\t\\t\\t\\t\\t\\t\\tclip-rule=\\"evenodd\\"\\n\\t\\t\\t\\t\\t\\t\\td=\\"M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z\\"\\n\\t\\t\\t\\t\\t\\t\\ttransform=\\"scale(64)\\"\\n\\t\\t\\t\\t\\t\\t\\tfill=\\"#1B1F23\\"\\n\\t\\t\\t\\t\\t\\t/></svg\\n\\t\\t\\t\\t\\t></a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</div>\\n\\n\\t<div class=\\"mb-12 lg:mb-0 flex items-center justify-center\\">\\n\\t\\t<img\\n\\t\\t\\tclass=\\"h-auto object-contain max-h-72 rounded-full\\"\\n\\t\\t\\tsrc={photo}\\n\\t\\t\\talt=\\"Illistration of a mascot standing on a snowboard surrounded by green leaves, a battery, two skies, a one-wheel, a solar panel, and a recycle logo.\\"\\n\\t\\t\\tstyle=\\"opacity: 1; transform: none;\\"\\n\\t\\t/>\\n\\t</div>\\n</div>\\n\\n<style>#escuelafrontend,#githubLogo{filter:invert(1)}</style>\\n"],"names":[],"mappings":"AAoIO,+BAAgB,CAAC,0BAAW,CAAC,OAAO,OAAO,CAAC,CAAC,CAAC"}`
};
var Hero = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$5);
  return `<div class="${"flex flex-row items-center justify-between lg:min-h-[12rem] pb-12 lg:pb-24 pt-12"}"><div class="${"pt-6 lg:flex lg:flex-col lg:h-full w-96"}"><div class="${"flex flex-auto flex-col"}" style="${"opacity: 1;"}"><div style="${"opacity: 1; transform: none;"}"><h2 class="${"leading-tight text-3xl md:text-4xl text-black dark:text-white"}">I&#39;m build things and help devs to level up their careers
				</h2></div>
			<div class="${"flex flex-col mt-14 space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0"}" style="${"opacity: 1; transform: none;"}"><a href="${"https://twitter.com/matiasfha"}"><svg width="${"40px"}" height="${"40px"}" aria-hidden="${"true"}" focusable="${"false"}" data-prefix="${"fab"}" data-icon="${"twitter"}" class="${"svg-inline--fa fa-twitter fa-w-16 fa-3x"}" role="${"img"}" viewBox="${"0 0 512 512"}" aria-label="${"Link to twitter"}"><path fill="${"#49a1eb"}" d="${"M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"}"></path></svg></a>
				<a href="${"http://egghead.io/instructors/matias-francisco-hernandez-arellano?af=4cexzz"}"><svg width="${"40px"}" height="${"40px"}" viewBox="${"0 0 256 263"}" version="${"1.1"}" preserveAspectRatio="${"xMidYMid"}"><g><path d="${"M128,262.399221 C113.6,262.399221 100,259.208957 87.2,254.423561 C74.4,248.840599 63.2,241.662505 54.4,231.294146 C44.8,221.723354 37.6,210.55743 32.8,197.796373 C31.2,193.010977 29.6,188.225581 28,182.642619 L27.2,182.642619 L26.4,174.666959 C16.8,170.679129 9.6,161.108336 7.2,152.33511 C4,141.169186 0.8,124.420299 0,109.266545 C0,97.3030546 6.4,86.1371303 17.6,81.3517342 C24.8,78.1614701 35.2,74.971206 47.2,73.376074 C55.2,56.6271875 64,41.4734331 73.6,30.3075088 C90.4,10.3683583 108.8,0 128,0 C147.2,0 165.6,10.3683583 182.4,30.3075088 C192,41.4734331 200.8,55.8296215 208,73.376074 C220,75.7687721 230.4,78.1614701 238.4,81.3517342 C249.6,86.1371303 256,97.3030546 256,109.266545 C255.2,126.812997 251.2,145.954582 248.8,153.132676 C246.4,162.703468 239.2,172.274261 229.6,175.464525 L228.8,183.440185 L228,183.440185 C227.2,188.225581 225.6,193.808543 223.2,198.593939 C218.4,211.354996 211.2,222.52092 201.6,232.091712 C192,241.662505 180.8,249.638165 168.8,255.221127 C156,260.006523 142.4,262.399221 128,262.399221 Z"}" fill="${"#FFFFFF"}"></path><path d="${"M126.918924,19.2475113 C172.380187,19.2475113 209.068224,116.550566 209.068224,162.011829 C209.068224,207.473092 172.380187,244.161129 126.918924,244.161129 C81.4576609,244.161129 44.769624,207.473092 44.769624,162.011829 C44.769624,116.550566 81.4576609,19.2475113 126.918924,19.2475113 Z"}" fill="${"#FCFBFA"}"></path><path d="${"M231.400073,97.4089814 L197.9023,109.372472 C197.9023,109.372472 202.687696,125.323792 203.485262,125.323792 L236.983035,121.335962 L231.400073,97.4089814 Z"}" fill="${"#252526"}"></path><path d="${"M23.2353414,97.4089814 L56.7331143,109.372472 C56.7331143,109.372472 51.9477181,125.323792 51.1501521,125.323792 L17.6523792,121.335962 L23.2353414,97.4089814 Z"}" fill="${"#252526"}"></path><path d="${"M92.6235853,95.0162833 C101.396811,95.0162833 102.991944,102.194378 102.991944,103.78951 C103.78951,108.574906 104.587076,114.955434 105.384642,121.335962 C105.384642,122.931094 105.384642,124.526226 104.587076,126.121358 C103.78951,122.133528 103.78951,118.145698 102.991944,114.157868 C102.991944,112.562736 100.599245,105.384642 92.6235853,105.384642 C87.8381891,105.384642 71.0893027,106.182208 55.1379822,108.574906 C55.9355483,104.587076 57.5306803,101.396811 59.1258123,97.4089814 C73.4820007,95.0162833 87.8381891,94.2187173 92.6235853,95.0162833 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M209.068224,158.023999 C179.558282,156.428867 154.036169,146.858075 148.453207,143.667811 C143.667811,141.275113 138.084848,137.287282 136.489716,126.121358 C135.69215,138.882415 138.084848,150.048339 149.250773,155.631301 C150.048339,156.428867 172.380187,166.797225 208.270658,169.189923 L208.270658,162.011829 C209.068224,160.416697 209.068224,158.821565 209.068224,158.023999 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M45.56719,158.023999 C75.0771328,156.428867 100.599245,146.858075 106.182208,143.667811 C110.967604,141.275113 116.550566,137.287282 118.145698,126.121358 C118.943264,138.882415 116.550566,150.048339 105.384642,155.631301 C104.587076,156.428867 82.255227,166.797225 46.364756,169.189923 L46.364756,162.011829 C45.56719,160.416697 45.56719,158.821565 45.56719,158.023999 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M161.214263,95.0162833 C152.441037,95.0162833 150.845905,102.194378 150.845905,103.78951 C150.048339,108.574906 149.250773,114.955434 148.453207,121.335962 C148.453207,122.931094 148.453207,124.526226 149.250773,126.121358 C150.048339,122.133528 150.048339,118.145698 150.845905,114.157868 C150.845905,112.562736 153.238603,105.384642 161.214263,105.384642 C165.999659,105.384642 182.748546,106.182208 198.699866,108.574906 C197.9023,104.587076 196.307168,101.396811 194.712036,97.4089814 C180.355848,95.0162833 165.999659,94.2187173 161.214263,95.0162833 Z"}" fill="${"#E0E0E0"}"></path><path d="${"M55.1379822,85.4454911 C63.1136424,66.3039065 72.6844347,48.7574541 83.052793,36.7939637 C96.6114154,20.0450773 111.76517,11.271851 126.918924,11.271851 C142.072679,11.271851 156.428867,20.0450773 170.785055,36.7939637 C181.153414,49.5550201 190.724206,66.3039065 198.699866,85.4454911 L198.699866,86.2430571 L197.9023,86.2430571 C194.712036,86.2430571 193.116904,85.4454911 189.92664,85.4454911 L189.92664,85.4454911 L189.92664,85.4454911 C181.153414,63.9112085 165.202093,36.7939637 145.262943,24.8304734 C138.882415,21.6402093 133.299452,19.2475113 126.918924,19.2475113 C120.538396,19.2475113 114.955434,20.8426433 108.574906,24.8304734 C88.6357551,35.9963977 73.4820007,63.9112085 63.9112085,85.4454911 L63.9112085,85.4454911 L63.9112085,85.4454911 C60.7209444,85.4454911 59.1258123,86.2430571 55.9355483,86.2430571 L55.1379822,86.2430571 L55.1379822,85.4454911 Z"}" fill="${"#56555C"}"></path><path d="${"M209.86579,147.655641 L203.485262,147.655641 L202.687696,147.655641 L202.687696,146.858075 C201.092564,130.906754 196.307168,113.360302 189.92664,95.8138493 L189.129074,94.2187173 L190.724206,94.2187173 C193.116904,94.2187173 195.509602,95.0162833 197.9023,95.0162833 L198.699866,95.0162833 L198.699866,95.8138493 C204.282828,113.360302 209.068224,131.70432 210.663356,146.858075 L210.663356,147.655641 L209.86579,147.655641 Z"}" fill="${"#56555C"}"></path><path d="${"M202.687696,108.574906 C201.092564,104.587076 200.294998,100.599245 198.699866,96.6114154 L198.699866,95.8138493 L197.9023,95.8138493 C195.509602,95.0162833 193.116904,95.0162833 190.724206,95.0162833 L189.129074,95.0162833 L189.92664,96.6114154 C191.521772,100.599245 192.319338,104.587076 193.91447,108.574906 C197.9023,107.77734 200.294998,107.77734 202.687696,108.574906 Z"}" fill="${"#252526"}"></path><path d="${"M43.9720579,146.060509 C45.56719,130.906754 50.3525861,112.562736 55.9355483,95.0162833 L55.9355483,94.2187173 L56.7331143,94.2187173 C59.1258123,94.2187173 61.5185104,93.4211513 63.9112085,93.4211513 L65.5063405,93.4211513 L64.7087745,95.0162833 C58.3282463,112.562736 54.3404162,130.906754 51.9477181,146.060509 L51.9477181,146.858075 L51.1501521,146.858075 L44.769624,146.858075 L43.9720579,146.858075 L43.9720579,146.060509 Z"}" fill="${"#56555C"}"></path><path d="${"M56.7331143,95.0162833 L56.7331143,95.0162833 L56.7331143,95.0162833 C54.3404162,99.8016794 53.5428502,103.78951 51.9477181,107.77734 C55.9355483,106.979774 57.5306803,106.979774 60.7209444,106.979774 C62.3160764,102.991944 63.1136424,99.0041134 64.7087745,95.0162833 L65.5063405,93.4211513 L63.9112085,93.4211513 C61.5185104,94.2187173 59.1258123,95.0162833 56.7331143,95.0162833 Z"}" fill="${"#252526"}"></path><path d="${"M126.918924,251.339224 C114.955434,251.339224 102.991944,248.946525 91.8260192,244.161129 C80.6600949,239.375733 71.0893027,232.995205 63.1136424,224.221979 C55.1379822,215.448753 48.7574541,205.87796 43.9720579,194.712036 C39.1866618,183.546112 37.5915298,170.785055 37.5915298,158.023999 L37.5915298,157.226433 L38.3890958,157.226433 L45.56719,157.226433 L46.364756,157.226433 L46.364756,158.023999 C45.56719,169.987489 47.959888,180.355848 51.9477181,191.521772 C55.9355483,201.89013 61.5185104,210.663356 68.6966046,218.639017 C75.8746988,226.614677 85.4454911,232.995205 95.0162833,236.983035 C105.384642,241.768431 115.753,243.363563 126.918924,243.363563 C138.084848,243.363563 149.250773,240.970865 158.821565,236.983035 C168.392357,232.995205 177.96315,226.614677 185.141244,218.639017 C192.319338,210.663356 198.699866,201.89013 201.89013,191.521772 C205.87796,181.153414 207.473092,169.987489 207.473092,158.023999 L207.473092,157.226433 L208.270658,157.226433 L215.448753,157.226433 L216.246319,157.226433 L216.246319,158.023999 C217.043885,170.785055 214.651187,182.748546 209.86579,194.712036 C205.87796,205.87796 199.497432,215.448753 190.724206,224.221979 C182.748546,232.995205 172.380187,239.375733 162.011829,244.161129 C151.643471,248.148959 139.679981,251.339224 126.918924,251.339224 Z"}" fill="${"#56555C"}"></path><path d="${"M46.364756,168.392357 L46.364756,158.023999 L46.364756,157.226433 L45.56719,157.226433 L38.3890958,157.226433 L37.5915298,157.226433 L37.5915298,158.023999 L37.5915298,168.392357 L37.5915298,168.392357 L46.364756,168.392357 L46.364756,168.392357 Z"}" fill="${"#252526"}"></path><path d="${"M216.246319,157.226433 L216.246319,157.226433 L209.068224,157.226433 L208.270658,157.226433 L208.270658,158.023999 L208.270658,168.392357 L216.246319,168.392357 L216.246319,157.226433 L216.246319,157.226433 Z"}" fill="${"#252526"}"></path><path d="${"M221.031715,164.404527 C202.687696,164.404527 185.93881,159.619131 169.987489,155.631301 C162.011829,153.238603 154.833735,149.250773 149.250773,146.858075 L149.250773,146.060509 C135.69215,139.679981 134.894584,125.323792 135.69215,113.360302 C135.69215,110.170038 134.894584,106.182208 131.70432,103.78951 C130.109188,102.991944 128.514056,102.194378 126.918924,102.194378 C125.323792,102.194378 122.931094,102.991944 122.133528,103.78951 C118.943264,106.182208 118.145698,110.170038 118.145698,113.360302 C119.74083,125.323792 118.943264,138.882415 104.587076,145.262943 L104.587076,145.262943 C99.0041134,147.655641 91.8260192,153.238603 83.850359,155.631301 C67.8990386,159.619131 51.1501521,164.404527 32.8061336,164.404527 L32.8061336,164.404527 C25.6280394,164.404527 19.2475113,157.226433 17.6523792,150.048339 C15.2596811,139.679981 11.271851,122.931094 11.271851,108.574906 C11.271851,102.991944 14.4621151,96.6114154 20.0450773,94.2187173 C39.1866618,85.4454911 78.2673969,82.255227 95.0162833,82.255227 C101.396811,82.255227 106.182208,84.647925 110.170038,88.6357551 C115.753,86.2430571 121.335962,84.647925 126.918924,84.647925 C132.501886,84.647925 138.084848,86.2430571 143.667811,88.6357551 C146.858075,85.4454911 151.643471,82.255227 158.821565,82.255227 C168.392357,82.255227 211.460922,83.850359 233.792771,93.4211513 C239.375733,95.8138493 242.565997,101.396811 242.565997,106.979774 C241.768431,121.335962 238.578167,139.679981 236.185469,150.048339 C234.590337,157.226433 228.209809,164.404527 221.031715,164.404527 L221.031715,164.404527 Z M161.214263,95.0162833 C153.238603,95.0162833 151.643471,102.194378 150.845905,102.991944 C150.048339,106.979774 149.250773,113.360302 148.453207,120.538396 C148.453207,126.918924 150.845905,131.70432 155.631301,134.097018 C173.177753,142.072679 193.91447,146.060509 217.841451,146.060509 C219.436583,146.060509 221.031715,144.465377 221.829281,142.870245 C224.221979,134.097018 227.412243,120.538396 227.412243,107.77734 C227.412243,106.979774 226.614677,105.384642 225.817111,105.384642 C210.663356,97.4089814 174.772885,95.0162833 161.214263,95.0162833 Z M27.2231715,105.384642 C26.4256055,106.182208 25.6280394,106.979774 25.6280394,107.77734 C25.6280394,120.538396 28.8183035,134.097018 31.2110016,142.870245 C32.0085676,144.465377 33.6036996,146.060509 35.1988317,146.060509 C59.9233784,146.060509 79.8625289,142.072679 97.4089814,134.097018 C102.194378,131.70432 104.587076,126.918924 104.587076,120.538396 C104.587076,114.955434 103.78951,109.372472 102.194378,102.991944 C102.194378,101.396811 100.599245,95.0162833 91.8260192,95.0162833 C85.4454911,95.0162833 46.364756,96.6114154 27.2231715,105.384642 Z"}" fill="${"#252526"}"></path></g></svg></a>
				<a href="${"https://escuelafrontend.com"}"><img${add_attribute("src", escuelaFrontend, 0)} alt="${"Escuela frontend logo"}" width="${"40"}" height="${"40"}" id="${"escuelafrontend"}" class="${"svelte-1pzzx9l"}"></a>
				<a href="${"https://github.com/matiasfha"}"><svg width="${"40px"}" height="${"40px"}" viewBox="${"0 0 1024 1024"}" fill="${"none"}" id="${"githubLogo"}" class="${"svelte-1pzzx9l"}"><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"}" transform="${"scale(64)"}" fill="${"#1B1F23"}"></path></svg></a></div></div></div>

	<div class="${"mb-12 lg:mb-0 flex items-center justify-center"}"><img class="${"h-auto object-contain max-h-72 rounded-full"}"${add_attribute("src", photo, 0)} alt="${"Illistration of a mascot standing on a snowboard surrounded by green leaves, a battery, two skies, a one-wheel, a solar panel, and a recycle logo."}" style="${"opacity: 1; transform: none;"}"></div>
</div>`;
});
var Featured = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { image } = $$props;
  let { title } = $$props;
  let { meta } = $$props;
  let { description } = $$props;
  if ($$props.image === void 0 && $$bindings.image && image !== void 0)
    $$bindings.image(image);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.meta === void 0 && $$bindings.meta && meta !== void 0)
    $$bindings.meta(meta);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  return `<section class="${"mt-12"}"><h2 class="${"leading-tight text-2xl md:text-3xl mb-3 dark:text-white"}">Featured</h2>
	<div class="${"relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"}"><div class="${"relative z-10 px-5 sm:text-left text-center py-10"}"><div class="${"space-y-5 mx-auto flex items-center justify-center max-w-screen-xl w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"}"><div class="${"flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"}"><div class="${"col-span-1 max-w-lg"}"><img alt="${"Featured illustration"}"${add_attribute("src", image, 0)} decoding="${"async"}" class="${"object-contain rounded-lg "}"></div>
					<div class="${"flex flex-col col-span-2 lg:items-start items-center w-full"}"><h1 class="${"lg:text-3xl md:text-2xl sm:text-xl text-lg font-extrabold dark:text-white text-gray-800 leading-tight"}">${escape2(title)}</h1>
						<p class="${"my-4 font-medium opacity-75 font-body"}">${escape2(meta)}</p>
						<div class="${"max-w-screen-md font-body"}"><p>${escape2(description)}</p></div></div></div></div></div></div></section>`;
});
var microbytes = "/_app/assets/microbytes.e1663835.png";
async function load$1({ fetch: fetch2 }) {
  const url = "/api/cafecontech.json";
  const res = await fetch2(url);
  if (res.ok) {
    const episodes = await res.json();
    return {
      props: {
        cafeConTech: { episodes, latest: episodes[0] }
      }
    };
  }
  return {
    status: res.status,
    error: new Error(`Could not load ${url}`)
  };
}
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { cafeConTech } = $$props;
  if ($$props.cafeConTech === void 0 && $$bindings.cafeConTech && cafeConTech !== void 0)
    $$bindings.cafeConTech(cafeConTech);
  return `${validate_component(Hero, "Hero").$$render($$result, {}, {}, {})}

${validate_component(Featured, "Featured").$$render($$result, {
    image: "https://escuelafrontend.com/_next/image?url=%2Fimages%2Freact-icon-hero.svg&w=256&q=100",
    title: "React useEffect \xBFPor que el arreglo de dependencias es importante?",
    meta: "Workshop \xB7 S\xE1bado 7 de Agosto, 2021",
    description: "En este workshop, aprender\xE1s los fundamentos esenciales para empezar tu carrera profesional como un React developer. Cuando hayas terminado, tendr\xE1s los fundamentos 	esenciales para crear experiencias excelentes para los usuarios de tus aplicaciones."
  }, {}, {})}


<section class="${"mt-24"}"><h2 class="${"leading-tight text-2xl md:text-3xl mb-3 dark:text-white"}">Latest</h2>
	<div class="${"grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8"}"><div class="${"flex flex-col"}"><div class="${"md:mb-4 mb-2"}"><a class="${"group peer relative block w-full focus:outline-none"}" href="${"/blog/useeffect-vs-uselayouteffect"}"><div class="${"aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"}"><img alt="${"podcast"}" class="${"rounded-lg object-cover"}" src="${"https://matiashernandez.dev/static/ac0c22c494eadef3f1fc51305ceb9825/f3dec/hooks-3d62.png"}"></div>

					<div class="${"mt-8 text-gray-300 text-md font-medium lowercase text-body"}">Course</div>
					<div class="${"text-2xl font-medium md:text-3xl text-black dark:text-white mt-4"}">Construye Componentes Avanzados con React Hooks y Patrones de Dise\xF1o
					</div></a></div></div>
		<div class="${"flex flex-col"}"><div class="${"md:mb-4 mb-2"}"><a class="${"group peer relative block w-full focus:outline-none"}" href="${"/blog/useeffect-vs-uselayouteffect"}"><div class="${"aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"}"><img alt="${"podcast"}" class="${"rounded-lg object-cover"}"${add_attribute("src", cafeConTech.latest.itunes.image, 0)}></div>

					<div class="${"mt-8 text-gray-300 text-md font-medium lowercase text-body"}">${escape2(new Date(cafeConTech.latest.isoDate).toDateString())}</div>
					<div class="${"text-2xl font-medium md:text-3xl text-black dark:text-white mt-4"}">${escape2(cafeConTech.latest.title)}</div></a></div></div>
		<div class="${"flex flex-col"}"><div class="${"md:mb-4 mb-2"}"><a class="${"group peer relative block w-full focus:outline-none"}" href="${"https://h.matiashernandez.dev/4-habilidades-blandas-esenciales-para-un-desarrollador"}"><div class="${"aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"}"><img alt="${"Fijando expectativas"}" class="${"rounded-lg object-cover"}" src="${"https://h.matiashernandez.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fres%2Fhashnode%2Fimage%2Fupload%2Fv1620052739335%2FRyzHtZtdH.jpeg%3Fw%3D1600%26h%3D840%26fit%3Dcrop%26crop%3Dentropy%26auto%3Dcompress%2Cformat%26format%3Dwebp&w=3840&q=75"}"></div>
					<div class="${"mt-8 text-gray-300 text-md font-medium lowercase text-body"}">03 de Mayo, 2021
					</div>
					<div class="${"text-2xl font-medium md:text-3xl text-black dark:text-white mt-4"}">4 Habilidades Blandas Esenciales Para Un Desarrollador.
					</div></a></div></div>
		<div class="${"flex flex-col"}"><div class="${"md:mb-4 mb-2"}"><a class="${"group peer relative block w-full focus:outline-none"}" href="${"https://clevertech.biz/insights/why-we-choose-typescript-all-the-way-through"}"><div class="${"aspect-w-2 aspect-h-1 focus:ring w-full rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"}"><img alt="${"Typescript article"}" class="${"rounded-lg object-cover"}" src="${"https://clevertech-projectid-prod.s3.amazonaws.com/media/slack_imgs_599094f762.jpg"}"></div>
					<div class="${"mt-8 text-gray-300 text-md font-medium lowercase text-body"}"></div>
					<div class="${"text-2xl font-medium md:text-3xl text-black dark:text-white mt-4"}">Why we choose Typescript all the way through
					</div></a></div></div></div></section>


<section class="${"mt-24"}"><h2 class="${"text-xl sm:font-semibold font-bold mb-3 dark:text-white"}">Staff Picks and Favorites</h2>
	<div class="${"grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4"}"><div class="${"bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 ring-yellow-50 ring-offset-2"}"><a href="${"/"}" class="${"focus:outline-none"}"><div class="${"h-64 flex items-center justify-center mb-12"}"><img alt="${""}" aria-hidden="${"true"}" role="${"presentation"}" src="${"https://matiashernandez.dev/static/ac0c22c494eadef3f1fc51305ceb9825/f3dec/hooks-3d62.png"}" class="${"rounded-lg object-contain max-h-64"}"></div></a>
			<div><h3 class="${"text-xs text-green-600 dark:text-green-300 mb-2 mt-1 text-body"}">Curso</h3>
				<a href="${"/"}"><h2 class="${"text-lg font-bold leading-tighter py-3"}">Construye Componentes Avanzados con React Hooks y Patrones de Dise\xF1o
					</h2></a></div></div>
		<div class="${"bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 ring-yellow-50 ring-offset-2"}"><a href="${"https://draft.dev/learn/hugo-vs-gatsby"}"><div class="${"h-64 flex items-center justify-center mb-12"}"><img alt="${""}" aria-hidden="${"true"}" role="${"presentation"}" src="${"https://draft.dev/learn/assets/posts/c4f82d27.png"}" class="${"rounded-lg object-contain max-h-64"}"></div></a>
			<div><div><h3 class="${"text-xs text-green-600 dark:text-green-300 mb-2 mt-1"}">Article</h3>

					<a href="${"/playlists/build-a-corgi-up-boop-web-app-with-netlify-serverless-functions-and-hasura-553c"}"><h2 class="${"text-lg font-bold leading-tighter py-3"}">Roundup: Gatsby vs Hugo - Draft.dev
						</h2></a></div></div></div>
		<div class="${"bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-lg overflow-hidden p-5 text-center hover:ring-2 ring-yellow-50 ring-offset-2"}"><a href="${"https://www.cafecon.tech/1081172/8869619-testing-react-typescript-and-remix-with-kent-c-dodds"}"><div class="${"h-64 flex items-center justify-center mb-12"}"><img alt="${""}" aria-hidden="${"true"}" role="${"presentation"}" class="${"rounded-lg object-contain max-h-64"}" src="${"https://www.cafecon.tech/rails/active_storage/representations/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCRkpWZHdJPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--99a10b33c8ef56f3f4525e3160173ce5e89c850a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9VWTI5dFltbHVaVjl2Y0hScGIyNXpld282QzNKbGMybDZaVWtpRHpFME1EQjRNVFF3TUY0R09nWkZWRG9NWjNKaGRtbDBlVWtpQzJObGJuUmxjZ1k3QjFRNkMyVjRkR1Z1ZEVraURqRTBNREI0TVRRd01BWTdCMVE2REhGMVlXeHBkSGxwVlRvUFkyOXNiM0p6Y0dGalpVa2lDWE5TUjBJR093ZFUiLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--62cccdad7c2145af9102d69a13c480276ec82e2e/Art%20Work%20(1)%201-2.jpg"}"></div></a>
			<div><div><h3 class="${"text-xs text-green-600 dark:text-green-300 mb-2 mt-1"}">Podcast</h3>
					<a href="${"https://www.cafecon.tech/1081172/8869619-testing-react-typescript-and-remix-with-kent-c-dodds"}"><h2 class="${"text-lg font-bold leading-tighter py-3"}">Testing, React, Typescript and Remix with Kent C. Dodds
						</h2></a></div></div></div></div></section>

<section class="${"mt-24"}"><div class="${"relative flex items-center justify-center bg-white text-white overflow-hidden rounded-lg shadow-sm dark:bg-gray-800 focus:outline-none transition hover:ring-2 ring-yellow-50 ring-offset-2"}"><div class="${"relative z-10 px-5 sm:text-left text-center py-10"}"><div class="${"space-y-5 mx-auto flex flex-col items-center justify-center max-w-screen-xl lg:px-8 w-full sm:mb-4 md:my-12 lg:m-0 mt-0 mb-15"}"><div class="${"flex lg:flex-row flex-col items-center justify-center sm:space-x-10 sm:space-y-0 space-y-5 0 w-full xl:pr-16"}"><div class="${"flex-shrink-0"}"><img alt="${"illustration for React Desde Cero"}"${add_attribute("src", microbytes, 0)} decoding="${"async"}" class="${"object-contain"}"></div>
					<div class="${"flex flex-col lg:items-start items-center w-full"}"><h3 class="${"text-xs text-green-600 dark:text-green-300 uppercase font-semibold mb-2 font-body"}">Microcursos en tu inbox!
						</h3>
						<h1 class="${"lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-extrabold dark:text-white text-gray-800 leading-tight"}">\xBFA\xFAn luchas con Javascript y el desarrollo web?
						</h1>

						<div class="${"max-w-screen-md font-body"}"><p>\u200BUnete a Micro Bytes un newsletter semanal de micro cursos. Recibir\xE1s una colecci\xF3n
								de contenidos para mejorar tu conocimiento en desarrollo web y darle un giro a tu
								carrera, directamente en tu correo.
							</p></div></div></div>
				<div class="${"relative w-full"}"><form method="${"post"}" action="${"/TODO: set up action for newsletter"}" enctype="${"application/x-www-form-urlencoded"}" class="${"mt-8 space-y-4 w-full grid grid-cols-2 gap-4"}"><div class="${"flex flex-col gap-4"}"><input type="${"text"}" name="${"firstName"}" autocomplete="${"name"}" placeholder="${"First name"}" aria-label="${"First name"}" class="${"border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"}">
							<input type="${"email"}" name="${"email"}" autocomplete="${"email"}" placeholder="${"email"}" aria-label="${"email"}" class="${"border-secondary hover:border-primary focus:border-primary focus:bg-secondary px-8 py-6 w-full dark:text-white bg-transparent border rounded-lg focus:outline-none"}" value="${""}"></div>
						<button type="${"submit"}" class="${"text-primary inline-flex items-center justify-self-end text-left font-medium focus:outline-none cursor-pointer transition pt-4"}"><span class="${"mr-8 text-xl font-medium"}">Sign me up</span>
							<div class="${"relative inline-flex flex-none items-center justify-center p-1 w-14 h-14"}"><div class="${"absolute text-gray-200 dark:text-gray-600"}"><svg width="${"60"}" height="${"60"}"><circle stroke="${"currentColor"}" stroke-width="${"2"}" fill="${"transparent"}" r="${"28"}" cx="${"30"}" cy="${"30"}"></circle><circle class="${"text-primary"}" stroke="${"currentColor"}" stroke-width="${"2"}" fill="${"transparent"}" r="${"28"}" cx="${"30"}" cy="${"30"}" style="${"stroke-dasharray: 175.929, 175.929; transform: rotate(-90deg); transform-origin: 30px 30px;"}" transform-origin="${"30px 30px"}" stroke-dashoffset="${"175.92918860102841"}"></circle></svg></div>
								<span style="${"transform: none;"}"><svg class="${"transform -rotate-90"}" width="${"32"}" height="${"32"}" viewBox="${"0 0 32 32"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M15.101 5.5V23.1094L9.40108 17.4095L8.14807 18.6619L15.9862 26.5L23.852 18.6342L22.5996 17.3817L16.8725 23.1094V5.5H15.101Z"}" fill="${"currentColor"}"></path></svg></span></div></button></form></div></div></div></div></section>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  load: load$1
});
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var prerender = true;
function load({ fetch: fetch2 }) {
  return __awaiter(this, void 0, void 0, function* () {
    const url = "/api/blog.json";
    const res = yield fetch2(url);
    if (res.ok) {
      const posts = yield res.json();
      return { props: { posts } };
    }
    return {
      status: res.status,
      error: new Error(`Could not load ${url}`)
    };
  });
}
var Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { posts } = $$props;
  if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
    $$bindings.posts(posts);
  return `${validate_component(Featured, "Featured").$$render($$result, {
    image: "https://res.cloudinary.com/matiasfha/image/upload/v1604323837/monirul-islam-shakil-31I2Mi1UuxQ-unsplash_kkerl8.jpg",
    title: "React useEffect \xBFPor que el arreglo de dependencias es importante?",
    meta: "Workshop \xB7 S\xE1bado 7 de Agosto, 2021",
    description: "En este workshop, aprender\xE1s los fundamentos esenciales para empezar tu carrera\n								profesional como un React developer. Cuando hayas terminado, tendr\xE1s los fundamentos\n								esenciales para crear experiencias excelentes para los usuarios de tus aplicaciones."
  }, {}, {})}

<section class="${"mt-12"}"><h2 class="${"leading-tight text-2xl md:text-3xl my-12 dark:text-white"}">Blog Posts</h2>
	<div class="${"grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-8"}">${each(posts, (post) => `<div class="${"flex flex-col"}"><div class="${"md:mb-4 mb-2"}"><a class="${"group peer relative block w-full focus:outline-none"}"${add_attribute("href", `/blog/post/${post.slug}`, 0)}><div class="${"aspect-w-2 aspect-h-1 h-1/4 rounded-lg transition group-hover:ring-2 ring-yellow-50 ring-offset-2"}"><img alt="${"podcast"}" class="${"rounded-lg object-cover"}"${add_attribute("src", post.banner, 0)} decoding="${"async"}"></div>

						<div class="${"mt-8 text-gray-300 text-md font-medium lowercase text-body"}">${escape2(new Date(post.date).toLocaleDateString())}</div>
						<h2 class="${"md:text-2xl text-xl font-bold leading-tighter text-black dark:text-white "}">${escape2(post.title)}
						</h2></a></div>
			</div>`)}</div></section>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Blog,
  prerender,
  load
});
var css$4 = {
  code: "button.svelte-1sxrfbn{background-color:#000;border-radius:9999px;border-width:0;color:#c4ac93;cursor:pointer;height:2.5rem;outline:2px solid transparent;outline-offset:2px;padding-left:.7rem;width:2.5rem}",
  map: `{"version":3,"file":"__layout.reset.svelte","sources":["__layout.reset.svelte"],"sourcesContent":["<script>\\n\\timport '../../../app.postcss';\\n\\timport logo from '$lib/images/logo.png';\\n\\timport Footer from '$lib/components/Footer.svelte';\\n<\/script>\\n\\n<!-- Navbar -->\\n<div class=\\"px-10 pt-6 absolute top-0 left-0 z-50\\">\\n\\t<nav class=\\"dark:text-gray-50 text-gray-900 flex items-center justify-between w-screen\\">\\n\\t\\t<div class=\\"flex flex-row items-center gap-8 justify-between\\">\\n\\t\\t\\t<a href=\\"/\\">\\n\\t\\t\\t\\t<img src={logo} alt=\\"Matias Hern\xE1ndez Logo\\" width=\\"48\\" height=\\"48\\" />\\n\\t\\t\\t</a>\\n\\t\\t\\t<a\\n\\t\\t\\t\\tclass=\\"underlined block whitespace-nowrap text-2xl font-medium focus:outline-none transition\\"\\n\\t\\t\\t\\thref=\\"/\\"><h1>Matias Hern\xE1ndez</h1></a\\n\\t\\t\\t>\\n\\t\\t</div>\\n\\t\\t<ul class=\\"hidden lg:flex pr-20\\">\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Podcast</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/blog\\">Blog</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/blog\\">Art\xEDculos</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Cursos</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Workshops</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"https://microbytes.dev\\">newsletter</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li class=\\"px-5 py-2\\">\\n\\t\\t\\t\\t<a\\n\\t\\t\\t\\t\\tclass=\\"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary\\"\\n\\t\\t\\t\\t\\thref=\\"/\\">Sobre M\xED</a\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t\\t<li>\\n\\t\\t\\t\\t<button\\n\\t\\t\\t\\t\\tid=\\"dark-mode-toggler\\"\\n\\t\\t\\t\\t\\taria-label=\\"Switch to dark mode\\"\\n\\t\\t\\t\\t\\tclass=\\"css-1xg1y4o-ButtonToggler e5j3spd0\\"\\n\\t\\t\\t\\t\\t><svg\\n\\t\\t\\t\\t\\t\\tstroke=\\"currentColor\\"\\n\\t\\t\\t\\t\\t\\tfill=\\"none\\"\\n\\t\\t\\t\\t\\t\\tstroke-width=\\"2\\"\\n\\t\\t\\t\\t\\t\\tviewBox=\\"0 0 24 24\\"\\n\\t\\t\\t\\t\\t\\tstroke-linecap=\\"round\\"\\n\\t\\t\\t\\t\\t\\tstroke-linejoin=\\"round\\"\\n\\t\\t\\t\\t\\t\\theight=\\"1em\\"\\n\\t\\t\\t\\t\\t\\twidth=\\"1em\\"\\n\\t\\t\\t\\t\\t\\t><circle cx=\\"12\\" cy=\\"12\\" r=\\"5\\" /><line x1=\\"12\\" y1=\\"1\\" x2=\\"12\\" y2=\\"3\\" /><line\\n\\t\\t\\t\\t\\t\\t\\tx1=\\"12\\"\\n\\t\\t\\t\\t\\t\\t\\ty1=\\"21\\"\\n\\t\\t\\t\\t\\t\\t\\tx2=\\"12\\"\\n\\t\\t\\t\\t\\t\\t\\ty2=\\"23\\"\\n\\t\\t\\t\\t\\t\\t/><line x1=\\"4.22\\" y1=\\"4.22\\" x2=\\"5.64\\" y2=\\"5.64\\" /><line\\n\\t\\t\\t\\t\\t\\t\\tx1=\\"18.36\\"\\n\\t\\t\\t\\t\\t\\t\\ty1=\\"18.36\\"\\n\\t\\t\\t\\t\\t\\t\\tx2=\\"19.78\\"\\n\\t\\t\\t\\t\\t\\t\\ty2=\\"19.78\\"\\n\\t\\t\\t\\t\\t\\t/><line x1=\\"1\\" y1=\\"12\\" x2=\\"3\\" y2=\\"12\\" /><line x1=\\"21\\" y1=\\"12\\" x2=\\"23\\" y2=\\"12\\" /><line\\n\\t\\t\\t\\t\\t\\t\\tx1=\\"4.22\\"\\n\\t\\t\\t\\t\\t\\t\\ty1=\\"19.78\\"\\n\\t\\t\\t\\t\\t\\t\\tx2=\\"5.64\\"\\n\\t\\t\\t\\t\\t\\t\\ty2=\\"18.36\\"\\n\\t\\t\\t\\t\\t\\t/><line x1=\\"18.36\\" y1=\\"5.64\\" x2=\\"19.78\\" y2=\\"4.22\\" /></svg\\n\\t\\t\\t\\t\\t></button\\n\\t\\t\\t\\t>\\n\\t\\t\\t</li>\\n\\t\\t</ul>\\n\\t</nav>\\n</div>\\n\\n<slot />\\n\\n<Footer />\\n\\n<style>button{background-color:#000;border-radius:9999px;border-width:0;color:#c4ac93;cursor:pointer;height:2.5rem;outline:2px solid transparent;outline-offset:2px;padding-left:.7rem;width:2.5rem}</style>\\n"],"names":[],"mappings":"AAsGO,qBAAM,CAAC,iBAAiB,IAAI,CAAC,cAAc,MAAM,CAAC,aAAa,CAAC,CAAC,MAAM,OAAO,CAAC,OAAO,OAAO,CAAC,OAAO,MAAM,CAAC,QAAQ,GAAG,CAAC,KAAK,CAAC,WAAW,CAAC,eAAe,GAAG,CAAC,aAAa,KAAK,CAAC,MAAM,MAAM,CAAC"}`
};
var _layout_reset = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$4);
  return `
<div class="${"px-10 pt-6 absolute top-0 left-0 z-50"}"><nav class="${"dark:text-gray-50 text-gray-900 flex items-center justify-between w-screen"}"><div class="${"flex flex-row items-center gap-8 justify-between"}"><a href="${"/"}"><img${add_attribute("src", logo, 0)} alt="${"Matias Hern\xE1ndez Logo"}" width="${"48"}" height="${"48"}"></a>
			<a class="${"underlined block whitespace-nowrap text-2xl font-medium focus:outline-none transition"}" href="${"/"}"><h1>Matias Hern\xE1ndez</h1></a></div>
		<ul class="${"hidden lg:flex pr-20"}"><li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Podcast</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/blog"}">Blog</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/blog"}">Art\xEDculos</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Cursos</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Workshops</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"https://microbytes.dev"}">newsletter</a></li>
			<li class="${"px-5 py-2"}"><a class="${"hover:text-primary underlined focus:text-primary block whitespace-nowrap text-lg font-medium focus:outline-none text-secondary"}" href="${"/"}">Sobre M\xED</a></li>
			<li><button id="${"dark-mode-toggler"}" aria-label="${"Switch to dark mode"}" class="${"css-1xg1y4o-ButtonToggler e5j3spd0 svelte-1sxrfbn"}"><svg stroke="${"currentColor"}" fill="${"none"}" stroke-width="${"2"}" viewBox="${"0 0 24 24"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" height="${"1em"}" width="${"1em"}"><circle cx="${"12"}" cy="${"12"}" r="${"5"}"></circle><line x1="${"12"}" y1="${"1"}" x2="${"12"}" y2="${"3"}"></line><line x1="${"12"}" y1="${"21"}" x2="${"12"}" y2="${"23"}"></line><line x1="${"4.22"}" y1="${"4.22"}" x2="${"5.64"}" y2="${"5.64"}"></line><line x1="${"18.36"}" y1="${"18.36"}" x2="${"19.78"}" y2="${"19.78"}"></line><line x1="${"1"}" y1="${"12"}" x2="${"3"}" y2="${"12"}"></line><line x1="${"21"}" y1="${"12"}" x2="${"23"}" y2="${"12"}"></line><line x1="${"4.22"}" y1="${"19.78"}" x2="${"5.64"}" y2="${"18.36"}"></line><line x1="${"18.36"}" y1="${"5.64"}" x2="${"19.78"}" y2="${"4.22"}"></line></svg></button></li></ul></nav></div>

${slots.default ? slots.default({}) : ``}

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var __layout_reset = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout_reset
});
var css$3 = {
  code: "div.svelte-16q1vu8{padding-top:57%;position:relative;width:100%}iframe.svelte-16q1vu8{height:100%;left:0;position:absolute;top:0;width:100%}",
  map: '{"version":3,"file":"EggheadLesson.svelte","sources":["EggheadLesson.svelte"],"sourcesContent":["<script>\\n\\texport let lessonId;\\n<\/script>\\n\\n<div class=\\"egghead-lesson-mdx-embed\\">\\n\\t<iframe\\n\\t\\tdata-testid=\\"egghead-lesson\\"\\n\\t\\ttitle={`egghead-${lessonId}`}\\n\\t\\tsrc={`https://egghead.io/lessons/${lessonId}/embed`}\\n\\t\\tframeBorder=\\"0\\"\\n\\t\\tallow=\\"autoplay; fullscreen\\"\\n\\t\\tallowFullScreen\\n\\t/>\\n</div>\\n\\n<style>div{padding-top:57%;position:relative;width:100%}iframe{height:100%;left:0;position:absolute;top:0;width:100%}</style>\\n"],"names":[],"mappings":"AAeO,kBAAG,CAAC,YAAY,GAAG,CAAC,SAAS,QAAQ,CAAC,MAAM,IAAI,CAAC,qBAAM,CAAC,OAAO,IAAI,CAAC,KAAK,CAAC,CAAC,SAAS,QAAQ,CAAC,IAAI,CAAC,CAAC,MAAM,IAAI,CAAC"}'
};
var EggheadLesson = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { lessonId } = $$props;
  if ($$props.lessonId === void 0 && $$bindings.lessonId && lessonId !== void 0)
    $$bindings.lessonId(lessonId);
  $$result.css.add(css$3);
  return `<div class="${"egghead-lesson-mdx-embed svelte-16q1vu8"}"><iframe data-testid="${"egghead-lesson"}"${add_attribute("title", `egghead-${lessonId}`, 0)}${add_attribute("src", `https://egghead.io/lessons/${lessonId}/embed`, 0)} frameborder="${"0"}" allow="${"autoplay; fullscreen"}" allowfullscreen class="${"svelte-16q1vu8"}"></iframe>
</div>`;
});
var css$2 = {
  code: "i.svelte-1yc3jt4,svg.svelte-1yc3jt4{display:inline-block}svg.svelte-1yc3jt4{vertical-align:middle}",
  map: '{"version":3,"file":"Quote.svelte","sources":["Quote.svelte"],"sourcesContent":["<aside\\n\\tclass=\\"text-lg border-l-4 border-blue-600 rounded italic bg-ebony-clay-600 text-gray-200 relative mt-4 mb-8 py-4 px-8\\"\\n>\\n\\t<div\\n\\t\\tclass=\\"text-blue-600 absolute top-0 left-0\\n  transform -translate-y-2/4 -translate-x-2/4\\n  rounded-full\\n  bg-blue-50\\n  p-2\\"\\n\\t>\\n\\t\\t<i fill=\\"currentColor\\">\\n\\t\\t\\t<svg\\n\\t\\t\\t\\tfill=\\"none\\"\\n\\t\\t\\t\\theight=\\"32\\"\\n\\t\\t\\t\\twidth=\\"32\\"\\n\\t\\t\\t\\tviewBox=\\"0 0 24 24\\"\\n\\t\\t\\t\\tstroke=\\"currentColor\\"\\n\\t\\t\\t\\tstroke-width=\\"2\\"\\n\\t\\t\\t\\tstroke-linecap=\\"round\\"\\n\\t\\t\\t\\tstroke-linejoin=\\"round\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<circle cx=\\"12\\" cy=\\"12\\" r=\\"10\\" />\\n\\t\\t\\t\\t<line x1=\\"12\\" y1=\\"16\\" x2=\\"12\\" y2=\\"12\\" />\\n\\t\\t\\t\\t<line x1=\\"12\\" y1=\\"8\\" x2=\\"12\\" y2=\\"8\\" />\\n\\t\\t\\t</svg>\\n\\t\\t</i>\\n\\t</div>\\n\\t<div>\\n\\t\\t<slot />\\n\\t</div>\\n</aside>\\n\\n<style>i,svg{display:inline-block}svg{vertical-align:middle}</style>\\n"],"names":[],"mappings":"AAgCO,gBAAC,CAAC,kBAAG,CAAC,QAAQ,YAAY,CAAC,kBAAG,CAAC,eAAe,MAAM,CAAC"}'
};
var Quote = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<aside class="${"text-lg border-l-4 border-blue-600 rounded italic bg-ebony-clay-600 text-gray-200 relative mt-4 mb-8 py-4 px-8"}"><div class="${"text-blue-600 absolute top-0 left-0\n  transform -translate-y-2/4 -translate-x-2/4\n  rounded-full\n  bg-blue-50\n  p-2"}"><i fill="${"currentColor"}" class="${"svelte-1yc3jt4"}"><svg fill="${"none"}" height="${"32"}" width="${"32"}" viewBox="${"0 0 24 24"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"svelte-1yc3jt4"}"><circle cx="${"12"}" cy="${"12"}" r="${"10"}"></circle><line x1="${"12"}" y1="${"16"}" x2="${"12"}" y2="${"12"}"></line><line x1="${"12"}" y1="${"8"}" x2="${"12"}" y2="${"8"}"></line></svg></i></div>
	<div>${slots.default ? slots.default({}) : ``}</div>
</aside>`;
});
function getOgImage({ text, tags }) {
  const imageConfig = [
    "w_1280",
    "h_669",
    "c_fill",
    "q_auto",
    "f_auto"
  ].join(",");
  const titleConfig = [
    "w_760",
    "c_fit",
    "co_rgb:FFFFFF",
    "g_south_west",
    "x_480",
    "y_254",
    `l_text:futura_64:${encodeURIComponent(text)}`
  ].join(",");
  const tagsConfig = [
    "w_760",
    "c_fit",
    "co_rgb:FFFFFF",
    "g_north_west",
    "x_480",
    "y_445",
    `l_text:futura_32:${encodeURIComponent(tags.map((t) => `#${t}`).join(" "))}`
  ].join(",");
  const url = [
    "https://res.cloudinary.com",
    "matiasfha",
    "image",
    "upload",
    imageConfig,
    titleConfig,
    tagsConfig,
    "social-card.jpg"
  ];
  return url.join("/");
}
var Seo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { description = void 0 } = $$props;
  let { keywords } = $$props;
  let { canonical = void 0 } = $$props;
  let { isBlogPost } = $$props;
  const slug = title.toLowerCase().split(" ").join("-");
  const image = getOgImage({ text: title, tags: keywords });
  const siteUrl = `https://matiashernandez.dev/blog/post/${slug || ""}`;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.keywords === void 0 && $$bindings.keywords && keywords !== void 0)
    $$bindings.keywords(keywords);
  if ($$props.canonical === void 0 && $$bindings.canonical && canonical !== void 0)
    $$bindings.canonical(canonical);
  if ($$props.isBlogPost === void 0 && $$bindings.isBlogPost && isBlogPost !== void 0)
    $$bindings.isBlogPost(isBlogPost);
  return `${$$result.head += `${$$result.title = `<title>${escape2(title)}</title>`, ""}<meta name="${"twitter:creator"}" content="${"https://twitter.com/matiasfha/"}" data-svelte="svelte-185gd70"><meta property="${"og:type"}"${add_attribute("content", isBlogPost ? "article" : "website", 0)} data-svelte="svelte-185gd70"><meta name="${"robots"}" content="${"index, follow"}" data-svelte="svelte-185gd70"><meta name="${"googlebot"}" content="${"index,follow"}" data-svelte="svelte-185gd70"><meta name="${"twitter:site"}"${add_attribute("content", siteUrl, 0)} data-svelte="svelte-185gd70">${description ? `<meta name="${"description"}"${add_attribute("content", description, 0)} data-svelte="svelte-185gd70">` : ``}${canonical ? `<link rel="${"canonial"}"${add_attribute("href", canonical, 0)} data-svelte="svelte-185gd70">` : ``}<meta name="${"keywords"}"${add_attribute("content", keywords.join(", "), 0)} data-svelte="svelte-185gd70"><meta property="${"og:title"}"${add_attribute("content", title, 0)} data-svelte="svelte-185gd70">${description ? `<meta property="${"og:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-185gd70">` : ``}${canonical ? `<meta property="${"og:url"}"${add_attribute("content", canonical, 0)} data-svelte="svelte-185gd70">` : ``}<meta property="${"og:image"}"${add_attribute("content", image, 0)} data-svelte="svelte-185gd70"><meta name="${"twitter:card"}" content="${"summary_large_image"}" data-svelte="svelte-185gd70"><meta name="${"twitter:title"}"${add_attribute("content", title, 0)} data-svelte="svelte-185gd70">${description ? `<meta name="${"twitter:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-185gd70">` : ``}<meta name="${"twitter:image"}"${add_attribute("content", image, 0)} data-svelte="svelte-185gd70">`, ""}`;
});
var css$1 = {
  code: '.post-header.svelte-11j33vu:after{background:#111;content:"";display:block;height:100%;left:0;mix-blend-mode:multiply;opacity:.85;position:absolute;top:0;transform:skew(-15deg,0deg);transform-origin:top left;width:60vw;z-index:5}',
  map: `{"version":3,"file":"PostLayout.svelte","sources":["PostLayout.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\timport { blockquote } from '$lib/components/typography/index';\\n\\timport Codesandbox from './mdx/Codesandbox.svelte';\\n\\timport EggheadLesson from './mdx/EggheadLesson.svelte';\\n\\texport { blockquote, Codesandbox, EggheadLesson };\\n<\/script>\\n\\n<script>\\n\\timport Seo from './Seo.svelte';\\n\\texport let banner;\\n\\texport let bannerCredit;\\n\\texport let title;\\n\\texport let description;\\n\\texport let keywords;\\n<\/script>\\n\\n<Seo {title} {description} {keywords} isBlogPost={true} />\\n<main class=\\"w-full pb-4\\">\\n\\t<header\\n\\t\\tclass=\\"post-header w-full bg-gray-900 flex items-start flex-col justify-center relative h-[32rem]\\"\\n\\t>\\n\\t\\t<img\\n\\t\\t\\tsrc={banner}\\n\\t\\t\\tclass=\\"object-cover w-full absolute top-0 left-0 z-0 max-h-96 filter blur-sm\\"\\n\\t\\t\\talt={title}\\n\\t\\t/>\\n\\t\\t<h1 class=\\"text-left text-gray-100 font-bold text-3xl max-w-4xl z-10 p-8 px-12\\">\\n\\t\\t\\t{title}\\n\\t\\t</h1>\\n\\t\\t<h3 class=\\"text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 px-12\\">\\n\\t\\t\\t{description}\\n\\t\\t</h3>\\n\\t\\t<h4\\n\\t\\t\\tclass=\\"text-left text-gray-100 font-body leading-tight text-sm max-w-4xl z-10 px-12 absolute bottom-2\\"\\n\\t\\t>\\n\\t\\t\\t{@html bannerCredit}\\n\\t\\t</h4>\\n\\t</header>\\n\\t<article class=\\"text-gray-100 py-12 mx-auto container max-w-6xl prose lg:prose-lg\\">\\n\\t\\t<slot />\\n\\t</article>\\n</main>\\n\\n<style>.post-header:after{background:#111;content:\\"\\";display:block;height:100%;left:0;mix-blend-mode:multiply;opacity:.85;position:absolute;top:0;transform:skew(-15deg,0deg);transform-origin:top left;width:60vw;z-index:5}</style>\\n"],"names":[],"mappings":"AA2CO,2BAAY,MAAM,CAAC,WAAW,IAAI,CAAC,QAAQ,EAAE,CAAC,QAAQ,KAAK,CAAC,OAAO,IAAI,CAAC,KAAK,CAAC,CAAC,eAAe,QAAQ,CAAC,QAAQ,GAAG,CAAC,SAAS,QAAQ,CAAC,IAAI,CAAC,CAAC,UAAU,KAAK,MAAM,CAAC,IAAI,CAAC,CAAC,iBAAiB,GAAG,CAAC,IAAI,CAAC,MAAM,IAAI,CAAC,QAAQ,CAAC,CAAC"}`
};
var PostLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { banner } = $$props;
  let { bannerCredit } = $$props;
  let { title } = $$props;
  let { description } = $$props;
  let { keywords } = $$props;
  if ($$props.banner === void 0 && $$bindings.banner && banner !== void 0)
    $$bindings.banner(banner);
  if ($$props.bannerCredit === void 0 && $$bindings.bannerCredit && bannerCredit !== void 0)
    $$bindings.bannerCredit(bannerCredit);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0)
    $$bindings.description(description);
  if ($$props.keywords === void 0 && $$bindings.keywords && keywords !== void 0)
    $$bindings.keywords(keywords);
  $$result.css.add(css$1);
  return `${validate_component(Seo, "Seo").$$render($$result, {
    title,
    description,
    keywords,
    isBlogPost: true
  }, {}, {})}
<main class="${"w-full pb-4"}"><header class="${"post-header w-full bg-gray-900 flex items-start flex-col justify-center relative h-[32rem] svelte-11j33vu"}"><img${add_attribute("src", banner, 0)} class="${"object-cover w-full absolute top-0 left-0 z-0 max-h-96 filter blur-sm"}"${add_attribute("alt", title, 0)}>
		<h1 class="${"text-left text-gray-100 font-bold text-3xl max-w-4xl z-10 p-8 px-12"}">${escape2(title)}</h1>
		<h3 class="${"text-left text-gray-100 font-body leading-tight text-lg max-w-4xl z-10 px-12"}">${escape2(description)}</h3>
		<h4 class="${"text-left text-gray-100 font-body leading-tight text-sm max-w-4xl z-10 px-12 absolute bottom-2"}"><!-- HTML_TAG_START -->${bannerCredit}<!-- HTML_TAG_END --></h4></header>
	<article class="${"text-gray-100 py-12 mx-auto container max-w-6xl prose lg:prose-lg"}">${slots.default ? slots.default({}) : ``}</article>
</main>`;
});
var metadata$n = {
  "date": "2020-08-11T03:13:59.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1597115954/andreas-gucklhorn-Ilpf2eUPpUE-unsplash_n8npgz.jpg",
  "keywords": [
    "Arreglos",
    "Array",
    "ES6",
    "Array.reduce",
    "Array.filter",
    "Remover duplicados",
    "egghead",
    "lesson",
    "tutorial"
  ],
  "tag": "Seed",
  "title": "4 formas de eliminar elementos duplicados en un arreglo con Javascript",
  "description": "Remover elementos duplicados de un arreglo es una tarea com\xFAn durante el desarrollo de software. Javascript ofrece varias formas de hacerlo y su elecci\xF3n depende del caso de uso.",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@draufsicht?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Andreas G\xFCcklhorn</a> on <a href="https://unsplash.com/collections/9718937/solar?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "favorite": true
};
var _4_formas_de_eliminar_elementos_duplicados_en_un_arreglo_con_javascript = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$n), {}, {
    default: () => `<p>La manipulaci\xF3n de arreglos es una de las tareas m\xE1s comunes y constantes a la hora de desarrollar una aplicaci\xF3n. Los arreglos son estructuras de datos b\xE1sicas en cualquier programa. Una de estas tareas de manipulaci\xF3n es la de remover elementos duplicados de un arreglo.
Javascript, por su naturaleza flexible, ofrece variadas formas de efectuar esta tarea y la elecci\xF3n de cu\xE1l utilizar corresponde tanto a la experiencia del desarrollador como al caso de uso.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h3 id="${"tldr-lecci\xF3n-en-video-en-egghead"}">TLDR Lecci\xF3n en video en <a href="${"https://egghead.io/lessons/javascript-4-formas-de-remover-elementos-duplicados-de-un-arreglo-con-javascript?pl=manipulacion-de-arreglos-con-javascript-12bd?af=4cexzz"}" rel="${"nofollow"}">egghead</a></h3>`
    })}
${validate_component(EggheadLesson, "EggheadLesson").$$render($$result, {
      lessonId: "javascript-4-formas-de-remover-elementos-duplicados-de-un-arreglo-con-javascript"
    }, {}, {})}
<h4 id="${"arrayfilter"}"><strong>Array.filter</strong></h4>
<p>Una de las formas m\xE1s directas de remover elementos de un arreglo es utilizar <code>Array.filter</code></p>
<p>Array.filter es un m\xE9todo inmutable que retorna un nuevo arreglo con los elementos que cumplan la condici\xF3n implementada por la funci\xF3n utilizada como argumento.</p>
<p>De forma interna, <code>filter</code> itera sobre los elementos del arreglo y aplica la funci\xF3n argumento en cada item retornando un valor _boolean, s_i el elemento pasa la condici\xF3n se retorna true indicando que este ser\xE1 agregado al nuevo arreglo.</p>
<p>Para este caso de remover elementos duplicados utilizamos como m\xE9todo auxiliar la funci\xF3n <code>Array.indexOf</code>. Este m\xE9todo retorna Array.indexOf retorna el primer indice del arreglo en donde se encuentre un elemento dado.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">let</span> data <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">6</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">5</span><span class="token punctuation">,</span><span class="token number">9</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> result <span class="token operator">=</span> data<span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">item<span class="token punctuation">,</span>index</span><span class="token punctuation">)</span><span class="token operator">=></span><span class="token punctuation">&#123;</span>
      <span class="token keyword">return</span> data<span class="token punctuation">.</span><span class="token function">indexOf</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span> <span class="token operator">===</span> index<span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//[1,2,6,5,9,'33']</span></code>`}<!-- HTML_TAG_END --></pre>
<p>En este caso, podemos identificar un duplicado cuando el indice no es igual al resultado de <code>indexOf</code>.
<code>data.indexOf(item) === index</code> ,retornar\xE1 siempre la primera ocurrencia del <code>item</code>.</p>
<h4 id="${"set"}"><strong>Set</strong></h4>
<p>El objeto global <strong>Set</strong> es una estructura de datos, una colecci\xF3n de valores que permite s\xF3lo almacenar valores \xFAnicos de cualquier tipo, incluso valores primitivos u referencias a objetos.</p>
<p>Es posible iterar sobre los elementos en el orden de inserci\xF3n.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">let</span> data <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">6</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">5</span><span class="token punctuation">,</span><span class="token number">9</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> dataArr <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> result <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token operator">...</span>dataArr<span class="token punctuation">]</span><span class="token punctuation">;</span>

    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//[1,2,6,5,9,'33']</span></code>`}<!-- HTML_TAG_END --></pre>
<p>El caso de utilizar <strong>Set</strong> para remover duplicados es bastante simple, creamos un nuevo <strong>Set</strong> basado en el arreglo original utilizando <em>new Set</em>.</p>
<p>Y finalmente puedes convertir el nuevo Set a un arreglo nuevamente utilizando la sintaxis spread.</p>
<p>Si eres un <em>\u201CComputer Science Junkie\u201D</em> o est\xE1s trabajando con grandes cantidades de datos es importante pensar en la performance de este m\xE9todo. Utilizar <strong>Set</strong> es un m\xE9todo de orden <em>O(nlogn)</em></p>
<h4 id="${"reduce"}"><strong>Reduce</strong></h4>
<p>El m\xE9todo <code>Array.reduce</code> tambi\xE9n puede ser utilizado con el mismo prop\xF3sito.</p>
<p><code>Array.reduce</code> ejecuta una funci\xF3n sobre cada elemento del arreglo y retorna un valor como un \xFAnico resultado. B\xE1sicamente permite transformar un arreglo a otro tipo de valor.</p>
<p><code>Array.reduce</code> recibe dos par\xE1metros, una funci\xF3n , llamada reductora, que tiene a lo menos dos argumentos: el acumulador y el item actual de la iteraci\xF3n y como segundo par\xE1metro que indica el valor inicial en este caso un arreglo vac\xEDo</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">let</span> data <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">6</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">5</span><span class="token punctuation">,</span><span class="token number">9</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> result <span class="token operator">=</span> data<span class="token punctuation">.</span><span class="token function">reduce</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">acc<span class="token punctuation">,</span>item</span><span class="token punctuation">)</span><span class="token operator">=></span><span class="token punctuation">&#123;</span>
      <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token operator">!</span>acc<span class="token punctuation">.</span><span class="token function">includes</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
      	acc<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">&#125;</span>
      <span class="token keyword">return</span> acc<span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span>

    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//[1,2,6,5,9,'33']</span></code>`}<!-- HTML_TAG_END --></pre>
<p>En este caso la funci\xF3n utilizada simplemente revisa si el item actual se encuentra dentro del resultado identificado por la variable <code>acc</code>, de no estarlo, simplemente agrega el valor al acumulador</p>
<h4 id="${"foreach-y-otros-loops"}"><strong>ForEach y otros loops</strong></h4>
<p><code>Array.forEach</code> es otra forma de iterar sobre el arreglo y como tal tambi\xE9n permite remover duplicados pero de una forma m\xE1s imperativa.</p>
<p>Aqu\xED es necesario utilizar un arreglo auxiliar para almacenar el resultado del proceso de filtrado</p>
<p>Al iterar sobre el arreglo se utiliza un bloque condicional que verifica que el item no exista ya dentro del arreglo de valores \xFAnicos utilizando <code>Array.includes</code>, que permite determinar si un elemento existe o no dentro del arreglo.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">
    <span class="token keyword">let</span> data <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">6</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">,</span><span class="token number">5</span><span class="token punctuation">,</span><span class="token number">9</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">,</span><span class="token string">'33'</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> result <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    data<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">item</span><span class="token punctuation">)</span><span class="token operator">=></span><span class="token punctuation">&#123;</span>
    	<span class="token comment">//pushes only unique element</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token operator">!</span>uniqueArr<span class="token punctuation">.</span><span class="token function">includes</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
    		uniqueArr<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span><span class="token punctuation">;</span>
    	<span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//[1,2,6,5,9,'33']</span></code>`}<!-- HTML_TAG_END --></pre>
<p><code>Array.forEach </code>al igual que cualquier otro m\xE9todo de iteraci\xF3n directa es una forma imperativa y es de baja performance dado que requiere iterar varias veces sobre el mismo elemento - <code>Array.includes</code> tambi\xE9n itera sobre los elementos - por lo que es de orden O(n\xB2).</p>
<p>En resumen las opciones para eliminar duplicado son variadas pero se sustenan en la misma premisa. El uso de iteraciones para corroborar si un elemente ya existe o no, y el uso de estructuras de datos m\xE1s complejas como Set.</p>`
  })}`;
});
var _4FormasDeEliminarElementosDuplicadosEnUnArregloConJavascript = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _4_formas_de_eliminar_elementos_duplicados_en_un_arreglo_con_javascript,
  metadata: metadata$n
});
var metadata$m = {
  "date": "2020-07-17T03:41:45.000Z",
  "title": "Arreglos de objetos en Javascript: Como crear y actualizar su contenido",
  "hero_image": "/content/images/pierre-bamin-p2pogrtgpra-unsplash.jpg",
  "description": "En Javascript existen diversas formas de crear un arreglo de objetos y varias formas de manipular su contenido.",
  "keywords": ["javascript", "array", "arreglos", "es6"],
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1595045136/pierre-bamin-P2POGRtGprA-unsplash_gx6ozd.jpg",
  "bannerCredit": "",
  "tag": "Seed"
};
var Arreglos_de_objetos_en_javascript_como_crear_y_actualizar_su_contenido = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$m), {}, {
    default: () => `<p>Javascript es un lenguaje flexible que otorga diversas formas de efectuar una tarea determinada dejando libertad de decisi\xF3n al desarrollador para elejir la que considere como mejor opci\xF3n.</p>
<p>Una de las estructuras de datos m\xE1s utilizada en cualquier aplicaci\xF3n son los arreglos y en el caso de Javascript los arreglos de objetos son pan de cada d\xEDa.</p>
<p>Un arreglo puede ser creado y completado de variadas formas incluyendo la creaci\xF3n \u201Con the fly\u201D ya que los arreglos en Javascript pueden no tener l\xEDmite.</p>
<p>En el siguiente v\xEDdeo muestro 4 formas de crear un arreglo de objetos</p>
${validate_component(EggheadLesson, "EggheadLesson").$$render($$result, {
      lessonId: "javascript-4-formas-de-llenar-un-arreglo-en-javascript"
    }, {}, {})}
<p>La primera opci\xF3n es el uso de <a href="${"https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/fill"}" title="${"Array.fill"}" rel="${"nofollow"}">Array.fill</a> este m\xE9todo completa un arreglo cambiando todos los elementos por un valor est\xE1tico, es decir, si utilizamos, como en el ejemplo, una funci\xF3n que cree objetos, el arreglo ser\xE1 completado con el mismo objeto cada vez ya que \u201Ccopia su referencia y rellena el arreglo con referencias a dicho objeto.\u201D</p>
<p>Para evitar este \u201Cproblema\u201D podemos hacer uso del m\xE9todo <a href="${"https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map"}" rel="${"nofollow"}">Array.map</a>. Este m\xE9todo permite iterar sobre el arreglo de forma declarativa y modificar su contenido por medio de crear un nuevo arreglo con los valores retornados.</p>`
  })}`;
});
var arreglosDeObjetosEnJavascriptComoCrearYActualizarSuContenido = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Arreglos_de_objetos_en_javascript_como_crear_y_actualizar_su_contenido,
  metadata: metadata$m
});
var metadata$l = {
  "date": "2020-11-01T00:52:32.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1604192606/markus-spiske-sFHt4P_CqV4-unsplash_of1cfx.jpg",
  "keywords": ["React", "useEffect", "hook", "hooks"],
  "tag": "Seed",
  "title": "React useEffect Hook Comparado con los Estados del Ciclo de Vida",
  "description": "El hook useEffect y los estados del ciclo de vida de un componente.\nSon comparables? Funcionan igual? Es uno del reemplazo del otro?.",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@markusspiske?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Markus Spiske</a> on <a href="https://unsplash.com/s/photos/effect?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "favorite": true
};
var React_useeffect_hook_comparado_con_los_estados_del_ciclo_de_vida = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$l), {}, {
    default: () => `<p>Este es un breve post para de forma resumida aclarar algunos conceptos respecto al uso del hook <code>useEffect</code>y su relaci\xF3n con los <code>estados del ciclo de vida</code> de un componente.</p>
<h1 id="${"\xBFc\xF3mo-se-relacionan-el-hook-useeffect-y-los-estados-del-ciclo-de-vida"}">\xBFC\xF3mo se relacionan el hook useEffect y los estados del ciclo de vida?</h1>
<p>\xBFEs posible comparar ambas implementaciones?, \xBFEs uno el reemplazo del otro?</p>
<p>Un gran recurso sobre este particular hook es el art\xEDculo publicado por <a href="${"https://twitter.com/dan_abramov"}" rel="${"nofollow"}">Adan Abramov</a> <a href="${"http://overreacted.io/a-complete-guide-to-useeffect/"}" rel="${"nofollow"}">en su blog</a></p>
<p>Los estados del ciclo de vida son una definici\xF3n y concepto utilizados en los componentes de clase. Estos componentes eran la \xFAnica forma de escribir componentes que tuvieran estado interno antes del advenimiento de hooks.</p>
<p>Para esto se utiliza la sintaxis de <a href="${"https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Classes"}" rel="${"nofollow"}">clase de ES6</a> como en el siguiente ejemplo.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript"><span class="token keyword">class</span> <span class="token class-name">Componente</span> <span class="token keyword">extends</span> <span class="token class-name">React<span class="token punctuation">.</span>Component</span> <span class="token punctuation">&#123;</span>
    <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">props</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
      <span class="token keyword">super</span><span class="token punctuation">(</span>props<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">this</span><span class="token punctuation">.</span>state <span class="token operator">=</span> <span class="token punctuation">&#123;</span>something<span class="token operator">:</span> <span class="token string">'some value'</span><span class="token punctuation">&#125;</span><span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span>
    <span class="token function">componentWillMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span><span class="token operator">...</span><span class="token punctuation">&#125;</span>
    <span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span><span class="token operator">...</span><span class="token punctuation">&#125;</span>
    <span class="token function">componentWillUnmount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span><span class="token operator">...</span><span class="token punctuation">&#125;</span>
    <span class="token function">componentDidUpdate</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span><span class="token operator">...</span><span class="token punctuation">&#125;</span>
<span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Este tipo de component implementa diferentes m\xE9todos que te permiten ejecutar alguna l\xF3gica en base a un <strong>\u201Cmomento\u201D</strong> dado durante el proceso de renderizado del componente. Y esto es importante:</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>La ejecuci\xF3n de estos m\xE9todos esta relacionada con el <strong>tiempo</strong> como variable adyacente.</p>`
    })}
<p>Cada uno de estos m\xE9todos depende del momento en el que el componente se encuentre y la decisi\xF3n de que l\xF3gica agregar a cada uno est\xE1 basada en este concepto.</p>
<p>El <a href="${"https://es.reactjs.org/docs/hooks-effect.html"}" rel="${"nofollow"}">hook <code>useEffect</code></a> nace dentro de una nueva api ofrecida por React para permitir crear componentes que contenga estado de una forma funcional, es decir, con componentes implementados como funci\xF3n. Si bien este hook puede obtener los mismos resultados que algunos m\xE9todos del ciclo de vida, estos, no son directamente comparables (y no deber\xEDa hacerse) ya que el concepto y modelo mental tr\xE1s su implementaci\xF3n es diferente.</p>
<p><code>useEffect</code> se trata sobre <em>sincronizar</em> el estado interno de un componente con alg\xFAn estado externo, por ejemplo obtener datos desde una api o modificar algo en el DOM.  </p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Relacionado: <a href="${"https://matiashernandez.dev/algunos-errores-comunes-al-utilizar-react-hooks"}" rel="${"nofollow"}">Algunos errores comunes al utilizar React hooks</a></p>`
    })}
<p><code>useEffect</code> ejecuta un efecto (side effect) definido como primer argumento a modo de callback.</p>
<p>Este efecto es ejecutado cada vez que uno de los valores del arreglo de dependencias (segundo par\xE1metro) ha cambiado.<br>
Y eso es todo el modelo conceptual!. El efecto no se ejecuta en relaci\xF3n a un momento del renderizado, ergo, no hay ejecuci\xF3n al montar o recibir props.</p>
<p>El efecto s\xF3lo se ejecuta cuando una dependencia cambia, he ah\xED la importancia de hacerle caso al plugin <a href="${"https://www.npmjs.com/package/eslint-plugin-react-hooks"}" rel="${"nofollow"}">eslint-plugin-react-hooks</a> y no saltarse la definici\xF3n de dependencias.  </p>
<h2 id="${"\xBFcu\xE1l-es-la-diferencia-entre-useeffect-y-los-m\xE9todos-del-ciclo-de-vida"}">\xBFCu\xE1l es la diferencia entre useEffect y los m\xE9todos del ciclo de vida?</h2>
<p>El gran cambio aqu\xED es que a la hora de definir tu componente no debes pensar en el cuando (en relaci\xF3n al tiempo) se ejecutar\xE1 el efecto, si no, en el por qu\xE9 el efecto se ejecuta (cambio en una dependencia).  </p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Relacionado: <a href="${"https://matiashernandez.dev/que-son-los-hooks"}" rel="${"nofollow"}">\xBFQu\xE9 son los hooks?</a></p>`
    })}
<p>Finalmente si bien puede que te haga sentido hacer la comparaci\xF3n y relaci\xF3n con la implementaci\xF3n del ciclo de vida esto puede ser detrimental ya que puede llevar a malas pr\xE1cticas en su implementaci\xF3n, c\xF3mo el no uso del arreglo de dependencias u obviar algunas.</p>
<p>Para aprender hooks, y en particular <code>useEffect</code>, debes dejar de compararlo con la forma previa de implementaci\xF3n, sobre todo si tan s\xF3lo est\xE1s comenzando con <a href="${"https://threadreaderapp.com/hashtag/React"}" rel="${"nofollow"}">#React</a></p>
<p>Si est\xE1s comenzando con React, sigue atento al curso \u201CPensando en React\u201D para <a href="${"http://egghead.io/instructors/matias-francisco-hernandez-arellano"}" rel="${"nofollow"}">@eggheadio</a> que est\xE1 en progreso!!  </p>
<p>\xDAnete al newsletter para mantenerte al tanto.</p>`
  })}`;
});
var reactUseeffectHookComparadoConLosEstadosDelCicloDeVida = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": React_useeffect_hook_comparado_con_los_estados_del_ciclo_de_vida,
  metadata: metadata$l
});
var metadata$k = {
  "date": "2020-11-02T12:17:52.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1604323837/monirul-islam-shakil-31I2Mi1UuxQ-unsplash_kkerl8.jpg",
  "keywords": ["React", "hooks", "useEffect"],
  "tag": "Seed",
  "title": "React useEffect \xBFPor que el arreglo de dependencias es importante?",
  "description": "React `useEffect` es quiz\xE1 el hook que m\xE1s confusiones genera a la hora de utilizarlo. Una confusi\xF3n com\xFAn es el uso del arreglo de dependencias",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@themisphotography?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Monirul Islam Shakil</a> on <a href="https://unsplash.com/s/photos/effect?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var React_useeffect_por_que_el_arreglo_de_dependencias_es_importante = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$k), {}, {
    default: () => `<p>React <code>useEffect</code> es quiz\xE1 el hook que m\xE1s confusiones genera a la hora de utilizarlo.
Algunas de esas confusiones se debe al intento de comparar su funcionamiento con los estados del ciclo de vida de un componente de clase, algo que aclaro en <a href="${"https://matiashernandez.dev/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida"}" rel="${"nofollow"}">este post anterior</a></p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Recomendado:</p>
<p><a href="${"https://matiashernandez.dev/que-son-los-hooks"}" rel="${"nofollow"}">\xBFQu\xE9 son los hooks?</a></p>
<p><a href="${"https://matiashernandez.dev/algunos-errores-comunes-al-utilizar-react-hooks"}" rel="${"nofollow"}">Algunos errores comunes al utilizar React hooks.</a></p>`
    })}
<p>El hook useEffect recibe dos argumentos, una funcion/callback que define el efecto deseado y un listado/arreglo de valores que definen las dependencias del efecto.
Estas dependencias le sirven a React para saber cu\xE1ndo o m\xE1s bien <strong>por qu\xE9</strong> el efecto debe ejecutarse.</p>
<p>Internamente useEffect \u201Cobserva\u201D este listado de dependencias y cuando uno de los valores de ellas cambia el efecto es emitido. Esto te permite optimizar la ejecuci\xF3n del efecto.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Mant\xE9n en mente que React realiza una comparaci\xF3n utilizando <a href="${"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is"}" rel="${"nofollow"}">Object.is</a> para determinar si hubo un cambio en uno de los elementos. Si necesitas hacer una comparaci\xF3n \u201Cprofunda\u201D puedes utilizar este hook <a href="${"https://github.com/kentcdodds/use-deep-compare-effect"}" rel="${"nofollow"}">useDeepCompareEffect</a></p>`
    })}
<p>El equipo de React provee un<a href="${"https://www.npmjs.com/package/eslint-plugin-react-hooks"}" rel="${"nofollow"}">plugin de eslint </a>que ayuda a identificar cuando hay dependencias no identificadas por medio de la regla: <a href="${"https://es.reactjs.org/docs/hooks-rules.html#eslint-plugin"}" rel="${"nofollow"}"><strong>react-hooks/exhaustive-deps</strong></a></p>
<p>En general un efecto es una funci\xF3n que ejecuta cierta l\xF3gica para sincronizar el estado interno del componente con un estado externo (si, no me canso de repetirlo \u{1F937}\u200D\u2642\uFE0F).</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript"><span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    	<span class="token function">fetch</span><span class="token punctuation">(</span><span class="token string">"/api/data"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>
    		<span class="token parameter">res</span> <span class="token operator">=></span> <span class="token function">setState</span><span class="token punctuation">(</span>res<span class="token punctuation">.</span>data<span class="token punctuation">)</span>
    	<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>setState<span class="token punctuation">]</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"y-por-que-las-dependencias-son-importantes"}">Y por que las dependencias son importantes?</h3>
<p>Simple! Por que las dependencias son la forma de controlar cuando el efecto se ejecuta o no. Recuerda. No se trata de si el efecto ocurre al montar el componente (o cualquier otro \u201Cmomento\u201D), si no, de por qu\xE9 se ejecuta (cambio en un valor de una dependencia?</p>
<h3 id="${"y-\xBFpor-qu\xE9-debo-escribir-todas-las-dependencias-del-efecto"}">Y \xBFpor qu\xE9 debo escribir todas las dependencias del efecto?</h3>
<p>Si tu efecto utiliza un valor dentro de su l\xF3gica pero no lo declaras como dependencia entonces \u201Calgo huele mal\u201D(code smell)</p>
<p>El plugin de eslint reportar\xE1 la dependencia faltante como un warning. Entonces \xBFPor qu\xE9 es tan importante si s\xF3lo se reporta como un warning?.</p>
<p>Bueno, es un bug que en cualquier momento volver\xE1 a morderte.</p>
<p>Tu efecto funciona incluso sin declarar la dependencia por que la funci\xF3n/callback definida funciona como un closure y es capaz de utilizar el valor externo a su scope.</p>
<p>Si miramos el mismo ejemplo anterior, podemos escribirlo sin dependencias o con una lista vac\xEDa (lo que indica que se ejecutar\xE1 s\xF3lo una vez)</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript"><span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    	<span class="token function">fetch</span><span class="token punctuation">(</span><span class="token string">"/api/data"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>
    		<span class="token parameter">res</span> <span class="token operator">=></span> <span class="token function">setState</span><span class="token punctuation">(</span>res<span class="token punctuation">.</span>data<span class="token punctuation">)</span>
    	<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Pero, pi\xE9nsalo as\xED, estas declarando una funci\xF3n que trabaja con ciertos valores pero no le estas dando acceso directo a esos valores!! No es extra\xF1o?
\xBFEst\xE1s diciendo que tu funci\xF3n usa un valor pero que no depende de \xE9l?</p>
<h1 id="${"\xBFentonces-que-hacer"}">\xBFEntonces que hacer?</h1>
<p>Hay que redefinir la l\xF3gica de tu efecto para que solo utilice los valores de los que realmente dependa.</p>
<p>\xBFC\xF3mo? Una forma es extraer la l\xF3gica hacia una funci\xF3n externa y utilizar esta nueva funci\xF3n como dependencia del efecto.</p>
<p>Te dejo algunos muy buenos art\xEDculos sobre useEffect:</p>
<ul><li><p>Kent C Dodds: Escrbi\xF3 <a href="${"https://kentcdodds.com/blog/react-hooks-pitfalls"}" rel="${"nofollow"}">un articulo</a> sobre algunos errores al utilizar hooks, en donde comenta sobre el no uso de las dependencias.</p></li>
<li><p><a href="${"https://twitter.com/dan_abramov"}" rel="${"nofollow"}">Dan Abramov</a> tiene un art\xEDculo en <a href="${"http://overreacted.io/a-complete-guide-to-useeffect/"}" rel="${"nofollow"}">profundidad sobre useEffect</a></p></li>
<li><p><a href="${"https://daveceddia.com/useeffect-hook-examples/"}" rel="${"nofollow"}">Y este \xE1rt\xEDculo</a> de Dave Ceddia</p></li></ul>
<p>Mantente atento sobre estos temas y m\xE1s uniendote a mi newsletter!
Pronto noticias sobre el curso sobre React en el que estoy trabajando para a <a href="${"http://egghead.io/instructors/matias-francisco-hernandez-arellano"}" rel="${"nofollow"}">@eggheadio</a></p>`
  })}`;
});
var reactUseeffectPorQueElArregloDeDependenciasEsImportante = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": React_useeffect_por_que_el_arreglo_de_dependencias_es_importante,
  metadata: metadata$k
});
var Buzzsprout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { buzzsproutId } = $$props;
  if ($$props.buzzsproutId === void 0 && $$bindings.buzzsproutId && buzzsproutId !== void 0)
    $$bindings.buzzsproutId(buzzsproutId);
  return `<div style="${"position: relative"}"><iframe data-testid="${"buzzsprout"}" class="${"buzzsprout-mdx-embed"}"${add_attribute("title", `buzzsprout-${buzzsproutId}`, 0)}${add_attribute("src", `https://www.buzzsprout.com/1081172/${buzzsproutId}?client_source=admin&amp;iframe=true`, 0)} width="${"100%"}" height="${"200"}" frameborder="${"0"}" scrolling="${"no"}"></iframe></div>`;
});
var metadata$j = {
  "date": "2021-03-05T13:30:00.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1620052013/debby-hudson-EjCS2TsPjh8-unsplash_n9amcf.jpg",
  "keywords": ["Soft Skills", "Habilidades Bladnas", "Comunicaci\xF3n", "Aprendizaje"],
  "tag": "Post",
  "title": "4 Habilidades Blandas Esenciales Para Un Desarrollador.",
  "description": "Un desarrollador ya no es s\xF3lo alguien con grandes capacidades t\xE9cnicas, si no, que debe ser capaz de comunicar ideas e intenciones. Hoy las habilidades blandas son altamente valoradas.",
  "favorite": true
};
var _4_habilidades_blandas_esenciales_para_un_desarrollador = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$j), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h3 id="${"tldr-este-post-es-parte-del-episodio-12-de-la-primera-temporada-de-caf\xE9-con-tech"}">TLDR; Este post es parte del episodio 12 de la primera temporada de <a href="${"https://www.cafecon.tech"}" rel="${"nofollow"}">Caf\xE9 con Tech</a></h3>`
    })}
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
      buzzsproutId: "4452938-4-habilidades-blandas-esenciales-para-un-desarrollador"
    }, {}, {})}
<p>En toda \xE1rea de la vida tanto profesional como personal hay una serie de habilidades que se desarrollan, algunas de forma natural y otras por aprendizaje o adaptaci\xF3n que te permiten desenvolverte de mejor manera.
El desarrollo de software no est\xE1 ajeno a ello, pero por muchos a\xF1os, el desarrollo de habilidades blandas  e inteligencia emocional han sido dejadas de lado durante los procesos formativos dejando a muchos abandonados a su suerte en este aspecto una vez terminado su proceso educativo formal.</p>
<p>Por suerte, la industria, el mercado y la formaci\xF3n en si ha ido cambiando, en distintas direcciones, incluyendo la presencia de muchos desarrolladores sin formaci\xF3n acad\xE9mica y una miriada de freelancers que han puesto en la mesa y demostrado como estas habilidades olvidades por unos han sido una herramienta escencial en sus procesos.</p>
<p>Personalmente, creo que siempre estuve al tanto de este tipo de necesidades dentro de nuestra industria, siempre estuve algo incomodo y disconforme con los curriculums educativos para ingenier\xEDa en donde una gran \xE1rea del mercado de desarrolladores se dejaba abandonada enfocandose en una industria local conservadora de cuello y corbata.</p>
<p>Claramente, no termine en el camino que el curriculum de donde yo estudie dictaba.</p>
<p>Es por eso que en este episodio quiero compartir las que yo creo son las habilidades blandas m\xE1s escenciales para un desarrollador hoy en d\xEDa, ya sea para construir tu carrera, encontrar un nuevo trabajo o simplemente mejorar en el rol en que te encuentras ahora. Pero especialmente, me quiero enfocar en aquellos desarrolladores que est\xE1n comenzando. Aquellos que estan escribiendo su primer \u201CHola Mundo\u201D , aquellos que est\xE1n por iniciar un camino en este basto, acelerado y cambiante mundo.</p>
<p>Para comenzar, la habilidad que creo yo escencial en nuestra area, aunque quiz\xE1 sea adecuado a todo orden de cosas.</p>
<h3 id="${"aprendizaje-continuo"}">Aprendizaje continuo</h3>
<p>El mundo en el que tu y yo nos desarrollamos o queremos desarrollar profesionalmente es un mercado que muta y crece continuamente y una velocidad desesperada que no ha hecho m\xE1s que aumentar desde sus inicios.
En general, nuestra sociedad ha cambiado aceleradamente y ahora nuestro trabajo es parte escencial del como las sociedades crecen, se comunican y organizan, y es por esta naturaleza cambiante y escencial que tenemos que formar y adoptar la habilidad del aprendizaje continuo.</p>
<p>Con esto me refiero a que debemos ser capaz de siempre estar aprendiendo, aceptar que no lo sabemos todo y que no existen tal cosa como un experto. Lo que sabes hoy puede ser el pin\xE1culo del conocimiento tecnol\xF3gico de tu \xE1rea, pero ma\xF1ana una nueva implementaci\xF3n ver\xE1 la luz y lo que sab\xEDas, si bien no ser\xE1 obsoleto e inusable, ya no es la cima que sol\xEDa ser. </p>
<p>Este proceso de aprendizaje continue incluye algunas \u201Csub-habilidades\u201D o habilidades relacionadas que permiten que puedas continuar aprendiendo sin importar tu edad ni el rol que desempe\xF1as.</p>
<p>Necesitas tener un pensamiento cr\xEDtico, y no s\xF3lo con la informaci\xF3n que te rodea, si no, que con lo crees saber, debes estar listo para aprender y cambiar si los hechos o las evidencias as\xED lo demuestran.
Sobre todo al inicio de tu carrera escuchar\xE1s un sin fin de consejos de personas que tienen mayor experiencia en el campo, y obviamente, escucha esos consejos, pero tomalos con cuidado y recuerda que cada consejo tiene un sesgo, personal, ideol\xF3gico, o en este caso tecnol\xF3gico.
Es posible que escuches consejos sobre que tecnolog\xEDa aprender o sobre que camino seguir en tu carrera, cuando esta informaci\xF3n llega a ti es donde debes practicar tu pensamiento cr\xEDtico y tu habilidad de investigar.
Otra habilidad relacionda es la capacidad de autonom\xEDa de aprendizaje. No todo el conocimiento se obtiene en una sala de clases o de libros de autores. En general todo ese conocimiento, si bien \xFAtil e interesantes, es de a lo menos unos 5 o 10 a\xF1os. Un conocimiento que se ha encerrado en las aulas y que poco a sociabilizado con el mundo exterior. Y est\xE1 bien!. es claro que las casas de estudio no pueden seguir el paso a este mundo acelerado, deben preparar curriculums para cientos de estudiantes y actualizar a catedr\xE1ticos que quiz\xE1 llevan a\xF1os haciendo investigaci\xF3n de su \xE1rea. Y esto lleva tiempo.
Pero tu, eres t\xFA, te conoces, sabes lo que quieres y cu\xE1l es tu proceso de aprendizaje. O al menos deber\xEDas.
Por lo que el tiempo requerido para mejorar tus conocimientos por cuenta propia es cada d\xEDa menor. Existen un mont\xF3n de material all\xE1 afuera tanto gratuito como pagado, que puedes consumir en el momento que tu quieras y que te ayudar\xE1 a mantenerte al d\xEDa o incluso a aprender m\xE1s sobre alg\xFAn tema en espec\xEDfico.</p>
<p>No es necesario que tomes un curso o certificado, la verdad es que no conozco ninguna empresa que pida un certificado en alguna tecnolog\xEDa\u2026 bueno las que a\xFAn escriben Java \u2026</p>
<p>Puedes simplemente aprender peque\xF1os trucos o tips que te permitan resolver un problema en particular. No es necesario que dediques cientos de hora a aprender una tecnolog\xEDa, basta con que consumas el contenido adecuado y practiques, y ya estar\xE1s aprendiendo.</p>
<p>Y aqu\xED viene otra parte truculenta. Consumir el contenido adecuado. Como saber si lo que estoy leyendo/escuchando o viendo es contenido relevante?</p>
<p>Personalmente creo que hay dos formas:</p>
<ol><li>SI es relevante para ti, entonces ya est\xE1 definido.</li>
<li>Y dos, si proviene de una fuente confiable ya est\xE1s en el buen camino. Que es una fuente confiable? En toda area del desarrollo de software hay personas que crean contenido al respecto y muchas que son reconocidas por lo que hacen. Es ah\xED donde hay que poner el foco, en donde la experiencia que se comparte sea de alguna forma comprobable.</li></ol>
<p>Finalmente. si en este momento estas estudiando para ser desarrollador o ingeniero. Ten claro eso. Hay un mundo mucho mas grande que las murallas de tu casa de estudio.</p>
<h3 id="${"saber-elejir-tus-batallas-y-definir-objetivos"}">Saber elejir tus batallas y definir objetivos</h3>
<p>No se muy bien como se llamar\xEDa este tipo de habilidad, pero puedo definirlo como la habilidad de saber elejir que hacer. Elejir que estudiar, en que enfocarse, que contenido consumir, etc.
En general esta elecci\xF3n debe ir alineada de alguna forma con objetivos. Es claro que al inicio de tu carrera el objetivo quiz\xE1 no es muy claro y elejir que camino tomar en t\xE9rminos de que tecnolog\xEDa deber\xEDa aprender es bastante difuso y sesgado sobre todo por la necesidad de trabajar. Es por eso que creo importante que si a\xFAn est\xE1s estudiando comiences tu camino de auto-aprendizaje y comiences a definir tu objetivo desde ya para que no salgas al mundo sin saber que hacer.</p>
<p>Elejir que camino en tecnolog\xEDa tomar es importante ya que te ayudar\xE1 a disminuir y limpiar el insesante stream de informaci\xF3n que recibes, te ayudar\xE1 a enfocarte en un aspecto en particular, por ejemplo.
Decidir si te gusta m\xE1s el desarrollo Frontend o Backend o Si te gusta el desarrollo de productos o servicios vs el desarrollo empresarial. Quiz\xE1 al inicio de tu carrera decidir que lenguaje aprender hasta ser un experto es complejo e incluso contraindicado, si creo que deber\xEDas tener alguna preferencia que te permita tener una herramienta que sabes usar de buena manera.</p>
<h3 id="${"comunicaci\xF3n"}">Comunicaci\xF3n.</h3>
<p>El desarrollo de software es m\xE1s sobre comunicaci\xF3n y personas de lo que parece en la superficie. Por mucho tiempo se ha visto a las quienes trabajamos en desarrollo de software como obscuros ermita\xF1os sobre un teclado aliment\xE1ndose del brillo de la pantalla como si una planta a luz se tratara. Se nos ha estereotipado como hura\xF1os, ap\xE1ticos y antisociales, pero eso no es as\xED. O al menos ya no.
Como coment\xE9 al principio. Estamos en una sociedad en donde nuestro trabajo cobra cada d\xEDa m\xE1s importancia y en donde se ha entendido que no solo bebemos caf\xE9 y producimos c\xF3digo, si no, que nuestra labor es producir valor al usuario, valor, por medio del desarrollo de un producto, de una experiencia.
Y para lograr ese objetivo es necesario trabajar en equipo, es muy poco probable y poco com\xFAn que un producto sea desarrollado completamente por un ingeniero solo y aislado del mundo.</p>
<p>Es tan simple de ver que comunicaci\xF3n es clave, basta con ver como funciona GitHub y los cientos de miles de comentarios y pull request en los repositorios, los miles de blogs sobre desarrollo de software, los cientos de personas que asisten a eventos sobre software.</p>
<p>Saber comunicar es clave, es necesario en varios puntos.</p>
<ol><li>Comunicar lo que est\xE1s haciendo con tu equipo para que as\xED todos puedan visualizar lo que ocurre con el proyecto</li>
<li>Comunicar si tienes un problema y pedir ayuda cuando es necesario</li>
<li>Comunicar que est\xE1s en desacuerdo con alg\xFAn aspecto de como se est\xE1 haciendo el proyecto, sea este una decisi\xF3n t\xE9cnica o no - como las estimaciones </li>
<li>Comunicarte con la comunidad. Participar de la comunidad. Por el medio que sea, es \xFAtil para salir del ostracismo. No importa si desarrollaste una soluci\xF3n de software para calcular pi a la precisi\xF3n si nadie lo sabe y si nadie puede verificar cu\xE1l fue tu proceso. Aqu\xED participar de conversaciones en github, twitter, <a href="${"http://dev.to"}" rel="${"nofollow"}">dev.to</a> o meetups locales que se hagan en tu ciudad es no solo \xFAtil, sino tambi\xE9n entretenido.</li></ol>
<h3 id="${"y-finalmente-saber-descansar"}">Y finalmente, saber descansar.</h3>
<p>El desarrollo de software es una criatura compleja. Es una actividad de ingenier\xEDa pero con una alta mezcla de creatividad y arte. Es prima de las matem\xE1ticas, ciencia exacta, pero tambi\xE9n de las artes de contar historias. La resoluci\xF3n de problemas mediante c\xF3digo no es una actividad repetitiva y calculadora, si as\xED lo fuese, ya no estar\xEDamos escribiendo c\xF3digo sino que un programa lo har\xEDa por nosotros.</p>
<p>Y esta naturaleza extra\xF1a hace que sea una actividad de alto estr\xE9s, todos quieren ese trozo de c\xF3digo en que est\xE1s trabajando para ayer. y al mismo tiempo una actividad que apasiona. Es por eso que saber desconectarte y descansar de esta actividad es necesaria.</p>
<p>Es una habilidad que cuesta en un principio. Debo reconocer que por mucho tiempo mi hobby era seguir escribiendo c\xF3digo, pero esta vez para alg\xFAn proyecto personal, es decir, me pasaba muchas horas frente al computador haciendo lo mismo pero en diferente contexto. Hoy, sigo muchas horas al computador pero al menos haciendo algo diferente \u{1F605}</p>
<p>Aprender a descansar es necesario, quiz\xE1 en los inicios de tu carrera no se note, pero con el tiempo tu cerebro y tu cuerpo lo agradecer\xE1n.
En este punto tambi\xE9n incluyo el aprender a despejarse cuando est\xE1s atrapado por alg\xFAn problema y el trabajar en tu salud mental y f\xEDsica para as\xED tener m\xE1s energ\xEDa y mantenerse en la carrera por m\xE1s tiempo</p>`
  })}`;
});
var _4HabilidadesBlandasEsencialesParaUnDesarrollador = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _4_habilidades_blandas_esenciales_para_un_desarrollador,
  metadata: metadata$j
});
var metadata$i = {
  "date": "2020-09-24T02:23:01.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1600914347/steve-johnson-xL88x9Tqch0-unsplash_h9aqd8.jpg",
  "keywords": ["Rust", " Elm", "Clojure", "Elixir", "Overview"],
  "tag": "Seed",
  "title": "Overview de algunos modernos lenguajes de programaci\xF3n",
  "description": "Existen diversos lenguajes de programaci\xF3n pero podemos llamar a algunos de ellos pueden ser considerados modernos, este es un overview de al menos 4 de ellos que se han popularizado y con buenas razones\n",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@steve_j?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Steve Johnson</a> on <a href="https://unsplash.com/s/photos/modern-languajge?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Overview_de_algunos_modernos_lenguajes_de_programacion = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$i), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h2 id="${"tldr"}">TLDR;</h2>
<p>Este post es tambi\xE9n parte del <a href="${"http://www.cafecon.tech/1081172/5581075-overview-de-algunos-modernos-lenguajes-de-programacion"}" rel="${"nofollow"}">episodio 24</a> de <a href="${"http://www.cafecon.tech"}" rel="${"nofollow"}">Cafe con Tech</a></p>
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
        buzzsproutId: "5581075-overview-de-algunos-modernos-lenguajes-de-programacion"
      }, {}, {})}`
    })}
<p>Existen muchos lenguajes de programaci\xF3n, quiz\xE1 demasiados, cada uno enfocado a solucionar alg\xFAn problema en particular o con alguna orientaci\xF3n diferente. Algunos de estos han sucumbido a los cambios y otros se han mantenido estoicos durante los a\xF1os y unos pocos han superado todo cambio y son parte escencial de la tecnolog\xEDa que usamos hoy en d\xEDa.
Entre estos a\xF1osos monstruos tenemos C, nacido en 1972, C++ en 1985, Java, Javascript, Python, Php, Ruby, todos ellos nacidos en los 90. Si bien estos leguajes a\xFAn siguen en boga y tienen un gran mercado, es f\xE1cil ver que se han vuelto muy complejos a la hora de enfrentar los problemas de hoy en d\xEDa</p>
<p>El t\xE9rmino <strong>moderno</strong> es una clasificaci\xF3n a lo menos controversial, es complejo definir que es moderno ya que cada uno puede tener prejucios y preconceptos sobre que considerar actual o no, pero en el scope de este post consideraremos modernos a lenguajes nacidos durante la <strong>\xFAltima decada</strong> y que contemplan algunas caracter\xEDsticas que en general la comunidad de desarrolladores a llegado a desear y definir como b\xE1sicos.</p>
<h3 id="${"la-necesidad-de-la-invenci\xF3n"}">La necesidad de la invenci\xF3n</h3>
<p>La tecnolog\xEDa de hoy es, claramente, diferente a la de hace 40-50 a\xF1o, hoy los sistemas y aplicaciones deben soportar computadores <strong>multi-core</strong>, uso de <strong>gpu</strong>, dispositivos m\xF3vules, <strong>cloud computing</strong>, etc. En general, un concepto que engloba estos t\xE9rminos es <strong>Concurrencia</strong>.
La mayor\xEDa de los lenguajes <span class="${"underline"}">antiguos</span> se han actualizado con los a\xF1os para dar soporte a estos nuevos requerimientos, por ejemplo Java agreg\xF3 expresions Lambda y Streams en su versi\xF3n 8. El problema es que estos lenguajes no fueron dise\xF1ados con estos requerimientos en mente.
Es por esto que cada a\xF1o vemos el nacimiento de alg\xFAn nuevo lenguaje que incluye alguna caracter\xEDstica especial que le da vida, dentro de este grupo hay algunos lenguajes que destacan por los diferentes approaches que proponen para enfrentar los problemas de la tecnolog\xEDa actual.</p>
<p>Algunas de estas caracter\xEDsticas son:</p>
<ul><li>Soporte nativo para concurrencia</li>
<li>Inmutabilidad</li>
<li>Inferencia de tipos y type safety</li>
<li>Programaci\xF3n funcional,</li>
<li>Tipos est\xE1ticos</li>
<li>Nuevos tipos de sintaxis</li>
<li>Developer Experience</li></ul>
<p>Algunos de estos lenguajes, que en base a estas caracter\xEDsitcas, se muestran como <strong>modernos</strong> son:</p>
<ul><li>Rust</li>
<li>Elm</li>
<li>Clojure</li>
<li>Elixir</li>
<li>Kotlin</li>
<li>Swift</li>
<li>Scala</li>
<li>Grain</li>
<li>Unison</li>
<li>Dark</li></ul>
<p>Lo que sigue es un overview de algunos de estos lenguajes, describiendo algunos de los features que cada uno de ellos presenta, me enconfar\xE9 en Rust, Elm y Clojure. Intencionalmente me he dejado fuera Kotlin y Swift.
Kotlin y Swift son claramente lenguajes modernos,nacieron para cubrar una necesidad moderna, desarrollar aplicaciones m\xF3viles, los dejo fuera de este listado por que:</p>
<ul><li>Tienen un futuro claro</li>
<li>Son lenguajes de nicho (cada uno para su plataforma)</li></ul>
<p>Comenzaremos esta lista con <strong>Rust</strong> un lenguaje que considero tiene un gran potencial y que ha crecido enormemente tanto en su set de caracter\xEDsticas como en el tamaa\xF1o de su comunidad.</p>
<h3 id="${"rust"}"><a href="${"http://rust-lang.org/"}" rel="${"nofollow"}">Rust</a></h3>
<p>Se autodefine como un lenguaje para <strong>empoderar a todos a construir software confiable y eficiente</strong>, nace como una alternativa a C++. Es un lenguaje de uso general, se puede usar para casi todo, incluyendo aplicaciones web al compilar como wasm.</p>
<p>Uno de sus objetivos es ser eficitiente y tener una gran performance en runtime. Otras de sus caracter\xEDsticas son:</p>
<ul><li><p>Compila como binario, no tiene garbage collector es como C++</p></li>
<li><p>Tiene interoperaci\xF3n con C/C++</p></li>
<li><p>Tiene un manejador de paquetes, plugins para editores, material de aprendizaje (ej: <a href="${"https://github.com/rust-lang/rustlings"}" rel="${"nofollow"}">https://github.com/rust-lang/rustlings</a> y <a href="${"https://egghead.io/playlists/learning-rust-by-solving-the-rustlings-exercises-a722?af=4cexzz"}" rel="${"nofollow"}">esta colecci\xF3n en egghead</a> por <a href="${"https://www.christopherbiscardi.com/the-rust-programming-language"}" rel="${"nofollow"}">Chris Biscardi</a>)</p></li>
<li><p>Es Backward compatible</p>
<p>Al mismo tiempo, Rust se define como un lenguaje confiable, y esta confiablidad viene dada por caracter\xEDsticas como las siguientes</p></li>
<li><p>Revisi\xF3n de tipos est\xE1ticos</p></li>
<li><p>Un sistema de datos seguro (si el compilador te dice que es cierto tipo, entonces lo es )</p></li>
<li><p>Tiene datos reales, nada de \`any\` (alo! Typescript)</p></li>
<li><p>No incluye el <a href="${"https://www.youtube.com/watch?v=ybrQvs4x0Ps"}" rel="${"nofollow"}">\u201Cerror del billon de dolares\u201D</a>, es decir, no existen referencias \`null\` ni \`undefined\` ni similares.</p></li>
<li><p>Tiene un compilador que de verdad entrega ayuda cuando existen errores</p></li>
<li><p>Es un lenguaje con datos inmutables por defecto, pero ofrece formas de modicar este comportamiento</p></li>
<li><p>Tiene seguros de acceso a memorio <strong>no data races</strong></p></li>
<li><p>Si compila, usualmente significa que funciona</p></li></ul>
<p>Rust es un lenguaje complejo, con muchos conceptos que aprende, pero tiene una comunidad bastante activa lo que ayuda mucho a la hora de aprender. Nacido el 2010 dise\xF1ador por <a href="${"https://github.com/graydon"}" rel="${"nofollow"}">Graydon Hoare</a>, actualmente podemos encontrar 6 grandes conferencias, adem\xE1s su desarrollo es constante contanto con varios developers full-time y una gran cantidad de colaboradores.</p>
<p>Un ejemplo de c\xF3digo en Rust, para pattern matching.</p>
<pre class="${"language-rust"}"><!-- HTML_TAG_START -->${`<code class="language-rust">      <span class="token keyword">enum</span> <span class="token type-definition class-name">Coin</span> <span class="token punctuation">&#123;</span>
          <span class="token class-name">Penny</span><span class="token punctuation">,</span>
          <span class="token class-name">Nickel</span><span class="token punctuation">,</span>
          <span class="token class-name">Dime</span><span class="token punctuation">,</span>
          <span class="token class-name">Quarter</span><span class="token punctuation">,</span>
      <span class="token punctuation">&#125;</span>

      <span class="token keyword">fn</span> <span class="token function-definition function">value_in_cents</span><span class="token punctuation">(</span>coin<span class="token punctuation">:</span> <span class="token class-name">Coin</span><span class="token punctuation">)</span> <span class="token punctuation">-></span> <span class="token keyword">u8</span> <span class="token punctuation">&#123;</span>
          <span class="token keyword">match</span> coin <span class="token punctuation">&#123;</span>
              <span class="token class-name">Coin</span><span class="token punctuation">::</span><span class="token class-name">Penny</span> <span class="token operator">=></span> <span class="token number">1</span><span class="token punctuation">,</span>
              <span class="token class-name">Coin</span><span class="token punctuation">::</span><span class="token class-name">Nickel</span> <span class="token operator">=></span> <span class="token number">5</span><span class="token punctuation">,</span>
              <span class="token class-name">Coin</span><span class="token punctuation">::</span><span class="token class-name">Dime</span> <span class="token operator">=></span> <span class="token number">10</span><span class="token punctuation">,</span>
              <span class="token class-name">Coin</span><span class="token punctuation">::</span><span class="token class-name">Quarter</span> <span class="token operator">=></span> <span class="token number">25</span><span class="token punctuation">,</span>
          <span class="token punctuation">&#125;</span>
      <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"elm"}"><a href="${"http://elm-lang.org/"}" rel="${"nofollow"}">Elm</a></h3>
<p>Este es un lenguaje que personalmente disfrute mucho mientras experimentaba con el, Elm se define a si mismo como \u201CUn lenguaje disfrutante para crear aplicaciones web confiables\u201D. Puede ser considerado una alternativa a Javascript ya que (actualmente) el resultado de su compilaci\xF3n es un bundle javascript para ser ejecutado en el navegador, por lo que se subentiende que es de uso exclusivo para el desarrollo de aplicaciones web.
Cuando Elm se definie como disfrutable, es por que pone gran parte de su foco en caracter\xEDsticas de developer experience y developer ergon\xF3micos, tiene un gran compilador y mensajes de error realente \xFAtiles.
Es un lenguaje peque\xF1o y simple con un objetivo simple y claro, crear aplicaciones web eficientes y confiables.
Tiene compatibilidad con Javascript, es decir, puedes utilizar librer\xEDas escritas en JS dentro de tu app Elm, o anexar peque\xF1as partes de c\xF3digo Elm dentro de tu app Javascript para ir migrando poco a poco.
Como todo lenguaje que se precie de tal actualmente, tambi\xE9n posee un ecosistema de paquetes y un manejador de dependencies, editor de plugin y material de aprendizaje.</p>
<p>Es usualmente comparado con algunos frameworks Javascript, lo que no es t\xE9cnicamente correcto ya que Elm es un lenguaje en si mismo, a\xFAn as\xED, esta comparaci\xF3n beneficia a elm en casi todas las ocasiones (excepto con Svelte quiz\xE1). Elm es un \u201Ctodo en uno\u201D, al escribir c\xF3digo Elm no se requiere framework, Elm es el framework en si mismo.</p>
<p>Al igual que Rust, parte de sus caracter\xEDsticas importantes es ser un lenguaje confiable, y esta confiabilidad viene dada por caracter\xEDsticas como:</p>
<ul><li>100% Inmutable</li>
<li>Tipos est\xE1ticos</li>
<li>Un sistema de datos seguro</li>
<li>No incluye el <a href="${"https://www.youtube.com/watch?v=ybrQvs4x0Ps"}" rel="${"nofollow"}">\u201Cerror del billon de dolares\u201D</a>, es decir, no existen referencias \`null\` ni \`undefined\` ni similares, si no, que utiliza un tipo de dato Maybe.</li>
<li>Los mensajes de error del compilad sin lugar a duda los mejores existentes.</li></ul>
<ul><li>No runtime exceptions, gracias a su inferencia de datos puede detectar casos complejos y asi evitar errores en producci\xF3n.</li></ul>
<p>Nacido el 2012 de la mano de <a href="${"https://github.com/evancz"}" rel="${"nofollow"}">Evan Czaplicki</a> como \xFAnico desarrollador y actual Benevolente Dictador.
La comunidad Elm es peque\xF1a pero bastante activa, actualmente tiene 5 grandes conferencias.</p>
<p>Un ejemplo de c\xF3digo Elm, para <a href="${"https://elm-lang.org/examples/animation"}" rel="${"nofollow"}">ejecutar una animaci\xF3n</a></p>
<pre class="${"language-elm"}"><!-- HTML_TAG_START -->${`<code class="language-elm"><span class="token import-statement"><span class="token keyword">import</span> Playground <span class="token keyword">exposing</span> </span><span class="token punctuation">(</span><span class="token operator">..</span><span class="token punctuation">)</span>


<span class="token hvariable">main</span> <span class="token operator">=</span>
  <span class="token hvariable">animation</span> <span class="token hvariable">view</span>


<span class="token hvariable">view</span> <span class="token hvariable">time</span> <span class="token operator">=</span>
  <span class="token punctuation">[</span> <span class="token hvariable">octagon</span> <span class="token hvariable">darkGray</span> <span class="token number">36</span>
      <span class="token operator">|></span> <span class="token hvariable">moveLeft</span> <span class="token number">100</span>
      <span class="token operator">|></span> <span class="token hvariable">rotate</span> <span class="token punctuation">(</span><span class="token hvariable">spin</span> <span class="token number">3</span> <span class="token hvariable">time</span><span class="token punctuation">)</span>
  <span class="token punctuation">,</span> <span class="token hvariable">octagon</span> <span class="token hvariable">darkGray</span> <span class="token number">36</span>
      <span class="token operator">|></span> <span class="token hvariable">moveRight</span> <span class="token number">100</span>
      <span class="token operator">|></span> <span class="token hvariable">rotate</span> <span class="token punctuation">(</span><span class="token hvariable">spin</span> <span class="token number">3</span> <span class="token hvariable">time</span><span class="token punctuation">)</span>
  <span class="token punctuation">,</span> <span class="token hvariable">rectangle</span> <span class="token hvariable">red</span> <span class="token number">300</span> <span class="token number">80</span>
      <span class="token operator">|></span> <span class="token hvariable">moveUp</span> <span class="token punctuation">(</span><span class="token hvariable">wave</span> <span class="token number">50</span> <span class="token number">54</span> <span class="token number">2</span> <span class="token hvariable">time</span><span class="token punctuation">)</span>
      <span class="token operator">|></span> <span class="token hvariable">rotate</span> <span class="token punctuation">(</span><span class="token hvariable">zigzag</span> <span class="token operator">-</span><span class="token number">2</span> <span class="token number">2</span> <span class="token number">8</span> <span class="token hvariable">time</span><span class="token punctuation">)</span>
  <span class="token punctuation">]</span></code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"elixir"}"><a href="${"https://elixir-lang.org/"}" rel="${"nofollow"}">Elixir</a></h3>
<p>Elixir es un lenguaje din\xE1mico y funcional nacido para construir aplicaciones escalables y mantenibles. Elixir corre sobre <a href="${"https://en.wikipedia.org/wiki/BEAM_(Erlang_virtual_machine)"}" rel="${"nofollow"}">BEAM la Erlang VM</a> y toma todo su pode que es conocida por ejecutar sistemas distribuidos de baja latencia.</p>
<p>Se utiliza mayoritariamente para desarrolo web, software embebido, procesamiento multimedia, etc.</p>
<p>Su principal enfoque est\xE1 en la escalabilidad y la concurrencia, es 100% funcional lo que implica que es completamente immutable y sin side effects. Es posible extenderlo mediante el uso de un DSL (macros). Como todos, Elixir tambi\xE9n inclute un sistema de manejo de dependencias <a href="${"https://hex.pm/"}" rel="${"nofollow"}"><code>Hex</code></a> y una herramienta de build llamada <a href="${"https://hexdocs.pm/mix/"}" rel="${"nofollow"}"><code>Mix</code></a>.</p>
<p>El ejecutar su c\xF3digo sobre la m\xE1quina virtual de Erlang, Elixir es compatible con Erlan otorgandote la posibilidad de utilizar todo el ecosystem de Erlang.</p>
<p>Elixir es utilizado por Heroku, Whatsapp y Pinterest entre otros.</p>
<p>Adem\xE1s de ofrecer un gran framework work inspirado por RoR: <a href="${"https://www.phoenixframework.org/"}" rel="${"nofollow"}">Phoenix</a></p>
<p>Nacido el 2011 por <a href="${"https://github.com/josevalim"}" rel="${"nofollow"}">Jos\xE9 Valim</a>, parte del equipo Core de RoR
Tiene una comunidad activa y una gran conferencia llama ElixirConf en total hay 13 grandes eventos a nivel mundial.</p>
<p>Un ejemplo de c\xF3digo Elixir</p>
<pre class="${"language-elixir"}"><!-- HTML_TAG_START -->${`<code class="language-elixir"><span class="token keyword">defmodule</span> <span class="token module class-name">Math</span> <span class="token keyword">do</span>
  <span class="token keyword">def</span> <span class="token function">sum_list</span><span class="token punctuation">(</span><span class="token punctuation">[</span>head <span class="token operator">|</span> tail<span class="token punctuation">]</span><span class="token punctuation">,</span> accumulator<span class="token punctuation">)</span> <span class="token keyword">do</span>
    <span class="token function">sum_list</span><span class="token punctuation">(</span>tail<span class="token punctuation">,</span> head <span class="token operator">+</span> accumulator<span class="token punctuation">)</span>
  <span class="token keyword">end</span>

  <span class="token keyword">def</span> <span class="token function">sum_list</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> accumulator<span class="token punctuation">)</span> <span class="token keyword">do</span>
    accumulator
  <span class="token keyword">end</span>
<span class="token keyword">end</span>

<span class="token module class-name">IO</span><span class="token punctuation">.</span>puts <span class="token module class-name">Math</span><span class="token punctuation">.</span><span class="token function">sum_list</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token comment">#=> 6</span>
</code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"clojure"}"><a href="${"https://clojure.org"}" rel="${"nofollow"}">Clojure</a></h3>
<p>Se trata de un lenguaje de prop\xF3sito general robusto, practico y r\xE1pido con caracter\xEDsiticas para formar una herramienta simple, coherente y poderosa.</p>
<p>Clojure es un dialecto de <a href="${"https://es.wikipedia.org/wiki/Lisp"}" rel="${"nofollow"}">Lisp</a> y comparte la filosof\xEDa codigo-como-datos.
Esto se conoce como homoiconocidad. El propio programa ecrito puede ser manipulado como data usando el propio lenguaje.</p>
<p>Su creador describe el desarrollo de Clojure como la b\xFAsqueda de aquel lenguaje que no pudo encontrar: un <code>lisp</code> funcional y con la programaci\xF3n concurrente en sus cimientos.</p>
<p>Clojure puede ser ejecutado sobre la <a href="${"https://es.wikipedia.org/wiki/M%C3%A1quina_Virtual_de_Java"}" rel="${"nofollow"}">JVM</a> o la m\xE1quina virtual de .Net e incluso compilado a Javascript utilizando <a href="${"https://ClojureScript.org"}" rel="${"nofollow"}">ClojureScript</a>, esto le permite ser iteroperable con sus lenguajes host.</p>
<p>Es un lenguaje bastante \u201Cbattle tested\u201D siendo utilizado por diferentes industrias y compa\xF1ias como: Citibank, Simple, Amazon, Netflix, etc.</p>
<p>Nacido el 2007 de la mano de <a href="${"https://github.com/richhickey"}" rel="${"nofollow"}">Rich Hickey</a>, actualmente mantenido por Cognitect con 126 contributors formales</p>
<p>Gran comunidad, un ejemplod ello es el project <a href="${"https://github.com/athensresearch/ClojureFam"}" rel="${"nofollow"}">ClojureFam</a> del que participo para aprender Clojure.Tiene dos conferencias anuales US para un total de entre 7 y 8 conferencias mundiales (incluyendo una remota)</p>
<p>Un ejemplo de c\xF3digo Clojure</p>
<pre class="${"language-clojure"}"><!-- HTML_TAG_START -->${`<code class="language-clojure">user=<span class="token keyword">></span> <span class="token punctuation">(</span>source <span class="token keyword">+</span><span class="token punctuation">)</span>
<span class="token punctuation">(</span><span class="token keyword">defn</span> <span class="token keyword">+</span>
  <span class="token string">"Returns the sum of nums. (+) returns 0. Does not auto-promote
  longs, will throw on overflow. See also: +'"</span>
  <span class="token punctuation">&#123;</span><span class="token operator">:inline</span> <span class="token punctuation">(</span>nary-inline <span class="token operator">'add</span> <span class="token operator">'unchecked_add</span><span class="token punctuation">)</span>
   <span class="token operator">:inline-arities</span> ><span class="token number">1</span>?
   <span class="token operator">:added</span> <span class="token string">"1.2"</span><span class="token punctuation">&#125;</span>
  <span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token number">0</span><span class="token punctuation">)</span>
  <span class="token punctuation">(</span><span class="token punctuation">[</span>x<span class="token punctuation">]</span> <span class="token punctuation">(</span><span class="token keyword">cast</span> Number x<span class="token punctuation">)</span><span class="token punctuation">)</span>
  <span class="token punctuation">(</span><span class="token punctuation">[</span>x y<span class="token punctuation">]</span> <span class="token punctuation">(</span><span class="token keyword">.</span> clojure.lang.Numbers <span class="token punctuation">(</span><span class="token number">add</span> x y<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
  <span class="token punctuation">(</span><span class="token punctuation">[</span>x y &amp; more<span class="token punctuation">]</span>
     <span class="token punctuation">(</span>reduce1 <span class="token keyword">+</span> <span class="token punctuation">(</span><span class="token keyword">+</span> x y<span class="token punctuation">)</span> more<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token boolean">nil</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Existen variados lenguajes de programaci\xF3n e incluso siguen desarroll\xE1ndose nuevas ideas e implementaciones. Algunos lenguajes consiguen tener un gran tracci\xF3n dado sus caracter\xEDsticas y su comunidad.
En mi opini\xF3n es importante intentar al menos mantenerse al tanto sobre algunos de estos lenguajes y ojal\xE1 poder experimentar con ellos ya que de por seguro ser\xE1n las herramientas del futuro.</p>`
  })}`;
});
var overviewDeAlgunosModernosLenguajesDeProgramacion = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Overview_de_algunos_modernos_lenguajes_de_programacion,
  metadata: metadata$i
});
var metadata$h = {
  "date": "2020-10-17T19:40:05.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1602963950/lukasz-szmigiel-jFCViYFYcus-unsplash_mffzif.jpg",
  "keywords": ["React Native", "Javascript", "React", "Android", "Native Module"],
  "tag": "Seed",
  "title": "Agregar M\xF3dulos Nativos a Una Aplicaci\xF3n React Native",
  "description": "React Native permite que el uso de c\xF3digo nativo para utilizar el potencial de cada plataforma, es una caracter\xEDstica avanzada y que requiere algunos conocimientos m\xE1s all\xE1 de Javascript y React, pero si la plataforma no te ofrece alguna caracter\xEDstica que requieres, es posible crearla.",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@szmigieldesign?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Lukasz Szmigiel</a> on <a href="https://unsplash.com/s/photos/nature?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Agregar_modulos_nativos_a_una_aplicacion_react_native = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$h), {}, {
    default: () => `<p>React Native te permite crear aplicaciones para todo tipo dispositivos m\xF3viles utilizando Javascript, esto permite una gran flexibilidad y disminuye la curva de aprendizaje.</p>
<p>React Native permite acceso a diferentes API nativas para los distintos sistemas operativos (Android, iOS), pero en ciertas ocasiones esto no es suficiente y es necesario desarrollar soluciones en c\xF3digo nativo: Java/Kotlin o Object-C/Swift.</p>
<h1 id="${"m\xF3dulos-nativos"}">M\xF3dulos nativos</h1>
<p>React Native permite que el uso de c\xF3digo nativo para utilizar el potencial de cada plataforma, es una caracter\xEDstica avanzada y que requiere algunos conocimientos m\xE1s all\xE1 de Javascript y React, pero si la plataforma no te ofrece alguna caracter\xEDstica que requieres, es posible crearla.</p>
<h2 id="${"android"}">Android</h2>
<p>En el caso de Android, el c\xF3digo nativo puede venir distribuido como una paquete jar o aar o creado manualmente como un m\xF3dulo dentro de tu aplicaci\xF3n.</p>
<p>Quiz\xE1s necesitas utilizar un SDK o librer\xEDa externa, en el caso de paquetes <em>jar</em> o <em>aar</em> puedes agregarlos utilizando <a href="${"https://developer.android.com/studio"}" rel="${"nofollow"}">Android Studio</a>.</p>
<ol><li>Abre tu proyecto en Android Studio, abre s\xF3lo el directorio <strong>android</strong>.</li>
<li>Haz click en <code>File &gt; New Module</code></li>
<li>Una ventana flotante se mostrar\xE1 en donde puedes elegir el tipo de m\xF3dulo que quieres importar, en este caso <em>.JAR/</em>.AAR. Luego presiona siguiente</li></ol>
<p><img src="${"https://res.cloudinary.com/matiasfha/image/upload/c_scale,w_auto:100,dpr_auto/v1602963871/import-aar_aehans.png"}" alt="${"import aar"}"></p>
<ol><li>Ahora abre el archivo <code>build.gradle</code> de tu app y agrega una nueva linea al bloque de dependencias:</li></ol>
<pre class="${"language-undefined"}"><!-- HTML_TAG_START -->${`<code class="language-undefined">    dependencies &#123; compile project(&quot;:my-library-module&quot;) &#125;</code>`}<!-- HTML_TAG_END --></pre>
<ol><li>Haz click en <em>Sync Project With Gradle Files</em>.</li></ol>
<p>Es posible que tu nuevo m\xF3dulo ya implemente lo necesarioa para hacer su API disponible en tu proyecto React Native, en caso de no ser as\xED tendras que hacerlo manualmente</p>
<p>Lo primero es crear un nuevo m\xF3dulo deentro del proyecto, lo llamaremos \`SDKModule\`</p>
<p>Este nuevo m\xF3dulo implementa una clase que implementa <code>ReactContextBaseJavaModule</code></p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token keyword">package</span> <span class="token namespace">com<span class="token punctuation">.</span>myapp<span class="token punctuation">.</span>sdk</span><span class="token punctuation">;</span>
    
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">Callback</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">ReactApplicationContext</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">ReactContextBaseJavaModule</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">ReactMethod</span><span class="token punctuation">;</span>
    
    <span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SDKModule</span> <span class="token keyword">extends</span> <span class="token class-name">ReactContextBaseJavaModule</span> <span class="token punctuation">&#123;</span>
       <span class="token comment">//constructor</span>
       <span class="token keyword">public</span> <span class="token class-name">SDKModule</span><span class="token punctuation">(</span><span class="token class-name">ReactApplicationContext</span> reactContext<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
           <span class="token keyword">super</span><span class="token punctuation">(</span>reactContext<span class="token punctuation">)</span><span class="token punctuation">;</span>
       <span class="token punctuation">&#125;</span>
       <span class="token annotation punctuation">@Override</span>
       <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
           <span class="token keyword">return</span> <span class="token string">"SDK"</span><span class="token punctuation">;</span>
       <span class="token punctuation">&#125;</span>
       <span class="token comment">//Custom function that we are going to export to JS</span>
       <span class="token annotation punctuation">@ReactMethod</span>
       <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">getDeviceName</span><span class="token punctuation">(</span><span class="token class-name">Callback</span> cb<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
           <span class="token keyword">try</span><span class="token punctuation">&#123;</span>
               cb<span class="token punctuation">.</span><span class="token function">invoke</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token class-name"><span class="token namespace">android<span class="token punctuation">.</span>os<span class="token punctuation">.</span></span>Build</span><span class="token punctuation">.</span>MODEL<span class="token punctuation">)</span><span class="token punctuation">;</span>
           <span class="token punctuation">&#125;</span><span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Exception</span> e<span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
               cb<span class="token punctuation">.</span><span class="token function">invoke</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
           <span class="token punctuation">&#125;</span>
       <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Esta clase debe implementar el m\xE9todo <code>getName</code>. Luego tendr\xE1s que agregar los m\xE9todos que quieres exponer para su uso en Javascript. Estos m\xE9todos deben ser deecorados con la etiqueta <code>@ReactMethod</code></p>
<p>En este ejemplo el m\xE9todo <code>getDeviceName</code> podr\xE1 ser utilizando desde tu c\xF3digo Javascript.</p>
<p>Pero falta un paso m\xE1s. Es necesario crear un <code>package</code> con el nuevo m\xF3dulo. Esta nueva clase permitir\xE1 el registro del m\xF3dulo. Para esto bastar\xE1 con crear un nuevo archivo llamado <code>SDKPackage</code></p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token keyword">package</span> <span class="token namespace">com<span class="token punctuation">.</span>myapp<span class="token punctuation">.</span>sdk</span><span class="token punctuation">;</span>
    
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span></span><span class="token class-name">ReactPackage</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">JavaScriptModule</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">NativeModule</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>bridge<span class="token punctuation">.</span></span><span class="token class-name">ReactApplicationContext</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>facebook<span class="token punctuation">.</span>react<span class="token punctuation">.</span>uimanager<span class="token punctuation">.</span></span><span class="token class-name">ViewManager</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span></span><span class="token class-name">ArrayList</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span></span><span class="token class-name">Collections</span><span class="token punctuation">;</span>
    <span class="token keyword">import</span> <span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span></span><span class="token class-name">List</span><span class="token punctuation">;</span>
    
    <span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SDKPackge</span> <span class="token keyword">implements</span> <span class="token class-name">ReactPackage</span> <span class="token punctuation">&#123;</span>
    
       <span class="token annotation punctuation">@Override</span>
       <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ViewManager</span><span class="token punctuation">></span></span> <span class="token function">createViewManagers</span><span class="token punctuation">(</span><span class="token class-name">ReactApplicationContext</span> reactContext<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
           <span class="token keyword">return</span> <span class="token class-name">Collections</span><span class="token punctuation">.</span><span class="token function">emptyList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
       <span class="token punctuation">&#125;</span>
    
       <span class="token annotation punctuation">@Override</span>
       <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">NativeModule</span><span class="token punctuation">></span></span> <span class="token function">createNativeModules</span><span class="token punctuation">(</span>
               <span class="token class-name">ReactApplicationContext</span> reactContext<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
           <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">NativeModule</span><span class="token punctuation">></span></span> modules <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
           <span class="token comment">//We import the module file here</span>
           modules<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">SDKModule</span><span class="token punctuation">(</span>reactContext<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    
           <span class="token keyword">return</span> modules<span class="token punctuation">;</span>
       <span class="token punctuation">&#125;</span>
    
       <span class="token comment">// Backward compatibility</span>
       <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Class</span><span class="token punctuation">&lt;</span><span class="token operator">?</span> <span class="token keyword">extends</span> <span class="token class-name">JavaScriptModule</span><span class="token punctuation">></span><span class="token punctuation">></span></span> <span class="token function">createJSModules</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
           <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">></span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
       <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Finalmente debemos registrar el paquete en la clase principal <code>MainApplication.java</code></p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">       <span class="token keyword">import</span> <span class="token namespace">com<span class="token punctuation">.</span>notetaker<span class="token punctuation">.</span>sdk<span class="token punctuation">.</span></span><span class="token class-name">SDKPackage</span><span class="token punctuation">;</span>
    
      <span class="token annotation punctuation">@Override</span>
      <span class="token keyword">protected</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ReactPackage</span><span class="token punctuation">></span></span> <span class="token function">getPackages</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">return</span> <span class="token class-name">Arrays</span><span class="token punctuation">.</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ReactPackage</span><span class="token punctuation">></span></span><span class="token function">asList</span><span class="token punctuation">(</span>
            <span class="token keyword">new</span> <span class="token class-name">MainReactPackage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
            <span class="token keyword">new</span> <span class="token class-name">SDKPackage</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token comment">//Add your package here</span>
        <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Listo, ahora tu nuevo m\xF3dulo estar\xE1 disponible dentro del objeto <code>NativeModules</code> en tu app React Native, bajo el nombre que definiste en el m\xE9todo <code>getName</code></p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token keyword">import</span> <span class="token punctuation">&#123;</span><span class="token class-name">NativeModules</span><span class="token punctuation">&#125;</span> from <span class="token string">'react-native'</span><span class="token punctuation">;</span>
    <span class="token class-name">NativeModules</span><span class="token punctuation">.</span>SDK<span class="token punctuation">.</span><span class="token function">getDeviceName</span><span class="token punctuation">(</span><span class="token punctuation">(</span>err <span class="token punctuation">,</span>name<span class="token punctuation">)</span> <span class="token operator">=</span><span class="token operator">></span> <span class="token punctuation">&#123;</span>
       console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>err<span class="token punctuation">,</span> name<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<h1 id="${"conclusi\xF3n"}">Conclusi\xF3n</h1>
<p>React Native es una plataforma que permite el desarrollo r\xE1pido y seguro de aplicaciones m\xF3viles, pero no tiene soporte (a\xFAn) para cada una de las caracter\xEDsitcas de los dispositivos o a veces el soporte ofrecido por defecto no es suficiente, en estos casos querr\xE1s crear un m\xF3dulo nativo, que no m\xE1s que c\xF3digo Java - en el caso de Android -  que te permite definir como utilizar cierta caracter\xEDstica. Este c\xF3digo puede ser expuesto a tu aplicaci\xF3n Javascript tal como se describe en el ejemplo.</p>`
  })}`;
});
var agregarModulosNativosAUnaAplicacionReactNative = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Agregar_modulos_nativos_a_una_aplicacion_react_native,
  metadata: metadata$h
});
var metadata$g = {
  "date": "2020-11-13T14:11:55.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1605277342/mark-konig-IwRPMHU1PpE-unsplash_ejulel.jpg",
  "keywords": ["React Native", "Modulos Nativos", "Native Module", "Promises", "Callbacks"],
  "tag": "Seed",
  "title": "React Native: Promesas y Callbacks en m\xF3dulos nativos",
  "description": "React Native ofrece estructuras de datos que permiten desarrollar m\xF3dulos nativos que exponen el uso de Promesas y Callbacks a tu aplicaci\xF3n React Native",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@markkoenig?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Mark K\xF6nig</a> on <a href="https://unsplash.com/s/photos/module?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "favorite": true
};
var React_native_promesas_y_callbacks_en_modulos_nativos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$g), {}, {
    default: () => `<p>Durante estas \xFAltimas semanas he estado trabajando con un proyecto utilizando React Native, y si bien React Native es, de alguna manera, 90% simplemente React, es tambien cierto que crea nuevos desafios.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Recomendado: <a href="${"https://matiashernandez.dev/comenzando-con-react-native"}" rel="${"nofollow"}">Comenzando con React Native</a></p>`
    })}
<p>Algunos de estos:</p>
<ul><li>desaf\xEDos son el nuevo ambiente de desarrollo: El ciclo de desarrollo y feedback es un poco m\xE1s lento o forzoso en comparaci\xF3n con el r\xE1pido feedback obtenido al desarrollar una web utilizando por ejemplo create-react-app.</li>
<li>Diferentes primitivas: Las primitivas utilizadas para crear la interfaz en una aplicaci\xF3n React Native son diferentes y si bien en mi caso esto no fue algo nuevo ya que he hecho algunas otras app con React Native, si implica tener que <a href="${"http://reactnative.dev/"}" rel="${"nofollow"}">mirar la documentacion</a> basstante seguido para revisar algunas props o algunos elementos disponibles.</li>
<li>Es necesario implementar modulos nativos para resolver alguna tareas: Si bien la API de React Native y de herramientas como <a href="${"http://expo.io/"}" rel="${"nofollow"}">expo</a> cubren gran parte de los casos de uso de una aplicaci\xF3n m\xF3vil gen\xE9rica, muchas veces tenemos que crear nuestros propios m\xF3dulos para resolver casos m\xE1s complejos.</li></ul>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Relacionado: <a href="${"https://matiashernandez.dev/agregar-modulos-nativos-a-una-aplicacion-react-native"}" rel="${"nofollow"}">Agregar m\xF3dulos nativos a una aplicaci\xF3n React Native</a></p>`
    })}
<p>Es en este \xFAltimo desaf\xEDo es en donde pase la \xFAltima semana, implementando un wrapper en Java para exponer una API de un SDK.</p>
<p>Cuando desarrollas una aplicaci\xF3n web utilizando Javascript el uso de funciones as\xEDncronas es parte del d\xEDa a d\xEDa y para lograr esa asincronicidad hay dos m\xE9todos posibles: Callbacks y Promesas.</p>
<h2 id="${"callbacks"}">Callbacks</h2>
<p>Estas son parte esencial de Javascript y han estado presentes desde el inicio de los tiempos. \xBFQue son?, de forma muy simple, una callback es una funci\xF3n que es pasado como argumento a otra funci\xF3n y es despu\xE9s llamada desde el interior de la funci\xF3n cuando termina de ejecutar alguna tarea.</p>
<p>Un ejemplo es el uso de <code>setTimeout</code></p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript"><span class="token keyword">const</span> <span class="token function-variable function">customSetTimeout</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">callback</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        <span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span> <span class="token comment">//Esta tambien es un callback</span>
            console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'Set timeout terminado'</span><span class="token punctuation">)</span>
            <span class="token function">callback</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//Ejecuta el callback cuando setTimeout termino</span>
        <span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//1 segundo</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<h2 id="${"promises"}">Promises</h2>
<p>Una Promesa es una implementaci\xF3n un poco m\xE1s robusta para resolver el problema de asincronicidad. En palabras generales, una promesa es \u201Calgo que pasar\xE1 en el futuro\u201D, basicamente es una funci\xF3n que recibe una instrucci\xF3n de hacer alguna tarea y te responde \u201CA\xFAn no tengo los dato, pero dame tu contacto y cuano tenga los dato de aviso\u201D. \xBFC\xF3mo se ve en c\xF3digo?</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token function">fetch</span><span class="token punctuation">(</span><span class="token string">'https://someapi.com'</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token parameter">data</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        <span class="token function">doSomethingWithData</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">catch</span><span class="token punctuation">(</span><span class="token parameter">e</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Para \u201Ccapturar\u201D esta promesa se utiliza <code>then</code> para definir que hacer cuando la promesa retorna \u201Cse resuelve\u201D y <code>catch</code> para definir que hacer cuando la promesa falla.</p>
<p>Actualmente Javascript ofrece algo de <code>syntaxis sugar</code> utilizando <code>async/await</code></p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">getData</span> <span class="token operator">=</span> <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">try</span> <span class="token punctuation">&#123;</span>
            <span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">fetch</span><span class="token punctuation">(</span><span class="token string">'https://someapi.com'</span><span class="token punctuation">)</span>
            <span class="token function">doSomethingWithData</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span><span class="token keyword">catch</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
            console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<h2 id="${"m\xF3dulos-nativos"}">M\xF3dulos Nativos</h2>
<p>React Native ofrece  algunas estructuras de datos que permiten ofrecen esta experiencia en los m\xE9todos expuestos. Existen dos estructuras utilizadas como argumentos <code>Callback</code> y <code>Promise</code>.</p>
<h3 id="${"callbacks-nativas"}">Callbacks Nativas</h3>
<p><code>Callback</code> es utilizado para proveer el resultado del llamado de la funci\xF3n hacia Javascript.
En el caso de iOS utilizando Objective-C</p>
<pre class="${"language-objectivec"}"><!-- HTML_TAG_START -->${`<code class="language-objectivec">    <span class="token function">RTC_EXPORT_METHOD</span><span class="token punctuation">(</span>nativeFetchApi<span class="token punctuation">:</span><span class="token punctuation">(</span>RCTResponseSenderBlock<span class="token punctuation">)</span>callback<span class="token punctuation">)</span>
    <span class="token punctuation">&#123;</span>
      NSArray <span class="token operator">*</span>array <span class="token operator">=</span> AwesomeSDK<span class="token punctuation">.</span><span class="token function">fetch</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token function">callback</span><span class="token punctuation">(</span><span class="token operator">@</span><span class="token punctuation">[</span>NSNull null<span class="token punctuation">]</span><span class="token punctuation">,</span> array<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>O en su version Java</p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token annotation punctuation">@ReactMethod</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">nativeFetchApi</span><span class="token punctuation">(</span><span class="token class-name">Callback</span> callback<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token class-name">WritableArray</span> array <span class="token operator">=</span> <span class="token class-name">AwesomeSDK</span><span class="token punctuation">.</span><span class="token function">fetch</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        callback<span class="token punctuation">.</span><span class="token function">invoke</span><span class="token punctuation">(</span>array<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Y despu\xE9s simplemente se utiliza en nuestro c\xF3digo Javacript</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">fetchCallback</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        <span class="token function">doSomethingCool</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span>
    NativeModules<span class="token punctuation">.</span>MyAwesomeModule<span class="token punctuation">.</span><span class="token function">nativeFetchApi</span><span class="token punctuation">(</span>fetchCallback<span class="token punctuation">)</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>El m\xF3dulo nativo debe invocar el callback s\xF3lo una vez. Tambi\xE9n es posible almacenar el callback y llamarlo en otro punto del c\xF3digo. De hecho esto es lo que tuve que realizar ya que el SDK utilizado tiene sus propios <code>observers</code>.</p>
<p>Java</p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token keyword">private</span> <span class="token class-name">Callback</span> privateCallback <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token annotation punctuation">@ReactMethod</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">nativeSdkSingin</span><span class="token punctuation">(</span><span class="token class-name">Callback</span> callback<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>privateCallback <span class="token operator">=</span> callback<span class="token punctuation">;</span>
        <span class="token class-name">AwesomeSDK</span><span class="token punctuation">.</span><span class="token function">signin</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">signinObserver</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>privateCallback <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
            <span class="token keyword">this</span><span class="token punctuation">.</span>privateCallback<span class="token punctuation">.</span><span class="token function">invoke</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">&#125;</span><span class="token number">38</span>k
        <span class="token keyword">this</span><span class="token punctuation">.</span>privateCallback <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"promises-nativas"}">Promises Nativas</h3>
<p>React Native tambi\xE9n provee de una estructura de datos que puede definir una Promesa, que permite simplificar un poco el c\xF3digo as\xEDncrono, sobre todo si se utiliza <code>async/await</code>. Para definir el uso de una promesa, es decir, determinar que una funci\xF3n retornar\xE1 una promesa debes utilizar como \xFAltimo par\xE1metro de la funci\xF3n este argumento.</p>
<p>En el caso de iOS utilizando Objective-C</p>
<pre class="${"language-objectivec"}"><!-- HTML_TAG_START -->${`<code class="language-objectivec">    <span class="token function">RTC_EXPORT_METHOD</span><span class="token punctuation">(</span>nativeFetchApi<span class="token punctuation">,</span>
                     nativeFetchApiWithResolver<span class="token punctuation">:</span><span class="token punctuation">(</span>RCTPromiseResolveBlock<span class="token punctuation">)</span>resolve
                     rejecter<span class="token punctuation">:</span><span class="token punctuation">(</span>RCTPromiseRejectBlock<span class="token punctuation">)</span>reject<span class="token punctuation">)</span>
    <span class="token punctuation">&#123;</span>
        NSArray <span class="token operator">*</span>array <span class="token operator">=</span> AwesomeSDK<span class="token punctuation">.</span><span class="token function">fetch</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>array<span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
            <span class="token function">resolve</span><span class="token punctuation">(</span>array<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span><span class="token keyword">else</span><span class="token punctuation">&#123;</span>
            NSError <span class="token operator">*</span>error <span class="token operator">=</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>
            <span class="token function">reject</span><span class="token punctuation">(</span><span class="token string">@"no_data"</span><span class="token punctuation">,</span> <span class="token string">@"No hay datos"</span><span class="token punctuation">,</span> error<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>O en su version Java</p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token annotation punctuation">@ReactMethod</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">nativeFetchApi</span><span class="token punctuation">(</span><span class="token class-name">Promise</span> promise<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">try</span> <span class="token punctuation">&#123;</span>
            <span class="token class-name">WritableArray</span> array <span class="token operator">=</span> <span class="token class-name">AwesomeSDK</span><span class="token punctuation">.</span><span class="token function">fetch</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
            promise<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span>array<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span><span class="token keyword">catch</span><span class="token punctuation">(</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
            promise<span class="token punctuation">.</span><span class="token function">reject</span><span class="token punctuation">(</span><span class="token string">'...'</span><span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span>

    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Y despues simplemente se utiliza en nuestro c\xF3digo Javacript</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">fetchNativeData</span> <span class="token operator">=</span> <span class="token keyword">async</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">try</span> <span class="token punctuation">&#123;</span>
            <span class="token keyword">const</span> data <span class="token operator">=</span> <span class="token keyword">await</span> NativeModules<span class="token punctuation">.</span>MyAwesomeModule<span class="token punctuation">.</span><span class="token function">nativeFetchApi</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token function">doSomethingCool</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span><span class="token keyword">catch</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
            console<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Y de igual forma que en el ejemplo de uso de callbacks, tambi\xE9n es posible almacenar la promesa y llamarla en otro punto del c\xF3digo.</p>
<p>Java</p>
<pre class="${"language-java"}"><!-- HTML_TAG_START -->${`<code class="language-java">    <span class="token keyword">private</span> <span class="token class-name">Promise</span> privatePromise <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token annotation punctuation">@ReactMethod</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">nativeSdkSingin</span><span class="token punctuation">(</span><span class="token class-name">Promise</span> promise<span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>privatePromise <span class="token operator">=</span> promise<span class="token punctuation">;</span>
        <span class="token class-name">AwesomeSDK</span><span class="token punctuation">.</span><span class="token function">signin</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">signinObserver</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>privatePromise <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
            <span class="token keyword">this</span><span class="token punctuation">.</span>privatePromise<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">&#125;</span><span class="token number">38</span>k
        <span class="token keyword">this</span><span class="token punctuation">.</span>privatePromise <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<h2 id="${"conclusi\xF3n"}">Conclusi\xF3n</h2>
<p>Al desarrollar aplicaciones m\xF3viles utilizando React Native, ciertos casos de usos requieren el desarrollo de m\xF3dulos nativos, y uno de los objetivos de estos m\xF3dulos es ofrecer una experiencia de uso (al desarrollador) lo m\xE1s cercana posible a una librer\xEDa escrita en javascript, para esto React Native ofrece estructuras de datos que permiten desarrollar m\xE9todos nativos que soportan Callbacks y Promesas.</p>`
  })}`;
});
var reactNativePromesasYCallbacksEnModulosNativos = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": React_native_promesas_y_callbacks_en_modulos_nativos,
  metadata: metadata$g
});
var metadata$f = {
  "date": "2020-08-05T15:35:12.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1596641805/brook-anderson-gTQbZXL417Q-unsplash_si4ngk.jpg",
  "keywords": ["React", "Hooks"],
  "tag": "Seed",
  "title": "Algunos errores comunes al utilizar React Hooks",
  "description": "El uso de hooks requiere de un cambio de modelo mental, un proceso que puede ser complejo sobre todo para quienes ya llevan un tiempo desarrollando aplicaciones con React, es normal caer en algunos errores y lugares comunes que hemos ido identificando con el tiempo creando buenas pr\xE1cticas.",
  "bannerCredit": '<span>Photo by <a href="[https://unsplash.com/@brookanderson?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText](https://unsplash.com/@brookanderson?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText)">Brook Anderson</a> on <a href="[https://unsplash.com/s/photos/hooks?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText](https://unsplash.com/s/photos/hooks?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText)">Unsplash</a></span>'
};
var Algunos_errores_comunes_al_utilizar_react_hooks = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$f), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h3 id="${"tldr"}">TLDR</h3>
<p>Este post es tambi\xE9n parte del episodio 17 del podcast Caf\xE9 con Tech</p>
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
        buzzsproutId: "4822565-errores-comunes-con-react-hooks"
      }, {}, {})}`
    })}
<p>El uso de hooks requiere de un cambio de modelo mental, un proceso que puede ser complejo sobre todo para quienes ya llevan un tiempo desarrollando aplicaciones con React, es normal caer en algunos errores y lugares comunes que hemos ido identificando con el tiempo creando buenas pr\xE1cticas.</p>
<p>El primer error o problema est\xE1 relacionado con aquellos que llevan un tiempo trabajando con React, seguir pensando en m\xE9todos de estado de vida de un componente o seguir intentando escribir dichos m\xE9todos utilizando Hooks.</p>
<p>En palabras simples y directas. La api de hooks no es un reemplazo de la api de clases.</p>
<h3 id="${"\xBFc\xF3mo-se-relaciona-los-estados-del-ciclo-de-vida-con-hooks"}">\xBFC\xF3mo se relaciona los estados del ciclo de vida con hooks?</h3>
<p>Los m\xE9todos de estado de vida fueron por mucho tiempo la forma de definir el comportamiento del componente basado en un momento dado. Pero al utilizar hooks, y en particular <code>useEffect</code> el modelo mental que debemos adoptar es diferente. Es un modelo en base al concepto de sincronizaci\xF3n, sincronizar el estado del mundo con el estado  del componente, props y estado.</p>
<p>La diferencia entre el usual modelo de <em>montar/actualizar/desmontar</em>  y la sincronizaci\xF3n es sutil. O como lo menciona Ryan Florence: \u201CLa pregunta ahora no es Cuando este efecto es ejecutado\u201D, si no, \u201CCon que estado se sincroniza este efecto\u201D, con este modelo tenemos 3 opciones. Sincronizar con todos los estados, con ninguno o con un listado definido de estados, las dependencias utilizadas para useEffect</p>
<p><a href="${"https://twitter.com/ryanflorence/status/1125041041063665666?s=20"}" rel="${"nofollow"}">https://twitter.com/ryanflorence/status/1125041041063665666?s=20</a></p>
<p>Ciertamente modificar tus pre-conceptos sobre esta relaci\xF3n de los estados del ciclo de vida y la sincronizaci\xF3n del estado requiere, de cierta forma, olvidar lo aprendido.</p>
<p>Y esto nos lleva al siguiente error, mentirle a React sobre las dependencias de un hook o m\xE1s bien, ignorar o no utilizar el plugin de <strong>ESLINT</strong> <a href="${"https://www.google.com/search?client=safari&rls=en&q=eslint-plugin-react-hooks&ie=UTF-8&oe=UTF-8"}" rel="${"nofollow"}">eslint-plugin-react-hooks.</a></p>
<h3 id="${"dependencias-exhaustivas"}">Dependencias exhaustivas</h3>
<p>El equipo tr\xE1s React creo este plugin con dos reglas escenciales: las llamadas <a href="${"https://es.reactjs.org/docs/hooks-rules.html"}" rel="${"nofollow"}">\u201Creglas de los hooks\u201D</a> y \u201Cdependencias exhaustivas\u201D.</p>
<p>SI no est\xE1s utilizando este plugin pero est\xE1s escribiendo hooks, te recomiendo fuertemente lo instales y lo utilices!</p>
<p>De estas dos reglas las que la mayor\xEDa de los desarrolladores ignora es \u201Cdependencias exhaustivas\u201D, es aquella regla que te grita cada vez que, por ejemplo, al utilizar <code>useEffect</code> dejas el arreglo de dependencias vaci\xF3 pero dentro del efecto haces uso de algunas variables fuera de su scope.</p>
<p>Utilizar este plugin es como tener al equipo de React, Sebastian Markbage, Dan Abramov y el resto del equipo, mirando sobre tu hombro diciendo: No, as\xED no es como debes utilizar los hooks. El ignorar el uso de este plugin es como decirles : \u201CTranquilo Sebastian, yo se usar hooks mejor que tu\u201D.</p>
<p>Este problema se relaciona con el mencionado anteriormente, el pensar en el ciclo de vida del componente, se ha mostrado incanzablemente que el utilizar un arreglo vac\xEDo c\xF3mo dependencia se comporta de igual manera que el m\xE9todo <code>componentDidMount</code> ejecutando el efecto solo en el primer render. Y si bien el resultado obtenido es similar, no es exactamente el mismo concepto. Un arreglo vac\xEDo, indica que el efecto no utiliza ning\xFAn valor fuera de su scope, es decir, no existen dependencias.</p>
<p>La verdad es que en la mayor\xEDa de los casos los efectos emitidos si tienen alguna dependencia y si esta dependencia es en realidad idempotente utilizarla como dependencia no generar\xEDa ningun problem.</p>
<p>En resumen, no le mientas a React dejando el listado de dependencias vac\xEDos cuando en realidad estas dependencias existen. No sigas pensando en estados del ciclo de vida y utiliza el plugin de ESLINT. Y escucha a Sebastian y Dan.</p>
<h3 id="${"no-optimices-prematuramente"}">No optimices prematuramente.</h3>
<p>Otro error com\xFAn y que probablemente va m\xE1s all\xE1 del uso de hooks es la optimizaci\xF3n prematura o pensar demasiado en la performance de tu app.</p>
<p>Con el uso de hooks todo lo que estamos escribiendo son funciones y muchas veces se escriben funciones dentro del componente lo que lleva a muchos a pensar en que esto generar\xE1 problemas de rendimiento futuros dado que en cada nuevo render del componente una nueva funci\xF3n es creada. O si esta funci\xF3n que es redefinida se utiliza como prop en otro componente, se podr\xEDan generar demasiados renders innecesarios</p>
<p>Ciertamente la re-definici\xF3n de una funci\xF3n multiples veces no es algo que desees, pero por lo general los actuales engines de Javascript son bastante r\xE1pidos en esta operaci\xF3n,  ahora bien para la segunda parte del problema de performance, demasiados renders innecesarios, tambi\xE9n es una media verdad. Claramente si tenemos una funci\xF3n que se re-define en cada render y esta es usada como prop, el componente que la recibe tambien se renderizar\xE1 multiples veces pues una de sus prop cambi\xF3.
Pero, preguntate esto: Un re-render de un componente implica siempre una actualizaci\xF3n del DOM?</p>
<p>Pensemos en un escenario donde en un componente la \xFAnica prop que cambia es una funci\xF3n como un manejador de eventos, esto claramente no implica un cambio en el renderizado de este componente cierto? Por lo tanto, aunque se renderize mil veces, no existir\xE1n cambios en el DOM.</p>
<p>Uno de las principales caracter\xEDsticas de React es su gran trabajo de optimizaci\xF3n  a la hora de calcular diffs y modificar el DOM, por lo que este segundo problema de performance puede no ser tan relevante como piensas.</p>
<p>Aqu\xED el consejo o soluci\xF3n es simple. No hagas optimizaci\xF3n prematuras, como utilizar indiscriminadamente <code>useMemo</code> o <code>useCallback</code>primero toma algunas mediciones del real performance de tu applicaci\xF3n y busca estrategias y mejoras que mitigen esos cuellos de botellas que lograste determinar, y si despu\xE9s de eso siguen existiento problemas, analiza por que hay tantos re-renders innecesarios y ah\xED solo ah\xED aplica <code>useMemo</code> o <code>useCallback</code> de forma conciente.</p>
<p>Ah!.. y no olvides, que estas m\xE9tricas debiesen ser obtenidas desde un ambiente de producci\xF3n. la versi\xF3n de desarrollo de React es mucho m\xE1s lenta que su contraparte de producci\xF3n.</p>
<h3 id="${"no-dejes-la-documentaci\xF3n-de-lado"}">No dejes la documentaci\xF3n de lado</h3>
<p>Existe otro problema que creo nace de confusi\xF3n o incluso desconfianza en tus propios conocimientos, por lo que la soluci\xF3n aqu\xED es f\xE1cil. Lee la documentaci\xF3n  de hooks y practica. me refiero a no utilizar hooks como useReducer o m\xE1s bien no poder identificar cuando utilizar <code>useReducer</code>.</p>
<p><code>useReducer</code> es en cierto modo una v\xE1lvula de escape dentro de los hooks, te da la posibilidad clara y directa de desacoplar los cambios de estado de tus efectos.</p>
<p>Como regla general, si comienzas a establecer un valor de estado en dependencia del valor actual del estado, es decir, utilizas la forma funcional de tu m\xE9todo setState, deber\xEDas comenzar a pensar en utilizar useReducer.</p>
<p>useReducer es una potente herramienta que permite el manejo de estados complejos para ser utilizados de una forma simple dentro de tus componentes y sus efectos en donde la \xFAnica dependencia minima es <code>dispatch</code>, funci\xF3n que React te asegura ser\xE1 constante entre los diferentes renders.</p>
<p>Y finalmente una idea que sigue relacionada con el uso de <code>useEffect</code> pero que creo puede ir m\xE1s all\xE1.</p>
<p>Muchas veces en favor de mantener algunos conceptos est\xE1ndares de la industria como DYI muchos evitan mover sus funciones dentro del <code>useEffect</code> pero muchas veces siguen callendo en el error de las dependencias. Esto me lleva a pensar en las abstracciones que nos forzamos a utilizar.</p>
<p>Esta porf\xEDa de evitar la duplcaci\xF3n de codigo s\xF3lo por evitarlo de forma ma\xF1osa sin un trasfondo mayor lleva a crear abstracciones que muchas veces o son m\xE1s complejas o son innecesarias y crear futuros problemas.
En este sentido te invito a esuchar la charla de Kent C Dodds. AHA programming o Avoid Hefty Abstractions disponible en youtube.</p>
<p><a href="${"https://www.youtube.com/watch?v=wuVy7rwkCfc%5C%5D(https://www.youtube.com/watch?v=wuVy7rwkCfc"}" rel="${"nofollow"}">https://www.youtube.com/watch?v=wuVy7rwkCfc\\](https://www.youtube.com/watch?v=wuVy7rwkCfc</a></p>
<h3 id="${"conclusi\xF3n"}">Conclusi\xF3n</h3>
<p>En conclusi\xF3n a la hora de utilizar hooks creo que los novatos la tienen m\xE1s f\xE1cil pues s\xF3lo tienen que crear un modelo mental para esta API.
Pero en general para evitar estos errores comunes hay simples soluciones:</p>
<ul><li>Leer la documentaci\xF3n oficial y sobre todos sus FAQ. o preguntas frecuentes</li>
<li>Dejar de pensar en estados de ciclo de vida</li>
<li>No optimizar prematuramente</li>
<li>Utilizar y no ignorar el plugin de eslint para hooks</li>
<li>Y no crear abstracciones innecesarias</li></ul>`
  })}`;
});
var algunosErroresComunesAlUtilizarReactHooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Algunos_errores_comunes_al_utilizar_react_hooks,
  metadata: metadata$f
});
var Como_crear_animaciones_con_react_native = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props), {}, {
    default: () => `<p>Las animaciones son parte importante de cualquier aplicaci\xF3n ya que permiten ofrece una mejor experiencia de uso siendo utilizadas como feedback para las acciones del usuario.
React Native ofrece una API para trabajar con animaciones directamente utilizando \u201Cjust javascript\u201D</p>
<p>En este post revisaremos como utilizar esta caracter\xEDsitca para crear tus propias animaciones!.</p>
<h2 id="${"tldr"}">TLDR:</h2>
${validate_component(EggheadLesson, "EggheadLesson").$$render($$result, {
      lessonId: "react-native-crear-animacion-con-react-native-y-la-api-animated"
    }, {}, {})}
<h1 id="${"la-api-animated"}">La API Animated</h1>
<p>React Native ofrece dos API complementarias: <code>Animated</code> para un control granular de valores espec\xEDficos y <code>LayoutAnimation</code> para efectos animados globales en transacciones del layout.</p>
<p>La API <code>Animated</code> fue dise\xF1ada para ofrecer control granular para crear diferentes patrones de interacci\xF3n y con la mejor performance posible, es una api declarativa que permite control de inicio y fin de una animaci\xF3n.</p>
<p>Esta API exporta seis componentes para animar, pero tambi\xE9n permite crear tu propio componente utilizando <code>Animated.createAnimatedComponent()</code>.
Los componentes animados por defecto son: <code>View</code>, <code>Text</code>, <code>Image</code>, <code>ScrollView</code>, <code>FlatList</code> y <code>SectionList</code></p>
<p>As\xED mismo, <code>Animated</code> ofrece m\xE9todos para controlar los valores que est\xE1s animando como <code>Animated.timing</code> y <code>Animated.spring</code> y otros que permiten componer animaciones como: <code>Animated.parallel</code>, <code>Animated.sequence</code>, <code>Animated.delay</code> y <code>Animated.loop</code>.</p>
<p>Primero vamos a revisar algunos de estos m\xE9todos:</p>
<h2 id="${"animatedtiming-y-animatedspring"}">Animated.timing y Animated.spring</h2>
<p>Estos m\xE9todos permiten definir una animaci\xF3n, <code>timing</code> permite definir un tiempo para ejecutar la animaci\xF3n y <code>spring</code> utiliza un modelo f\xEDsico para determinar la velocidad para ejecutar la animaci\xF3n, es decir, no es controlado por el tiempo.
Ambos m\xE9todos tienen una api similar aceptando casi los mismos par\xE1metros</p>
<p>Revisemos un ejemplo</p>
<p><a href="${"https://snack.expo.io/@matiasfh/example-translate-animation"}" rel="${"nofollow"}">https://snack.expo.io/@matiasfh/example-translate-animation</a></p>
<p>En este ejemplo podemos ver dos elementos y dos animaciones, una con <code>timing</code> y la otra con <code>spring</code>.</p>
<p>Revisemos el c\xF3digo.
Lo primero que podemos ver dentro de la definicion de <code>App</code> es el uso de <code>React.useRef()</code></p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript"><span class="token keyword">const</span> translateAnimationTiming <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useRef</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Animated<span class="token punctuation">.</span>Value</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span>current</code>`}<!-- HTML_TAG_END --></pre>
<p>Aqu\xED utilizamos <code>useRef</code> para mantener una referencia a un valor sin necesidad de emitir un cambio de estado provocando un re-renderizado del componente, dentro del <code>ref</code> creamos un valor para animar utilizando <code>new Animated.Value(0)</code> iniciando que el valor inicial ser\xE1 0, luego definimos la funci\xF3n que iniciar\xE1 la animaci\xF3n, en este caso es un manejador para el evento click de los botones</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">timingAnimation</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        Animated<span class="token punctuation">.</span><span class="token function">timing</span><span class="token punctuation">(</span>translateAnimationTiming<span class="token punctuation">,</span> <span class="token punctuation">&#123;</span>
          toValue<span class="token operator">:</span> <span class="token number">250</span><span class="token punctuation">,</span>
          duration<span class="token operator">:</span> <span class="token number">600</span><span class="token punctuation">,</span>
          useNativeDriver<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Esta funci\xF3n declara y ejecuta la animaci\xF3n <code>timing</code>. El primer argumento es el valor que se animar\xE1 y luego recibe un objeto de configuraci\xF3n <code>toValue</code> que declara que se animar\xE1 hasta obtener el valor 250 en un tiempo <code>duration: 600</code> (milisegundos). y definimos que se usar\xE1 el driver nativo. Este \xFAltimo argumento es requerido por React Native como <code>true</code> or <code>false</code>.</p>
<p>S\xF3lo algunos valores pueden ser animados utilizando el driver nativo, tal como se describe en <a href="${"https://reactnative.dev/blog/2017/02/14/using-native-driver-for-animated"}" rel="${"nofollow"}">este post de la documentaci\xF3n oficial</a>, los valores animables por el driver nativo son todos aquellos \u201Cno relacionados con el layout\u201D, es decir no puedes animar nativamente (pero si al utilizar <code>useNativeDriver: false</code>) propiedades de flexbox, tama\xF1os (width, height) o posiciones.</p>
<p>En este ejemplo tambi\xE9n hay otra funci\xF3n que ejecuta la animaci\xF3n utilizando <code>spring</code></p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">timingAnimation</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        Animated<span class="token punctuation">.</span><span class="token function">spring</span><span class="token punctuation">(</span>translateAnimationTiming<span class="token punctuation">,</span> <span class="token punctuation">&#123;</span>
          toValue<span class="token operator">:</span> <span class="token number">250</span><span class="token punctuation">,</span>
          useNativeDriver<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>El m\xE9todo spring solo recibe el valor al cual se quiere animar (sin tiempo).
Puedes ver la diferencia entre ambas animaciones en el ejemplo de Snack.</p>
<p>Por cierto, en ambos casos se hizo una llamada al m\xE9todo <code>start()</code> para iniciar la animaci\xF3n. <code>start()</code> puede recibir un argumento. Un callback que es ejecutado cuando la animaci\xF3n termin\xF3. Si la animaci\xF3n termino de forma correcta el callback ser\xE1 invocado con el argumento <code>{finished:true}</code>, en caso contrario, si la animaci\xF3n, termino de forma err\xF3nea, o no se pudo completar (por ejemplo, por alguna interrupci\xF3n al re-renderizar), el callback recibir\xE1 el par\xE1metro <code>{finished:false}</code></p>
<h2 id="${"componentes-animados"}">Componentes animados</h2>
<p>Otro punto importante del ejemplo es el uso de componentes animados, en este caso <code>Animated.View</code> este es un componente ofrecido por la API Animated que tiene el mismo comportamiento y props que el <code>View</code> normal, pero contiene la l\xF3gica necesaria para efectuar los cambios en los estilos determinados por la funci\xF3n de animaci\xF3n.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token operator">&lt;</span>Animated<span class="token punctuation">.</span>View
        style<span class="token operator">=</span><span class="token punctuation">&#123;</span><span class="token punctuation">[</span>
        styles<span class="token punctuation">.</span>circle<span class="token punctuation">,</span>
        animatedStyleTiming<span class="token punctuation">,</span>
        <span class="token punctuation">]</span><span class="token punctuation">&#125;</span>
    <span class="token operator">/</span><span class="token operator">></span></code>`}<!-- HTML_TAG_END --></pre>
<p>La animaci\xF3n es en el fondo, una modificaci\xF3n a alguna propiedad del estilo del componente, en este caso <code>animatedStyleTiming</code> que para este ejemplo est\xE1 definido como</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> animatedStyleTiming <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
        transform<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">&#123;</span> translateX<span class="token operator">:</span> translateAnimationTiming<span class="token punctuation">&#125;</span><span class="token punctuation">]</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Este style, define la propiedad transform para indicar que se modificar\xE1 la posici\xF3n en <code>X</code> del elemento.</p>
<h2 id="${"easing"}">Easing</h2>
<p>Easing functions o funciones de aceleraci\xF3n especifican la forma o monto del cambio de un par\xE1metro sobre durante el tiempo.
Los objetos, en la vida real no inician o detienen su movimiento de forma abrupta, y casi nunca se mueven a una velocidad constante.
React Native ofrece varias funciones de aceleraci\xF3n para aplicar en nuestras animaciones, para su uso simplemente debes importar el objeto <code>Easing</code>, como en el siguiente ejemplo</p>
<p><a href="${"https://snack.expo.io/@matiasfh/rn-easing-examples"}" rel="${"nofollow"}">https://snack.expo.io/@matiasfh/rn-easing-examples</a></p>
<p>En este peque\xF1o proyecto puedes ver la aplicaci\xF3n de las diferentes funciones de aceleraci\xF3n disponibles</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">import</span> <span class="token punctuation">&#123;</span> Easing <span class="token punctuation">&#125;</span> <span class="token keyword">from</span> <span class="token string">'react-native'</span><span class="token punctuation">;</span>
    <span class="token operator">...</span>
    <span class="token operator">...</span>
    Animated<span class="token punctuation">.</span><span class="token function">timing</span><span class="token punctuation">(</span>animatedValue<span class="token punctuation">,</span> <span class="token punctuation">&#123;</span>
      <span class="token operator">...</span>
      easing<span class="token operator">:</span> Easing<span class="token punctuation">.</span>ease
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Para aplicar una funci\xF3n de aceleraci\xF3n a tu animaci\xF3n solo debes definir la propiedad <code>easing</code> en la declaraci\xF3n de la animaci\xF3n.</p>
<h2 id="${"interpolation"}">Interpolation</h2>
<p>Otro m\xE9todo que React Native dispone para controlar nuestras animaciones es la interpolaci\xF3n.
Cada propiedad definida para animar puede pasar por un proceso de interpolaci\xF3n primero, este proceso crea un mapa de entradas y salidas <code>inputRange</code> y <code>ouputRange</code>.</p>
<p>Esto te permite utilizar tu valor de animaci\xF3n varias veces incluso si solo est\xE1 definido como un valor entre <code>0</code> y <code>1</code> al esquematizar tu rango de valores con un rango de la propiedad que quieres animar.
Vamos un ejemplo y animemos dos propiedades diferentes de dos componentes.</p>
<p><a href="${"https://snack.expo.io/@matiasfh/rn-animation-interpolation-example"}" rel="${"nofollow"}">https://snack.expo.io/@matiasfh/rn-animation-interpolation-example</a></p>
<p>En este ejemplo tenemos dos componentes animados. Un circulo rojo que se mueve hacia la derecha y un circulo azul que \u201Cdesaparece\u201D cambiando su opacidad, pero solo tenemos la definici\xF3n de un valor de animaci\xF3n</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> animatedValue <span class="token operator">=</span> react<span class="token punctuation">.</span><span class="token function">useRef</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Animated<span class="token punctuation">.</span>Value</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span>current</code>`}<!-- HTML_TAG_END --></pre>
<p>Valor de animaci\xF3n que comienza en 0 y que manipularemos para que cambie siempre entre valores 0 y 1.
Tambi\xE9n se definen dos interpolaciones <code>translateInterpolation</code> que genera un mapa de 0 a 0 y 1 a 250. Y <code>opacityInterpolation</code> que crea el mapa reverso 0 -&gt; 1, y 1 -&gt; 0. Indicando que cuando el valor de animaci\xF3n sea 0, el valor utilizado por la interpolaci\xF3n ser\xE1 <code>1</code>.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> translateInterpolation <span class="token operator">=</span> animatedValue<span class="token punctuation">.</span><span class="token function">interpolate</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>
      inputRange<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
      outputRange<span class="token operator">:</span><span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token number">250</span><span class="token punctuation">]</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span>
    <span class="token keyword">const</span> opacityInterpolation <span class="token operator">=</span> animatedValue<span class="token punctuation">.</span><span class="token function">interpolate</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>
      inputRange<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
      outputRange<span class="token operator">:</span><span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">,</span><span class="token number">0</span><span class="token punctuation">]</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Tambi\xE9n se modifica la funci\xF3n de animaci\xF3n para indicar que el valor de cambio ser\xE1 <code>toValue: 1</code></p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">animation</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        animatedValue<span class="token punctuation">.</span><span class="token function">setValue</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span>
        Animated<span class="token punctuation">.</span><span class="token function">timing</span><span class="token punctuation">(</span>animatedValue<span class="token punctuation">,</span> <span class="token punctuation">&#123;</span>
            toValue<span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
            duration<span class="token operator">:</span> <span class="token number">600</span><span class="token punctuation">,</span>
            useNativeDriver<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
     <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Entonces al hacer click en el bot\xF3n <strong>Animate</strong> ambos componentes son animados, uno se mueve <code>250px</code> a la derecha mientras el otro cambia su opacidad de 1 a 0.</p>
<h1 id="${"conclusi\xF3n"}">Conclusi\xF3n</h1>
<p>React Native provee de un control granular a la hora de crear animaciones permitiendo que sea solo tu imaginaci\xF3n el limite para definir como quieres que tu interfaz se comporte.
Para poder animar componentes necesitas utilizar los componentes animados provistos en el objeto <code>Animated</code> y luego definir un valor de animaci\xF3n utilizando <code>useRef</code>. Este valor de animaci\xF3n es despu\xE9s utilizado como par\xE1metro para la funci\xF3n de animaci\xF3n que quieres utilizar como <code>timing</code> o  <code>spring</code>.
Adem\xE1s ofrece una forma de control a\xFAn mas detallada como la interpolaci\xF3n, que permite crear un mapa de valores pudiendo reutilizar el valor de animaci\xF3n como se desee.</p>`
  })}`;
});
var comoCrearAnimacionesConReactNative = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Como_crear_animaciones_con_react_native
});
var metadata$e = {
  "date": "2021-07-11T03:13:59.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1597115954/andreas-gucklhorn-Ilpf2eUPpUE-unsplash_n8npgz.jpg",
  "keywords": [
    "useState",
    "hooks",
    "hook",
    "React",
    "Wizard",
    "componentes",
    "lesson",
    "tutorial"
  ],
  "tag": "Post",
  "title": "Crear un componente Wizard utilizando useState React hook",
  "description": "Como utilizar useState React hook para crear un sencillo componente Wizard o multi-step",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@draufsicht?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Andreas G\xFCcklhorn</a> on <a href="https://unsplash.com/collections/9718937/solar?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "favorite": true,
  "lang": "es"
};
var Use_state_para_crear_component_wizard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$e), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h3 id="${"tldr"}">TLDR;</h3>
<p>Puedes ver este video en <a href="${"https://egghead.io/lessons/react-crear-un-componente-wizard-usando-usestate-react-hooks?pl=hooks-3d62\u2061=4cexzz"}" rel="${"nofollow"}">egghead.io</a>.
Este video es parte de una <a href="${"https://egghead.io/playlists/hooks-3d62\u2061=4cexzz"}" rel="${"nofollow"}">colecci\xF3n</a> en donde se muestra progresivamente como crear un componente utilizando diferentes hooks y patrones de dise\xF1o</p>`
    })}
${validate_component(EggheadLesson, "EggheadLesson").$$render($$result, {
      lessonId: "react-crear-un-componente-wizard-usando-usestate-react-hooks"
    }, {}, {})}
<p>Un <strong>Wizard</strong> o <strong>multi-step</strong> es un componente que puede contenir multiples \u201Cp\xE1ginas\u201D pero que s\xF3lo renderiza una de ellas y permite navegar hacia delante o atr\xE1s entre las p\xE1ginas restantes. Este tipo de componentes son usualmente utilizados para renderizar formularios largos dividiendolos en diferentes \u201Cpasos\u201D.</p>
<p>Este tipo de componentes requieren el manejo de un estado interno para poder decidir que \u201Cp\xE1gina\u201D se debe renderizar y como los botones del componente deben actuar ante el evento click. La forma que React ofrece para manejar estados internos es utilizando el hook <code>React.useState</code></p>
<p>La forma m\xE1s sencilla de este componente utiliza un estado sencillo que solo indica el indice de la p\xE1gina \u201Cactual\u201D, es decir, la que se mostrar\xE1 en pantalla.</p>
<p>En este ejemplo podemos ver el uso de useState, y como utilizar la forma funcional de la funci\xF3n actualizadora para acceder al estado actual y modificarlo.</p>
<p>Para comenzar, crearemos la base de nuestro componente creando un contenedor que mantendr\xE1 otros dos contenedores, uno para el contenido que se renderizar\xE1 y otro para los botones necesarios para la navegaci\xF3n.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Con esto en su lugar ya podemos definir los componentes que ir\xE1n dentro de nuestro wizard y definir el aspecto que tendr\xE1n cuando sean renderizados para eso crearemos en este caso tres componentes simples que llamaremos page que simplemente contienen un t\xEDtulo indicando la p\xE1gina a la que corresponden y agregamos esto dentro de nuestra aplicaci\xF3n.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Page1</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Pagina 1</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">
  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token function-variable function">Page2</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Pagina 2</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">
  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> <span class="token function-variable function">Page3</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Pagina 3</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">
  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token function-variable function">App</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Wizard</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Page1</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Page2</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Page3</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Wizard</span></span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Nuestro objetivo ahora es mostrar una p\xE1gina a la vez, por lo que necesitamos manipular los componentes que el wizard recibe. Para esto, utilizaremos la API React.Children que permite manipular el objeto children, en este caso, convirti\xE9ndolo a un arreglo de elementos.
Tambi\xE9n usaremos una variable auxiliar <code>currentPage</code> que mantendr\xE1 la p\xE1gina que se renderizar\xE1 y utilizaremos un \xEDndice para indicar la selecci\xF3n. En este caso utilizamos el primer indice lo que renderizar\xE1 s\xF3lo la prima p\xE1gina que hemos creado.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Ahora es cuando entra en juego el hook <code>useState</code>.</p>
<p>Es necesario que el componente seleccionado en currentPage sea variable, se modifique con el tiempo, y cambie cuando se hace click en alguno de los botones. Esto es que cambie el estado de nuestro componente.</p>
<p>Este estado lo podemos manejar con el hook <code>useState</code> que retorna el arreglo con dos elementos, un valor que llamamos <code>activePageIndex</code> y una funci\xF3n que sirve para definir el valor del estado que llamaremos <code>setActivePageIndex</code>.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>activePageIndex<span class="token punctuation">,</span> setActivePageIndex<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span>activePageIndex<span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Adem\xE1s, useState puede recibir un valor inicial que ser\xE1 en este caso el primer \xEDndice. Con esto, ya podemos usar el valor de <code>activePageIndex</code> para definir qu\xE9 se renderiza en cada momento. Recuerda que cada llamada al componente tiene su propio valor de <code>activePageIndex</code>.</p>
<p>Utilizaremos el valor de <code>activePageIndex</code> para definir si se muestra o no cada bot\xF3n. Para eso simplemente escribimos una condicional ternar\xEDa indicando que se renderice el bot\xF3n con cierta condici\xF3n o se renderice null.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>activePageIndex<span class="token punctuation">,</span> setActivePageIndex<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span>activePageIndex<span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">ButtonPrev</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">></span> <span class="token number">0</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-left<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        Atras
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token function-variable function">ButtonNext</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">&lt;</span> pages<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-right<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        Siguiente
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonPrev</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonNext</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>En el caso del bot\xF3n atr\xE1s, se renderizar\xE1 s\xF3lo si <code>activePageIndex</code>, que es el \xEDndice, sea mayor que <code>0</code>, y en el caso del bot\xF3n Siguiente, se renderizar\xE1 s\xF3lo si <code>activePageIndex</code> es menor que el total de \xEDtems dentro de las p\xE1ginas. A\xFAn los botones no hace espec\xEDficamente nada. Es necesario que el estado pueda cambiar.</p>
<p>Para eso, definiremos dos funciones, una para cuando el bot\xF3n atr\xE1s es presionado y otra para el bot\xF3n siguiente. Para el bot\xF3n atr\xE1s, simplemente disminuimos el valor del \xEDndice. Para eso, utilizamos la forma funcional de la funci\xF3n de actualizaci\xF3n, la funci\xF3n <code>setActivePageIndex</code>.</p>
<p>Este m\xE9todo puede recibir una funci\xF3n que recibe como par\xE1metro el estado actual y modifica el estado en base al valor retornado. En este caso, disminuye el \xEDndice en -1. De forma similar al presionar el bot\xF3n Siguiente, el \xEDndice se incrementar\xE1 en 1.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>activePageIndex<span class="token punctuation">,</span> setActivePageIndex<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span>activePageIndex<span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">goNextPage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    <span class="token function">setActivePageIndex</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">index</span><span class="token punctuation">)</span> <span class="token operator">=></span> index <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">goPrevPage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    <span class="token function">setActivePageIndex</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">index</span><span class="token punctuation">)</span> <span class="token operator">=></span> index <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">ButtonPrev</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">></span> <span class="token number">0</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span>
        <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span>
        <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">&#123;</span>goPrevPage<span class="token punctuation">&#125;</span></span>
        <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-left<span class="token punctuation">"</span></span>
      <span class="token punctuation">></span></span><span class="token plain-text">
        Atras
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token function-variable function">ButtonNext</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">&lt;</span> pages<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span>
        <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span>
        <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">&#123;</span>goNextPage<span class="token punctuation">&#125;</span></span>
        <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-right<span class="token punctuation">"</span></span>
      <span class="token punctuation">></span></span><span class="token plain-text">
        Siguiente
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonPrev</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonNext</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Agregamos estos manejadores de eventos a cada bot\xF3n y con esto ya tenemos una versi\xF3n simplificada de un componente que permite navegar entre los elementos renderizados utilizando <code>useState</code> para manejar el estado.</p>
<p><code>useState</code> permite manejar el estado de un componente definido como una funci\xF3n. <code>useState</code> retorna un arreglo con dos elementos, el valor del estado y una funci\xF3n para modificar ese estado. Es posible pasar una funci\xF3n como argumento a la funci\xF3n modificadora, lo que permite acceder al estado actual y retornar el nuevo estado</p>`
  })}`;
});
var useStateParaCrearComponentWizard$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Use_state_para_crear_component_wizard,
  metadata: metadata$e
});
var metadata$d = {
  "date": "2020-07-21T15:06:24.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1595344382/kolleen-gladden-ij5_qCBpIVY-unsplash_ncnaro.jpg",
  "keywords": ["react", "performance"],
  "title": "Measuring your React app performance",
  "description": "There are different ways or approaches that helps you to measure your app performance when working with React. Here we will summarize a two of them:",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@rockthechaos?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Kolleen  Gladden</a> on <a href="https://unsplash.com/s/photos/performance?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "tag": "Post"
};
var Measuring_your_react_app_performance = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$d), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>This is an old post written in my medium site.</p>
<p>Just published here to keep track of it and not loose it</p>`
    })}
<p>There are different ways or approaches that helps you to measure your app performance when working with React. Here we will summarize a two of them:</p>
<ul><li>Using Chrome Timeline to Profile Components</li>
<li>The new <code>unstable</code> Profiler component.</li></ul>
<h1 id="${"using-chrome-timeline-to-profile-your-components"}">Using Chrome Timeline to Profile your Components</h1>
<p>This is the more direct way and less \u201Cinvasive\u201D method to measure your app performance.</p>
<p>You can use Chrome Developer Tools to visualize the components in the Chrome Timeline. Using this you can see the components that are mounted, updated and unmounted and the time used in each task.</p>
<p>To use this tool just load your app adding a new query string to the url <code>?react_perf</code> once the app is loaded:</p>
<ul><li>Open the Timeline tab and press <strong>Record</strong></li>
<li>Use your app while Chrome is recording</li>
<li>Stop the recording</li></ul>
<p>Now you can analyze the results that were recorded, this data can help you figure out when some piece of the UI get\u2019s updated when it shouldn\u2019t, how much updates happens, etc.</p>
<h1 id="${"profile-component"}">Profile component</h1>
<p>The core React team recently merge a new PR including a new component type: <code>Profiler</code></p>
<p>This component can be used to get the following timing metrics:</p>
<ul><li>User Timing API: Measure the start and stop time for each component lifecycle</li>
<li>Render time: The actual time spent rendering the <code>Profile</code> and it descendants</li>
<li>Base render time: The time spent in the most recent \`render\` for each component under the <code>Profiler</code> tree.</li></ul>
<h2 id="${"how-to-use-profiler-"}">How to use <code>Profiler</code> :</h2>
<p>First: This component is a new experimental API so it\u2019s currently exported as <code>React.unstable_Profiler</code> and its available in the <code>master</code> branch of react. <a href="${"https://github.com/facebook/react/blob/master/packages/react/src/React.js#L57"}" title="${"https://github.com/facebook/react/blob/master/packages/react/src/React.js#L57"}" rel="${"nofollow"}">https://github.com/facebook/react/blob/master/packages/react/src/React.js#L57</a></p>
<p>Using this component is dead simple:</p>
<p>This component acts just as a \u201Ccontainer\u201D so the <code>Profiler</code> can be declared anywhere in your tree and can be nested.</p>
<p>The <code>onRender</code> callback is called on each \`render\` of the root with the following arguments:</p>
<ul><li>id: An identificator for the <code>Profiler</code></li>
<li>phase: Identify in what step the component is: <code>mount</code> or <code>update</code></li>
<li>actualTime: The time spent rendering the <code>Profiler</code> and the descendant tree.</li>
<li>baseTime: The time spent rendering the descendant components of the <code>Profiler</code></li></ul>
<h2 id="${"metrics"}">Metrics</h2>
<p>The metrics that can be gathered with this component are (as mentioned above)</p>
<ul><li>User Timing API: Measure the start and stop time for the components lifecycle. This is measured in a realtime graph gathering the times for each component lifecyle in the tree. The realtime graph is recorded after each lifecyle call.</li>
<li>Actual Render time: The actual time spent rendering the <code>Profile</code> and it descendants. This is measured but starting a timer during the <em>begin_phase and finishing it at the _complete</em> phase. The time is recorded each time <code>Profiler</code> is re-rendered. Can be useful to understand how the subtree make use of \`shouldComponentUpdate\` and to check how the momoization process behave. Less time means better memoization.</li>
<li>Base render time: The time spent in the most recent \`render\` for each component under the <code>Profiler</code> tree. This is measured for each <code>fiber</code>under the <code>Profiler</code> component. The times are not updated is the components skips the render. This can tell how expensive is the \`render\` function in the worst scenario.</li></ul>`
  })}`;
});
var measuringYourReactAppPerformance = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Measuring_your_react_app_performance,
  metadata: metadata$d
});
var metadata$c = {
  "date": "2021-07-11T03:13:59.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1597115954/andreas-gucklhorn-Ilpf2eUPpUE-unsplash_n8npgz.jpg",
  "keywords": [
    "useState",
    "hooks",
    "hook",
    "React",
    "Wizard",
    "componentes",
    "lesson",
    "tutorial"
  ],
  "tag": "Post",
  "title": "Crear un componente Wizard utilizando useState React hook",
  "description": "Como utilizar useState React hook para crear un sencillo componente Wizard o multi-step",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@draufsicht?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Andreas G\xFCcklhorn</a> on <a href="https://unsplash.com/collections/9718937/solar?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "favorite": true
};
var UseState_para_crear_component_wizard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$c), {}, {
    default: () => `<h2 id="${"tldr"}">TLDR;</h2>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Puedes ver este video en <a href="${"https://egghead.io/lessons/react-crear-un-componente-wizard-usando-usestate-react-hooks?pl=hooks-3d62\u2061=4cexzz"}" rel="${"nofollow"}">egghead.io</a>.
Este video es parte de una <a href="${"https://egghead.io/playlists/hooks-3d62\u2061=4cexzz"}" rel="${"nofollow"}">colecci\xF3n</a> en donde se muestra progresivamente como crear un componente utilizando diferentes hooks y patrones de dise\xF1o</p>`
    })}
${validate_component(EggheadLesson, "EggheadLesson").$$render($$result, {
      lessonId: "react-crear-un-componente-wizard-usando-usestate-react-hooks"
    }, {}, {})}
<p>Un <strong>Wizard</strong> o <strong>multi-step</strong> es un componente que puede contenir multiples \u201Cp\xE1ginas\u201D pero que s\xF3lo renderiza una de ellas y permite navegar hacia delante o atr\xE1s entre las p\xE1ginas restantes. Este tipo de componentes son usualmente utilizados para renderizar formularios largos dividiendolos en diferentes \u201Cpasos\u201D.</p>
<p>Este tipo de componentes requieren el manejo de un estado interno para poder decidir que \u201Cp\xE1gina\u201D se debe renderizar y como los botones del componente deben actuar ante el evento click. La forma que React ofrece para manejar estados internos es utilizando el hook <code>React.useState</code></p>
<p>La forma m\xE1s sencilla de este componente utiliza un estado sencillo que solo indica el indice de la p\xE1gina \u201Cactual\u201D, es decir, la que se mostrar\xE1 en pantalla.</p>
<p>En este ejemplo podemos ver el uso de useState, y como utilizar la forma funcional de la funci\xF3n actualizadora para acceder al estado actual y modificarlo.</p>
<p>Para comenzar, crearemos la base de nuestro componente creando un contenedor que mantendr\xE1 otros dos contenedores, uno para el contenido que se renderizar\xE1 y otro para los botones necesarios para la navegaci\xF3n.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Con esto en su lugar ya podemos definir los componentes que ir\xE1n dentro de nuestro wizard y definir el aspecto que tendr\xE1n cuando sean renderizados para eso crearemos en este caso tres componentes simples que llamaremos page que simplemente contienen un t\xEDtulo indicando la p\xE1gina a la que corresponden y agregamos esto dentro de nuestra aplicaci\xF3n.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Page1</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Pagina 1</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">
  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token function-variable function">Page2</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Pagina 2</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">
  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> <span class="token function-variable function">Page3</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">(</span>
  <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">Pagina 3</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>h1</span><span class="token punctuation">></span></span><span class="token plain-text">
  </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> <span class="token function-variable function">App</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Wizard</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Page1</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Page2</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">Page3</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span><span class="token class-name">Wizard</span></span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Nuestro objetivo ahora es mostrar una p\xE1gina a la vez, por lo que necesitamos manipular los componentes que el wizard recibe. Para esto, utilizaremos la API React.Children que permite manipular el objeto children, en este caso, convirti\xE9ndolo a un arreglo de elementos.
Tambi\xE9n usaremos una variable auxiliar <code>currentPage</code> que mantendr\xE1 la p\xE1gina que se renderizar\xE1 y utilizaremos un \xEDndice para indicar la selecci\xF3n. En este caso utilizamos el primer indice lo que renderizar\xE1 s\xF3lo la prima p\xE1gina que hemos creado.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Ahora es cuando entra en juego el hook <code>useState</code>.</p>
<p>Es necesario que el componente seleccionado en currentPage sea variable, se modifique con el tiempo, y cambie cuando se hace click en alguno de los botones. Esto es que cambie el estado de nuestro componente.</p>
<p>Este estado lo podemos manejar con el hook <code>useState</code> que retorna el arreglo con dos elementos, un valor que llamamos <code>activePageIndex</code> y una funci\xF3n que sirve para definir el valor del estado que llamaremos <code>setActivePageIndex</code>.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>activePageIndex<span class="token punctuation">,</span> setActivePageIndex<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span>activePageIndex<span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Adem\xE1s, useState puede recibir un valor inicial que ser\xE1 en este caso el primer \xEDndice. Con esto, ya podemos usar el valor de <code>activePageIndex</code> para definir qu\xE9 se renderiza en cada momento. Recuerda que cada llamada al componente tiene su propio valor de <code>activePageIndex</code>.</p>
<p>Utilizaremos el valor de <code>activePageIndex</code> para definir si se muestra o no cada bot\xF3n. Para eso simplemente escribimos una condicional ternar\xEDa indicando que se renderice el bot\xF3n con cierta condici\xF3n o se renderice null.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>activePageIndex<span class="token punctuation">,</span> setActivePageIndex<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span>activePageIndex<span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">ButtonPrev</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">></span> <span class="token number">0</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-left<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        Atras
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token function-variable function">ButtonNext</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">&lt;</span> pages<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-right<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        Siguiente
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonPrev</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonNext</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>En el caso del bot\xF3n atr\xE1s, se renderizar\xE1 s\xF3lo si <code>activePageIndex</code>, que es el \xEDndice, sea mayor que <code>0</code>, y en el caso del bot\xF3n Siguiente, se renderizar\xE1 s\xF3lo si <code>activePageIndex</code> es menor que el total de \xEDtems dentro de las p\xE1ginas. A\xFAn los botones no hace espec\xEDficamente nada. Es necesario que el estado pueda cambiar.</p>
<p>Para eso, definiremos dos funciones, una para cuando el bot\xF3n atr\xE1s es presionado y otra para el bot\xF3n siguiente. Para el bot\xF3n atr\xE1s, simplemente disminuimos el valor del \xEDndice. Para eso, utilizamos la forma funcional de la funci\xF3n de actualizaci\xF3n, la funci\xF3n <code>setActivePageIndex</code>.</p>
<p>Este m\xE9todo puede recibir una funci\xF3n que recibe como par\xE1metro el estado actual y modifica el estado en base al valor retornado. En este caso, disminuye el \xEDndice en -1. De forma similar al presionar el bot\xF3n Siguiente, el \xEDndice se incrementar\xE1 en 1.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> <span class="token function-variable function">Wizard</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> children <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>activePageIndex<span class="token punctuation">,</span> setActivePageIndex<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> pages <span class="token operator">=</span> React<span class="token punctuation">.</span>Children<span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span>children<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> currentPage <span class="token operator">=</span> pages<span class="token punctuation">[</span>activePageIndex<span class="token punctuation">]</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">goNextPage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    <span class="token function">setActivePageIndex</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">index</span><span class="token punctuation">)</span> <span class="token operator">=></span> index <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">goPrevPage</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    <span class="token function">setActivePageIndex</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">index</span><span class="token punctuation">)</span> <span class="token operator">=></span> index <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token function-variable function">ButtonPrev</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">></span> <span class="token number">0</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span>
        <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span>
        <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">&#123;</span>goPrevPage<span class="token punctuation">&#125;</span></span>
        <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-left<span class="token punctuation">"</span></span>
      <span class="token punctuation">></span></span><span class="token plain-text">
        Atras
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token function-variable function">ButtonNext</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span>
    activePageIndex <span class="token operator">&lt;</span> pages<span class="token punctuation">.</span>length <span class="token operator">-</span> <span class="token number">1</span> <span class="token operator">?</span> <span class="token punctuation">(</span>
      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span>
        <span class="token attr-name">type</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>button<span class="token punctuation">"</span></span>
        <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">&#123;</span>goNextPage<span class="token punctuation">&#125;</span></span>
        <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons-right<span class="token punctuation">"</span></span>
      <span class="token punctuation">></span></span><span class="token plain-text">
        Siguiente
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span>
    <span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__content<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token punctuation">&#123;</span>currentPage<span class="token punctuation">&#125;</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">className</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>wizard__buttons<span class="token punctuation">"</span></span><span class="token punctuation">></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonPrev</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
        </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span><span class="token class-name">ButtonNext</span></span> <span class="token punctuation">/></span></span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Agregamos estos manejadores de eventos a cada bot\xF3n y con esto ya tenemos una versi\xF3n simplificada de un componente que permite navegar entre los elementos renderizados utilizando <code>useState</code> para manejar el estado.</p>
<p><code>useState</code> permite manejar el estado de un componente definido como una funci\xF3n. <code>useState</code> retorna un arreglo con dos elementos, el valor del estado y una funci\xF3n para modificar ese estado. Es posible pasar una funci\xF3n como argumento a la funci\xF3n modificadora, lo que permite acceder al estado actual y retornar el nuevo estado</p>`
  })}`;
});
var useStateParaCrearComponentWizard = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": UseState_para_crear_component_wizard,
  metadata: metadata$c
});
var css = {
  code: "iframe.svelte-y8qc18{border:0;border-radius:4px;height:500px;overflow:hidden;width:100%}",
  map: '{"version":3,"file":"CodeSandbox.svelte","sources":["CodeSandbox.svelte"],"sourcesContent":["<script>\\n\\texport let codeSandboxId;\\n<\/script>\\n\\n<iframe\\n\\tdata-testid=\\"codesandbox\\"\\n\\ttitle={`codeSandbox-${codeSandboxId}`}\\n\\tclass=\\"codesandbox-mdx-embed\\"\\n\\tsrc={`https://codesandbox.io/embed/${codeSandboxId}`}\\n\\tallow=\\"geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb\\"\\n\\tsandbox=\\"allow-modals allow-forms allow-popups allow-scripts allow-same-origin\\"\\n/>\\n\\n<style>iframe{border:0;border-radius:4px;height:500px;overflow:hidden;width:100%}</style>\\n"],"names":[],"mappings":"AAaO,oBAAM,CAAC,OAAO,CAAC,CAAC,cAAc,GAAG,CAAC,OAAO,KAAK,CAAC,SAAS,MAAM,CAAC,MAAM,IAAI,CAAC"}'
};
var CodeSandbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { codeSandboxId } = $$props;
  if ($$props.codeSandboxId === void 0 && $$bindings.codeSandboxId && codeSandboxId !== void 0)
    $$bindings.codeSandboxId(codeSandboxId);
  $$result.css.add(css);
  return `<iframe data-testid="${"codesandbox"}"${add_attribute("title", `codeSandbox-${codeSandboxId}`, 0)} class="${"codesandbox-mdx-embed svelte-y8qc18"}"${add_attribute("src", `https://codesandbox.io/embed/${codeSandboxId}`, 0)} allow="${"geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"}" sandbox="${"allow-modals allow-forms allow-popups allow-scripts allow-same-origin"}"></iframe>`;
});
var metadata$b = {
  "date": "2020-11-05T12:55:05.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1604581117/halacious-tZc3vjPCk-Q-unsplash_jzsdkp.jpg",
  "keywords": ["useLayoutEffect", "React", "hooks", "useEffect"],
  "tag": "Seed",
  "title": "\xBFCu\xE1ndo usar el hook useLayoutEffect?",
  "description": "\xBFCu\xE1ndo user el hook useLayoutEffect y cu\xE1l es la diferencia con useEffect?",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@halacious?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Halacious</a> on <a href="https://unsplash.com/s/photos/layout?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Cuando_usar_el_hook_uselayouteffect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$b), {}, {
    default: () => `<p>Y \xBFCu\xE1l es la diferencia con el hook <code>useEffect</code>?</p>
<p>useLayoutEffect es similar en casi TODO a useEffect, solo tiene peque\xF1as diferencias.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>###\xA0TLDR:
<code>useEffect</code> es lo que quieres usar el 99% del tiempo.</p>`
    })}
<p>Ambos reciben dos argumentos, un callback que define el efecto y una lista de dependencias.</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">React<span class="token punctuation">.</span><span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token comment">// do something</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>array<span class="token punctuation">,</span> dependency<span class="token punctuation">]</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">React<span class="token punctuation">.</span><span class="token function">useLayoutEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
  <span class="token comment">// do something</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>array<span class="token punctuation">,</span> dependency<span class="token punctuation">]</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Relacionado: Hablamos sobre la <a href="${"https://matiashernandez.dev/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante"}" rel="${"nofollow"}">lista de dependencie este post</a></p>`
    })}
<p>La diferencia entre ambos radica en el momento en que el efecto definido en el callback es ejecutado.</p>
<p><em>useEffect</em> es <strong>ASINCRONO</strong>. y ejecuta el efecto despu\xE9s que tu componente se renderiza asegurando as\xED que tu efecto no bloquer\xE1 el proceso principal.
Tu efecto se ejecutar\xE1 as\xED:</p>
<ol><li>El componente se actualiza por alg\xFAn cambio de estado, props o el padre se re-renderiza</li>
<li>React renderiza el componente</li>
<li>La pantalla se actualiza \u201Cvisualmente\u201D</li>
<li>Tu efecto es ejecutado!! \u{1F389}</li></ol>
<p>Considera este peque\xF1o y restringido ejemplo</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript"><span class="token keyword">const</span> <span class="token function-variable function">Counter</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    <span class="token keyword">const</span> <span class="token punctuation">[</span>count<span class="token punctuation">,</span> setCount<span class="token punctuation">]</span> <span class="token operator">=</span> React<span class="token punctuation">.</span><span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span>
    React<span class="token punctuation">.</span><span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
      <span class="token comment">// Ejecuta el efecto</span>
      <span class="token function">sendToServer</span><span class="token punctuation">(</span>count<span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>count<span class="token punctuation">]</span><span class="token punctuation">)</span>
    <span class="token keyword">return</span> <span class="token punctuation">(</span>
      <span class="token operator">&lt;</span><span class="token operator">></span>
        <span class="token operator">&lt;</span>h1<span class="token operator">></span> Valor actual <span class="token punctuation">&#123;</span>count<span class="token punctuation">&#125;</span> <span class="token operator">&lt;</span><span class="token operator">/</span>h1<span class="token operator">></span>
        <span class="token operator">&lt;</span>button onClick<span class="token operator">=</span><span class="token punctuation">&#123;</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token function">setCount</span><span class="token punctuation">(</span><span class="token parameter">count</span> <span class="token operator">=></span> count <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">&#125;</span><span class="token operator">></span>
            Plus <span class="token number">1</span>
        <span class="token operator">&lt;</span><span class="token operator">/</span>button<span class="token operator">></span>
	   <span class="token operator">&lt;</span><span class="token operator">/</span><span class="token operator">></span>
    <span class="token punctuation">)</span>
 <span class="token punctuation">&#125;</span>
<span class="token operator">...</span>
<span class="token operator">...</span>
<span class="token comment">// render</span>
<span class="token operator">&lt;</span>Counter <span class="token operator">/</span><span class="token operator">></span></code>`}<!-- HTML_TAG_END --></pre>
<p>Cuando el component es renderizado, podr\xE1s ver en pantalla el mensaje
<code>Valor actual 0</code></p>
<p>Y con cada click en el bot\xF3n, el estado del contador se actualizar\xE1, y el DOM mutar\xE1 para pintar el nuevo mensaje en la pantalla, y despu\xE9s el efecto ser\xE1 emitido.</p>
<p><strong>Recuerda: El efecto se emitir\xE1 solo despu\xE9s que los cambios del DOM sean pintados en la pantalla</strong></p>
<p>Sin embargo, si lo que buscas es que tus efectos muten el DOM cambiando la apariencia de este entre el renderizado y tu efecto entonces necesitas usar useLayoutEffect.</p>
<p><strong><code>useLayoutEffect</code></strong> se ejecuta de forma <strong>as\xEDncrona</strong>, justo despu\xE9s de que React ejecut\xF3 todas las mutaciones pero antes de \u201Cpintar\u201D en pantalla.</p>
<p>Esto es \xFAtil para por ejemplo obtener las medidas del DOM y despu\xE9s ejecutar alguna mutaci\xF3n en base a esos datos.</p>
<p>El orden de ejecuci\xF3n para useLayoutEffect es:</p>
<ol><li>El componente se actualiza por alg\xFAn cambio de estado, props o el padre se re-renderiza</li>
<li>React renderiza el componente</li>
<li>Tu efecto es ejecutado!!</li>
<li>La pantalla se actualiza \u201Cvisualmente\u201D</li></ol>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">React<span class="token punctuation">.</span><span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"Efecto desde useEffect"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
React<span class="token punctuation">.</span><span class="token function">useLayoutEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"Efecto desde useLayoutEffect"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>\xBFCu\xE1l ser\xE1 el orden en que esos <code>console.log</code> ser\xE1n emitidos?
\u2026
Ex\xE1cto!!, sin importar que el efecto de <code>useLayoutEffect</code> sea declarado despu\xE9s de <code>useEffect</code> el efecto es emitido antes! \xBFPor qu\xE9?. Por que el efecto de <code>useLayoutEffect</code> es emitido de forma s\xEDncrona.</p>
<p>En definitiva usa useLayoutEffect si tu efecto busca mutar el DOM y obtener datos de este y useEffect el 99% de las veces.</p>
<p>Por lo general tu efecto busca sincronizar alg\xFAn estado interno con un estado externo sin significar un cambio visual inmediato.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Recomendado: Hablamos sobre el modelo mental de useEffect y como este sincroniza el estado interno del componente con el externo en estos posts</p>
<ul><li><a href="${"https://matiashernandez.dev/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida"}" rel="${"nofollow"}">React useEffect hook comparado con los estados del ciclo de vida</a></li>
<li><a href="${"https://matiashernandez.dev/algunos-errores-comunes-al-utilizar-react-hooks"}" rel="${"nofollow"}">Algunos errores comunes al utilizar React Hooks</a></li></ul>`
    })}
<h2 id="${"\xBFcu\xE1ndo-use-uselayouteffect"}">\xBFCu\xE1ndo use useLayoutEffect?</h2>
<p>Literalmente ver\xE1s el momento de usarlo.</p>
<p>Un caso com\xFAn es que tu componente tenga un comportamiento de renderizado con \u201Cflickering\u201D dado que el estado cambia r\xE1pidamente modificando el DOM, otro, es cuando requieres obtener mediciones del DOM.</p>
<p>Mira el siguiente ejemplo:</p>
${validate_component(CodeSandbox, "CodeSandbox").$$render($$result, {
      codeSandboxId: "flamboyant-driscoll-dt3op"
    }, {}, {})}
<p>Este es un simple ejemplo que renderiza un cuadrado verde que por defecto (revisa el archivo style.css) en la esquina superior derecha. El efecto definido lo mueve hacia la esquina inferior derecha.</p>
<p>Deber\xEDas poder ver por un momento (si no lo ves, prueba actualizar el sandbox), un cambio muy r\xE1pido. El cuadrado se \u201Cmueve\u201D de posici\xF3n, esto es por que el efecto se ejecuta despu\xE9s de que React termina de rederizar y mutar el DOM.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Ten en mente que manejar los elementos del DOM de esta manera es un anti-patr\xF3n pero que puede ser resuelto utilizando <code>useRef</code></p>`
    })}
<p>Ahora, veamos lo mismo pero utilizando <code>useLayoutEffect</code></p>
${validate_component(CodeSandbox, "CodeSandbox").$$render($$result, { codeSandboxId: "suspicious-field-5qljd" }, {}, {})}
<p>Ejemplo similar, el cuadrado rojo, est\xE1 definido para que se renderice en la esquina superior derecha y el efecto lo mueve a la esquina inferior izquierda, pero esta vez no hay \u201Cmovimiento r\xE1pido\u201D (flickering). Incluso, aunque refresques el sandbox, el cuadrado estar\xE1 siempre en el mismo lugar, esto por que <code>useLayoutEffect</code> ejecuta el efecto antes de que el DOM sea pintado.</p>`
  })}`;
});
var cuandoUsarElHookUselayouteffect = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Cuando_usar_el_hook_uselayouteffect,
  metadata: metadata$b
});
var metadata$a = {
  "date": "2020-10-09T19:27:23.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1602271677/timj-6BVinN0Y7Xk-unsplash_ge392o.jpg",
  "keywords": ["node", "nvm", "version"],
  "tag": "Post",
  "title": "Definir la version de Node con NVM",
  "description": "NVM es la herramienta que te ayudara a controlar versiones de Node y Tambi\xE9n a definir cual es la versi\xF3n en uso para tu proyecto",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@the_roaming_platypus?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">timJ</a> on <a href="https://unsplash.com/s/photos/version?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Definir_la_version_de_node_con_nvm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$a), {}, {
    default: () => `<p>Cuando trabajas con Node hay muchas cosas que puede variar de un ambiente a otro, una de ellas es la versi\xF3n de Node instalada en cada m\xE1quina, esto, en algunos casos puede traer problemas. Pero, es posible definir o \u201Clock down\u201D una versi\xF3n espec\xEDfica de node.</p>
<p>Una forma de lograr este proceso de manera sencilla es utilizando <a href="${"https://github.com/nvm-sh/nvm"}" rel="${"nofollow"}">*nvm*</a> (Node Version Manager).</p>
<h2 id="${"nvm"}">NVM</h2>
<p><strong>nvm</strong> es un manejador de versione para node, te permite mantener m\xFAltiples versiones de node en tu m\xE1quina y utilizar la que requieras para cada project.</p>
<p>Instalar es sencillo, tan solo debes ejecutar el script de instalaci\xF3n</p>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    <span class="token function">wget</span> -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh <span class="token operator">|</span> <span class="token function">bash</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Este escript, clona el repositorio de nvm dentro del directorio \`~/.nvm\` y agregar alguna lineas a tu archivo de perfil \`.bash<sub>profile</sub>\`, \`.zshrc\`, \`.profile\`, etc.</p>
<p>El manual de uso te puede ayudar en caso de que tenga alg\xFAn problema: <a href="${"https://github.com/nvm-sh/nvm"}" rel="${"nofollow"}">https://github.com/nvm-sh/nvm</a></p>
<h2 id="${"usando-nvmrc"}">Usando .nvmrc</h2>
<p>Si lo que necesitas es definir y <strong>fijar</strong> la versi\xF3n de node para diferentes proyectos, puedes hacer uso del archivo \`.nvmrc\`.</p>
<p>Este archivo, es un archivo de configuraci\xF3n que le indica a \`nvm\` que versi\xF3n de node se requiere para este proyecto.</p>
<p>Simplemente crear este archivo y agrega la versi\xF3n que quieres definir</p>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    <span class="token builtin class-name">echo</span> <span class="token string">"12.15.0"</span> <span class="token operator">></span> .nvmrc</code>`}<!-- HTML_TAG_END --></pre>
<p>Despu\xE9s de eso s\xF3lo debes ejecutar algunos comandos extra para que nvm instale lo necesario</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>\u{1F6A8} estos comandos son ejecutados desde el directorio del proyecto</p>`
    })}
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    nvm use
    nvm <span class="token function">install</span>
    nvm <span class="token builtin class-name">exec</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Listo, ahora tu proyecto tiene la versi\xF3n de node definida, no olvides agegar el archivo \`.nvmrc\` a tu control de versiones</p>
<p>Y ahora a continuar con tu maravilloso proyecto!</p>`
  })}`;
});
var definirLaVersionDeNodeConNvm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Definir_la_version_de_node_con_nvm,
  metadata: metadata$a
});
var metadata$9 = {
  "date": "2021-01-04T11:00:00.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1617320273/nick-bolton-BchlCdwbtMo-unsplash_pgdsfn.jpg",
  "keywords": ["Javascript", "Closures", "React", "Fundamentos", "Stale Closure"],
  "tag": "Seed",
  "title": "\xBFQu\xE9 es un closure en Javascript?",
  "description": "\xBFQu\xE9 es un Closure y por que es relevante al desarrollar con React u otro framework?",
  "bannerCredit": 'Photo by <a href="https://unsplash.com/@nickrbolton?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Nick Bolton</a> on <a href="https://unsplash.com/s/photos/closure?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>',
  "favorite": true,
  "lang": "es"
};
var Que_es_un_closure_en_javascript = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$9), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Esto es parte del material del curso \u201CJavascript para React\u201D del newsletter <a href="${"https://microbytes.matiashernandez.dev"}" rel="${"nofollow"}">Microbytes</a> \xFAnete para recibir este contenido directamente en tu inbox</p>`
    })}
<h1 id="${"closures"}">Closures</h1>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>TLDR;  Tienes una closure cuando una funci\xF3n cualquiera accede a una variable fuera de su contexto.</p>`
    })}
<p>Un elemento escencial en el desarrollo de software es la existencia y uso de funciones, \xBFpor qu\xE9? Por que es la forma \u201Cnatural\u201D de encapsular cierta l\xF3gica y compartirla con otras partes de tu aplicaci\xF3n.</p>
<p>En Javascript un <strong>closure</strong> es creado cada vez que una funci\xF3n es creado, y dado que este tipo de funciones pueden acceder a valores fuera de su propio contexto, el uso de <strong>closures</strong> permite crear y manejar el concepto de <strong>estado</strong> o variables privadas que pueden ser accesibles incluso  cuando la funci\xF3n padre dejo de existir despu\xE9s de su invocaci\xF3n.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">function</span> <span class="token function">exterior</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
	<span class="token keyword">const</span> mensaje <span class="token operator">=</span> <span class="token string">'Hola mundo'</span><span class="token punctuation">;</span>
  <span class="token keyword">function</span> <span class="token function">interior</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
       <span class="token keyword">return</span> mensaje<span class="token punctuation">;</span>
  <span class="token punctuation">&#125;</span>
  <span class="token keyword">return</span> interior<span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span>

<span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token function">exterior</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//retorna el mensaje "Hola mundo"</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Aqu\xED tenemos la variable <code>mensaje</code> dentro de la funci\xF3n <code>exterior</code>. Es una variable local y no puede ser accedida desde fuera de la funci\xF3n, pero si desde el interior de la funci\xF3n en la funci\xF3n <code>interior</code>.</p>
<p>Cuando asignamos la funci\xF3n <code>exterior</code> a la variable <code>foo</code> lo que ocurre es lo siguiente:</p>
<ul><li>La funci\xF3n <code>exterior</code> se ejecuta una vez y <code>foo</code> se convierte ahora en la declaraci\xF3n de una funci\xF3n (se le asigna el \u201Cvalor\u201D de lo que retorna <code>exterior</code> que en este caso es <code>interior</code>).</li>
<li>La variable <code>foo</code> tiene acceso a la funci\xF3n (closure) <code>interior</code> y desde ah\xED a la variable <code>mensaje</code>.</li></ul>
<p>En javascript los closures son creados con toda la informaci\xF3n del entorno donde fueron creadas. La funci\xF3n <code>foo</code> tiene una referencia al closure <code>interior</code>, el que fue creado durante la ejecuci\xF3n de la funci\xF3n <code>exterior</code>. La funci\xF3n <code>interior</code> (el closure) mantiene la informaci\xF3n de su ambiente: La variable <code>mensaje</code>.</p>
<p>Puedes leer m\xE1s sobre Closures en <a href="${"https://www.freecodecamp.org/espanol/news/que-es-un-closure-en-javascript/"}" rel="${"nofollow"}">https://www.freecodecamp.org/espanol/news/que-es-un-closure-en-javascript/</a></p>
<h2 id="${"\xBFpor-qu\xE9-aprender-sobre-closures-para-trabajar-con-react"}">\xBFPor qu\xE9 aprender sobre Closures para trabajar con React?</h2>
<p>Closures est\xE1n por todas partes en React, sobre todo ahora con la existencia y uso de la API de hooks. Los hooks se basan fuertemente en el uso de closures, lo que permite que los hooks sean tan expresivos y simples.</p>
<p>Un problema que se presenta con este extensivo uso de closures es el de \u201Cel closure rancio\u201D (stale closure) \xBFWTF es esto?</p>
<h3 id="${"stale-closure"}">Stale Closure</h3>
<p>Revisemos el siguiente c\xF3digo</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">function</span> <span class="token function">contador</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
  <span class="token keyword">let</span> value <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token keyword">function</span> <span class="token function">incrementar</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
    value<span class="token operator">++</span><span class="token punctuation">;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span>
  <span class="token punctuation">&#125;</span>
  <span class="token keyword">function</span> <span class="token function">decrementar</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
    value<span class="token operator">--</span><span class="token punctuation">;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span>
  <span class="token punctuation">&#125;</span>
  <span class="token keyword">const</span> mensaje <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">El valor actual es </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>value<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token template-punctuation string">&#96;</span></span>
  <span class="token keyword">function</span> <span class="token function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
    console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>mensaje<span class="token punctuation">)</span>
  <span class="token punctuation">&#125;</span>
  <span class="token keyword">return</span> <span class="token punctuation">[</span>incrementar<span class="token punctuation">,</span> decrementar<span class="token punctuation">,</span> log<span class="token punctuation">]</span>
<span class="token punctuation">&#125;</span>
<span class="token keyword">const</span> <span class="token punctuation">[</span>incrementar<span class="token punctuation">,</span> decrementar<span class="token punctuation">,</span> log<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">contador</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token function">incrementar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// logs 1</span>
<span class="token function">incrementar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// logs 2</span>
<span class="token function">decrementar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// logs 1</span>
<span class="token comment">// No funciona</span>
<span class="token function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>       <span class="token comment">// logs "El valor actual es 0"</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Puedes ver el <a href="${"https://jsitor.com/UQpQtnE_I"}" rel="${"nofollow"}">demo aqui</a></p>
<p>Claramente algo extra\xF1o pasa aqu\xED, la funci\xF3n <code>log</code> nos muestra que el valor es <code>0</code> cuando sabemos que debe ser <code>1</code>.</p>
<p>Esta es un \u201Cstale closure\u201D. El closure <code>log</code> captur\xF3 el valor de <code>mensaje</code> en la primera ejecuci\xF3n de la funci\xF3n <code>contador</code> cuando el valor de <code>value</code> era <code>0</code>.</p>
<h3 id="${"\xBFc\xF3mo-arreglarlo"}">\xBFC\xF3mo arreglarlo?</h3>
<p>La soluci\xF3n es \u201Csencilla\u201D. Primer debemos notar que el closure <code>log</code> se cerr\xF3 sobre la variable <code>mensaje</code> que no es la variable que cambia. Entonces, debemos refactorizar este trozo de c\xF3digo para cerrar nuestro closure sobre la variable que realmente cambia</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">...</span>
<span class="token operator">...</span>
<span class="token keyword">function</span> <span class="token function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
	<span class="token keyword">const</span> mensaje <span class="token operator">=</span> <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">El valor actual es </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>value<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token template-punctuation string">&#96;</span></span>
	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>mensaje<span class="token punctuation">)</span>
<span class="token punctuation">&#125;</span>
<span class="token operator">...</span>
<span class="token operator">...</span></code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"\xBFqu\xE9-relaci\xF3n-tiene-con-react"}">\xBFQu\xE9 relaci\xF3n tiene con React?</h3>
<p>Sabemos que los hooks se basan en el funcionamiento de las closures, y uno de los hooks m\xE1s \u201Ccomplejos\u201D y utilizados es  <code>useEffect</code>. Este hook se utiliza para ejecutar <strong>efectos,</strong> es decir, para sincronizar el estado interno del componente con alg\xFAn estado externo. </p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Puedes leer m\xE1s en</p>`
    })}
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p><a href="${"https://matiashernandez.dev/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida"}" rel="${"nofollow"}">https://matiashernandez.dev/react-useeffect-hook-comparado-con-los-estados-del-ciclo-de-vida</a></p>`
    })}
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p><a href="${"https://matiashernandez.dev/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante"}" rel="${"nofollow"}">https://matiashernandez.dev/react-useeffect-por-que-el-arreglo-de-dependencias-es-importante</a></p>`
    })}
<p><code>useEffect</code> recibe un <code>callback</code> que es en efecto un closure y un arreglo de dependencias que le indica que \u201Cvalores observar\u201D para ejecutar el closure definido.</p>
<p>Si no indicas ning\xFAn valor en el arreglo de dependencias el closure usado como primer argumento se \u201Ccerrar\u201D sobre los valores existentes en el primer render.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>seguiremos hablando sobre este hook m\xE1s adelante</p>`
    })}
<p>Otro caso es con el hook <code>useState</code>. Este hook retorna una tupla con el valor del estado y una funci\xF3n que permite actualizar el estado.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">function</span> <span class="token function">Contador</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">const</span> <span class="token punctuation">[</span>count<span class="token punctuation">,</span> setCount<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">function</span> <span class="token function">onClick</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
    <span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
      <span class="token function">setCount</span><span class="token punctuation">(</span>count <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">&#125;</span>

  <span class="token keyword">return</span> <span class="token punctuation">(</span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span><span class="token plain-text">
      </span><span class="token punctuation">&#123;</span>count<span class="token punctuation">&#125;</span><span class="token plain-text">
      </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>button</span> <span class="token attr-name">onClick</span><span class="token script language-javascript"><span class="token script-punctuation punctuation">=</span><span class="token punctuation">&#123;</span>onClick<span class="token punctuation">&#125;</span></span><span class="token punctuation">></span></span><span class="token plain-text">+1</span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>button</span><span class="token punctuation">></span></span><span class="token plain-text">
    </span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>
  <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Este simple componente renderiza un bot\xF3n que al ser clickeado actualiza el estado a\xF1adiendo <code>1</code> al valor de <code>count</code> pero lo hace despu\xE9s de 1 segundo.</p>
<p>Al hacer un par de clicks en el bot\xF3n (m\xE1s r\xE1pido que 1 segundo) se esperar\xEDa que el valor de  <code>count</code> fuese <code>2</code> pero es en realidad <code>1</code>.</p>
<p>Puedes ver el <a href="${"https://codesandbox.io/s/beautiful-sunset-k1bkl?file=/src/App.js"}" rel="${"nofollow"}">demo aqu\xED</a></p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>\xBFQu\xE9 crees que pasa y como puedes solucionarlo?</p>`
    })}`
  })}`;
});
var queEsUnClosureEnJavascript = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Que_es_un_closure_en_javascript,
  metadata: metadata$9
});
var metadata$8 = {
  "date": "2022-02-04T11:00:00.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1618393569/sangga-rima-roman-selia-VkNrl7ZHi5M-unsplash_g7uqm4.jpg",
  "keywords": ["JamStack", "Static Site Generator", "SSG", "SSR", "Gatsby", "Next.js", "Next"],
  "tag": "Post",
  "title": "\xBFPor que JamStack es tan cool?",
  "description": "JamStack es una arquitectura, un concepto que engloba decisiones sobre como un app ser\xE1 construida. Incluso podr\xEDamos ir m\xE1s all\xE1 y decir que JamStack es una filosof\xEDa o modelo que busca dr\xE1sticamente eliminar la complejidad de nuestros sistemas buscando como objetivo final el poder crear y distribuir mejores aplicaciones en menos tiempo."
};
var Por_que_jamstack_es_tan_cool = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$8), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h3 id="${"tldr"}">TLDR;</h3>
<p>Este post es parte del episodio 7 de la segunda temporada de <a href="${"https://www.cafecon.tech"}" rel="${"nofollow"}">Caf\xE9 con Tech</a></p>
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
        buzzsproutId: "/8317715-por-que-jamstack-es-tan-cool"
      }, {}, {})}`
    })}
<p>El mundo del desarrollo web cambia constantemente, tanto que intentamos clasificar cada etapa o \xE9poca para darle un poco de sentido a la constante e incluso azarosa evoluci\xF3n de la tecnolog\xEDa y nuestros trabajos.</p>
<p>Es claro que no existen absolutos, ni verdades escritas en piedras, que todo conocimiento est\xE1 sujeto a cambios y mejoras o incluso a ser olvidado en el tiempo.</p>
<p>Y esto no deja de ser cierto cuando comenzamos un nuevo proyecto y debemos tomar decisiones de arquitectura del software. Muchos hemos pasado horas de nuestra vida trabajando hasta tarde, mejorando o reparando c\xF3digo, fines de semana en que \u201Cproducci\xF3n se cay\xF3\u201D, y cientos de horas en reuniones que intentan buscar el problema o peor a\xFAn, apuntar culpables. Pero la gran mayor\xEDa de las veces estos problemas no viene causados por un simple bug, si no m\xE1s bien por decisiones de arquitectura que no fueron adecuadas o se convirtieron en algo tan complejo que es casi imposible cambiarlas, mejorarlas o incluso entenderlas.</p>
<p>JamStack es una arquitectura, un concepto que engloba decisiones sobre como un app ser\xE1 construida. Incluso podr\xEDamos ir m\xE1s all\xE1 y decir que JamStack es una filosof\xEDa o modelo que busca dr\xE1sticamente eliminar la complejidad de nuestros sistemas buscando como objetivo final el poder crear y distribuir mejores aplicaciones en menos tiempo.</p>
<p>Mucho hemos escuchado (y algunos incluso predicado) \u201CMove fast break things\u201D, pero que tan cierto es? Que tan r\xE1pido puedes moverte cuando la aplicaci\xF3n en la que trabajas a crecido a pasos agigantados creando m\xE1s complejidad e incluso burocracia para poder desarrollar nuevos features?. Como puedes moverte r\xE1pido cuando pasas el 80% de tu tiempo resolviendo errores?.</p>
<p>Un problema com\xFAn es que las aplicaciones comienzan a crecer, por lo que mantener un modelo mental de todo lo que la aplicaci\xF3n hacer se vuelve imposible o al menos dif\xEDcil para muchos en el equipo. Los equipos cambian, crecen o disminuyen y quienes tomaron las primeras decisiones quiz\xE1 ya no est\xE1n. Entonces la aplicaci\xF3n se vuelve una gran carga en donde agregar nuevas cosas se vuelve un juego de malabarismo que muchas veces termina en decidir no cambiar ni eliminar solo agregar, incrementando as\xED a\xFAn m\xE1s la complejidad, el tiempo de desarrollo y el proceso de llevar a producci\xF3n.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p><strong>Si queremos movernos r\xE1pido es necesario hacer menos cosas</strong>.</p>`
    })}
<p>Jamstack es un dise\xF1o de arquitectura pensando para evitar la complejidad para poder as\xED, moverse m\xE1s r\xE1pido.</p>
<p>Un app JamStack es b\xE1sicamente un frontend con \u201Cassets\u201D est\xE1ticos que se comunica con una o m\xE1s fuentes de datos, es decir, es un frontend simplificado, at\xF3mico y escalable, pero sobre todo <strong>simple</strong>.</p>
<p>Es com\xFAn que cuando dices \u201CJamStack\u201D son archivos est\xE1ticos, el s\xF3lo uso de la palabra est\xE1tico levanta alarmas en los o\xEDdos de los no iniciados, llev\xE1ndoos a pensar que Jamstack es una especie de locura que imposibilita tener dinamismo en sus aplicaciones o sitios web, pero no pueden estar m\xE1s errados.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p><strong>archivos o</strong> \u201C<strong>assets\u201D est\xE1ticos no es lo mismo que sitios est\xE1ticos.</strong></p>`
    })}
<p>Tus archivos javascript, css e im\xE1genes son archivos est\xE1ticos, son almacenados en el sistema de archivo y no son \u201Cregenerados\u201D cada vez que visitas un sitio web. Pero javascript permite dar dinamismo al contenido de tu sitio web, permiti\xE9ndote obtener datos cuando es necesario, tener Code Splitting, mostrar o esconder contenido, es decir, tener contenido que no es nada similar a ser est\xE1tico.</p>
<p>Otro problema com\xFAn cuando llega la hora de decidir si usar o no una arquitectura JamStack es la idea de que <strong>no es posible</strong> manejar grandes sitios web o aplicaciones,  que el tiempo de compilaci\xF3n ser\xE1 <strong>demasiado alto</strong> y que no valdr\xE1 la pena. Y esto guarda cierto grado de verdad.</p>
<p>Una arquitectura JamStack se basa en dos principales ideas:</p>
<ul><li>Frontend y backend desacomplados</li>
<li>Compilaci\xF3n del frontend para generar archivo est\xE1ticos</li></ul>
<p>Y es esta fase de compilaci\xF3n la que puede crear situaciones de largas esperas cuando hablamos de cientos de miles de archivos.</p>
<p>La idea aqu\xED es que el proceso de construcci\xF3n del sitio lee cada uno de los archivos o datos necesarios para ir generando archivos html (y sus otros assets asociados), y esto puede tomar mucho tiempo entre obtener los datos y crear los archivos. Pero siguiendo la idea de buscar la simplicidad en nuestras soluciones, como reza el principio de la Navaja de Ockham podemos dise\xF1ar una soluci\xF3n a este problema.</p>
<p>Una gran aplicaci\xF3n o sitio web se compone de varias instancias o contextos, por lo que es posible dividir el sitio en esos diversos contextos creando as\xED sitios m\xE1s peque\xF1os - Divide y Vencer\xE1s -. Estos sitios a su vez pueden volver a sud-dividirse y as\xED consecutivamente hasta cuando haga sentido. Ahora, construir estos peque\xF1os sitios es r\xE1pido e incluso paralelizable, por lo que el problema del tiempo de compilaci\xF3n queda resuelto. S\xF3lo nos queda dise\xF1ar como se unir\xE1n estos sitios para recrear el sitio final lo que normalmente incluye configuraciones en el dominio y/o proxies en el servidor o mejor a\xFAn, configuraciones en el CDN.</p>
<h2 id="${"\xBFy-que-tal-la-escalabilidad"}">\xBFY que tal la escalabilidad?</h2>
<p>Este es otro tema que genera cierto grado de discusi\xF3n, por alguna raz\xF3n los detractores u objetores de esta arquitectura pregonan que no tiene una gran escalabilidad, pero, considera esto: Desde el punto de vista del deployment, un sitio Jamstack no es m\xE1s que una colecci\xF3n de directorios y archivos est\xE1ticos que pueden ser f\xE1cilmente servidor por un CDN, es decir, la arquitectura is inherentemente escalable - y de bajo costo - Un gran ejemplo es <a href="${"https://covidtracking.com/"}" rel="${"nofollow"}">covidtracking.com</a>  sitio web creado con una arquitectura JamStack, puedes ver su <a href="${"https://github.com/COVID19Tracking"}" rel="${"nofollow"}">c\xF3digo en github</a> en donde ver\xE1s varios repositorios que dividen contextos y responsabilidades. Este sitio escalo de la noche a la ma\xF1ana para recibir m\xE1s de 2 millones de requests al d\xEDa y sin siquiera sonrojarse.
Por cierto, el sitio web es un sitio Gatsby que consume datos de diversas fuentes.</p>
<p>Finalmente la arquitectura JamStack es una forma de definir la arquitectura de tu sitio de forma simple y sencilla - que no es lo mismo que f\xE1cil -. La complejidad constituye de forma subyacente un bug que vendr\xE1 a morderte tarde o temprano</p>
<p>##\xA0Opciones</p>
<p>Ahora, \xBFqu\xE9 opciones tienes para construir tu sitio Jamstack?. Bueno, hay muchas, quiz\xE1 las m\xE1s conocidas hoy son generar tu sitio con Next.js, Gatsby o Nuxt. La verdad es que la decisi\xF3n de que herramienta usar\xE1s no es m\xE1s que una cuesti\xF3n de gustos o de que alguna u otra caracter\xEDstica te gusta  m\xE1s o tu equipo la conoce de mejor manera.</p>
<p><a href="${"http://gatsbyjs.com/"}" rel="${"nofollow"}">Gatsby</a> y <a href="${"http://nextjs.org/"}" rel="${"nofollow"}">Next</a> son frameworks para crear aplicaciones que utilizan React para definir su interfaz y otro variopinto conjunto de decisiones y opciones para ayudarte a construir una aplicaci\xF3n simple, efectiva y escalable.</p>
<ul><li><a href="${"http://nuxtjs.org/"}" rel="${"nofollow"}">Nuxt</a> y <a href="${"https://gridsome.org/"}" rel="${"nofollow"}">Grindsome</a> son la misma idea pero para trabajar con Vue</li>
<li><a href="${"http://kit.svelte.dev/"}" rel="${"nofollow"}">Svelkit</a> y <a href="${"https://elderguide.com/tech/elderjs/"}" rel="${"nofollow"}">Elder.js</a> para Svelte</li>
<li><a href="${"https://scully.io/"}" rel="${"nofollow"}">Scully </a> para Angular</li>
<li><a href="${"https://gohugo.io/"}" rel="${"nofollow"}">Hugo</a> escrito en Go</li>
<li><a href="${"https://cobalt-org.github.io/"}" rel="${"nofollow"}">Cobalt</a> escrito en Rust</li>
<li>y as\xED <a href="${"https://jamstack.org/generators/"}" rel="${"nofollow"}">muchos m\xE1s</a>.</li></ul>
<p>Tambi\xE9n existen muchas soluciones para administrar tus datos desde opciones \u201CNo-Code \u201Ccomo <a href="${"http://airtable.com/"}" rel="${"nofollow"}">Airtable</a> o CMS m\xE1s complejos como el mism\xEDsimo Wordpress o <a href="${"https://www.contentful.com"}" rel="${"nofollow"}">Contentful</a>, [Strapi][https://strapi.io], <a href="${"https://sanity.io"}" rel="${"nofollow"}">Sanity</a>, etc o incluso directamente trabajar con bases de datos como <a href="${"https://prisma.io"}" rel="${"nofollow"}">Prisma</a> o <a href="${"https://upstash.com"}" rel="${"nofollow"}">Upstash</a>.</p>
<p>El n\xFAmero de opciones es grande y las posibilidades son tremendas, en mi opini\xF3n no existe aplicaci\xF3n, sitio web o equipo que no se beneficie de este patr\xF3n de dise\xF1o.</p>`
  })}`;
});
var porQueJamstackEsTanCool = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Por_que_jamstack_es_tan_cool,
  metadata: metadata$8
});
var metadata$7 = {
  "date": "2020-10-06T14:07:42.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1601993304/oskar-yildiz-gy08FXeM2L4-unsplash_v6ccmb.jpg",
  "keywords": ["React Native", " Android", " IOS", " IOS Simulator", " Android Studio"],
  "tag": "Seed",
  "title": "Comenzando con React Native",
  "description": "React Native es un framework que te permite utilizar Javascript y React para desarrollar tu aplicaci\xF3n nativa. Para iniciar debes configurar algunas cosas primero.",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@oskaryil?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Oskar Yildiz</a> on <a href="https://unsplash.com/s/photos/react-native?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Comenzando_con_react_native = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$7), {}, {
    default: () => `<p>Esta semana he comenzado un nuevo proyecto junto a un nuevo equipo en <a href="${"https://moduscreate.com"}" rel="${"nofollow"}">Modus Create</a>. Una nueva intersante aventura creando una nueva aplicaci\xF3n utilizando React pero esta vez se trata de una aplicaci\xF3n nativa para Android, es decir, utilizando React Native.</p>
<h1 id="${"\xBFqu\xE9-es-react-native"}">\xBFQu\xE9 es React Native?</h1>
<p>React Native es, actualmente, un framework bastante popular que permite crear aplicaciones nativas utilizando Javascript, aplicaciones nativas para Android e iOS.</p>
<p>Fue inicialmente publicado por Facebook el 2015 y en solo unos pocos a\xF1os se convirti\xF3 en una soluci\xF3n importante a la hora de construir aplicaciones mobiles.</p>
<p>B\xE1sicamente React Native utiliza el poder de React para \u201Ccompilar\u201D o m\xE1s bien \u201Ctranspilar\u201D c\xF3digo Javascript a c\xF3digo nativo de cada plataforma. La principal diferencia entre React y React Native es que React Native en realidad utiliza React pero sobre una nueva plataforma y en ez de utilizar primitivas del DOM (provistas por react-dom) utiliza primitvas para apuntar a los dispositivos.</p>
<p>En vez de divs y spans (primitivas provistas por react-dom) se usa <code>&lt;View&gt;</code>, <code>&lt;Text&gt;</code>, etc</p>
<p>La idea de este framework es permitir el desarrollo multiplataforma de aplicaciones, permite combinar las \u201Cmejores\u201D partes de el desarrollo de aplicaciones nativas y el flexible uso (y conocimiento) de Javascript.</p>
<h2 id="${"ios-simulator"}">iOS Simulator</h2>
<p>Para ejecutar tu app en un simulador de iOS necesitas, primero un Mac, luego instalar Xcode, la forma m\xE1s simple de hacerlo es instalado desde la <a href="${"https://itunes.apple.com/us/app/xcode/id497799835?mt=12"}" rel="${"nofollow"}">Mac App Store</a> eso tambi\xE9n instalar el simulador de iOS.</p>
<h3 id="${"command-line-tools"}">Command Line Tools</h3>
<p>Tambi\xE9n ser\xE1 necesario instalar las herramientas de linea de comando, para esto simplemente abre XCode, selecciona preferencias (CMD + ,) y en la pesta\xF1a \u201CLocations\u201D selecciona desde el dropdown la versi\xF3n m\xE1s reciente.</p>
<p><img src="${"https://reactnative.dev/docs/assets/GettingStartedXcodeCommandLineTools.png"}" alt="${"img"}" title="${"Preferencias de XCode"}"></p>
<h3 id="${"ios-simulator-1"}">iOS Simulator</h3>
<p>Nuevamente en la preferencias de Xcode, selecciona la pesta\xF1a <strong>Componentes</strong>. Seleciona el simulador que deseas.</p>
<p>Finalmente es neceario instalar <a href="${"https://cocoapods.org/"}" rel="${"nofollow"}">Cocoapods</a>, esta es una herramiente escrita en Ruby que te permitir\xE1 manejar dependencias. Por defecto tu SO ya tiene ruby instalado, por lo que solo debes abrir la consola y ejecutar</p>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    <span class="token function">sudo</span> gem <span class="token function">install</span> cocoapods</code>`}<!-- HTML_TAG_END --></pre>
<h2 id="${"android-emulator"}">Android emulator</h2>
<p>Para ejecutar tu aplicaci\xF3n el el simulador de Android necesitar\xE1s</p>
<ul><li><p>node</p></li>
<li><p>watchman</p></li>
<li><p>el JDK</p></li>
<li><p>Android Studio</p>
<p>Anroid Studio es necesario para poder utilizar las herramientas de compilado de Android, puedes usar el editor de tu gusto para desarrollar.</p>
<p>Lo primero ser\xE1 instalar node y watchman, lo m\xE1s seguro es que puede saltarte este paso ya que probablemente ya tienes esto instalado</p></li></ul>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">      brew <span class="token function">install</span> node
      brew <span class="token function">install</span> watchman</code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"java-development-kit"}">Java Development Kit</h3>
<p>El JDK provee herramientas para el desarrollo de aplicaciones Java, Android utiliza estas herramientas en el proceso de compilar y construir el paquete de la aplicaci\xF3n.
Se recomienda utilizar Hoombrew para instalar.</p>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    brew cask <span class="token function">install</span> adoptopenjdk/openjdk/adoptopenjdk8</code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"android-development-env"}">Android development env</h3>
<p>Esta parte puede ser algo tediosa pero no es compleja.</p>
<ul><li>Instala Android Studio descargandolo desde <a href="${"https://developer.android.com/studio/index.html"}" rel="${"nofollow"}">aqui</a>
Y en el wizard asegurate de que los siguiente checkbox est\xE9n activados<ul><li>Android SDK</li></ul></li>
<li>Android SDK Platform<ul><li>Android Virtual Device<ul><li>Performance (Intel HAXM)</li></ul></li></ul></li></ul>
<p>Despu\xE9s de que este parte finalice debes instalar el Android SDK, Android Studio instala el \xFAltimo SDK por defecto, pero para react-native requieres \\Android 10 (Q)\\. Asegurate que este instalada esa versi\xF3n. Abre Android Studio, click en \u201CConfigurar\u201D y selecciona <strong>SDK Manager</strong>.
En este ventana, seleciona las plataformas que desea, revisa que Android 10 (Q) esta seleccionado, expande este elemento de la lista y asegurate que tambi\xE9n esten seleccionadas</p>
<ul><li>Android SDK Platform 29</li>
<li>Intel x86 Atom<sub>64</sub> System Image or Google APIs Intel x86 Atom System Image</li></ul>
<p>Finalmente click en \u201CApplicar\u201D.</p>
<p>El \xFAltimo paso en configurar las variables de ambiente para ANDROID<sub>HOME</sub>
Edita tu archivo \`.bash<sub>profile</sub>\` o \`.bashrc\` o \`.zprofile\` o \`.zshrc\`, dependiendo de la shell que este utiliznado y agrega:</p>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    <span class="token builtin class-name">export</span> <span class="token assign-left variable">ANDROID_HOME</span><span class="token operator">=</span><span class="token environment constant">$HOME</span>/Library/Android/sdk
    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/emulator
    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/tools
    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/tools/bin
    <span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span><span class="token variable">$ANDROID_HOME</span>/platform-tools</code>`}<!-- HTML_TAG_END --></pre>
<h1 id="${"crear-una-aplicaci\xF3n"}">Crear una aplicaci\xF3n!</h1>
<p>Ya est\xE1 todo listo para crear tu primera aplicaci\xF3n, abre una consola y ejecuta</p>
<pre class="${"language-shell"}"><!-- HTML_TAG_START -->${`<code class="language-shell">    expo init MiNuevaAppRN
    
    <span class="token builtin class-name">cd</span> MiNuevaAppRN
    <span class="token function">npm</span> start</code>`}<!-- HTML_TAG_END --></pre>
<p>Esto crear un proyecto expo con todo lo necesario para ejecutar la app (algo as\xED com \`create-react-app\` para la web) y con \`npm start\` iniciar el servidor de desarrollo.</p>
<p>Y ya est\xE1 ahora, se abrir\xE1 una ventana en tu navegador por defecto mostrando la vista de Metro Bundler, que es el empaquetador de expo y te permitir\xE1 ejecutar tu app en el navegador, en alguno de los simuladores o utilizar el c\xF3digo QR para ejecutar la app en tu dispositivo m\xF3vil utilizando la app Expo.</p>`
  })}`;
});
var comenzandoConReactNative = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Comenzando_con_react_native,
  metadata: metadata$7
});
var metadata$6 = {
  "date": "2020-12-09T05:37:24.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1607492631/austin-neill-ZahNAl_Ic3o-unsplash_rvmpkh.jpg",
  "keywords": [
    "JamStack",
    "SSR",
    "SSG",
    "Static Generator",
    "Server Rendering",
    "Gatsby",
    "Next.js"
  ],
  "tag": "Post",
  "title": "JAMStack: \xBFQu\xE9 es SSG y SSR?",
  "description": "Una pregunta que suele aparecer en las foros y comunidades es la comparaci\xF3n entre Gatsby y Next.js o, la subyacente pregunta. Qu\xE9 es SSG y SSR? Cu\xE1l debo usar para X caso de uso y c\xF3mo comenzar?",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@arstyy?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Austin Neill</a> on <a href="https://unsplash.com/s/photos/stack?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Jamstack_que_es_ssg_y_ssr = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$6), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>TLDR; Este contenido fue publicado como episodio mi podcast <a href="${"http://www.cafecon.tech/1081172/6725749-jamstack-que-es-ssg-y-ssr"}" rel="${"nofollow"}">Caf\xE9 con Tech</a></p>`
    })}
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
      buzzsproutId: "6725749-jamstack-que-es-ssg-y-ssr"
    }, {}, {})}
<p>Cuando hablamos de <em>JAMstack</em> consideramos una colecci\xF3n de tecnolog\xEDas que se complementan para permitir la producci\xF3n de aplicaciones mediante el uso de sitios est\xE1ticos.</p>
<p>Una pregunta que suele aparecer en las foros y comunidades es la comparaci\xF3n entre Gatsby y Next.js o, la subyacente pregunta. Qu\xE9 es SSG y SSR? Cu\xE1l debo usar para X caso de uso y c\xF3mo comenzar?</p>
<p>Comencemos para definir cada unos de estos conceptos, iniciando por SSG.</p>
<p>SSG es el acr\xF3nimo para el conjunto de tecnolog\xEDas que permiten la generaci\xF3n de sitios est\xE1ticos.</p>
<p>Tal c\xF3mo comentamos en el episodio 31, los sitios web est\xE1ticos son tan antiguos como la web, t\xE9nicamente todo el contenido creado desde el comienzo, incluyendo el primer sitio web alojado en el computador Next de Sir Tim Bernes Leee, es un sitio est\xE1tico y por lo tanto puede ser considerado JamStack.</p>
<p>Actualmente, con el poder que Javascript ofrece a la hora de desarrollar sitios web, nuevas puertas se han abierto para que estos sitios est\xE1ticos tengan dinamismo.</p>
<p>Actualmente hay herramientas que permiten la generaci\xF3n de estos sitios est\xE1ticos, es decir, archivos HTML que ser\xE1n distribuidos desde un CDN, creados de forma automatica desde alguna fuente en particular.</p>
<h1 id="${"que-es-static-generation"}">Que es Static Generation?</h1>
<p>Static Generation describe el proceso de compilar y renderizar, es decir, crear el contenido html, en tiempo de compilaci\xF3n o build time. El resultado de este proceso ser\xE1 un set de archivos est\xE1ticos, incluyendo html, imagenes, css y javascript.</p>
<p>Desde este proceso nace el nombre de Static Site Generator.</p>
<h1 id="${"que-ocurre-durante-este-proceso"}">Que ocurre durante este proceso?</h1>
<p>Una aplicaci\xF3n javascript, como las conocemos funciona en un browser. El browser descarga un archivo HTML bastante sencillo que a su vez solicita la descarga de archivos javascript que contienen la l\xF3gica para renderizar el contenido de la interfaz, un proceso tambi\xE9n conocido como \u201Chidrataci\xF3n\u201D o hydrate.</p>
<p>Los generadores est\xE1ticos ejecutan este mismo proceso, pero durante el tiempo de compilaci\xF3n y sin necesitar un browser creando internamente el \xE1rbol de componentes del futuro sitio web.</p>
<p>La ventaja de este proceso es que el resultado, al ser simples archivos est\xE1ticos ofrecen un tiempo de carga bajo adem\xE1s de permitir servir el contenido desde muchos servicios e incluso gratis o al menos muy barato. Adem\xE1s, este tipo de apps pueden tener un muy buen ranking SEO ya que al ser contenido simple HTML se pueden aplicar muchas t\xE9nicas de optiizaci\xF3n para buscadores.</p>
<p>Existen dos problemas importantes con \xE9ste m\xE9todo: los tiempos de compilaci\xF3n pueden ser muy largos, ya que con cada cambio que se haga al contenido el sitio debe ser compilado nuevamente. El otro problema es que el contenido se vuelve obsoleto, ya que los cambios no se reflejan hasta una nueva compilaci\xF3n y deploy.</p>
<p>Recordemos que a pesar de ser llamados sitios est\xE1ticos, esto no implica que no puedan tener bits de dinamismo en la p\xE1gina ya compilada. Es posible, por ejemplo, consumir alguna api desde los archivos generados permitiendo asi evitar el problema del contenido obsoleto.</p>
<p>Algunos generadores de sitios est\xE1ticos que puede encontrar
<a href="${"http://gatsbyjs.com/"}" rel="${"nofollow"}">Gatsby</a>, <a href="${"http://gatsbyjs.com/"}" rel="${"nofollow"}">Hugo</a>, <a href="${"http://jekyllrb.com/"}" rel="${"nofollow"}">Jekyll</a>, <a href="${"http://11ty.dev/"}" rel="${"nofollow"}">11ty</a>, <a href="${"http://nuxtjs.org/"}" rel="${"nofollow"}">nuxt</a>, etc. Puedes encontrar una extensa lista visitando  <a href="${"http://staticgen.com/"}" rel="${"nofollow"}">http://staticgen.com/</a></p>
<h1 id="${"que-es-server-side-rendered"}">Que es Server Side Rendered</h1>
<p>Por otro lado, Server Side Rendered es tambi\xE9n una t\xE9nica que ha existido por a\xF1os en la web, se trata b\xE1sicaente de permitir que sea el servidor quien genere los archivos HTML o el contenido HTML en tiempo de ejeuci\xF3n. Esto es lo que siempre han hechos los sitios escritos en PHP como Wordpress o sitios creados con Rails, Django, etc.</p>
<p>La diferencia con la nueva iteraci\xF3n de esta ideaa es que existian limitantes a la hora de manejar la interacci\xF3n con el cliente, el servidor est\xE1 limitado a manejar s\xF3lo el contenido inicial que se renderiza, cualquier otro comportamiento adicional que se requiera debe o ser creado con llamadas a alguna api para hacer modificaciones sobre los datos de forma \u201Cdin\xE1mica\u201D o volviendo a renderizar la p\xE1gina.</p>
<p>Cuando hablamos de SSR en el mundo de Javascript, lo que realmente estamos diciendo es <strong>Javascript Isomorphic Rendering</strong>
Desde hace a\xF1os que Javascript puede ejecutarse tanto en el browser como en el server gracias a Nodejs (o Deno), lo que permite compartir l\xF3gica entre ambas caras de una aplicaci\xF3n.
Finalmente lo que Nextjs, Nuxt y otros ofrecen es una forma de compartir logica de renderizado entre la carga inicial desde el servidor y las interacciones futuras en el cliente.</p>
<p>Algunas de las ventajas de esta t\xE9nica es que le contenido que se muestra al cliente siempre est\xE1 actualizado y no hay necesidad de iniciar nuevos build cada vez que el contenido cambia, menos tiempo de compilaci\xF3n.</p>
<p>Y dentro de sus limitaciones o desventajas,  no puedes distribuir un sitio 100% SSR a un CDN, y el tiempo de renderizado del primer contenido es mas lento ya que dicho contenido debe ser creado cada vez que se accede al sitio.</p>
<p>Algunas formas de resolver estas limitaciones es por ejemplo el uso de alg\xFAn sistema de cache o como lo resuelve Next: Generando contenido est\xE1tico cuando la p\xE1gina no define que requiere algun dato en particular por medio del m\xE9todo <code>getInitialProps</code></p>
<h1 id="${"en-conclusi\xF3n"}">En conclusi\xF3n.</h1>
<p>Ambas t\xE9nicas son parte esencial de como la web ha sido construida dede sus inicios, pero ahora han sido relevadas nuevamente gracias a la flexibilidad otorgada por las nuevas implementaciones de Javascript y otros.</p>
<p>Los generadores de sitios est\xE1ticos otorga la facilidad de crear sitios web o aplicaciones que ofrecen alta velocidad de uso a sus usuarios pero a costa de altos tiempos de compilado o la generaci\xF3n de contenido obsoleto. Por otro lado los framework de server side rendering resuelve estos problemas a costa de mayores tiempos de carga y de quiz\xE1 una curva de aprendizaje mayor.</p>
<p>\xBFCu\xE1l debes elegir? depender\xE1 de tu caso de uso, tus conocimiento y el tiempo que tengas para desarrollar.</p>`
  })}`;
});
var jamstackQueEsSsgYSsr = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Jamstack_que_es_ssg_y_ssr,
  metadata: metadata$6
});
var metadata$5 = {
  "date": "2021-01-25T02:13:59.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1611543353/caspar-camille-rubin-fPkvU7RDmCo-unsplash_uh7g7z.jpg",
  "keywords": ["eslint", "linting", "javascript", "tooling"],
  "tag": "Seed",
  "title": "\xBFQu\xE9 es Linting y ESLint?",
  "description": null,
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@casparrubin?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Caspar Camille Rubin</a> on <a href="https://unsplash.com/s/photos/code-formatting?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>',
  "favorite": true
};
var Que_es_linting_y_eslint = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$5), {}, {
    default: () => `<p>En el mundo del desarrollo de aplicaciones web hay una mir\xEDada de herramientas que buscan, no s\xF3lo mejorar la experiencia de usuario y la performance de tu aplicaci\xF3n en general, si no tambi\xE9n, mejorar la experiencia de desarrollo (DX). Si bien tener tantas herramientas y opciones a disposici\xF3n puede ser algo bueno para la mejora intr\xEDnsica de estas herramientas, es tambi\xE9n un problema para muchos que est\xE1n comenzando en este proceso ya que puede ser muy confuso seguir indicaciones que presumen de cierto grado de conocimiento previo.</p>
<p>Si bien hay muchos \u201Cboilerplates\u201D o \u201Cplantillas de proyectos\u201D disponibles para cada tipo de framework, el uso de estas herramientas cae dentro de una \u201Ccaja negra\u201D donde pocas veces se entiende omo funcionan cada una de ellas, o el por que las necesito. </p>
<p>En el ca\xF3tico mundo del desarrollo web, es necesario tener una especie de gu\xEDa para sobrevivir. </p>
<p>Esta serie de art\xEDculos busca cubrir esa area olvidada o perdida (<a href="${"https://missing.csail.mit.edu"}" rel="${"nofollow"}">the missing semester</a>) tanto en la educaci\xF3n formal como en los tutoriales disponibles en internet. Obtener conocimiento y proficiencia con las herramientas, enfoc\xE1ndonos en la experiencia de desarrollador.</p>
<p>\xBFQue herramientas estar\xE1n inclu\xEDdas en la serie?</p>
<ul><li>npm</li>
<li>Linting (Eslint, stylelint)</li>
<li>Babel</li>
<li>Prettier</li>
<li>Bundlers (Webpack, Rollup, etc)</li>
<li>Git</li></ul>
<h1 id="${"\xBFqu\xE9-es-linting"}">\xBFQu\xE9 es Linting?</h1>
<p>Es inevitable tener errores en el c\xF3digo que desarrollas para una aplicaci\xF3n, y todos sabemos que estos errores son malos, algunos causan problemas en la interfaz que generan incomodidad en los usuarios, otros comprometen la seguridad del sistema o simplemente rompen todo y la aplicaci\xF3n deja de funcionar.</p>
<p>Hay un cierto grupo de errores que pueden ser identificados y reparados antes de que tu c\xF3digo llegue a ser ejecutado, estos pueden ser: </p>
<ul><li>errores de sintaxis</li>
<li>C\xF3digo poco intuitivo o dificil de mantener</li>
<li>Uso de \u201Cmalas practicas\u201D</li>
<li>O uso de estlios de codigo inconsistentes.</li></ul>
<p>Estos errores pueden ser incluso m\xE1s comunes que otros m\xE1s graves dado a que son menos evidentes.
Capturar errores antes de que tu c\xF3digo se ejecute puede salvarte, no s\xF3lo del error en si mismo, si no, tambi\xE9n ahorrarte mucho tiempo en la cacer\xEDa de esos errores.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>En la actualidad, se utiliza este t\xE9rmino para designar a herramientas que realizan estas tareas de comprobaci\xF3n en cualquier lenguaje de programaci\xF3n. Las herramientas de tipo lint generalmente funcionan realizando un an\xE1lisis est\xE1tico del c\xF3digo fuente. - Wikipedia <a href="${"https://es.wikipedia.org/wiki/Lint"}" rel="${"nofollow"}">https://es.wikipedia.org/wiki/Lint</a></p>`
    })}
<p>En otras palabras, es una herramienta de software que revisa y \u201Cobserva\u201D tu c\xF3digo en busca de errores que puedan afectar tu c\xF3digo. Algunos \u201Clinteres\u201D incluso pueden darte sugerencias de como arreglar el error o incluso arreglarlo ellos mismos.</p>
<p>Las herramientas de linting pertenecen a un grupo de programas conocidos como <strong>herramientas de an\xE1lisis est\xE1tico</strong> , un proceso de revisi\xF3n de un programa sin ejecutar dicho programa, por lo general la revisi\xF3n se realiza sobre el c\xF3digo fuente o alguna clase de c\xF3digo objeto. Visto de otra forma es como tener a un revisor de tu pull request pero automatizado y siempre observando lo que escribes. </p>
<p>Un ejemplo de herramienta de \u201Clinting\u201D, y el que usaremos en este art\xEDculo es <strong>ESLint</strong>.</p>
<h2 id="${"\xBFqu\xE9-es-eslint"}">\xBFQu\xE9 es ESLint?</h2>
<p>ESLint es una herramienta de c\xF3digo abierto enfocada en el proceso de \u201Clintig\u201D para javascript (o m\xE1s correctamente para <a href="${"https://www.ecma-international.org/publications-and-standards/standards/ecma-262/"}" rel="${"nofollow"}">ECMAScript</a>). ESLint es la herramienta predominante para la tarea de \u201Climpiar\u201D c\xF3digo javascript tanto en el servidor (node.js) como en el navegador.</p>
<p>Dado que javascript es un lenguaje din\xE1mico y de tipado d\xE9bil, es especialmente f\xE1cil caer en errores humanos a la hora de escribir c\xF3digo. ESLint utiliza un sistema de reglas que permiten definir que es y que no es posible dentro del c\xF3digo. ESLint est\xE1 escrito en Nodejs y es posible instalarlo desde <a href="${"http://npmjs.com/"}" rel="${"nofollow"}">npm</a>.</p>
<h3 id="${"\xBFqu\xE9-puede-hacer-eslint-por-mi"}">\xBFQu\xE9 puede hacer ESLint por mi?</h3>
<p>Bueno, ESLint es una herramienta de \u201Clinting\u201D, por lo que te puede ayudar a:</p>
<ul><li>Mostrarte errores de sintaxis.</li>
<li>Mostrarte errores cuando no se siguen buenas pr\xE1cticas.</li>
<li>Proveer sugerencias para mejorar tu c\xF3digo.</li>
<li>Mantener un estilo consistente en tu c\xF3digo o reforzar reglas internas de tu propio equipo.</li></ul>
<p>Aqu\xED ESLint es el motor que te ayudar\xE1 a definir reglas y revisar\xE1 tu c\xF3digo. ESLint est\xE1 disponible a travez de <code>[npm](https://www.npmjs.com/package/eslint)</code>.</p>
<p>ESLint se compone de al menos 3 partes: el Parser, las Reglas y el Resultado.</p>
<h3 id="${"parser"}">Parser</h3>
<p>El parseador se encarga de convertir tu c\xF3digo, que es escrito para ser le\xEDdo por un ser humano, a una representaci\xF3n o abstracci\xF3n que permite que el computador pueda entender tu c\xF3digo. ESLint convierte tu c\xF3digo a un \xC1rbol de Sintaxis Abstracto o AST (del ingl\xE9s Abstract Syntax Tree). Es esta representaci\xF3n la utilizada por ESLint para aplicar las diferentes reglas necesarias.</p>
<p>Este \xE1rbol es b\xE1sicamente un gran objeto json que representa cada parte de tu c\xF3digo (existen diferentes tipos de AST generados por diferentes parsers), esta representaci\xF3n es f\xE1cil de recorrer y consultar.</p>
<p>ESLint, recorre este \xE1rbol visitando cada uno de los nodos, en cada visita, recorre la lista de reglas y aplica las que corresponden al tipo de nodo visitado.</p>
<p>Puedes ver una representaci\xF3n de un AST utilizando <a href="${"https://astexplorer.net/"}" rel="${"nofollow"}">https://astexplorer.net</a></p>
<p>Un ejemplo de AST es </p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">function</span> <span class="token function">setCount</span><span class="token punctuation">(</span><span class="token parameter">v</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
    <span class="token keyword">return</span> v <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>y el AST correspondiente</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token punctuation">&#123;</span>
  <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"Program"</span><span class="token punctuation">,</span>
  <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">41</span><span class="token punctuation">,</span>
  <span class="token string">"body"</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">&#123;</span>
      <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"FunctionDeclaration"</span><span class="token punctuation">,</span>
      <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
      <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">40</span><span class="token punctuation">,</span>
      <span class="token string">"id"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
        <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"Identifier"</span><span class="token punctuation">,</span>
        <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">9</span><span class="token punctuation">,</span>
        <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">17</span><span class="token punctuation">,</span>
        <span class="token string">"name"</span><span class="token operator">:</span> <span class="token string">"setCount"</span>
      <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
      <span class="token string">"expression"</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      <span class="token string">"generator"</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      <span class="token string">"async"</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
      <span class="token string">"params"</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">&#123;</span>
          <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"Identifier"</span><span class="token punctuation">,</span>
          <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">18</span><span class="token punctuation">,</span>
          <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">19</span><span class="token punctuation">,</span>
          <span class="token string">"name"</span><span class="token operator">:</span> <span class="token string">"v"</span>
        <span class="token punctuation">&#125;</span>
      <span class="token punctuation">]</span><span class="token punctuation">,</span>
      <span class="token string">"body"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
        <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"BlockStatement"</span><span class="token punctuation">,</span>
        <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">21</span><span class="token punctuation">,</span>
        <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">40</span><span class="token punctuation">,</span>
        <span class="token string">"body"</span><span class="token operator">:</span> <span class="token punctuation">[</span>
          <span class="token punctuation">&#123;</span>
            <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"ReturnStatement"</span><span class="token punctuation">,</span>
            <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">25</span><span class="token punctuation">,</span>
            <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">38</span><span class="token punctuation">,</span>
            <span class="token string">"argument"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
              <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"BinaryExpression"</span><span class="token punctuation">,</span>
              <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">32</span><span class="token punctuation">,</span>
              <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">37</span><span class="token punctuation">,</span>
              <span class="token string">"left"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
                <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"Identifier"</span><span class="token punctuation">,</span>
                <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">32</span><span class="token punctuation">,</span>
                <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">33</span><span class="token punctuation">,</span>
                <span class="token string">"name"</span><span class="token operator">:</span> <span class="token string">"v"</span>
              <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
              <span class="token string">"operator"</span><span class="token operator">:</span> <span class="token string">"+"</span><span class="token punctuation">,</span>
              <span class="token string">"right"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
                <span class="token string">"type"</span><span class="token operator">:</span> <span class="token string">"Literal"</span><span class="token punctuation">,</span>
                <span class="token string">"start"</span><span class="token operator">:</span> <span class="token number">36</span><span class="token punctuation">,</span>
                <span class="token string">"end"</span><span class="token operator">:</span> <span class="token number">37</span><span class="token punctuation">,</span>
                <span class="token string">"value"</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
                <span class="token string">"raw"</span><span class="token operator">:</span> <span class="token string">"1"</span>
              <span class="token punctuation">&#125;</span>
            <span class="token punctuation">&#125;</span>
          <span class="token punctuation">&#125;</span>
        <span class="token punctuation">]</span>
      <span class="token punctuation">&#125;</span>
    <span class="token punctuation">&#125;</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token string">"sourceType"</span><span class="token operator">:</span> <span class="token string">"module"</span>
<span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<h3 id="${"las-reglas"}">Las Reglas</h3>
<p>El siguiente paso en el proceso es aplicar las reglas. Una regla es una colecci\xF3n de cierta l\xF3gica (funci\xF3n) que permite identificar un potencial problema en el c\xF3digo. El resultado de la aplicaci\xF3n de estas reglas puede contener un reporte del error encontrado incluyendo el nodo y otra informaci\xF3n que permite arreglar el error.</p>
<p>Estas reglas son aplicadas por medio de un \u201Ctransformador\u201D. El transformador es quien permite que las reglas (funciones) puedan consultar que nodo del AST esta siendo visitado.</p>
<p>Un ejemplo de definici\xF3n de regla es:</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">context</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
  <span class="token keyword">return</span> <span class="token punctuation">&#123;</span>
    <span class="token function">Identifier</span><span class="token punctuation">(</span><span class="token parameter">node</span><span class="token punctuation">)</span> <span class="token punctuation">&#123;</span>
      <span class="token keyword">if</span><span class="token punctuation">(</span>node<span class="token punctuation">.</span>name <span class="token operator">===</span> <span class="token string">'console'</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
        context<span class="token punctuation">.</span><span class="token function">report</span><span class="token punctuation">(</span>node<span class="token punctuation">,</span> <span class="token string">'Left in log statement'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">&#125;</span> 
    <span class="token punctuation">&#125;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Esta funci\xF3n es ejecutada cuando el Identificador del nodo es <code>console</code> y reporta que el c\xF3digo contiene el uso de <code>console.log</code>.</p>
<h3 id="${"el-resultado"}"><strong>El Resultado</strong></h3>
<p>Este es e \xFAltimo paso del proceso. Aqu\xED es donde se define c\xF3mo se muestran los reportes de las reglas que se \u201Cinfringieron\u201D. Por defecto la ejecuci\xF3n de ESLint ser\xE1 en consola pero los resultados tambi\xE9n pueden ser desplegados en tu editor de texto favorito.</p>
<h2 id="${"\xBFc\xF3mo-comienzo"}">\xBFC\xF3mo comienzo?</h2>
<p>La forma m\xE1s simple de comenzar es primer, tener un proyecto javascript en el que utilizar ESLint.
Creemos entonces un simple proyecto al que agregar ESLInt, comienza por crear un directorio en donde almacenar tu proyecto, puedes hacer todo esto directamente en tu terminal.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">mkdir linting</code>`}<!-- HTML_TAG_END --></pre>
<p>Ahora ingresa en el directorio para comenzar a trabajar</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">cd linting</code>`}<!-- HTML_TAG_END --></pre>
<p>Creemos nuestro primer archivo javascript, que para este ejemplo ser\xE1 muy simple</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">touch app<span class="token punctuation">.</span>js</code>`}<!-- HTML_TAG_END --></pre>
<p>Ahora, agreguemos algo de c\xF3digo en este archivo, \xE1brelo en tu editor favorito y escribe</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token keyword">const</span> nombre <span class="token operator">=</span> <span class="token string">'Matias'</span>

<span class="token keyword">const</span> persona <span class="token operator">=</span> <span class="token punctuation">&#123;</span>nombre<span class="token punctuation">&#125;</span>

console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>persona<span class="token punctuation">)</span>

<span class="token keyword">const</span> <span class="token function-variable function">saludar</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">fNombre</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">Hola! \xBFque tal, </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">$&#123;</span>fNombre<span class="token interpolation-punctuation punctuation">&#125;</span></span><span class="token string">?</span><span class="token template-punctuation string">&#96;</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> persona <span class="token operator">=</span> <span class="token punctuation">&#123;</span> nombre<span class="token operator">:</span> <span class="token string">'Otra persona'</span> <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Es claro a simple vista algunos problemas de formato con este simple c\xF3digo adem\xE1s de un problema de sintaxis.</p>
<p>Ahora inicia este proyecto utilizando <code>npm</code></p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">npm init</code>`}<!-- HTML_TAG_END --></pre>
<p>Este comando crear\xE1 el archivo <code>package.json</code>, archivo que describe la configuraci\xF3n de tu proyecto y la lista de dependencias del mismo.</p>
<p>Ahora con el proyecto javascript preparado agreguemos eslint.</p>
<h3 id="${"configurando-eslint"}">Configurando ESLint</h3>
<p>Lo primero es instalar ESLint en nuestro proyecto, para ello volveremos a nuestra terminal y utilizaremos <code>npm</code> para instalar esta dependencia</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">npm install eslint <span class="token operator">--</span>save<span class="token operator">-</span>dev</code>`}<!-- HTML_TAG_END --></pre>
<p>Utilizamos el argumento  <code>--save-dev</code> para indicarle a <code>npm</code> que queremos guardar esta dependencia para uso de desarrollo. ESLint es un paquete que solo necesitamos durante el proceso de desarrollo y no se necesita para ejecutar tu aplicaci\xF3n.</p>
<p>Una vez instalado,  puede iniciar la configuraci\xF3n al ejecutar</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">npx eslint <span class="token operator">--</span>init</code>`}<!-- HTML_TAG_END --></pre>
<p>este comando ( en particular el argumento<code>--init</code>) es el que activar\xE1 ESLint en tu proyecto, esto se realiza mediante la creaci\xF3n de un archivo de configuraci\xF3n que vivir\xE1 en el directorio principal de tu proyecto.</p>
<p>El proceso de creaci\xF3n de este archivo se ejecutar\xE1 en la consola y te har\xE1 algunas preguntas comenzando por: \xBFC\xF3mo te gustar\xEDa usar ESLint?</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">?</span> How would you like to use ESLint<span class="token operator">?</span> \u2026
  To check syntax only
  To check syntax and find problems
\u276F To check syntax<span class="token punctuation">,</span> find problems<span class="token punctuation">,</span> and enforce code style</code>`}<!-- HTML_TAG_END --></pre>
<p>Selecciona la \xFAltima opci\xF3n \u201CPara revisar sintaxis, encontrar problemas y reforzar el estilo de c\xF3digo\u201D.</p>
<p>La siguiente pregunta ser\xE1</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">What type <span class="token keyword">of</span> modules does your project use<span class="token operator">?</span> \u2026
  JavaScript <span class="token function">modules</span> <span class="token punctuation">(</span><span class="token keyword">import</span><span class="token operator">/</span><span class="token keyword">export</span><span class="token punctuation">)</span>
\u276F <span class="token function">CommonJS</span> <span class="token punctuation">(</span>require<span class="token operator">/</span>exports<span class="token punctuation">)</span>
  None <span class="token keyword">of</span> these</code>`}<!-- HTML_TAG_END --></pre>
<p>En este caso seleccionas <code>CommonJS</code> ya que no usaremos ninguna herramienta externa (bundlers) para manejar los m\xF3dulos de nuestro proyecto.</p>
<p>La siguiente pregunta ser\xE1:</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">?</span> Which framework does your project use<span class="token operator">?</span> \u2026
  React
  Vue<span class="token punctuation">.</span>js
\u276F None <span class="token keyword">of</span> these</code>`}<!-- HTML_TAG_END --></pre>
<p>Por ahora seleccionar\xE1s \u201CNone of these\u201D</p>
<p>Luego te preguntar\xE1 si usas Typescript o no.</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">?</span> Does your project use TypeScript<span class="token operator">?</span> \u203A No <span class="token operator">/</span> Yes</code>`}<!-- HTML_TAG_END --></pre>
<p>Seleccionar\xE1s <code>No</code></p>
<p>La siguiente pregunta ser\xE1 sobre el estilo de c\xF3digo que quieres usar: <code>\xBFC\xF3mo te gustar\xEDa definir un estilo para tu proyecto?</code></p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">\u2714 How would you like to define a style <span class="token keyword">for</span> your project<span class="token operator">?</span> \u2026
\u276F Use a popular style guide
  Answer questions about your style
  Inspect your JavaScript <span class="token function">file</span><span class="token punctuation">(</span>s<span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Selecciona la primera opci\xF3n: <code>Usar una gu\xEDa de estilo popular</code> y en la siguiente pregunta selecciona <code>Airbnb</code></p>
<p>Luego se te preguntar\xE1 por el tipo de archivo para la configuraci\xF3n cuyas opciones son <code>YAML</code>,<code>Javascript</code> y <code>JSON</code>. </p>
<p>Finalmente ver\xE1s el mensaje de aviso que se instalar\xE1n algunas dependencias extras y la siguiente pregunta</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">?</span> Would you like to install them now <span class="token keyword">with</span> npm<span class="token operator">?</span> \u203A No <span class="token operator">/</span> Yes</code>`}<!-- HTML_TAG_END --></pre>
<p><code>\xBFQuieres instalar las dependencias ahora con npm?</code> Selecciona <code>Yes</code></p>
<p>Al terminar este proceso podr\xE1s notar que un nuevo archivo fue creado en el directorio ra\xEDz del proyecto <code>.eslintrc.json</code> (o <code>. js</code> o <code>.yaml</code> dependiendo de lo seleccionado).</p>
<p>Finalmente agreguemos algunas reglas simples en el archivo de configuraci\xF3n. Abre el archivo <code>.eslintrc.js</code> (Si elegiste el formato javascript) y ver\xE1s lo siguiente:</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  env<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    browser<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    commonjs<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    es2021<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  <span class="token keyword">extends</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token string">'airbnb-base'</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  parserOptions<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    ecmaVersion<span class="token operator">:</span> <span class="token number">12</span><span class="token punctuation">,</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  rules<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Ahora, agreguemos una nueva gu\xEDa al arreglo <code>extends</code> y algunas reglas al objeto <code>rules</code></p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
  env<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    browser<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    commonjs<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    es2021<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  <span class="token keyword">extends</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token string">'airbnb-base'</span><span class="token punctuation">,</span>
    <span class="token string">'eslint:recommended'</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  parserOptions<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    ecmaVersion<span class="token operator">:</span> <span class="token number">12</span><span class="token punctuation">,</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
  rules<span class="token operator">:</span> <span class="token punctuation">&#123;</span>
    semi<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'error'</span><span class="token punctuation">,</span> <span class="token string">'always'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    quotes<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">'error'</span><span class="token punctuation">,</span> <span class="token string">'double'</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Aqu\xED agregamos <code>eslint:recommended</code> al arreglo  <code>extends</code> indicando que tambi\xE9n usaremos las reglas recomendadas de ESLint. Adem\xE1s agregamos dos nuevas reglas en el objeto <code>rules</code> indicando que utilizar punto y coma <code>semi</code> al final de cada linea de c\xF3digo es requerido y  que se usaran comillas dobles en los strings.</p>
<h3 id="${"utilizar-eslint"}">Utilizar ESLint</h3>
<p>El uso m\xE1s simple que puedes darle a ESLint es revisar tu c\xF3digo de forma manual ejecutando un script en la terminal, para esto puedes escribir <code>npx eslint . --ext .js</code> cada vez o configurar este comando como un script de npm.</p>
<p>Abre el archivo <code>package.json</code> en tu editor de texto favorito y agrega la secci\xF3n <code>scripts</code></p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">...</span>
<span class="token string">"scripts"</span><span class="token operator">:</span> <span class="token punctuation">&#123;</span>
  <span class="token operator">...</span>
  <span class="token string">"lint"</span><span class="token operator">:</span> <span class="token string">"eslint .  --ext .js"</span>
  <span class="token operator">...</span>
<span class="token punctuation">&#125;</span><span class="token punctuation">,</span>
<span class="token operator">...</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Con este comando estar\xE1s ejecutando ESLint en todo los archivos con extensi\xF3n <code>js</code> en tu proyecto.</p>
<p>Ahora vuelve a tu terminal y puedes ejecutar</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">npm run lint</code>`}<!-- HTML_TAG_END --></pre>
<p>y ver\xE1s el resultado que mostrar\xE1 los errores del c\xF3digo que tienes escrito en <code>app.js</code></p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">/</span>Users<span class="token operator">/</span>matias<span class="token operator">/</span>Development<span class="token operator">/</span>linting<span class="token operator">/</span><span class="token punctuation">.</span>eslintrc<span class="token punctuation">.</span>js
   <span class="token number">8</span><span class="token operator">:</span><span class="token number">5</span>   error  Strings must use doublequote  quotes
   <span class="token number">9</span><span class="token operator">:</span><span class="token number">5</span>   error  Strings must use doublequote  quotes
  <span class="token number">15</span><span class="token operator">:</span><span class="token number">12</span>  error  Strings must use doublequote  quotes
  <span class="token number">15</span><span class="token operator">:</span><span class="token number">21</span>  error  Strings must use doublequote  quotes
  <span class="token number">16</span><span class="token operator">:</span><span class="token number">14</span>  error  Strings must use doublequote  quotes
  <span class="token number">16</span><span class="token operator">:</span><span class="token number">23</span>  error  Strings must use doublequote  quotes

<span class="token operator">/</span>Users<span class="token operator">/</span>matias<span class="token operator">/</span>Development<span class="token operator">/</span>linting<span class="token operator">/</span>app<span class="token punctuation">.</span>js
  <span class="token number">10</span><span class="token operator">:</span><span class="token number">7</span>  error  Parsing error<span class="token operator">:</span> Identifier <span class="token string">'persona'</span> has already been declared

\u2716 <span class="token number">7</span> <span class="token function">problems</span> <span class="token punctuation">(</span><span class="token number">7</span> errors<span class="token punctuation">,</span> <span class="token number">0</span> warnings<span class="token punctuation">)</span>
  <span class="token number">6</span> errors and <span class="token number">0</span> warnings potentially fixable <span class="token keyword">with</span> the <span class="token template-string"><span class="token template-punctuation string">&#96;</span><span class="token string">--fix</span><span class="token template-punctuation string">&#96;</span></span> option<span class="token punctuation">.</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Podemos intentar que ESLint arregle algunos de estos problemas autom\xE1ticamente utilizando el argumento <code>--fix</code>. Abre tu archivo <code>package.json</code> para agregar un nuevo script:</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token string">"lint-fix"</span><span class="token operator">:</span> <span class="token string">"eslint . --ext .js --fix"</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Y ahora en la terminal</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx">npm run lint<span class="token operator">-</span>fix</code>`}<!-- HTML_TAG_END --></pre>
<p>Y el resultado ser\xE1</p>
<pre class="${"language-jsx"}"><!-- HTML_TAG_START -->${`<code class="language-jsx"><span class="token operator">/</span>Users<span class="token operator">/</span>matias<span class="token operator">/</span>Development<span class="token operator">/</span>linting<span class="token operator">/</span>app<span class="token punctuation">.</span>js
  <span class="token number">10</span><span class="token operator">:</span><span class="token number">7</span>  error  Parsing error<span class="token operator">:</span> Identifier <span class="token string">'persona'</span> has already been declared

\u2716 <span class="token number">1</span> <span class="token function">problem</span> <span class="token punctuation">(</span><span class="token number">1</span> error<span class="token punctuation">,</span> <span class="token number">0</span> warnings<span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<h2 id="${"conclusi\xF3n"}">Conclusi\xF3n</h2>
<p>El proceso de <code>linting</code> se han convertido en una herramienta b\xE1sica y necesaria en todo proyecto de software, sobre todo en el mundo del desarrollo web con javascript.</p>
<p>Sus beneficios van m\xE1s all\xE1 de lo que ESLint hace t\xE9cnicamente ya que ayuda a los desarrolladores a enfoncarse en lo m\xE1s importante: desarrollar soluciones.
Este tutorial introduce algunas de las cosas que puedes lograr utilizando ESLint y una breve descripci\xF3n de c\xF3mo ESLint funciona. </p>
<p>Si quieres leer m\xE1s informaci\xF3n sobre las reglas que puedes utilizar y c\xF3mo personalizar las reglas de ESLint puedes revisar la \xA0<a href="${"https://eslint.org/docs/rules/"}" rel="${"nofollow"}">documentaci\xF3n</a>.</p>
<h3 id="${"other-linting-tools-to-check-out"}"><strong>Other linting tools to check out</strong></h3>
<ul><li><a href="${"https://jshint.com/"}" rel="${"nofollow"}">JSHint</a>: una alternativa a ESLint</li>
<li><a href="${"https://github.com/stylelint/stylelint"}" rel="${"nofollow"}">Stylelint</a>: una herramienta de linting para tu c\xF3digo CSS.</li>
<li><a href="${"https://github.com/dustinspecker/awesome-eslint"}" rel="${"nofollow"}">Awesome ESLint</a>: Una lista de configuraciones, parsers, plugins y otras herramientas para mejorar tu propia configuraci\xF3n de ESLint.c</li></ul>`
  })}`;
});
var queEsLintingYEslint = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Que_es_linting_y_eslint,
  metadata: metadata$5
});
var metadata$4 = {
  "date": "2022-10-03T11:00:00.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1616361261/jan-tinneberg-tVIv23vcuz4-unsplash_ftgyzc.jpg",
  "keywords": ["Sprint", "Expectativas", "Manejo del Tiempo", "Creando expectativas"],
  "tag": "Seed",
  "title": "Fijando Expectativas \xBFC\xF3mo manejar y crear buenas expectativas?",
  "description": "La comunicaci\xF3n es una herramienta esencial durante el desarrollo de software y entre las habilidades que debemos desarrollar est\xE1 el fijar expectativas claras y honestas y sobre todo cumplirlas.",
  "bannerCredit": '<span>Photo by <a href="/unsplash.com/@oplattner?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Jan Tinnerberg</a> on <a href="https://unsplash.com/s/photos/state-management?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Fijando_expectativas = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$4), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>TLDR; Este post es parte del episodio 4 de la segunda temporada de <a href="${"https://www.cafecon.tech"}" rel="${"nofollow"}">Caf\xE9 con Tech</a></p>
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
        buzzsproutId: "8182311-fijando-expectativas"
      }, {}, {})}`
    })}
<p>El desarrollo de software es m\xE1s que la colecci\xF3n de l\xEDneas de c\xF3digo escritas en un d\xEDa, si no, es por sobre todo una actividad humana. Si!, a pesar de que por mucho tiempo se consider\xF3 que quienes desarrollaban software eran una especie de ermita\xF1o computacional hoy en d\xEDa podemos ver, vivir y sentir que nuestra actividad se ha convertido en un proceso donde la comunicaci\xF3n se ha vuelto tan o m\xE1s esencial que el n\xFAmero de caracteres de c\xF3digo que escribes en un d\xEDa.</p>
<p>Cuando desarrollamos software lo que en realidad hacemos es crear soluciones para resolver alg\xFAn problema. Este problema es algo que otra persona presenta y desea resolver, es decir, estamos entregando a otro una herramienta.</p>
<p>Es com\xFAn que cuando llega la hora de entregar alg\xFAn producto de software, sea este un demo, un feature o el producto final el estr\xE9s aumenta, hay que trabajar horas extras, se crea a\xFAn m\xE1s deuda t\xE9cnica y un sin fin de malas pr\xE1cticas, la mayor\xEDa evitables. \xBFPor qu\xE9? Obviamente es un problema de m\xFAltiples variables, pero creo que una de gran importancia es como las cosas llegaron a ese momento.</p>
<p>M\xE1s de lo que pas\xF3 en el momento de la entrega (o pr\xF3ximo a ella) es m\xE1s bien la historia tras ese proceso. \xBFC\xF3mo llegamos hasta aqu\xED? \xBFQu\xE9 es lo que esper\xE1bamos? Son las expectativas que cada persona involucrada en el proyecto ten\xEDa las que provocaron de una u otra manera el resultado final repleto de estr\xE9s.</p>
<p>Definir las expectativas, y hacerlo bien desde un primer momento lo cambia todo. Claramente no se eliminan las malas noticias y tampoco puedes prevenir todo simplemente al bajar las expectativas, pero si pueden aminorar el impacto final y suavizar las relaciones entre las personas.</p>
<p>Los seres humanos somos muy poco h\xE1biles a la hora de estimar nuestras propias capacidades, normalmente estamos en uno de los extremos: sobreestimamos o sub-estimamos lo que somos capaces de hacer, y esto no deja de ser cierto en el desarrollo de software. Una pr\xE1ctica com\xFAn, aunque bastante cuestionada por muchos, es la de entregar estimaciones para cada parte del proyecto, desde la estimaci\xF3n de tiempo/esfuerzo del proyecto como un todo hasta la estimaci\xF3n de cada tarea a realizar.</p>
<p>Es en esta pr\xE1ctica donde fijar expectativas entra en juego a diario. Cuando estimamos quer\xE1moslo o no estamos creando un compromiso de tiempo y esfuerzo, cuando este no se cumple una de las partes recibir\xE1 el estr\xE9s y desenfado de la otra.</p>
<p>Pong\xE1moslo as\xED. El manager o l\xEDder t\xE9cnico del equipo describe una tarea en particular, se pregunta al equipo como enfrentaran el problema y al mismo tiempo se le dice \u201CNo se preocupen, t\xF3mense el tiempo que quieran\u201D. Obviamente el equipo o el desarrollador dir\xE1. Ok. Ya que no es urgente lo resolver\xE9 cuando pueda. Pero, en realidad el manager quiso decir, \u201Cnecesitamos esto luego, pero no te mates trabajando\u201D. Es diferente o no?. El manager tiene la expectativa de que la tarea descrita ser\xE1 resuelta en un tiempo moderado, ya que es relativamente urgente, pero el desarrollador entendi\xF3 literalmente que pod\xEDa tomarse todo el tiempo del mundo. Al final del sprint o ciclo de desarrollo, ambos estar\xE1n frustrados y quiz\xE1 enfadados dado que no se cumpli\xF3 lo esperado. La expectativa aqu\xED fue mal declarada.</p>
<h2 id="${"\xBFcomo-mejorar-esta-situaci\xF3n"}">\xBFComo mejorar esta situaci\xF3n?</h2>
<p>Ya lo comentaba en el <a href="${"https://www.cafecon.tech/1081172/4452938-4-habilidades-blandas-esenciales-para-un-desarrollador"}" rel="${"nofollow"}">episodio 12 de la temporada anterior</a> una de las habilidades esenciales hoy en d\xEDa es la comunicaci\xF3n, que debe ser clara y efectiva, mejorar en este aspecto te permitir\xE1 generar mejores expectativas.</p>
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, {
      buzzsproutId: "1081172/4452938-4-habilidades-blandas-esenciales-para-un-desarrollador"
    }, {}, {})}
<p>Para comenzar, 4 puntos a trabajar</p>
<ul><li><strong>Claridad:</strong> La ambig\xFCedad en el mensaje es el principal riesgo a la hora de comunicar expectativas. Un mensaje claro, al grano y sencillo ayudar\xE1 a declarar la expectativa de modo que todos comprendan lo mismo. Esta es una habilidad que se debe trabajar d\xEDa a d\xEDa. Hoy con el incipiente crecimiento del trabajo remoto la comunicaci\xF3n por mensajes de texto aumenta de forma exponencial y la cantidad de roces creados por un mensaje mal escrito o expresado es pan de cada d\xEDa.</li>
<li><strong>Se honesto:</strong> Si, pero no solo con otros, si no, contigo mismo. Ya mencion\xE9 lo malo que somos - en general - para estimar nuestras propias fuerzas y debilidades, por lo tanto piensa bien en tu actual capacidad de resolver lo propuesto y responde con honestidad a esa pregunta repetitiva de \xBFCu\xE1nto tiempo tomar\xE1? \xBFse puede hacer? \xBFpara cu\xE1ndo estar\xE1? Etc. Piensa si realmente puedes cumplir con esa deadline o restricci\xF3n de tiempo o si simplemente est\xE1s respondiendo que si porque es lo que espera tu equipo.</li>
<li><strong>Comunica los cambios</strong>: si ya declaraste una expectativa en la que todos est\xE1n de acuerdo, pero por diversas circunstancias el escenario cambia y sabes que es expectativa no ser\xE1 cumplida entonces debes comunicar lo antes posible esos cambios. Nadie deber\xEDa crucificarte por modificar la expectativa siempre y cuando sea a tiempo. Comunica la situaci\xF3n antes que sea demasiado tarde, antes de tener que decidir: me enfrento a la realidad y decepcion\xF3 a los dem\xE1s en \xFAltimo momento o trabajo horas extra en exceso solo para cumplir lo acordado.</li></ul>
<p>Es como avisar que llegar\xE1s tarde a una reuni\xF3n. Si sabes que llegar\xE1s tarde y no fue alguna emergencia es adecuado avisar con anticipaci\xF3n as\xED nadie estar\xE1 esperando que llegues ni perdiendo su valioso tiempo.</p>
<p>Importante tambi\xE9n es comunicar este cambio en las expectativas a todos quienes se ver\xE1n afectados por la modificaci\xF3n no solo al Manager o tech lead.</p>
<p>Definir las expectativas de forma clara y honesta puede ser dif\xEDcil e incluso inc\xF3modo y abrumante, pero mejor generar esa incomodidad antes que herir sentimientos o romper confianzas m\xE1s tarde.</p>
<p>Es cierto que decir que una tarea te tomar\xE1 3 d\xEDas cuando todos esperaban que fuese 1 puede sonar desesperanzador o incluso amenazante por la necesidad de encajar y de no ser visto como menos, pero es mejor comprometerse inmediatamente a lo posible que a lo imposible por cumplir expectativas falsas.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Definir buenas expectativas de forma temprana puede hacer la diferencia entre un proyecto exitoso y uno fallido.</p>`
    })}`
  })}`;
});
var fijandoExpectativas = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Fijando_expectativas,
  metadata: metadata$4
});
var metadata$3 = {
  "date": "2020-10-05T04:08:33.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1601870934/oliver-plattner-AUlmpoJcRdE-unsplash_h2vpwd.jpg",
  "keywords": [
    "Redux",
    " React",
    " State Management",
    " Manejo de Estado",
    "user redux",
    "como usar redux",
    "Como usar Redux",
    "Que es Estado",
    "How to use Redux",
    "Do I need Redux",
    "Necesito usar Redux",
    "Alternativa a Redux"
  ],
  "tag": "Seed",
  "title": "No necesitas Redux",
  "description": "Una pregunta com\xFAn entre quienes est\xE1n comenzando con React es si necesita aprender o integrar Redux en sus aplicaciones.",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@oplattner?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Oliver Plattner</a> on <a href="https://unsplash.com/s/photos/state-management?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var No_necesitas_redux = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$3), {}, {
    default: () => `<p>Una pregunta que me he encontrado varias veces de parte de quienes est\xE1n apreniendo React es si deben o no aprender Redux o si deben o no utilizar Redux.</p>
<p>Por mucho tiempo Redux fue, de alguna forma, la soluci\xF3n est\xE1ndar para el manejo de estado en aplicaciones React, est\xE1ndar al nivel de que pod\xEDas encontrarlo, en mi opini\xF3n, en el 90% de las aplicacione escritas con React hasta ese momento. Era lo \xFAltimo y lo mejor que teniamos disponible para el manejo de estado, pero Redux, como muchas otras soluciones, no era y no es la soluci\xF3n a todo. <strong>No hay silver bullets</strong>.</p>
<p>El gran problema de Redux, y de muchas otras librer\xEDas que intentan resolver el mismo problema es que no todo el estado puede considerarse estado global.</p>
<p>Pero, comenzando por el principio:</p>
<h1 id="${"\xBFqu\xE9-es-estado-y-por-qu\xE9-necesito-manejarlo"}">\xBFQu\xE9 es estado y por qu\xE9 necesito manejarlo?</h1>
<p>Recuerdo cuando escrib\xED mi primera aplicaci\xF3n con React, a\xF1o 2015 junto al equipo de <a href="${"https://mozio.com"}" rel="${"nofollow"}">Mozio</a>. La intenci\xF3n era migrar el proyecto desde Angular.js a React y por ese entonces eso implicaba aprender Redux. Parec\xEDa que parte escencial del uso de esta librer\xEDa era contar con una forma de manejar el estado de la aplicaci\xF3n, un concepto algo for\xE1neo, pero aceptable. El problema es que en el fondo no entend\xEDa bien que era ese <strong>estado</strong> que requer\xEDa manejar, tarea para lo cual Redux era la soluci\xF3n.</p>
<p>En el coraz\xF3n de cada componente en React existe el concepto de <strong>estado</strong>, un objeto que determina que es lo que el componente renderizar\xE1 y el c\xF3mo se comportar\xE1, es decir, <strong>estado</strong> es lo que te permite crear componentes din\xE1micos e interactivos.</p>
<p>Este objeto estado puede cambiar con el tiempo, con las interaciones del usuario de tu aplicaciones o a\xFAn m\xE1s complejo, el estado de un componente puede cambiar en base al padre de ese componente y este a su vez cambia seg\xFAn sus props, y este a su vez\u2026 se entiende la cadena cierto?</p>
<p>Por ejemplo, tienes un formulario, una vez que el usuario lo complet\xF3 lo env\xEDa haciendo una llamada HTTP, esta llamada falla, por validaci\xF3n de datos, y en la pantalla se muestra un mensaje de error.</p>
<p>Podemos considerar aqu\xED un objeto estado que contiene los posibles errores del formulario, en el momento inicial este objeto se ver\xEDa como esto</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> state <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
        errors <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>y el recibir el mensaje de error, el objeto contend\xEDa algo as\xED:</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> state <span class="token operator">=</span> <span class="token punctuation">&#123;</span>
        errors <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token string">'El email ingresado ya existe.'</span><span class="token punctuation">]</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Una forma de ver el estado es considerarlo como el resultado de una acci\xF3n, en este ejemplo, la acci\xF3n fue enviar el formulario con un error, el resultado? Un mensaje de error.</p>
<p>El simple hecho de tener esta variable ya implica que estas manejando el estado, hemos creado una estructura de datos explicita para almacenar los resultados de las acciones sobre nuestra aplicaci\xF3n.</p>
<p>Las diferentes librer\xEDas de manejo de estado ofrecen utilidades para crear estas estructuras de datos y actualizarlas basadas en las acciones que ocurren. React define un flujo de datos de una sola direcci\xF3n indicando que la actualizaciones de estado deben hacerse de una forma centralizada, Redux, ofrec\xEDa una soluci\xF3n a esto, creando un estado centralizado,por medio de un objeto, que s\xF3lo puede ser actualizado utilizando un mecanismo de acciones.</p>
<p>La idea es que los componentes pudieran leer partes de este estado para decidir que y c\xF3mo se renderiza.</p>
<h1 id="${"\xBFpor-que-no-redux"}">\xBFPor que no Redux?</h1>
<p>Redux fue una soluci\xF3n revolucionar\xEDa, nacida el 2015 e inspirada por <a href="${"https://elm-lang.org"}" rel="${"nofollow"}">elm</a> y trajo dos ideas interesantes a React.</p>
<ul><li><p>Combin\xF3 el modelo de <a href="${"https://facebook.github.io/flux/"}" rel="${"nofollow"}">Flux</a> con el concepto de <a href="${"https://redux.js.org/glossary#reducer"}" rel="${"nofollow"}">Reducer</a> creando un patr\xF3n de dise\xF1o sencillo que inmediatmente gener\xF3 tracci\xF3n.</p></li>
<li><p>Y ofreci\xF3 una soluci\xF3n para el manejo de estado global de una aplicaci\xF3n. Sin esto la forma en que pod\xEDas resolver el problema de estado global (estado que puede ser utilizado por todos los componentes) era tener un estado (un objeto) definido en el componente root (normalmente llamdo <code>&lt; App /&gt;</code>) y pasar los valores de este estado a travez de props a los componentes hijos: una pesadilla.</p>
<p>Redux, en su trastienda usaba la api Context que en ese entonces era una api pseudo-experimental pensada solo para el uso interno de React.</p>
<p>En la actualidad mucho ha cambiado, personalmente no he usado Redux al menos en los \xFAltimos 3 a\xF1os.</p>
<p>Hoy la forma de escribir React ha cambiado mucho con la introducci\xF3n de hooks, permitiendo una forma sencilla de compartir l\xF3gica y en este caso del estado, otorgando una forma directa de interactuar con la API Context en donde crear un patr\xF3n \`Action/Reducer\` como el de Redux es asquible con el uso de \`useReducer\`</p>
<p>Pero m\xE1s all\xE1 del cambio en las herramientas el problema principal de Redux es que por lo general tendemos a sobre dimensionar la soluci\xF3n a un problema y comenzamos a usar el martillo (redux) para todos los problemas.</p></li></ul>
<p>Redux hace uso de un estado <strong>global</strong>, es decir, estado que <strong>quiz\xE1</strong> sea necesario en toda la aplicaci\xF3n, pero muchas veces vi c\xF3digo que almacenaba en este estado los datos de un formulario u otros estados <strong>locales</strong>, esto en general es un anti patr\xF3n que lleva a muchos problemas tanto de interacci\xF3n y performance como tambi\xE9n de mantenibilidad y escalabilidad: M\xE1s grande tu aplicaci\xF3n, mas grande tu problema. Estoy convencido que la ubiquidad de Redux se debe a que ofreci\xF3 una soluci\xF3n al problemde de prop drilling (el pasar props de un componente a otro.</p>
<p>Mi punto de vista es que en la gran mayor\xEDa de las situaciones no necesitas Redux (y quiz\xE1 tampoco otra soluci\xF3n de manejo de estado). En mi experiencia la mayor\xEDa de aplicaciones no tienen un estado 100% global y gran parte de sus problemas pueden ser resueltos con el uso de la api Context.</p>
<p>Para ser claros, Redux es una gran herramienta, una soluci\xF3n inteligente a un problema complejo y es bueno usarlo pero cuando su uso es adecuado, cuando realmente tienes un estado global, pero si tienes estados simples, como un formulario o si una venta modal debe o no mostrarse Redux es \u201Coverkill\u201D.</p>
<p>Si tu pregunta es \u201Cdebo aprender Redux\u201D o \u201Cdebo integrar Redux en mi proyecto\u201D, la m\xE1s probable respuesta es no, no debes, y aparentemente no lo necesitas es por que eso que est\xE1s en la duda.
Redux es una bestia complicada que m\xE1s que ayudarte en esta etapa de tu proceso, simplemente se pondr\xE1 en tu camino. Revisa los conceptos fundamentales, experimenta hasta donde puedes llegar con React en si mismo. React es una soluci\xF3n para el manejo de estado.</p>
<p>Como dije antes, comienza por entender todos los conceptos y lo que React puede ofrecerte, en t\xE9rminos de manejo de estado estos son algunos conceptos que conocer:</p>
<ul><li>state lifting: <a href="${"https://es.reactjs.org/docs/lifting-state-up.html"}" rel="${"nofollow"}">https://es.reactjs.org/docs/lifting-state-up.html</a></li>
<li>El problema de <strong>prop drilling</strong>: <a href="${"https://kentcdodds.com/blog/prop-drilling"}" rel="${"nofollow"}">https://kentcdodds.com/blog/prop-drilling</a></li>
<li>Composicion de componentes: <a href="${"https://es.reactjs.org/docs/context.html#before-you-use-context"}" rel="${"nofollow"}">https://es.reactjs.org/docs/context.html#before-you-use-context</a> y este <a href="${"https://www.youtube.com/watch?v=3XaXKiXtNjw"}" rel="${"nofollow"}">video</a> de <a href="${"https://twitter.com/mjackson"}" rel="${"nofollow"}">Michael Jackson</a></li>
<li>Utilizar los hooks <a href="${"https://es.reactjs.org/docs/hooks-reference.html#usereducer"}" rel="${"nofollow"}">useReducer</a> y <a href="${"https://es.reactjs.org/docs/hooks-reference.html#usecontext"}" rel="${"nofollow"}">useContext</a></li>
<li>Y s\xF3lo si tu problema sigue existiendo a pesar de estas soluciones, entonces por ti mismo te dar\xE1s cuenta que necesitas ayuda extra y quiz\xE1 Redux tendr\xE1 sentido.</li></ul>
<p>Te comparto adem\xE1s una <a href="${"http://egghead.io/playlists/hooks-3d62"}" rel="${"nofollow"}">colecci\xF3n de video lecciones</a> en <a href="${"http://egghead.io"}" rel="${"nofollow"}">egghead</a> en donde podr\xE1s ver el uso de algunos de estos hooks, composici\xF3n de componentes y state lifting:</p>
<p>Dentro de las posibles soluciones al manejo de estado existen muchas alternativas, algunas de estas, muy recomendables, son:</p>
<ul><li><a href="${"https://react-query.tanstack.com"}" rel="${"nofollow"}">react-query</a> Es una librer\xEDa cuyo objetivo es otorgarte una forma de <strong>obtener, sincronizar, actualizar y \u201Ccachear\u201D</strong> tus datos remotos sin tocar tu estado global.</li>
<li><a href="${"https://github.com/mobxjs/mobx-state-tree"}" rel="${"nofollow"}">mobx-state-tree</a> Una librer\xEDa basado en MobX que combina caracter\xEDsticas de estado inmutable y mutable a forma de una m\xE1quina de estado.</li></ul>
<h1 id="${"conclusi\xF3n"}">Conclusi\xF3n</h1>
<p>Las actuales herramientas ofrecen bastante poder y flexibilidad a la hora de resolver diferentes problemas permitiendo que la necesidad de integrar utilidades extra quede fuera de la imagen.
No te pongas m\xE1s barreras en el aprendizaje agregando m\xE1s conceptos de los necesarios.
Manten el estado de tus componentes de la forma <strong>mas local posible</strong> y utiliza context s\xF3lo cuando el problema de <strong>prop drilling</strong> realmente sea un problema. Esto ser\xE1 mucho m\xE1s f\xE1cil que agregar Redux donde no es necesario.</p>`
  })}`;
});
var noNecesitasRedux = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": No_necesitas_redux,
  metadata: metadata$3
});
var metadata$2 = {
  "date": "2020-10-01T18:45:22.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1601578304/solmaz-hatamian-YSaKXcavOko-unsplash_xcnlkc.jpg",
  "keywords": ["Typescript", " Javacript"],
  "tag": "Seed",
  "title": "\xBFQu\xE9 es Typescript?",
  "description": "Typescript es un lenguaje compilado o transpilado que genera c\xF3digo Javascript, es decir escribir\xE1s c\xF3digo Typescript pero el producto final, el que se ejecuta es Javascript.",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@solmaz67?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">solmaz hatamian</a> on <a href="https://unsplash.com/s/photos/typescript?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Que_es_typescript = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$2), {}, {
    default: () => `<h1 id="${"\xBFqu\xE9-es-typescript"}">\xBFQu\xE9 es Typescript?</h1>
<p>Typescript es un lenguaje compilado o transpilado que genera c\xF3digo Javascript, es decir escribir\xE1s c\xF3digo Typescript pero el producto final, el que se ejecuta es Javascript.
Puedes tambi\xE9n considerarlo Javascript con esteroides, Typescript agrega funcionalidades al lenguaje base, esto es conocido como un superset. Algunas de las funcionalidades o caracter\xEDsticas que Typescript ofrece es el uso de tipos est\xE1ticos.</p>
<h2 id="${"\xBFqu\xE9-son-los-tipos"}">\xBFQu\xE9 son los tipos?</h2>
<p>Tipos es una forma de describir como se planea utilizar la informaci\xF3n que tu aplicaci\xF3n maneja, despu\xE9s de todo, la funci\xF3n b\xE1sica de todo programa o aplicaci\xF3n es manipular o transformar informaci\xF3n.
Los tipos o el tipado de informaci\xF3n permite definir el tipo de informaci\xF3n que se est\xE1 manipulando ya sea esto simples n\xFAmeros o cadenas de texto o estructuras m\xE1s complejas que permiten modelar perfectamente el problema de nuestro dominio.</p>
<h3 id="${"tipos-est\xE1ticos-vs-tipos-din\xE1micos"}">Tipos est\xE1ticos vs tipos din\xE1micos</h3>
<p>Los lenguajes de programaci\xF3n se pueden categorizar de variadas formas, una de ellas es en la forma que implementan el sistema de tipado. Existen dos tipos de implementaciones, tipado est\xE1tico y tipado din\xE1mico. Ninguna es mejor que la otra, simplemente son diferentes soluciones para un problema com\xFAn, c\xF3mo verificar que la informaci\xF3n que se manipula sea: <em>correctamente utilizada</em>.</p>
<p>La idea del tipado es evitar que utilices un tipo de informaci\xF3n o variable para hacer otra cosa, por ejemplo</p>
<p>const length = 14 // un n\xFAmero
console.log(length(\u201Calgun texto\u201D)) // length es usado c\xF3mo una funci\xF3n</p>
<p>El ejemplo muestra como se define una constante llamada \`length\` que est\xE1 asociada a un n\xFAmero (type Number) pero que despu\xE9s es utilizada como una funci\xF3n. Esto crear\xE1 un error al momento de ejecutar</p>
<p>TypeError: length is not a function. (In \u2018length(\u201Calgun texto\u201D)\u2019, \u2018length\u2019 is 14)</p>
<p>Este error es capturado al momento de ejecutar el c\xF3digo javascript. Javascript es un lenguaje de tipado din\xE1mico, es decir, ejecuta la corroboraci\xF3n de tipos en tiempo de ejecuci\xF3n, al igual que Python o Ruby. En cambio, Typescript, es un lenguaje de tipado est\xE1tico, la comprobaci\xF3n de tipos se hace en tiempo de compilaci\xF3n.</p>
<p>const length = 14 // un n\xFAmero
console.log(length(\u201Calgun texto\u201D)) // length es usado c\xF3mo una funci\xF3n</p>
<p>Al compilar el mismo trozo de c\xF3digo con typescript se nos muestra el siguiente error</p>
<p>../.nvm/versions/node/v12.9.0/lib/node_modules/typescript/lib/lib.dom.d.ts:19553:13 - error TS2451: Cannot redeclare block-scoped variable \u2018length\u2019.</p>
<p>19553 declare var length: number;</p>
<pre class="${"language-undefined"}"><!-- HTML_TAG_START -->${`<code class="language-undefined">
test.ts:1:7
1 const length = 14
~~~~~~
&#39;length&#39; was also declared here.

test.ts:1:7 - error TS2451: Cannot redeclare block-scoped variable &#39;length&#39;.

1 const length = 14
~~~~~~

../.nvm/versions/node/v12.9.0/lib/node_modules/typescript/lib/lib.dom.d.ts:19553:13
19553 declare var length: number;
    ~~~~~~
&#39;length&#39; was also declared here.

test.ts:2:13 - error TS2349: This expression is not callable.
Type &#39;Number&#39; has no call signatures.

2 console.log(length(&quot;algun texto&quot;))
~~~~~~


Found 3 errors.

Por lo tanto este tipo de error nunca ver\xE1 la luz en la aplicaic\xF3n.

Que ventaja puede tener un tipo de lenguaje sobre el otro? En general los lenguajes de tipado din\xE1mico son m\xE1s f\xE1ciles de aprender, son de scripting y se usan de forma muy r\xE1pida, usualmente asociado al proceso de prototipado, al contrario los lenguajes de tipado est\xE1tico pueden tener una curva de aprendizaje mayor.

Una \xFAltima clasificaci\xF3n de tipados es Tipado Fuerte vs Tipado D\xE9bil, aunque esto es m\xE1s un espectro, por ejemplo Javascript de tipado _muy_ d\xE9bil, tiene la noci\xF3n de tipos pero no necesariamente los utiliza _seriamente_, dijamos que es de tipado relajado.
Javascript hace una conversi\xF3n implicita, Typescript por contraparte prefier una conversi\xF3n explicita.

## \xBFPor qu\xE9 usar tipos est\xE1ticos en el desarrolo web?

En general la respuesta est\xE1 relacionada por el nivel de confianza que este tipo de tipado da, evitando errores del tipo &#96;undefined is not a function&#96;. Esta confiabilidad ayuda en la matenibilidad y refactoring del c\xF3digo, adem\xE1s, gracias a los diferentes plugins de los editores de texto se genera una gran documentaci\xF3n solo por el hecho de agregar tipos, permitiendo a todos quienes participan en el desarrollo puedan r\xE1pidamente entender que hace cada funci\xF3n.
Un [estudio muestra que el 15%](http://earlbarr.com/publications/typestudy.pdf) de todos los errores de Javascript pueden ser detectados por Typescript.

Adem\xE1s, no es necesario saber nada en particular para comenzar con TS, el agregar tipos es opcional, pero muy aconsejable, y todo el c\xF3digo Javascript es tambi\xE9n v\xE1lido como Typescript.
Adem\xE1s:

* Evitas la coerci\xF3n de datos (como la suma de n\xFAmeros con strings).
* Evitas operaciones en tipos erroneos, como hacer \u201Ctrim\u201D en un n\xFAmero.
* Los tipos est\xE1ticos invitan a crear tipos personalizados.
* Los tipos pueden ser implicitos o explicitos, si no los defines, el compilador los inferir\xE1 por ti.

## Algunos tipos en TS

Typescript define varios tipos b\xE1sicos como: Boolean, Number, String, Array, Typle, etc. Algunos de estos tipos tambi\xE9n existen en Javascript, puedes encontrar mas informaci\xF3n en la [documentaci\xF3n](https://www.typescriptlang.org/docs/handbook/basic-types.html)

* **Any y Unknown**: Typescript ofrece estos dos tipos para:
* **Any**: Es en cierto forma \u201Ccualquier tipo\u201D o \u201Ctodos los tipos\u201D, es en cierta forma una manera de escapar de Typescript, normalmente se utiliza para modelar los datos de librer\xEDas externas sin tipar.
* **Unknown**: Es el tipo desconocido, que a diferencia de &#96;any&#96; es un tipo seguro. Typescript no permite ejecutar operaciones sobre el dato hasta que el tipo del dato sea verificado.
* **Void**: Utilizado cuando no hay valor de retorno, por ejemplo en un event handler.
* **Never**: Es un tipo de dato emitido por funciones que no deber\xEDan ocurrir: ej: Throw an exception.
* **Intersection &amp; Union type:** Permite crear tipos personalizados adecuados para el dominio particular.
* Intersection: Permite unir varios tipos b\xE1sicos en un solo tipo. Equivalente a un \u201Cand\u201D
* Union: Equivalente a un \u201Cor\u201D Permite a la variable tomar uno de varios tipos

const result: string | undefined = undefined

# Pros y Cons

## Typescript es confiable

En contraste con javascript, Typescript es confiable y f\xE1cil de refactorizar permitiendo evadir errores.
Los tipos eliminan la mayor\xEDa de los errores bobos y generan un r\xE1pido feedback para arreglar esos peque\xF1os errores.

## Typescript es explicito

Al utilizar tipos explicitos podemos enfocar nuestra atenci\xF3n en como el sistema esta construido y como sus diferentes partes interactuan.

## Typescript y Javascript son \u201Ccasi\u201D intercambiables

Como Typescript es un superset de Javascript piedes utilizar todo el ecosistem Javascript.
Adem\xE1s la mayor\xEDa de las librerias m\xE1s populares o estan esscritas en typescript o distribuyen tipos via [Definitely Typed](https://github.com/DefinitelyTyped/DefinitelyTyped), un repositorio que contiene cientos de tipos para las librarias m\xE1s utilizadas.

# Cons

* No es un cabio directo. Tomar un equipo o un proyecto y comenzar a escribir TS idiom\xE1tico no es r\xE1pido. Hay una leve curva de aprendizaje.
* En el corto plazo puede tomar tiempo adaptarse.
* SI es un proyecto Open Source necesitar\xE1s que los contributors sepan TS.

&lt;a id=&quot;org793dbbd&quot;&gt;&lt;/a&gt;

# Quickstart

Lo primero que debes hacer es instalar el compilador de typescript con &#96;npm&#96;

npm install -g typescript

Una vez instalado podr\xE1s ejecutar &#96;tsc -v&#96; en tu consola.

Lo \xFAnico necesario para comenzar es el compilador y un archivo typescript.
Crea un archivo &#96;test.ts&#96;

function delay(milliseconds: number, count: number): Promise&lt;number&gt; &#123;
return new Promise&lt;number&gt;(resolve =&gt; &#123;
setTimeout(() =&gt; &#123;
resolve(count);
&#125;, milliseconds);
&#125;);
&#125;

// async function always return a Promise
async function dramaticWelcome(): Promise&lt;void&gt; &#123;
console.log(&quot;Hello&quot;);

for (let i = 0; i &lt; 5; i++) &#123;
// await is converting Promise&lt;number&gt; into number
const count: number = await delay(500, i);
console.log(count);
&#125;

console.log(&quot;World!&quot;);
&#125;

dramaticWelcome();

Como vez eso se parece mucho a Javascript pero tiene esos \u201Cextra\xF1os\u201D &#96;:&#96; que definen el tipo de la variable, argumento o funci\xF3n.
Para ejecutar esto, primero debes compilarlo y luego ejecutar con node

tsc test.ts
node test.js

Typescript es una grana adici\xF3n a tu flujo de desarrollo otorgando seguridad a tu proceso y evitando una gran familia de errores en los que todos podemos caer continuamente.

Les dejo algunos cursos para comenzar con Typescript:

* [https://egghead.io/courses/up-and-running-with-typescript](https://egghead.io/courses/up-and-running-with-typescript &quot;Up and Running with TypeScript&quot;)
* [https://egghead.io/courses/advanced-static-types-in-typescript](https://egghead.io/courses/advanced-static-types-in-typescript &quot;https://egghead.io/courses/advanced-static-types-in-typescript&quot;)
* [https://egghead.io/courses/practical-advanced-typescript](https://egghead.io/courses/practical-advanced-typescript &quot;https://egghead.io/courses/practical-advanced-typescript&quot;)
* [https://egghead.io/courses/async-await-using-typescript](https://egghead.io/courses/async-await-using-typescript &quot;https://egghead.io/courses/async-await-using-typescript&quot;)</code>`}<!-- HTML_TAG_END --></pre>`
  })}`;
});
var queEsTypescript = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Que_es_typescript,
  metadata: metadata$2
});
var metadata$1 = {
  "date": "2020-07-29T19:14:38.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1596050181/ferenc-almasi-tvHtIGbbjMo-unsplash_kq9ukw.jpg",
  "keywords": ["React", "Hooks"],
  "tag": "Seed",
  "title": "Que son los Hooks",
  "description": "\xBFQu\xE9 son los Hooks en React? \xBFDe d\xF3nde nacen y por qu\xE9?",
  "bannerCredit": '<span>Photo by <a href="https://unsplash.com/@flowforfrank?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Ferenc Almasi</a> on <a href="https://unsplash.com/s/photos/hooks?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>'
};
var Que_son_los_hooks = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata$1), {}, {
    default: () => `${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<h3 id="${"este-post-es-parte-transcripci\xF3n--de-lo-emitido-en-el-episodio-16-de-caf\xE9-con-tech-y-tambi\xE9n-material-extra"}">Este post es parte transcripci\xF3n  de lo emitido en el episodio 16 de Caf\xE9 con Tech y tambi\xE9n material extra</h3>
${validate_component(Buzzsprout, "Buzzsprout").$$render($$result, { buzzsproutId: "4728410-react-hooks" }, {}, {})}`
    })}
<h4 id="${"\xBFqu\xE9-son-los-hooks-en-react-y-por-que"}">\xBFQu\xE9 son los Hooks en React y por que?</h4>
<p>Cuando esta nueva API fue anunciada en la React Conf en OCtubre de 2018 causo algo de controversia, muchos aplaudieron emocionados por las nuevas posibilidades y muchos otros quedaron con la duda del por que esto ser\xEDa necesario cuando ya ten\xEDamos una API standard en forma de clases y varios patrones de dise\xF1o altamente probados.</p>
<p>Bueno, el equipo tras React y la comunidad en general ya hab\xEDan  identificado varios problemas durante la primera era de la librer\xEDa , problemas que llevaron a la creaci\xF3n de la api de Hooks.</p>
<p>Desde la publicaci\xF3n de React hemos podido entender que el uso de componentes y un ciclo de datos de una direcci\xF3n ayudan a organizar el desarrollo de nuestra UI en partes peque\xF1as, inpendientes y reutilizables. Pero a pesar de esto, muchas veces nos hemos encontrado con la imposibilidad de continuar dividiendo un componente complejo dado que la implementaci\xF3n es dependendiente del estado impidiendo  su extracci\xF3n. Muchas veces esto es lo que muchos detractores de React se refieren a la imposibilidad inherente de la librer\xEDa para separar las responsabilidades.</p>
<p>Este tipo de casos son muy comunes en el desarrollo de aplicaciones complejas, casos como animaciones, manejo de m\xFAltiples formularios, conexi\xF3n con datos externos, etc</p>
<p>Normalmente las soluciones implementadas en estos casos caen en unos de estos tres tipos.</p>
<ul><li><strong>Componentes gigantes</strong>, que claramente son dificiles de mantener, refactorizar y testear</li>
<li><strong>L\xF3gica duplicada</strong> entre diferentes componentes lo que dificulta la mantenibilidad del c\xF3digo o fomenta la creaci\xF3n de abstracciones a\xFAn m\xE1s complejas</li>
<li><strong>Patrones de dise\xF1o compuestos</strong>  como mezclas entres render props y high-order components</li></ul>
<p>Entonces basado en todos estos problemas nacio Hooks, como un intento (bastante certero a decir verdad) de reparar todos esos problemas de un s\xF3lo golpe.</p>
<p>La idea tr\xE1s hooks mantiene la filosof\xEDa implementada por react, composici\xF3n y un flujo de datos explicito, pero ya no s\xF3lo entre componentes, si no, dentro de un componente.</p>
<p>una cr\xEDtica de los primeros d\xEDas de hooks es que se acrecenta la curva de aprendizaje de React ya que existen multiples conceptos y formas de resolver un mismo problema, pero: Si se adopta (como se ha hecho hasta ahora) el uso de hooks como la formar primaria de escribir una aplicaci\xF3n React, en realidad se reducir\xEDa el n\xFAmero de conceptos con los que hay que lidiar. Aqu\xED los principiantes lo tienen algo m\xE1s f\xE1cil. No tiene un modelo mental que modificar y s\xF3lo deben ir directamente a utilizar y entender Hooks.
Para los m\xE1s viejitos, quiz\xE1 sea una curva de aprendizaje un poco m\xE1s empinada ya que el modelo mental internalizado genera ciertos choques que impiden entender del todo el funcionamiento de hooks. useEffect te estoy mirando a ti.</p>
<h4 id="${"\xBFentonces-que-son-los-hooks"}">\xBFEntonces que son los hooks?</h4>
<p>El principio b\xE1sico del que nace esta implementaci\xF3n es en la reutilizaci\xF3n de c\xF3digo.
Hasta antes de la llegada de esta API exist\xEDan muchas formas de compartir o reutilizar c\xF3digo. funciones utilitarias para ciertos c\xE1lculos o componentes, que por cierto tambi\xE9n son una funci\xF3n.
El inconveniente de los componentes a la hora de reutilizar c\xF3digo es que estos deben de renderizar algo, por lo que si es necesario compartir logica que no corresponda con nuestra UI se tornan algo incovenientes dando nacimiento as\xED a patrones m\xE1s complejos como los high-order components y render props, que como coment\xE9 en el episodio anterior buscan una forma de compartir l\xF3gica entre diversos componentes, patrones tambi\xE9n conocidos como headless components.</p>
<p>Pero, las funciones parecen ser el mecanismo adecuado para la reutilizaci\xF3n de c\xF3digo no? Adem\xE1s Javascript hace que la tarea de mover l\xF3gica entre funciones sea directa dado su soporte de primer orden y tomando todo lo aprendido desde la programaci\xF3n funcional donde una funci\xF3n es la unidad at\xF3mica de tu programa.
El problema con las funciones es que, no es posible tener estado en su interior, estado desde el punto de vista de React. ANtes de hooks no era posible extraer l\xF3gica relacionada con el estado de la UI tal como \u201Canimar un valor \u201D sin necesitar una refactorizaci\xF3n masiva o la introducciones de patrones m\xE1s complejos o mecanismos con una nueva curva de aprendizaje., como reactive programming.</p>
<p>Hooks propone exactamente una soluci\xF3n a esto. La api de hooks permite utilizar carecter\xEDsitcas inherentes de React, como el estado, directamente en una funci\xF3n, y como estos hooks son simples funciones en Javascript, es posible combinarlas y componerlas como m\xE1s consideremos adecuado dando nacimiento as\xED a los hooks personalizados o \u201Ccustom hooks\u201D. Permitiendo a cada desarrollador refactorizar problemas complejos o l\xF3gica duplicada en simples funciones que se pueden compartir en toda la aplicaci\xF3n.</p>
<p>React ofrece con esta nueva API algunos bloques de construcci\xF3n b\xE1sicos tales como:</p>
<ul><li><strong>useState</strong>: un hooks que permite mantener estado dentro de tu componente funcional</li>
<li><strong>useReducer</strong>: una variante de useState que permite manejar estados m\xE1s complejos utilizando una funci\xF3n reducer.</li>
<li><strong>useEffect</strong>: Quiz\xE1 el hook m\xE1s complejo de entender  dado la insistencia de muchos en relacionarlo con los m\xE9todos del ciclo de vida de un componente tipo clase. Este es el hook que permite la realizaci\xF3n de la obtenci\xF3n de datos, suscripciones o manipulaci\xF3n manual del DOM, esta dise\xF1ado para efectuar efectos secundarios o side effects.</li>
<li><strong>useContext</strong>: El hook que democratiz\xF3 la API context.</li></ul>
<p>Los hooks son funciones totalmente encapsuladas, creando un estado local aislado dentro del componente en que se ejecuta, es decir, no son una forma de compartir estado, si no, una forma de compartir logica con estado.</p>
<h4 id="${"entonces-que-pas\xF3-con-las-clases-las-olvidamos"}">Entonces que pas\xF3 con las clases? las olvidamos.?</h4>
<p>Los hooks personalizados son quiz\xE1 la parte m\xE1s interesante de esta api y para ello React provee de hooks b\xE1sicos o pilares, para construir abstracciones poderosas, al ofrecer estos hooks b\xE1sicos se cubre tambi\xE9n otra necesidad: son suficientes para definir un componente en general, es por esto que la comunidad empuja a que Hooks sea la forma principal para construir componentes React.</p>
<p>El equipo tras React no tiene planes de jubilar las clases, pero dado que hooks ha sido aceptado enormemente, no hay raz\xF3n para que existan dos formas recomendadas de escribir componentes.
Los hooks pueden cubrir todos los casos de uso de los componentes de clase y proveer m\xE1s flexibilidad, por lo que se recomienda que este sea el camino de aqu\xED en adelante.</p>
<p>Algo que tambi\xE9n es importante es entender que el funcionamiento de los hooks en las entra\xF1as de React no es ninguna magia vud\xFA, si no. Todo lo contrario. Es una implementaci\xF3n bastante simple.</p>
<p>React mantiene una lista de los hooks usados en cada componente, y mueve el puntero al siguiente en la lista cada vez que un hook es utilizado. Gracias a la existencia de las \u201Creglas de los hooks\u201D, el orden es el mismo en cada renderizado, permitiendo as\xED que se pueda proveer el componente con el estado correcto en cada llamada.</p>
<p>El estado de los hooks tampoco es nada nuevo ni especial, este es mantenido por React de la misma forma que se hac\xEDa para el estado en los componentes de clase. React posee una cola de actualizaci\xF3n interna que se utiliza como terreno de la verdad (source of truth) para cualquier estado, sin importar como este fue definido en el componente.</p>
<p>Hooks no utiliza Proxies o getters que han sido muy popularizados en algunas modernas librer\xEDas. B\xE1sicamente la ejecuci\xF3n de los hooks es muy similar a Array.push y Array.pop</p>
<p>Entonces, si estas comenzando con React. Enfoca tu b\xFAsqueda de informaci\xF3n en ejemplos y contenido que muestre el desarrollo con hooks como pilar principal, si ya estas avanzado en el uso de la librer\xEDa, ciertamente no es necesario que refactorices todo tu c\xF3digo para usar hooks, React tiene retro-compatibilidad y las clases no han sido marcadas como deprecated por lo que simplemente deber\xEDas enfocarte en el cambio de tu modelo mental y comenzar a crear nuevos features con la nueva api</p>
<h4 id="${"\xBFpor-qu\xE9-hablo-de-un-cambio-de-modelo-mental"}">\xBFPor qu\xE9 hablo de un cambio de modelo mental?</h4>
<p>Antes de la llegada oficial de Hooks la forma de construir aplicaciones con React estaba basada principalmente en el uso de clases y sus m\xE9todos de ciclos de vida. Los componentes funcionales o \u201Cstateless\u201D eran incluso llamados \u201Ctontos\u201D (dumb components) pues solo eran utilizados para renderizar partes de la UI sin realmente efectuar alguna acci\xF3n din\xE1mica, mas all\xE1 de representar el contenido de sus props.</p>
<p>Hooks, presenta una forma distinta de manejar un componente, los m\xE9todos de ciclos de vida ya no existen o se han vuelto redundantes transformando la forma en que desarrollamos a un m\xE9todo m\xE1s cercano a la programaci\xF3n funcional.<br>
<code>React.useEffect</code> es el hook que se encarga de efectuar todas las mismas acciones que se pod\xEDan hacer con los m\xE9todos de ciclo de vida, pero en realidad no es un reemplazo uno a uno de aquellos m\xE9todos, si no, una forma diferente de efectuar acciones sobre el component.</p>
<p>He aqu\xED el cambio de modelo mental, ahora ya no estamos escribiendo clases, estamos escribiendo funciones que tiene un m\xE9todo de efectuar side effects.</p>
<p>Los \u201Ceffects\u201D est\xE1n relacionados con el modelo mental que tenemos sobre el renderizado de un componente y c\xF3mo este se relaciona con su estado.</p>
<p>Como ejemplo</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">HideText</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">&#123;</span> text <span class="token punctuation">&#125;</span></span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
       <span class="token keyword">const</span> <span class="token punctuation">[</span>isHide<span class="token punctuation">,</span> setIsHide<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
       <span class="token keyword">const</span> <span class="token function-variable function">onClick</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
           <span class="token function">setIsHide</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">prevState</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
               <span class="token keyword">return</span> <span class="token operator">!</span>prevState
    	   <span class="token punctuation">&#125;</span><span class="token punctuation">)</span>
       <span class="token punctuation">&#125;</span>
       <span class="token keyword">return</span> <span class="token punctuation">(</span>
           <span class="token operator">&lt;</span>div<span class="token operator">></span>
               <span class="token operator">&lt;</span>button onClick<span class="token operator">=</span><span class="token punctuation">&#123;</span>onClick<span class="token punctuation">&#125;</span><span class="token operator">></span>Toggle Hide<span class="token operator">&lt;</span><span class="token operator">/</span>button<span class="token operator">></span>
               <span class="token punctuation">&#123;</span>isHide<span class="token operator">?</span> <span class="token keyword">null</span> <span class="token operator">:</span> text<span class="token punctuation">&#125;</span>
            <span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">></span>
       <span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>En este peque\xF1o trozo de c\xF3digo \xBFqu\xE9 quiere decir el renderizado condicional? \xBFel valor de <code>isHide</code> vigila los cambios que ocurren en el state? En general, al usar <code>useState</code> lo que se obtiene como primer valor es s\xF3lo eso, un valor, no hay data binding ni watchers, ni observables ni nada m\xE1s. S\xF3lo un valor, que en este caso es un boolean.</p>
<p>Por cada click que se haga en el bot\xF3n, se realiza una llamada a  <code>setIsHide</code>, es decir, un cambio en el estado y esto inicia un nuevo renderizado del componente. En cada una de estas nuevas llamadas al componente, <code>useState</code> retornar\xE1 un nuevo valor a la variable <code>isHide</code>.</p>
<p>Por cada cambio en el estado, React ejecuta una nueva llamada a la funci\xF3n con la que declaramos el componente, as\xED, en cada ocasi\xF3n un nuevo resultado es retornado por la llamada y en cada llamada un nuevo valor para <code>isHide</code> es visto por la funci\xF3n.</p>
<p>Es as\xED que esta linea <code>{isHide? null : text}</code> simplemente compara un valor constante y local <code>isHide</code> para definir si se renderiza o no el texto.</p>
<p>Es decir, los valores retornados por <code>useState</code> son constantes dentro de un renderizado en particular, la variable no cambia en el tiempo, no es un stream continuo de datos, al contrario, es el componente que es llamado en varias ocasiones con un valor de estado distinto. Esto tambi\xE9n es verdad para los manejadores de eventos (eventHandlers) que hagan uso del valor de estado. El manejador de eventos <em>pertenece</em> a un renderizado en particular.</p>
<p>Por extensi\xF3n llegamos a los side effects.</p>
<p>Para esto podemos usar un sencillo ejemplo</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">    <span class="token keyword">const</span> <span class="token function-variable function">TitleUpdater</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
    	<span class="token keyword">const</span> <span class="token punctuation">[</span>value<span class="token punctuation">,</span> setValue<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token function">useState</span><span class="token punctuation">(</span><span class="token string">''</span><span class="token punctuation">)</span>
        
        <span class="token function">useEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        	document<span class="token punctuation">.</span>title <span class="token operator">=</span> value
        <span class="token punctuation">&#125;</span><span class="token punctuation">)</span>
        
        <span class="token keyword">const</span> <span class="token function-variable function">handleChange</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">event</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">&#123;</span>
        	<span class="token function">setValue</span><span class="token punctuation">(</span>event<span class="token punctuation">.</span>target<span class="token punctuation">.</span>value<span class="token punctuation">)</span>
        <span class="token punctuation">&#125;</span>
        <span class="token keyword">return</span> <span class="token punctuation">(</span>
    	    <span class="token operator">&lt;</span>div<span class="token operator">></span>
    		    <span class="token operator">&lt;</span>p<span class="token operator">></span>Ingresa el titulo<span class="token operator">&lt;</span><span class="token operator">/</span>p<span class="token operator">></span>
    	    	<span class="token operator">&lt;</span>input type<span class="token operator">=</span><span class="token string">"text"</span> value<span class="token operator">=</span><span class="token punctuation">&#123;</span>value<span class="token punctuation">&#125;</span> onChange<span class="token operator">=</span><span class="token punctuation">&#123;</span>handleChange<span class="token punctuation">&#125;</span> <span class="token operator">/</span><span class="token operator">></span>
         	<span class="token operator">&lt;</span><span class="token operator">/</span>div<span class="token operator">></span>
        <span class="token punctuation">)</span>
    <span class="token punctuation">&#125;</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Este ejemplo simplemente muestra un input que recibe un texto que se ve reflejado en el titulo del sitio. </p>
<p>Basados en el ejemplo anterior sabemos que <code>value </code>es un valor constante dentro de un momento/renderizado en particular, tambi\xE9n sabemos que los manejadores de eventos pueden \u201Cver\u201D el estado de <code>value</code> dentro del render al que pertenecen, y esto mismo es verdad para los efectos.</p>
<p>La funci\xF3n de efecto es una simple funci\xF3n que tiene acceso a los valores dentro de su scope, y esta es diferente en cada renderizado. En cada versi\xF3n del rederizado la funci\xF3n de efecto <em>\u201Cve\u201D</em>  un valor distinto para la variable <code>value</code>.  </p>
<p>He aqu\xED la diferencia en el modelo mental entre los m\xE9todos del ciclo de vida y hooks. Las funciones de efectos pertenecen a un renderizado en particular al igual que los manejadores de efectos, por lo tanto no es necesario que \u201Creciban\u201D valores especiales o existan \u201Cwatchers\u201D o \u201Cbindings\u201D para acceder al estado.</p>
<p>El nuevo modelo mental al utilizar efectos est\xE1 m\xE1s relacionado con la posibilidad de sincronizar las props y estado con alguna \u201Ccosa\u201D fuera del \xE1rbol de componentes, como en el ejemplo anterior, el efecto modificaba el t\xEDtulo del documento que est\xE1 fuera del \xE1rbol de componentes pero se sincroniza con el estado del componente renderizado. Es completamente diferente al modelo anterior de <code>montar/actualizar/desmontar</code> intentar escribir un efecto que tiene diferentes comportamientos basados en el \u201Cmomento\u201D en que se encuentra es el camino errado.</p>`
  })}`;
});
var queSonLosHooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Que_son_los_hooks,
  metadata: metadata$1
});
var metadata = {
  "date": "2020-10-13T02:35:45.000Z",
  "banner": "https://res.cloudinary.com/matiasfha/image/upload/v1602556838/Clojure_logo.svg_idu5pq.png",
  "keywords": ["Clojure", "Listp"],
  "tag": "Post",
  "title": "\xBFPor qu\xE9 Clojure?",
  "description": "Clojure es un lenguaje variante de Lips, flexible, funcional, din\xE1mico y entretenido.",
  "bannerCredit": ""
};
var Por_que_clojure = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PostLayout, "Layout_MDSVEX_DEFAULT").$$render($$result, Object.assign($$props, metadata), {}, {
    default: () => `<p>Desde hace ya un tiempo que comence mi viaje de aprendizaje con Clojure, incialmente m\xE1s por curiosidad que nada, me gusta aprender nuevos lenguajes y obtener de cada uno de ellos algo que mejore mi trabajo diario.
Inicie con Clojure con el proyecto <a href="${"https://github.com/athensresearch/ClojureFam"}" rel="${"nofollow"}">ClojureFam</a> y en este momento puedo decir: Me encanta Clojure.</p>
<p>Pero, comencemos por el principio:</p>
<h1 id="${"\xBFqu\xE9-es-clojure"}">\xBFQu\xE9 es Clojure?</h1>
<p>Clojure es un lenguaje de uso general, din\xE1mico, es un dialecto de Lisp y comparte su <strong>filosof\xEDa /c\xF3digo como datos</strong> / (m\xE1s de esto m\xE1s adelante).</p>
<p>Fue creado el 2007 por Rich Hickey, acutalmente mantenido principalmente por Cognitect con la ayuda de 126 colaboradores</p>
<p>Es actualmente utilizado por <a href="${"https://clojure.org/community/success_stories"}" rel="${"nofollow"}">varias compa\xF1ias</a> como Amazon y Wallmart.</p>
<h1 id="${"\xBFpero-qu\xE9-hace-de-clojure-un-lenguaje-\xFAnico-e-interesante"}">\xBFPero qu\xE9 hace de Clojure un lenguaje \xFAnico e interesante?</h1>
<p>Primero, si bien Clojure naci\xF3 el 2007, es en realidad una \u201Cre-versi\xF3n\u201D (dialecto) de un lenguaje que se reh\xFAsa a morir y que es probablemente el lenguaje m\xE1s antiguo a\xFAn en uso Lisp.
Lisp, apareci\xF3 publicamente por primera vez en 1958, si!!, hace 62 a\xF1os subsistiendo a los cambios de paradigmas y nuevos requerimientos del mundo del desarrollo de software.</p>
<p>Clojure, es una \u201Cevoluci\xF3n\u201D de Lisp, matiene lo mejor que \xE9ste provee y mejorar algunas cosas creando un lenguaje simple (que no f\xE1cil) con una sintaxis robusta y m\xEDnima.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>\u201CLisp isn\u2019t a language, it\u2019s a building material.\u201D \u2014 Alan Kay</p>`
    })}
<h2 id="${"jvm"}">JVM</h2>
<p>Clojure se ejecuta en la JVM (Java virtual Machine), una gran pieza de software optimizada hasta m\xE1s no poder (tambi\xE9n se ejecuta o \u201Ctranspila\u201D  a Javascript para funcionar sobre el navegador) y adem\xE1s utiliza o \u201Caprovecha\u201D el ecosistema de Java, con todas sus librer\xEDas inclu\xEDdas, es decir, a\xF1os de experiencia y desarrollo al alcance de este nuevo lenguaje.</p>
<p>Actualmente el stack de Java (nacido en los 90s) es sin lugar a duda el stack m\xE1s popular en la industria, con la inmensa cantidad de c\xF3digo Java disponible en producci\xF3n es casi imposible para un nuevo lenguaje querer superar a Java o al menos querer ser notorio sin la capacidad de inter-operar con Java (o Javascript en el caso de ClojureScript).</p>
<p>Clojure te permite utilizar c\xF3digo Java por ejemplo:</p>
<pre class="${"language-clojure"}"><!-- HTML_TAG_START -->${`<code class="language-clojure">    <span class="token punctuation">(</span><span class="token keyword">import</span> <span class="token operator">'java</span>.util.Date <span class="token operator">'java</span>.text.SimpleDateFormat<span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>o crear una instancia de una clase java</p>
<pre class="${"language-clojure"}"><!-- HTML_TAG_START -->${`<code class="language-clojure">    <span class="token punctuation">(</span><span class="token keyword">import</span> '<span class="token punctuation">(</span>java.text SimpleDateFormat<span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">(</span><span class="token keyword">def</span> sdf <span class="token punctuation">(</span><span class="token keyword">new</span> SimpleDateFormat <span class="token string">"yyyy-MM-dd"</span><span class="token punctuation">)</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>En definitiva, Clojure utiliza todo el poder de la JVM y de lo que esta puede ofrecer.</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>Si he llegado hasta aqu\xED es por que me aup\xE9 en hombros de gigantes - Atribu\xEDdo a Isaac Newton</p>`
    })}
<p>Es decir, con Clojure obtienes el poder de la ya muy probada y aceptada JVM y adem\xE1s su portabilidad inherente a casi cualquier hardware y OS existente.</p>
<h2 id="${"din\xE1mico-inmutable-y-funcional"}">Din\xE1mico, Inmutable y Funcional</h2>
<p>Clojure, es tambi\xE9n un lenguaje din\xE1mico pero con estructuras de datos estrictamente inmutables, esto proporciona una gran facibilidad de uso para la manipulaci\xF3n de datos, adem\xE1s esta inmutabilidad provee facilidades tambi\xE9n para el desarrollo de aplicaciones multi-hilos evitando \u201Crace conditions\u201D y otros problemas presentes en lenguajes mutables como Java.</p>
<p>Es de tipado din\xE1mico, esto quiz\xE1 pueda ser algo que te aleje del lenguaje (sobre todo si eres un entusiaste de lenguajes <a href="${"https://matiashernandez.dev/que-es-typescript"}" rel="${"nofollow"}">Typescript</a>), pero la filosof\xEDa del lenguaje y el ciclo de desarrollo te aseguran que los cl\xE1sico errores de tipo de datos (<code>undefined is not a function</code>) no ocurrir\xE1n. Clojure es conocido por ser un lenguaje <em>REPL Driven Development</em>, es decir, utiliza su ultra poderosa REPL (Read Eval Print Loop) para ir testeando \u201Cin live\u201D el c\xF3digo que vas escribiendo.</p>
<p>Otra caracter\xEDstica \u201Ccool\u201D, heredada desde Lisp es la <a href><strong>homoiconocidad</strong></a> el propio programa que est\xE1s escribiendo puede ser manipulado como datos utilizando Clojure dado que un programa Clojure es representado como estructuras de datos Clojure.</p>
<p>Es un lenguaje funcional, no es purista como Haskell. Datos inmutables y funciones como ciudadanos importantes de este lenguaje permiten que puedas aplicar el paradigma en todo su esplendor. Ser funcional es algo bueno (has visto la tendencia en casi todos los lenguajes de programaci\xF3n? Hasta Java soporta funciones an\xF3nimas/lambdas ahora!! \u{1F633})</p>
${validate_component(Quote, "Components.blockquote").$$render($$result, {}, {}, {
      default: () => `<p>\u201CChoose immutability and see where it takes you\u201D \u2014 Rich Hickey, Clojure creator</p>`
    })}
<h2 id="${"sintaxis-econ\xF3mica"}">Sintaxis econ\xF3mica</h2>
<p>Pero una de las cosas que m\xE1s llama la atenci\xF3n inicialmente es su sintaxis, bastante extra\xF1a para la mayor\xEDa que hemos heredado el experimento que fue la sintaxis ofrecida por C.
Clojure cas\xED no tiene sintaxis o gram\xE1tica, un ejemplo puede explicar mucho m\xE1s</p>
<pre class="${"language-clojure"}"><!-- HTML_TAG_START -->${`<code class="language-clojure">    <span class="token punctuation">(</span><span class="token keyword">println</span> <span class="token punctuation">(</span><span class="token keyword">take</span> <span class="token number">10</span> <span class="token punctuation">(</span><span class="token keyword">map</span> <span class="token punctuation">(</span><span class="token keyword">fn</span> <span class="token punctuation">[</span>x<span class="token punctuation">]</span> <span class="token punctuation">(</span><span class="token keyword">*</span> x x<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">(</span><span class="token keyword">range</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Esta <em>\u201Ccriptica\u201D</em> pieza de c\xF3digo imprime en pantalla es bastante extra\xF1a la primera vez que la vez, tantos parentesis!!
Esta es, en mi opini\xF3n, m\xE1s del 85% de toda la sintaxis de Clojure, solo quedan por aprender algunas palbras claves como <code>def</code> y <code>defn</code>.</p>
<p>Que hace este c\xF3digo? o, como lo leo?
En clojure, todo est\xE1 definido como una lista, definida por <code>()</code> parentesis, esta sintaxis define tanto una lista como una \u201Cforma\u201D o expresi\xF3n. En este caso lo que tenemos es:</p>
<ul><li><p>Se abre un parentesis iniciando una expresi\xF3n (abreviado comunmente como sexp - S-expresion)</p></li>
<li><p>println es simplemente una llamada a la funci\xF3n <code>System.out.println</code> proviniente de Java, para imprimir algo en pantalla, a su derecha est\xE1 el argumento de <code>println</code>, lo que queremos imprimir.</p></li>
<li><p><code>()</code> una nueva lista es abierta</p></li>
<li><p><code>take</code> es una funci\xF3n que espera dos argumentos, un entero y una secuencia. El entero <code>10</code> indica el n\xFAmero de elementos que queremos \u201Ctomar\u201D de la secuencia</p></li>
<li><p><code>()</code> una nueva lista es abierta</p></li>
<li><p><code>map</code> aparece. Es una funci\xF3n que tambi\xE9n toma dos argumentos, una funci\xF3n para aplicar sobre cada item de la lista que recibe como segundo argumento.</p></li>
<li><p><code>(fn [x] (* x x))</code> una nueva lista y una funci\xF3n an\xF3nima es definida. Esta es la forma de definir una funci\xF3n sin nombre, una lambda, que recibe <code>[x]</code> un argumento llamado <code>x</code> y que retorna el resultado de aplicar la funci\xF3n <code>*</code> sobre los argumentos <code>x</code> y <code>x</code></p></li>
<li><p>El segundo argumento de <code>map</code> es una lista, en este caso es la llamada a la funci\xF3n <code>range</code></p></li>
<li><p><code>range</code> simplemente retorna una lista con <em>\u201Ctodos\u201D</em> los enteros positivos. Range retorna una secuencia tipo <code>lazy</code>, es decir, solo se generan los enteros solicitados, en este caso <code>10</code></p>
<p>Otra forma de escribir esto ser\xEDa</p></li></ul>
<pre class="${"language-clojure"}"><!-- HTML_TAG_START -->${`<code class="language-clojure">      <span class="token punctuation">(</span><span class="token keyword">defn</span> square <span class="token punctuation">[</span>x<span class="token punctuation">]</span> <span class="token punctuation">(</span><span class="token keyword">*</span> x x<span class="token punctuation">)</span><span class="token punctuation">)</span>
      <span class="token punctuation">(</span><span class="token keyword">println</span> <span class="token punctuation">(</span><span class="token keyword">take</span> <span class="token number">10</span> <span class="token punctuation">(</span><span class="token keyword">map</span> square <span class="token punctuation">(</span><span class="token keyword">range</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p><code>defn</code> es la forma que te permite definir una funci\xF3n \u{1F937}\u200D\u2642\uFE0F recibe como argumentos el nombre de la funci\xF3n y la definici\xF3n de esta (dentro de una lista <code>()</code>). Aqui los <code>[]</code> \u201Cbrackets\u201D que se usan para definir un vector, se utilizan para definir el grupo de argumentos de la funci\xF3n.</p>
<p>\xBFC\xF3mo ser\xEDa esto mismo en Javascript?</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">      <span class="token keyword">const</span> range <span class="token operator">=</span> Array<span class="token punctuation">.</span><span class="token function">from</span><span class="token punctuation">(</span><span class="token punctuation">&#123;</span>length<span class="token operator">:</span> <span class="token number">10</span><span class="token punctuation">&#125;</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token parameter">_<span class="token punctuation">,</span> i</span><span class="token punctuation">)</span> <span class="token operator">=></span> i <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span>
      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>range<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span><span class="token parameter">item</span> <span class="token operator">=></span> item<span class="token operator">*</span>item<span class="token punctuation">)</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Dado que javascript tiene ciertas capacidades de escribir c\xF3digo en forma funcional este trozo de codigo no es demasiado \u201Cverbose\u201D, pero quiz\xE1 algo m\xE1s dificil de entender.</p>
<p>La primera linea utiliza <a href="${"https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/from"}" rel="${"nofollow"}"><code>Array.from</code></a> que recibe un objeto de configuraci\xF3n con <code>length: 10</code>, largo 10 y una funci\xF3n tipo <code>map</code>, que toma el indice del elemento y le suma 1, para poder crear una arreglo que comienza desde 1.</p>
<p>Quiz\xE1 una forma mas sencilla ser\xEDa utilizar una librer\xEDa como lodash o <a href="${"http://underscorejs.org/#range"}" rel="${"nofollow"}">underscore</a> o escribir c\xF3digo imperativo cmo</p>
<pre class="${"language-javascript"}"><!-- HTML_TAG_START -->${`<code class="language-javascript">       <span class="token comment">// Otras opciones declarativas</span>
      <span class="token comment">// Array(10).fill().map((_, i) => i+1);</span>
      <span class="token comment">// [ ...Array(10).keys() ].map( i => i+1);</span>
      <span class="token keyword">const</span> range <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>
      <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token keyword">let</span> i <span class="token operator">&lt;=</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">&#123;</span>
        range<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span>
      <span class="token punctuation">&#125;</span>
      <span class="token keyword">const</span> <span class="token function-variable function">square</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">x</span><span class="token punctuation">)</span> <span class="token operator">=></span> x<span class="token operator">*</span>x
      console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>range<span class="token punctuation">.</span><span class="token function">map</span><span class="token punctuation">(</span><span class="token parameter">item</span> <span class="token operator">=></span> <span class="token function">square</span><span class="token punctuation">(</span>item<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span></code>`}<!-- HTML_TAG_END --></pre>
<p>Lo que es notoriamente m\xE1s explicito/imperativo y al mismo tiempo m\xE1s verbose.</p>
<h2 id="${"tooling"}">Tooling</h2>
<p>Las herramientas para desarrollar Clojure son tan buenas como cualquiera.</p>
<p>Editar c\xF3digo Clojure (u otros Lisp) no es exactamente como editar c\xF3digo en otros lenguajes, ahora estas lidiando con la edici\xF3n de <a href="${"https://en.wikipedia.org/wiki/S-expression"}" rel="${"nofollow"}">expresiones-s</a></p>
<p>Por lo general el editor consideradode-facto es Emacs en conjunto con <a href="${"https://cider.mx"}" rel="${"nofollow"}">Cider</a> que es una especie de \u201Cplugin\u201D para emacs que permite tener un ambiente de desarrollo interactivo utilizar REPL.
Clojure ofrece (antes mencionado) un medio de desarrollo conocido como REPL Driven Development, un ciclo de desarrollo interactivo e incremental, donde te encuentras constantemente re-evaluando las definiciones de tus funciones y agregando nuevas definiciones mientras tu app se ejecuta. No es necesario estar iniciando o deteniendo tu aplicaci\xF3n escrita en Clojure, simplemente te conectas a la interfaz de REPL.</p>
<p>Pero Emacs no es el \xFAnico IDE o editor que ofrece estas herramientas, tambi\xE9n es muy popular utilizar</p>
<ul><li>IntelliJ con <a href="${"https://cursive-ide.com"}" rel="${"nofollow"}">Cursive</a></li>
<li>VIM con <a href="${"http://www.vim.org/scripts/script.php?script_id=3998"}" rel="${"nofollow"}">paredit</a> o <a href="${"https://github.com/guns/vim-sexp"}" rel="${"nofollow"}">sexp</a> y <a href="${"https://github.com/tpope/vim-fireplace"}" rel="${"nofollow"}">fireplace</a> o <a href="${"https://github.com/Olical/conjure"}" rel="${"nofollow"}">conjure</a></li>
<li>VSCode con <a href="${"https://marketplace.visualstudio.com/items?itemName=avli.clojure"}" rel="${"nofollow"}">Clojure</a> o <a href="${"https://marketplace.visualstudio.com/items?itemName=betterthantomorrow.calva"}" rel="${"nofollow"}">Calva</a></li></ul>
<p>Tambi\xE9n vale la pena mencionar que Clojure tiene varias herramientas que te ayudan a manejar tus dependencias y crear tus proyectos, el m\xE1s utilizado es <a href="${"https://leiningen.org"}" rel="${"nofollow"}">leiningen</a></p>
<h2 id="${"comunidad"}">Comunidad</h2>
<p>La comunidad de Clojure, si bien menor en comparaci\xF3n con Java, Python o Javascript (quiz\xE1 la m\xE1s grande de todas (?)) es una comunidad muy activa.</p>
<ul><li><p><a href="${"https://clojurians.net"}" rel="${"nofollow"}">Clojurians Slack</a></p></li>
<li><p>Reddit <a href="${"https://reddit.com/r/clojure"}" rel="${"nofollow"}">/r/clojure</a></p></li>
<li><p>Youtube <a href="${"https://www.youtube.com/user/ClojureTV"}" rel="${"nofollow"}">ClojureTV</a></p></li>
<li><p><a href="${"https://github.com/athensresearch/ClojureFam"}" rel="${"nofollow"}">ClojureFam</a> El programa de apredizaje de Clojure que estoy siguiendo.</p>
<p>Adem\xE1s hay varias meetups y conferencias sobre el desarrollo de Clojure y ClojureScript como:</p></li>
<li></li>
<li><p><a href="${"http://clojutre.org/2020/"}" rel="${"nofollow"}">ClojuTRE</a></p></li>
<li><p><a href="${"http://clojurenorth.com/"}" rel="${"nofollow"}">ClojureNorth</a></p></li>
<li><p><a href="${"https://clojure.org/events/2020/dutchclojureday"}" rel="${"nofollow"}">Clojuredays</a></p></li>
<li><p><a href="${"https://clojure.org/events/2020/clojured"}" rel="${"nofollow"}">ClojureD</a></p></li>
<li><p><a href="${"https://www.bridgetroll.org/events/500"}" rel="${"nofollow"}">ClojureBridge</a></p></li></ul>
<h1 id="${"conclusi\xF3n"}">Conclusi\xF3n</h1>
<p>Clojure es un lenguaje entretenido, con una sintaxis que inicialmente parece compleja pero que en realidad es de las m\xE1s sencillas que me he encontrado, es vers\xE1til y puedes transformarte en un full stack developer escribiendo Clojure y Clojurescript.</p>
<p>Te invito a saltar a este mundo y comenzar a aprender un nuevo lenguaje, quiz\xE1 no para convertirte en un <em>clojurist</em> pero siempre, aprender un nuevo lenguaje, un nuevo paradigma y t\xE9cnicas te ayudaran a ser mejor en lo que haces d\xEDa a d\xEDa.</p>`
  })}`;
});
var porQueClojure = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Por_que_clojure,
  metadata
});

// .svelte-kit/vercel/entry.js
init();
var entry_default = async (req, res) => {
  const { pathname, searchParams } = new URL(req.url || "", "http://localhost");
  let body;
  try {
    body = await getRawBody(req);
  } catch (err) {
    res.statusCode = err.status || 400;
    return res.end(err.reason || "Invalid request body");
  }
  const rendered = await render({
    method: req.method,
    headers: req.headers,
    path: pathname,
    query: searchParams,
    rawBody: body
  });
  if (rendered) {
    const { status, headers, body: body2 } = rendered;
    return res.writeHead(status, headers).end(body2);
  }
  return res.writeHead(404).end();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
