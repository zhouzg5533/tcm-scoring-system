const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8899;

let allData = {
    s1: {}, s2: {}, s3: {}, s4: {}, s5: {}, s6: {}, s7: {}, s8: {}
};

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        const htmlPath = path.join(__dirname, 'index.html');
        fs.readFile(htmlPath, (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    }
});

const wss = new WebSocket.Server({ server });

function getLocalIp() {
    let ipList = [];
    const interfaces = os.networkInterfaces();
    for (let dev in interfaces) {
        interfaces[dev].forEach(item => {
            if (item.family === 'IPv4' && !item.internal) ipList.push(item.address);
        });
    }
    return ipList[0] || '127.0.0.1';
}
const localIP = getLocalIp();

function broadcast(msg) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(msg));
    });
}

wss.on('connection', (ws) => {
    console.log('✅ 设备已连接');
    ws.send(JSON.stringify({ type: 'init', data: allData }));

    ws.on('message', (buf) => {
        try {
            const res = JSON.parse(buf);
            if (res.type === 'save') {
                allData[res.screen] = res.data;
                broadcast({ type: 'refresh', data: allData });
            }
            if (res.type === 'reset') {
                allData = { s1: {}, s2: {}, s3: {}, s4: {}, s5: {}, s6: {}, s7: {}, s8: {} };
                broadcast({ type: 'resetAll', data: allData });
            }
        } catch (e) {}
    });

    ws.on('close', () => {
        console.log('设备已断开');
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('💚 中药打分系统 启动成功 ✅');
    console.log(`🌐 本机访问：http://127.0.0.1:${PORT}`);
    console.log(`🌐 局域网通用地址：http://${localIP}:${PORT}`);
    console.log('========================================');
});