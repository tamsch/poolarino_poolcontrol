#!/bin/bash
echo "Starting Poolarino-Poolcontrol installation"

function ProgressBar {
    let _progress=(${1}*100/${2}*100)/100
    let _done=(${_progress}*4)/10
    let _left=40-$_done

    _fill=$(printf "%${_done}s")
    _empty=$(printf "%${_left}s")

printf "\rInstallationsfortschritt : [${_fill// /#}${_empty// /-}] ${_progress}%%"

}

_start=1

_end=100

ProgressBar 1 ${_end}
sudo apt-get update &> /dev/null
ProgressBar 2 ${_end}
sudo apt-get upgrade -y &> /dev/null || { printf "\nBitte warten Sie auf den Abschluss der Systemupdates und versuchen es dann erneut! (5-10 Minuten)\n" ; exit 1; }
ProgressBar 3 ${_end}
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash - &> /dev/null
ProgressBar 4 ${_end}
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list &> /dev/null
ProgressBar 7 ${_end}
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add - &> /dev/null
ProgressBar 10 ${_end}
sudo apt-get update &> /dev/null
ProgressBar 13 ${_end}
sudo apt-get install gcc g++ make mongodb-org lighttpd pure-ftpd nodejs -y &> /dev/null
ProgressBar 15 ${_end}
sudo timedatectl set-timezone Europe/Berlin &> /dev/null
ProgressBar 18 ${_end}
sudo systemctl start mongod.service &> /dev/null
ProgressBar 22 ${_end}
sudo systemctl enable mongod.service &> /dev/null
ProgressBar 24 ${_end}
sudo git clone https://github.com/tamsch/poolarino_poolcontrol.git /home/poolarino_poolcontrol &> /dev/null
ProgressBar 28 ${_end}
sudo rm -r /home/poolarino_poolcontrol/angular-src/ &> /dev/null
ProgressBar 32 ${_end}
sudo npm --prefix /home/poolarino_poolcontrol/ install &> /dev/null
ProgressBar 36 ${_end}
sudo echo "db.createUser({user: 'pool', pwd: 'pool', roles: ['readWrite']})" > /home/mongodb.js
ProgressBar 40 ${_end}
sudo mongo pool /home/mongodb.js &> /dev/null
ProgressBar 44 ${_end}
echo "module.exports = {database: 'mongodb://pool:pool@127.0.0.1:27017/pool' , secret:'deinscret'}" > /home/poolarino_poolcontrol/config/database.js
ProgressBar 49 ${_end}
sudo npm install -g pm2 &> /dev/null
ProgressBar 55 ${_end}
sudo pm2 start /home/poolarino_poolcontrol/app.js &> /dev/null
ProgressBar 62 ${_end}
sudo pm2 startup &> /dev/null
ProgressBar 68 ${_end}
sudo groupadd ftpgroup &> /dev/null
ProgressBar 73 ${_end}
sudo useradd ftpuser -g ftpgroup -s /sbin/nologin -d /dev/null &> /dev/null
ProgressBar 78 ${_end}
sudo chown -R ftpuser:ftpgroup /var/www/html &> /dev/null
ProgressBar 84 ${_end}
(echo poolarino; echo poolarino) | sudo pure-pw useradd upload -u ftpuser -g ftpgroup -d /var/www/html -m &> /dev/null
ProgressBar 87 ${_end}
sudo pure-pw mkdb &> /dev/null
ProgressBar 91 ${_end}
sudo ln -s /etc/pure-ftpd/conf/PureDB /etc/pure-ftpd/auth/60puredb &> /dev/null
ProgressBar 94 ${_end}
sudo service pure-ftpd restart &> /dev/null
ProgressBar 95 ${_end}
sudo rm -r /var/www/html/* &> /dev/null
ProgressBar 96 ${_end}
sudo mv /home/poolarino_poolcontrol/compiled/* /var/www/html/ &> /dev/null
ProgressBar 97 ${_end}
sudo service lighttpd restart &> /dev/null
ProgressBar 98 ${_end}
ip4=$(/sbin/ip -o -4 addr list eth0 | awk '{print $4}' | cut -d/ -f1)
ProgressBar 99 ${_end}
sudo sed -i -e "s/http:\\/\\/.*:3000/http:\\/\\/$ip4:3000/g" /var/www/html/main.80b45faf48cbb7d90940.js
ProgressBar 100 ${_end}

printf "\nDie Poolarino-Poolsteuerung wurde erfolgreich installiert! Sie können diese nun unter http://$ip4 in Ihrem Browser aufrufen - viel Spaß und gutes Wetter! www.poolarino.de \n"