export default function (arr: any[], item: never | any, index: number) {
  return arr.reduce(function (s, a, i) {
    i === index ? s.push(item, a) : s.push(a);
    return s;
  }, []);
}
