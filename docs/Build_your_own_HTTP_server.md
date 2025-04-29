[![progress-banner](https://backend.codecrafters.io/progress/http-server/45347993-2625-496e-9398-fe1fe468f66e)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)
# Buil your own HTTP server with Javascript

## Introduction

Welcome to the Build your own HTTP server challenge!

HTTP is the protocol that powers the web. In this challenge, you'll build a HTTP server from scratch using TCP primitives. Your server will be capable of handling simple GET/POST requests, serving files and handling multiple concurrent connections.

Along the way, we'll learn about TCP connections, HTTP headers, HTTP verbs, handling multiple connections and more.

This is a starting point for JavaScript solutions to the
["Build Your Own HTTP server" Challenge](https://app.codecrafters.io/courses/http-server/overview).

[HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) is the
protocol that powers the web. In this challenge, you'll build a HTTP/1.1 server
that is capable of serving multiple clients.

Along the way you'll learn about TCP servers,
[HTTP request syntax](https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html),
and more.

# Passing the first stage

The entry point for your HTTP server implementation is in `app/main.js`. Study
and uncomment the relevant code, and push your changes to pass the first stage:

```sh
git commit -am "pass 1st stage" # any msg
git push origin master
```

Time to move on to the next stage!

# Stage 2 & beyond

Note: This section is for stages 2 and beyond.

1. Ensure you have `node (21)` installed locally
2. Run `./your_program.sh` to run your program, which is implemented in
   `app/main.js`.
3. Commit your changes and run `git push origin master` to submit your solution
   to CodeCrafters. Test output will be streamed to your terminal.


## Repository Setup

We've prepared a starter repository with some JavaScript code for you.
Clone the repository

```sh
git clone https://git.codecrafters.io/c4c9354be2b654d2 codecrafters-http-server-javascript
cd codecrafters-http-server-javascript
```

Push an empty commit
```sh
git commit --allow-empty -m 'test'
git push origin master
```

When you run the above command, the "Listening for a git push" message below will change, and the first stage will be activated.

## Bind to a port 

Since this is the first stage, we've included some commented code to help you get started. To pass this stage, simply uncomment the code and submit your changes. 

### Step 1: Navigate to app/main.js

Open your repository in your editor / IDE of choice and navigate to app/main.js.

If you're using VS Code, run this command:
```bash
code --goto app/main.js .
```
**Note:** If the code command is not available, read [VS Code's documentation](https://code.visualstudio.com/docs/editor/command-line#_launching-from-command-line). 

### Step 2: Uncomment code

Uncomment the following code in *app/main.js*:

app/main.js
```javascript
const net = require("net");

const server = net.createServer((socket) => {

  socket.on("close", () => {

    socket.end();

  });

});

server.listen(4221, "localhost");
```

### Step 3: Submit changes

First, run this command to commit your changes:
command line
```bash
git commit -am "[any message]"
```
The output of the command should look like this:
```bash
[master 8bc0189] [any message]
1 file changed, 1 insertion(+), 1 deletion(-)
```

Note: If your output doesn't match the above, [read this](https://app.codecrafters.io/courses/http-server/stages/at4#).

Next, run this command to push your changes:
command line
```bash
git push origin master
```
The output of the command should look like this:
```bash
remote: Welcome to CodeCrafters! Your commit was received successfully.
```
Note: If your output doesn't match the above, [read this](https://app.codecrafters.io/courses/http-server/stages/at4#).

Once you run the commands above, the Tests failed message below this card will change to Tests passed. 

### Your Task
In this stage, you'll create a TCP server that listens on port 4221.

TCP is the underlying protocol used by HTTP servers.
Tests

The tester will execute your program like this:
```bash
$ ./your_program.sh
```
Then, the tester will try to connect to your server on port 4221. The connection must succeed for you to pass this stage.

Notes

- To learn how HTTP works, you'll implement your server from scratch using TCP primitives instead of using 's built-in HTTP libraries.


## Step AP6 - Return a file

In this stage, you'll implement the /files/{filename} endpoint, which returns a requested file to the client.
Tests

The tester will execute your program with a --directory flag. The --directory flag specifies the directory where the files are stored, as an absolute path.
```sh
$ ./your_program.sh --directory /tmp/
```

The tester will then send two GET requests to the /files/{filename} endpoint on your server.
First request

The first request will ask for a file that exists in the files directory:
```bash
$ echo -n 'Hello, World!' > /tmp/foo
$ curl -i http://localhost:4221/files/foo
```

Your server must respond with a 200 response that contains the following parts:

  - **Content-Type** header set to application/octet-stream.
  - **Content-Length** header set to the size of the file, in bytes.
  - **Response body** set to the file contents.

```bash
HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: 13\r\n\r\nHello, World!
``` 
Second request

The second request will ask for a file that doesn't exist in the files directory:

```bash
$ curl -i http://localhost:4221/files/non_existant_file
```

Your server must respond with a *404* response:

```bash
HTTP/1.1 404 Not Found\r\n\r\n
```

To solve this stage we are going to use fs module from Node. Because of _fs.exist is deprecated_, we are go to use **fs** for use the function *fs.existsSync()* and fs.promises to use *fs.readFile()* in async mode. 

```javascript
const fsp = require("fs").promises;
const fs = require("fs");
```

## Step IJ8 - Multiple compression schemes

In this stage, you'll add support for Accept-Encoding headers that contain multiple compression schemes.

### Multiple compression schemes
A client can specify that it supports multiple compression schemes by setting Accept-Encoding to a comma-separated list:
```sh
Accept-Encoding: encoding-1, encoding-2, encoding-3
```

For this extension, assume that your server only supports the gzip compression scheme.

For this stage, you don't need to compress the body. You'll implement compression in a later stage.

### Tests

The tester will execute your program like this:
```sh
$ ./your_program.sh
```

The tester will then send two GET requests to the /echo/{str} endpoint on your server.

#### First request
For the first request, the Accept-Encoding header will contain gzip, along with some invalid encodings:
```sh
$ curl -v -H "Accept-Encoding: invalid-encoding-1, gzip, invalid-encoding-2" http://localhost:4221/echo/abc
``` 
Your server's response must contain this header: Content-Encoding: gzip.
```sh
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Encoding: gzip

// Body omitted.
```

#### Second request
For the second request, the Accept-Encoding header will only contain invalid encodings:
```sh
$ curl -v -H "Accept-Encoding: invalid-encoding-1, invalid-encoding-2" http://localhost:4221/echo/abc
```
Your server's response must not contain a Content-Encoding header:
```sh
HTTP/1.1 200 OK
Content-Type: text/plain

// Body omitted.
```

## Step CR8 - Gzip compression 
In this stage, you'll add support for gzip compression to your HTTP server.

### Tests
The tester will execute your program like this:
```sh
$ ./your_program.sh
```
Then, the tester will send a GET request to the /echo/{str} endpoint on your server. The request will contain an Accept-Encoding header that includes gzip.
```sh
$ curl -v -H "Accept-Encoding: gzip" http://localhost:4221/echo/abc | hexdump -C
```
Your server's response must contain the following:
```sh
200 response code.
Content-Type header set to text/plain.
Content-Encoding header set to gzip.
Content-Length header set to the size of the compressed body.
Response body set to the gzip-compressed str parameter.
HTTP/1.1 200 OK
Content-Encoding: gzip
Content-Type: text/plain
Content-Length: 23

1F 8B 08 00 00 00 00 00  // Hexadecimal representation of the response body
00 03 4B 4C 4A 06 00 C2
41 24 35 03 00 00 00
```

#### Notes
- To check that your compressed body is correct, you can run echo -n <uncompressed-str> | gzip | hexdump -C.
- It's normal for a very short string like abc to increase in size when compressed.

#### References
- Zlib: https://nodejs.org/api/zlib.html#zlib
- Node Stream: http://nodejs.org/api/stream.html#stream
