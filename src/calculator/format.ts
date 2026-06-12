const JAVA_GENERAL_PRECISION = 6;

export function formatJavaGeneral(value: number): string {
  if (Number.isNaN(value)) {
    return "NaN";
  }
  if (value === Number.POSITIVE_INFINITY) {
    return "INF";
  }
  if (value === Number.NEGATIVE_INFINITY) {
    return "-INF";
  }
  if (value === 0) {
    return "0.00000";
  }

  const exponent = Math.floor(Math.log10(Math.abs(value)));
  if (exponent < -4 || exponent >= JAVA_GENERAL_PRECISION) {
    return normalizeExponent(value.toExponential(JAVA_GENERAL_PRECISION - 1));
  }

  const fractionDigits = Math.max(JAVA_GENERAL_PRECISION - exponent - 1, 0);
  return value.toFixed(fractionDigits);
}

function normalizeExponent(formatted: string): string {
  return formatted.replace(/e([+-])(\d+)$/, (_match, sign: string, digits: string) => {
    return `e${sign}${digits.padStart(2, "0")}`;
  });
}

