# doppelganger-front

This is the frontend/backend code for the Doppelganger project, [see the Notion writeup for the whole project here.](https://regulad.notion.site/Doppelg-nger-Portal-for-second-copies-of-apps-5732d097a25748ef93370655a3c3067b?pvs=4)

Because this is a commercial project, it is not licensed for reuse or attribution. However, you are welcome to look at the code and use it for inspiration for your own projects. Some select modules are licensed under the MIT license, and those are noted in the code.

Illegal reuse/rehosting will be met with a DMCA takedown request, and litigation if necessary. Do the right thing.

## Installation

This project requires a number of odd dependencies to run. They are listed below for macOS w/ brew. Linux dependencies are installed through the Dockerfile.

### `node-canvas`

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman python-setuptools
```

### `pnpm`

```bash
brew install node pnpm
```

### NPM packages

```bash
pnpm i
```

### Submodules

```bash
pnpm run init
```

## Running

When running jobs, use can use `turbo` instead of `pnpm run` to get a measurable speedup.
