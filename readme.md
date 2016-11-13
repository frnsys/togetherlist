# togetherlist

The site for [togetherlist](http://togetherlist.com/).

## Setup

Install dependencies:

    npm install -d

For development, run the webpack server and sass:

    npm start
    sass --watch css/main.sass:css/main.css

For production, build the site:

    npm run build

## Updating Neocities

The site runs on [Neocities](https://neocities.org/).

A script is included to sync this directory to a Neocities site.

It has two dependencies:

    pip install requests python-dateutil

And then you can update the site with this command:

    python update.py NEOCITIES_USERNAME NEOCITIES_PASSWORD

## Note on fonts

The font used is [Halis Rounded](https://www.fontspring.com/fonts/ahmet-altun/halis-rounded).