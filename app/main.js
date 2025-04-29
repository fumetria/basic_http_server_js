const net = require("net");
const fsp = require("fs").promises;
const fs = require("fs");
const process = require('node:process');
const zlib = require('node:zlib');
const { pipeline } = require('node:stream');

const args = process.argv;
const directory = args.indexOf("--directory") !== -1 ? args[args.indexOf("--directory") + 1] : null;
const dat = args.indexOf("-d") !== -1 ? args[args.indexOf("-d") + 1] : null;
const server = net.createServer((socket) => {
    socket.on("data", async (data) => {
        const request = data.toString();
        const lines = request.split("\r\n");
        const requestLine = lines[0];
        let requestUserAgent = "";
        let acceptEncoding = "";
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            if (line.startsWith("User-Agent")) {
                requestUserAgent = line;
            }
            if (line.startsWith("Accept-Encoding")) {
                acceptEncoding = line;
            }
        }
        let encoding = "";
        let encodings = [];
        let contentEncoding = "";
        if (acceptEncoding != "") {
            encoding = acceptEncoding.split(": ")[1].toString();
            if (encoding.indexOf(',') != -1) {
                encodings = encoding.split(', ');
                for (let index = 0; index < encodings.length; index++) {
                    const encode = encodings[index];
                    if (encode === 'gzip') {
                        encoding = encode;
                        break;
                    }
                }
            }
            contentEncoding = encoding === "gzip" ? `Content-Encoding: ${encoding}\r\n` : "";
        }

        const fileData = lines[lines.length - 1];
        const [method, path, protocol] = requestLine.split(" ");
        const UserAgent = requestUserAgent.split(": ")[1];

        if (path != "/") {
            if (path.startsWith("/files/")) {
                const fileName = path.slice("/files/".length);
                const filePath = directory + fileName;
                if (method === "GET") {
                    if (fs.existsSync(filePath)) {
                        const fileBuffer = await fsp.readFile(filePath);
                        const fileContent = fileBuffer.toString();
                        const fileContentLength = fileContent.length;
                        socket.write(
                            `HTTP/1.1 200 OK\r\nFile-path: ${filePath}\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContentLength}\r\n\r\n${fileContent}`
                        );
                        socket.end();
                    } else {
                        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                        socket.end();
                    }
                }
                if (method === "POST") {
                    await fsp.writeFile(filePath, fileData);
                    socket.write("HTTP/1.1 201 Created\r\n\r\n");
                    socket.end();
                }

            } else if (path.startsWith("/echo/")) {
                let requestText = path.slice(6);
                const requestTextLength = requestText.length;
                if (encoding === "gzip") {
                    const gzip = zlib.createGzip();
                    // const source = fs.createReadStream(requestText);
                    // const destination = fs.createWriteStream(requestText);
                    // pipeline(source, gzip, destination, (err) => {
                    //     if (err) {
                    //         console.error('An error occurred:', err);
                    //         process.exitCode = 1;
                    //     }

                    // });
                    const compressedText = zlib.gzipSync(requestText);
                    socket.write(
                       `HTTP/1.1 200 OK\r\n${contentEncoding}Content-Type: text/plain\r\nContent-Length: ${requestTextLength}\r\n\r\n`
                    );
                    socket.write(compressedText);
                    socket.end();
                } else {
                    socket.write(
                        `HTTP/1.1 200 OK\r\n${contentEncoding}Content-Type: text/plain\r\nContent-Length: ${requestTextLength}\r\n\r\n${requestText}`
                    );
                    socket.end();
                }

            } else if (path.startsWith("/user-agent")) {
                const UserAgentLength = UserAgent.length;
                socket.write(
                    `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${UserAgentLength}\r\n\r\n${UserAgent}\r\n`
                );
                socket.end();
            } else {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                socket.end();
            }
        } else {
            socket.write("HTTP/1.1 200 OK\r\n\r\n");
            socket.end();
        }
    });
    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
