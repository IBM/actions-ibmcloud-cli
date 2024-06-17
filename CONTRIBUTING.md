# Contributing

## Developer Certificate of Origin (DCO)

All pull requests require a Developer Certificate of Origin (DCO) sign-off from the author, agreeing to the terms published at https://developercertificate.org/. You can add a sign-off to your commits using `-s`.

```bash
$ git commit -s -m 'This is my commit message'
```

## Installing dependencies

```bash
$ npm install
```

## Regenerating dist/index.js

```bash
$ npm run package
```

It is recommended to add this as a `git` `pre-commit` hook:

```bash
$ cp pre-commit .git/hooks/pre-commit
```

## Local development and testing

Testing of the GitHub Actions based tests can be done locally using [nektos/act](https://github.com/nektos/act). After installing `act`, you can run all of the jobs, however they tend to fail locally when run all at once. Instead, it's generally better to run single jobs at a time.

```bash
$ act -j test
```

Note that some tests require an `IBMCLOUD_API_KEY` secret (and `IBMCLOUD_USER` secret).

```bash
$ act -j test-login -s IBMCLOUD_API_KEY="$IBMCLOUD_API_KEY" -s IBMCLOUD_USER="$IBMCLOUD_USER"
```

Be aware that the tests will only run with the packaged version of the code in the dist directory. As such, it's important to regenerate the dist directory before running `act`. One common testing pattern is to ensure the code is packaged before running `act`:

```bash
$ npm run package && act -j test-login -s IBMCLOUD_API_KEY="$IBMCLOUD_API_KEY" -s IBMCLOUD_USER="$IBMCLOUD_USER"
```

## Pull requests

Pull requests made from forks will fail the various login tests because they won't have an `IBMCLOUD_API_KEY` present. Instead, you can enable GitHub Actions on your fork, add your secret to your fork's settings, and then run the actions on your fork. When making a pull request, please provide a link to the successful actions run on your fork.
