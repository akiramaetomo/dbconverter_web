# dBconverter

dBconverter is a browser-based electrical value and decibel conversion
calculator.

It calculates impedance, voltage, current, power, voltage level, and power
level from two selected input values. The interface is designed for both
mobile and desktop browsers.

Use the application at:

https://akiramaetomo.github.io/dbconverter_web/

## Features

- Calculate related electrical values from two selected inputs
- Convert between linear values and dB values
- Change display units without changing the physical value
- Use the calculator on desktop and mobile browsers
- Continue using the loaded application without an active network connection

## Bug reports

Bug reports are welcome through
[GitHub Issues](https://github.com/akiramaetomo/dbconverter_web/issues).
Please use the bug report form and include enough information to reproduce the
problem.

External pull requests are not accepted. See
[CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Repository role

This Web application was redesigned from an earlier Android implementation.
The Android source and internal development materials are not part of this
public repository.

This repository contains the public Web application and its GitHub Pages
deployment workflow. Development is maintained separately.

## Development

```powershell
npm ci
npm run dev
```

## Verification

```powershell
npm test
npm run build
npm run build:pages
```

Pushes and pull requests run the tests and production build. Pushes to `main`
also publish the application through GitHub Pages.

## License

This project is available under the [MIT License](LICENSE).
