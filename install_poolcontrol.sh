#!/bin/bash
echo "getting node repo..."
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash - > /dev/null
echo "installing nodejs..."
sudo apt install nodejs -y > /dev/null
echo "finished nodejs installation..."
echo "installing build tools..."
sudo apt-get install gcc g++ make -y > /dev/null
echo "leaving root..."
echo "setting timezone..."
sudo timedatectl set-timezone Europe/Berlin > /dev/null
echo "ttimezone set"
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add - > /dev/null
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
echo "updating repos..."
sudo apt-get update > /dev/null
echo "installing mongodb"
sudo apt-get install -y mongodb-org > /dev/null
echo "asdfasfd"
sudo systemctl start mongod.service > /dev/null
echo "enabling mongodb (autostart)..."
sudo systemctl enable mongod.service > /dev/null
echo "starting installing poolcontrol..."
cd ..
echo "cloning repo..."
sudo git clone https://github.com/tamsch/poolarino_poolcontrol.git > /dev/null
echo "werwerwer"
cd poolarino_poolcontrol
echo "eiieie"
echo "urueueue"
cd ../home/poolarino_poolcontrol/
echo "installing packages..."
sudo npm i > /dev/null
echo "werwerewrwrwer"
echo "ghgfhfghfh"
sudo rm -r angular-src/
echo "creating mongodb database..."
echo "db.createUser({user: 'pool', pwd: 'pool', roles: ['readWrite']})" > /tmp/mongodb.js
echo "creating database file..."
echo "module.exports = {database: 'mongodb://pool:pool@127.0.0.1:27017/pool' , secret:'deinscret'}" > ~/../poolarino_poolcontrol/config/database.js
echo "adding processmanager..."
sudo npm install -g pm2 > /dev/null
echo "jzjjzjj"
sudo pm2 startup > /dev/null
echo "rtrttzrtzrtrz"
cd poolarino_poolcontrol/
echo "uioiuoio"
sudo pm2 start app.js
echo "installing webserver..."
sudo apt-get install -y lighttpd > /dev/null
echo "installing ftp program..."
sudo apt-get install pure-ftpd -y > /dev/null
echo "uziuzuizuiz"
sudo groupadd ftpgroup
echo "errttrttrrttr"
sudo useradd ftpuser -g ftpgroup -s /sbin/nologin -d /dev/null
echo "hthhhhh"
sudo chown -R ftpuser:ftpgroup /var/www/html
echo "tzuzuzuzutztuz"
(echo poolarino; echo poolarino) | sudo pure-pw useradd upload -u ftpuser -g ftpgroup -d /var/www/html -m
sudo pure-pw mkdb
echo "rtzrtztrrztrrztrtz"
sudo ln -s /etc/pure-ftpd/conf/PureDB /etc/pure-ftpd/auth/60puredb
echo "jzjjjjtzjzt"
sudo service pure-ftpd restart
echo "finished everything, poolcontrol ready"