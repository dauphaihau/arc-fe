export default function (value: number | undefined) {
  if (typeof value !== 'number') {
    value = 0;
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return formatter.format(value);
}
