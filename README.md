# RainCatcher demo load testing scripts

This project contains scripts that are consumed by load-runner, for
 load-testing the [demo cloud app](https://github.com/feedhenry-raincatcher/raincatcher-demo-cloud).

## Setup

There's a setup script at `./setup/usersWorkorders.js` which creates a
 specified number of users, and creates a workorder for each
 one. Running it with node on the command line will show details of
 the parameters that it expects:

``` bash
node setup/usersWorkorders.js
Options:
  --app, -a          Cloud app base URL to target            [string] [required]
  --username, -u     Username to use to login to the app     [string] [required]
  --password, -p     Password to use to login to the app     [string] [required]
  --numUsers, -n     The number of users/workorders needed   [number] [required]
  --concurrency, -c  The concurrency at which to create resources
                                                             [number] [required]

Missing required arguments: app, username, password, numUsers, concurrency
```

Here's an example of how to run the setup script to create 100 users
 at a concurrency of 10:

```bash
./setup/usersWorkorders.js -a https://mycloudapp.mydomain.tld -u trever -p 123 -n 100 -c 10
```

npm is also configured to be able to run this script as `setup`, just
 remember the `--` to separate npm args from the script args:

``` bash
npm run setup -- -a https://mycloudapp.mydomain.tld -u trever -p 123 -n 100 -c 10
```

## Collecting Results

There's a collection script at `util/collectResults.js` which takes a
 results directory to pluck relevant information from, and a csv file
 (and an optional flag to write the CSV header). It can be run as
 follows:

``` bash
node util/collectResults.js --dir runs/<result dir>/ --csv results.csv --header

# or as the npm 'results script'
npm run results -- --dir runs/<result dir>/ --csv test.csv --header
```
