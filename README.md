[![wakatime](https://wakatime.com/badge/github/regulad/doppelganger-front.svg)](https://wakatime.com/badge/github/regulad/doppelganger-front)

# doppelganger-front

This is the frontend/backend code for the Doppelganger project.
[See the Notion writeup for the whole project here.](https://regulad.notion.site/Writeup-0bb2fa8bc5854264aa18157ad602b74a?pvs=4)

Because this is a commercial project, it is not licensed for reuse or attribution. However, you are welcome to look at the code and use it for inspiration for your own projects. Some select modules are licensed under the MIT license, and those are noted in the code.

Illegal reuse/rehosting will be met with a DMCA takedown request, and litigation if necessary. Do the right thing.

## Weird notes

- `dockerode-compose` is really weird. It doesn't call the docker-compose backend, instead it recreates the container definiton. For this reason, it is not used in this project.
- `next-ws` is extremely unstable and uses an odd "plugin" (patching) install technique. It will not be used for this reason; all WS paths are implemented manually in the server/\* package.
- Do not set `"type": "module"` in the package.json, it breaks certain interop modules.
- `webcrypto-shim` does not work as expected in Chrome versions that don't expose `crypto.subtle`. A better polyfill is needed.

## Installation

This project requires a number of odd dependencies to run. They are listed below for macOS w/ brew. Linux dependencies are installed through the Dockerfile.

### `pnpm`

```bash
brew install node pnpm
```

### NPM packages

```bash
pnpm i
```

### Prereqs

```bash
pnpm run init  # initializes submodules
pnpm run db:generate  # generates the database schema
pnpm run db:migrate  # migrates the database schema
pnpm run licenses:check  # generates a licenses.json file for the licenses page
```

## Running

When running jobs, use can use `turbo` instead of `pnpm run` to get a measurable speedup.

### Testing

```bash
pnpm run dev
```

### Production

```bash
pnpm run build
pnpm run start
```

## Development

After making a change to the database, remember to run `db:generate` and then `db:migrate` to update the database schema.

Consider installing pre-commit and then running `pre-commit install` so that all commits are automatically linted and tested. You may also run `turbo lint type-check format`.
