# dBconverter

dBconverter is a browser-based electrical value and decibel conversion
calculator.

It calculates impedance, voltage, current, power, voltage level, and power
level from two selected input values. The interface is designed for both
mobile and desktop browsers.

This Web application was redesigned from an earlier Android implementation.
The Android source and internal development materials are not part of this
public repository.

## Development

```powershell
npm ci
npm run dev
```

## Verification

```powershell
npm test
npm run build
```

Pushes and pull requests run the tests and production build. Pushes to `main`
also publish the application through GitHub Pages.
