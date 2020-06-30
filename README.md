# DEPRECATED Facebook Group Export

This project is deprecated because the Facebook API has been deprecated

[![NPM](https://nodei.co/npm/facebook-group-export.png?compact=true)](https://nodei.co/npm/facebook-group-export/)

Have you ever wanted to export all the members from a Facebook Group to a CSV?

Well you are in luck, Use `facebook-group-export` to list your groups, then pick the one you want, and export it; it's that easy.

## Installation

This will install facebook-group-export as a global command which you can run.

``` bash
npm install --global facebook-group-export
```

## Usage

``` text

  Usage: facebook-group-export <ACCESS-TOKEN> [options]

  Options:

    -V, --version       output the version number
    -l, --list          List Facebook Groups
    -g, --groupId [id]  ID for group to export
    -f, --file [path]   File to store data in
    -h, --help          output usage information

  Examples:

    facebook-group-export <ACCESS-TOKEN> -l
    facebook-group-export <ACCESS-TOKEN> -l -f ./path/file.csv

    facebook-group-export <ACCESS-TOKEN> -g <GROUP-ID>
    facebook-group-export <ACCESS-TOKEN> -g <GROUP-ID> -f ./path/file.csv

```

### Export data from Facebook

To access your data through the Facebook API, Facebook requires you to use an access token. This must be included when you run `facebook-group-export`. The easiest way I've found is to grab one from Facebook's API explorer https://developers.facebook.com/tools/explorer

There click on the "Get Access Token" button and make sure you check the "user_managed_groups" data permission. Once you've approved this app, copy the long random alphanumeric Access Token. We'll use it next to export your Facebook data.

![Get Access Token](https://cloud.githubusercontent.com/assets/7255363/20385186/50e94bde-ac6b-11e6-954f-58292223b5fd.png)

You need to know the Group ID of the group you wish to export data from. To see a list of all your groups and their Group IDs run:

`facebook-group-export <YOUR-ACCESS-TOKEN> -l`

This will return a list of the Facebook groups you manage.
Copy the id from the group you want to export.

To export the members run

`facebook-group-export <ACCESS-TOKEN> -g <GROUP-ID>`

### Save to CSV

To save any output as a CSV File add the `-f <FILENAME>` flag.

## Contributing

1. Fork it on Github [https://github.com/alexbbt/facebook-group-export](https://github.com/alexbbt/facebook-group-export)
2. Create your feature branch: `git checkout -b my-name-and-my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
