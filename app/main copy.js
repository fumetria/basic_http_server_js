const net = require("net");
const fs = require("fs").promises;

const routes = ["/", "/user-agent", "/echo", "/files"];

/**
 * 🔍 const dirIndex = args.indexOf("--directory");

    Busca el índice dentro del array args donde aparece el string "--directory".

    Si existe, te da su posición.

    Si no existe, devuelve -1.

    🧠 const baseDirectory = dirIndex !== -1 ? args[dirIndex + 1] : null;

    Si encontró "--directory" (dirIndex !== -1):

        Toma el siguiente valor en el array como el path base, es decir: args[dirIndex + 1].

    Si no lo encontró:

        Asigna null (por seguridad, para que no intente leer archivos desde una ruta indefinida).
 */
const args = process.argv;
const dirIndex = args.indexOf("--directory");
const baseDirectory = dirIndex !== -1 ? args[dirIndex + 1] : null;

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        const lines = request.split("\r\n");
        const requestLine = lines[0];
        let requestUserAgent = "";
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            if (line.startsWith("User-Agent")) {
                requestUserAgent = line;
                break;
            }
        }
        const [method, path, protocol] = requestLine.split(" ");
        const UserAgent = requestUserAgent.split(": ")[1];

        if (!routes.includes(path)) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.end();
        } else {
            if (path.startsWith("/files/")) {
                const fileName = path.slice(6);
                const filePath = baseDirectory + fileName;
                try {
                    const fileBuffer = async () =>{await fs.readFile(filePath)};
                    const fileContent = fileBuffer;
                    const fileContentLength = fileContent.length;
                    socket.write(
                        `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContentLength}\r\n\r\n${fileContent}`
                    );
                    socket.end();
                } catch (error) {
                    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                    socket.end();
                }
                // fs.readFile(filePath)
                //   .then((data) => {
                //     const fileContent = data;
                //     const fileContentLength = fileContent.length;
                //     socket.write(
                //       `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContentLength}\r\n\r\n${fileContent}`
                //     );
                //     socket.end();
                //   })
                //   .catch((error) => {
                //     socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                //     socket.end();
                //   });
            }
            if (path.startsWith("/echo" && path[5] === "/")) {
                const requestText = path.slice(6);
                const requestTextLength = requestText.length;
                socket.write(
                    `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${requestTextLength}\r\n\r\n${requestText}`
                );
                socket.end();
            }
            if (path.startsWith("/user-agent" && path[11] === "/")) {
                const UserAgentLength = UserAgent.length;
                socket.write(
                    `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${UserAgentLength}\r\n\r\n${UserAgent}\r\n`
                );
                socket.end();
            }
            if (path === "/") {
                socket.write("HTTP/1.1 200 OK\r\n\r\n");
                socket.end();
            }

            // if(path != '/'){
            //     if(path.slice(0,11) == '/user-agent'){
            //         const UserAgentLength = UserAgent.length;
            //         socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${UserAgentLength}\r\n\r\n${UserAgent}\r\n`);
            //         socket.end();
            //     }else if(path.slice(0,5) == '/echo'){
            //         const requestText = path.slice(6);
            //         const requestTextLength = requestText.length;
            //         socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${requestTextLength}\r\n\r\n${requestText}`);
            //         socket.end();
            //     } else{
            //         socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
            //         socket.end();
            //     }
            // } else {
            //     socket.write("HTTP/1.1 200 OK\r\n\r\n");
            //     socket.end();
            // }
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.end();
        }
    });
    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
