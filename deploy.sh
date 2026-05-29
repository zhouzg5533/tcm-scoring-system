#!/bin/bash
# 中药调配考核打分系统 - 阿里云 CentOS 一键部署脚本

set -e
echo "========================================"
echo "  中药打分系统 一键部署脚本"
echo "========================================"

# 1. 安装 Node.js 18
echo ""
echo ">>> [1/5] 安装 Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
node -v
npm -v

# 2. 安装 PM2
echo ""
echo ">>> [2/5] 安装 PM2（进程守护）..."
npm install -g pm2

# 3. 拉取代码
echo ""
echo ">>> [3/5] 拉取项目代码..."
mkdir -p /opt/tcm-scoring
cd /opt/tcm-scoring
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/zhouzg5533/tcm-scoring-system.git .
fi

# 4. 安装依赖
echo ""
echo ">>> [4/5] 安装项目依赖..."
npm install --production

# 5. 启动服务
echo ""
echo ">>> [5/5] 启动服务..."
pm2 stop tcm-scoring 2>/dev/null || true
pm2 start server.js --name tcm-scoring
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

# 开放防火墙端口
echo ""
echo ">>> 配置防火墙..."
firewall-cmd --permanent --add-port=8899/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo ""
echo "========================================"
echo "  部署完成！"
PUBLIC_IP=$(curl -s http://ipinfo.io/ip 2>/dev/null || echo "8.134.76.169")
echo "  访问地址：http://${PUBLIC_IP}:8899"
echo "  查看日志：pm2 logs tcm-scoring"
echo "  重启服务：pm2 restart tcm-scoring"
echo "========================================"
