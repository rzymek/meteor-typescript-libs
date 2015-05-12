/// <reference path="../definitions/node.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = require("assert");
var fs = require("fs");
var events = require("events");
var zlib = require("zlib");
var url = require('url');
var util = require("util");
var crypto = require("crypto");
var http = require("http");
var net = require("net");
var dgram = require("dgram");
var querystring = require('querystring');
var path = require("path");
assert(1 + 1 - 2 === 0, "The universe isn't how it should.");
assert.deepEqual({ x: { y: 3 } }, { x: { y: 3 } }, "DEEP WENT DERP");
assert.equal(3, "3", "uses == comparator");
assert.notStrictEqual(2, "2", "uses === comparator");
assert.throws(function () { throw "a hammer at your face"; }, undefined, "DODGED IT");
assert.doesNotThrow(function () {
    if (false) {
        throw "a hammer at your face";
    }
}, undefined, "What the...*crunch*");
////////////////////////////////////////////////////
/// File system tests : http://nodejs.org/api/fs.html
////////////////////////////////////////////////////
fs.writeFile("thebible.txt", "Do unto others as you would have them do unto you.", assert.ifError);
fs.writeFile("Harry Potter", "\"You be wizzing, Harry,\" jived Dumbledore.", {
    encoding: "ascii"
}, assert.ifError);
var content, buffer;
content = fs.readFileSync('testfile', 'utf8');
content = fs.readFileSync('testfile', { encoding: 'utf8' });
buffer = fs.readFileSync('testfile');
buffer = fs.readFileSync('testfile', { flag: 'r' });
fs.readFile('testfile', 'utf8', function (err, data) { return content = data; });
fs.readFile('testfile', { encoding: 'utf8' }, function (err, data) { return content = data; });
fs.readFile('testfile', function (err, data) { return buffer = data; });
fs.readFile('testfile', { flag: 'r' }, function (err, data) { return buffer = data; });
var Networker = (function (_super) {
    __extends(Networker, _super);
    function Networker() {
        _super.call(this);
        this.emit("mingling");
    }
    return Networker;
})(events.EventEmitter);
var errno;
fs.readFile('testfile', function (err, data) {
    if (err && err.errno) {
        errno = err.errno;
    }
});
////////////////////////////////////////////////////
/// Url tests : http://nodejs.org/api/url.html
////////////////////////////////////////////////////
url.format(url.parse('http://www.example.com/xyz'));
// https://google.com/search?q=you're%20a%20lizard%2C%20gary
url.format({
    protocol: 'https',
    host: "google.com",
    pathname: 'search',
    query: { q: "you're a lizard, gary" }
});
var helloUrl = url.parse('http://example.com/?hello=world', true);
assert.equal(helloUrl.query.hello, 'world');
// Old and new util.inspect APIs
util.inspect(["This is nice"], false, 5);
util.inspect(["This is nice"], { colors: true, depth: 5, customInspect: false });
////////////////////////////////////////////////////
/// Stream tests : http://nodejs.org/api/stream.html
////////////////////////////////////////////////////
// http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options
function stream_readable_pipe_test() {
    var r = fs.createReadStream('file.txt');
    var z = zlib.createGzip();
    var w = fs.createWriteStream('file.txt.gz');
    r.pipe(z).pipe(w);
    r.close();
}
////////////////////////////////////////////////////
/// Crypto tests : http://nodejs.org/api/crypto.html
////////////////////////////////////////////////////
var hmacResult = crypto.createHmac('md5', 'hello').update('world').digest('hex');
function crypto_cipher_decipher_string_test() {
    var key = new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7]);
    var clearText = "This is the clear text.";
    var cipher = crypto.createCipher("aes-128-ecb", key);
    var cipherText = cipher.update(clearText, "utf8", "hex");
    cipherText += cipher.final("hex");
    var decipher = crypto.createDecipher("aes-128-ecb", key);
    var clearText2 = decipher.update(cipherText, "hex", "utf8");
    clearText2 += decipher.final("utf8");
    assert.equal(clearText2, clearText);
}
function crypto_cipher_decipher_buffer_test() {
    var key = new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7]);
    var clearText = new Buffer([1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4]);
    var cipher = crypto.createCipher("aes-128-ecb", key);
    var cipherBuffers = [];
    cipherBuffers.push(cipher.update(clearText));
    cipherBuffers.push(cipher.final());
    var cipherText = Buffer.concat(cipherBuffers);
    var decipher = crypto.createDecipher("aes-128-ecb", key);
    var decipherBuffers = [];
    decipherBuffers.push(decipher.update(cipherText));
    decipherBuffers.push(decipher.final());
    var clearText2 = Buffer.concat(decipherBuffers);
    assert.deepEqual(clearText2, clearText);
}
////////////////////////////////////////////////////
// Make sure .listen() and .close() retuern a Server instance
http.createServer().listen(0).close().address();
net.createServer().listen(0).close().address();
var request = http.request('http://0.0.0.0');
request.once('error', function () { });
request.setNoDelay(true);
request.abort();
////////////////////////////////////////////////////
/// Http tests : http://nodejs.org/api/http.html
////////////////////////////////////////////////////
var http_tests;
(function (http_tests) {
    // Status codes
    var code = 100;
    var codeMessage = http.STATUS_CODES['400'];
    var codeMessage = http.STATUS_CODES[400];
    var agent = new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 10000,
        maxSockets: Infinity,
        maxFreeSockets: 256
    });
    var agent = http.globalAgent;
})(http_tests || (http_tests = {}));
////////////////////////////////////////////////////
/// Dgram tests : http://nodejs.org/api/dgram.html
////////////////////////////////////////////////////
var ds = dgram.createSocket("udp4", function (msg, rinfo) {
});
var ai = ds.address();
ds.send(new Buffer("hello"), 0, 5, 5000, "127.0.0.1", function (error, bytes) {
});
////////////////////////////////////////////////////
///Querystring tests : https://gist.github.com/musubu/2202583
////////////////////////////////////////////////////
var original = 'http://example.com/product/abcde.html';
var escaped = querystring.escape(original);
console.log(escaped);
// http%3A%2F%2Fexample.com%2Fproduct%2Fabcde.html
var unescaped = querystring.unescape(escaped);
console.log(unescaped);
// http://example.com/product/abcde.html
////////////////////////////////////////////////////
/// path tests : http://nodejs.org/api/path.html
////////////////////////////////////////////////////
var path_tests;
(function (path_tests) {
    path.normalize('/foo/bar//baz/asdf/quux/..');
    path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
    // returns
    //'/foo/bar/baz/asdf'
    try {
        path.join('foo', {}, 'bar');
    }
    catch (error) {
    }
    path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile');
    //Is similar to:
    //
    //cd foo/bar
    //cd /tmp/file/
    //cd ..
    //    cd a/../subfile
    //pwd
    path.resolve('/foo/bar', './baz');
    // returns
    //    '/foo/bar/baz'
    path.resolve('/foo/bar', '/tmp/file/');
    // returns
    //    '/tmp/file'
    path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
    // if currently in /home/myself/node, it returns
    //    '/home/myself/node/wwwroot/static_files/gif/image.gif'
    path.isAbsolute('/foo/bar'); // true
    path.isAbsolute('/baz/..'); // true
    path.isAbsolute('qux/'); // false
    path.isAbsolute('.'); // false
    path.isAbsolute('//server'); // true
    path.isAbsolute('C:/foo/..'); // true
    path.isAbsolute('bar\\baz'); // false
    path.isAbsolute('.'); // false
    path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb');
    // returns
    //    '..\\..\\impl\\bbb'
    path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
    // returns
    //    '../../impl/bbb'
    path.dirname('/foo/bar/baz/asdf/quux');
    // returns
    //    '/foo/bar/baz/asdf'
    path.basename('/foo/bar/baz/asdf/quux.html');
    // returns
    //    'quux.html'
    path.basename('/foo/bar/baz/asdf/quux.html', '.html');
    // returns
    //    'quux'
    path.extname('index.html');
    // returns
    //    '.html'
    path.extname('index.coffee.md');
    // returns
    //    '.md'
    path.extname('index.');
    // returns
    //    '.'
    path.extname('index');
    // returns
    //    ''
    'foo/bar/baz'.split(path.sep);
    // returns
    //        ['foo', 'bar', 'baz']
    'foo\\bar\\baz'.split(path.sep);
    // returns
    //        ['foo', 'bar', 'baz']
    console.log(process.env.PATH);
    // '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'
    process.env.PATH.split(path.delimiter);
    // returns
    //        ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
    console.log(process.env.PATH);
    // 'C:\Windows\system32;C:\Windows;C:\Program Files\nodejs\'
    process.env.PATH.split(path.delimiter);
    // returns
    //        ['C:\Windows\system32', 'C:\Windows', 'C:\Program Files\nodejs\']
    path.parse('/home/user/dir/file.txt');
    // returns
    //    {
    //        root : "/",
    //        dir : "/home/user/dir",
    //        base : "file.txt",
    //        ext : ".txt",
    //        name : "file"
    //    }
    path.parse('C:\\path\\dir\\index.html');
    // returns
    //    {
    //        root : "C:\",
    //        dir : "C:\path\dir",
    //        base : "index.html",
    //        ext : ".html",
    //        name : "index"
    //    }
    path.format({
        root: "/",
        dir: "/home/user/dir",
        base: "file.txt",
        ext: ".txt",
        name: "file"
    });
})(path_tests || (path_tests = {}));
