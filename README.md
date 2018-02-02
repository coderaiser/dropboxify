# Dropboxify [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/dropboxify.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/dropboxify/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/dropboxify.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/@coderaiser/dropboxify "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/dropboxify  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/dropboxify "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

Read directory content from dropbox compatible way with [readify](https://github.com/coderaiser/readify).

## Install

```
npm i dropboxify --save
```

## API

### dropboxify(token, dir[, options], fn)

- **token** - `string` generated [access token](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/)
- **options** - `object` can contain:
  - `sort` - sort by: name, size, date
  - `order` - "asc" or "desc" for ascending and descending order (default: "asc")
  - `type` - when "raw" returns not formatted result
- **fn** - `function` callback

## Examples

```js
const sort = 'size';
const order = 'desc';
const token = 'token';
const dir = '/';
const type = 'raw';

dropboxify(token, dir, {type, sort, order}, (e, files) => {
    console.log(files);
    // outputs
    [{
        name: 'dropboxify.js',
        size: 4735,
        date: 1377248899000,
        owner: 0,
        mode: 0
    }, {
        name: 'readify.js',
        size: 3735,
        date: 1377248899000,
        owner: 0,
        mode: 0
    }];
});
```

## Related

- [Sortify](https://github.com/cloudcmd/sortify "Sortify") - sort directory content by name, size, date
- [Readify](https://github.com/coderaiser/readify "Readify") - read directory content with file attributes: size, date, owner, mode

## License

MIT

[CoverageURL]:              https://coveralls.io/github/coderaiser/dropboxify?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/dropboxify/badge.svg?branch=master&service=github

