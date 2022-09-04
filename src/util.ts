import os from 'os';
const network = os.networkInterfaces();

export function getAllHost() {
  const keys = Object.keys(network);
  return keys.reduce<string[]>((prev, curr) => {
    const element = network[curr] ?? [];
    const IPv4Item = element?.filter((item) => item.family === 'IPv4');
    prev.push(IPv4Item?.[0]?.address);
    return prev;
  }, []);
}
