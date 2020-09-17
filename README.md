# Poolarino Poolcontrol by www.poolarino.de

Poolarino Poolcontrol is a free software to control your technic around your swimming pool. If you have any questions feel free to join us under www.poolarino.de

![Poolarino Poolcontrol](https://www.poolarino.de/media/23-poolarino-poolcontrol-v-1-0-0-dashboard-png/)

## Information

This software is designed for the official raspberry pi touch display (800 x 480px). If you're going to develop on your local environment run you favored browser and set resolution to `800px x 480px` via Devtools (normaly F12) than go on with these steps:

1. **You need to have NodeJS and NPM installed locally**

2. **Obtain an API-Key from openweathermap.org**

You need to obtain an API-key from openweathermap for the included weather forecast. After you got one, add it to the `url` in `/routes/weatherforecast/weatherforecast.js`.

3. **Create a database.js file inside /config folder**

Create a new file inside the `/config` folder and name it `database.js`. This is where your database connect information goes. It should look something like this:

    module.exports = {
        database: 'mongodb://{MONGO_USER}:{MONGO_PASS}@{SERVER_IP:SERVER_PORT}/{AUTH_DB}',
        secret: 'SecretYouLike'
    }

a free database for testing purposes for example can be created on https://mlab.com/

4. **Install packages via `npm i`**

Install dependencys in `/` and `angular-src` via `npm i`

5. **Start anything**

* Start server in `/` with `nodemon` for example
* Start angular dev environment via `ng serve` inside /angular-src

If you have any errors feel free to join and contact us via Issues here on Github or on our site: www.poolarino.de

## Contributing

Contributing is extremly welcome. Feel free to improve and update the code via Pull Requests!

## License
Poolarino Poolcontrol - software to control anything around your swimming pool
Copyright (C) 2020 Tammo Schimanski

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
    
Contact:
Tammo Schimanski
github@poolarino.de
https://www.poolarino.de
