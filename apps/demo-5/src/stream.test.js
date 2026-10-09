import { parsePartialJson } from './stream.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(JSON.stringify(parsePartialJson('')) === '{}', 'empty');
assert(parsePartialJson('{"destination":"Queenstown"}').destination === 'Queenstown', 'complete');
assert(parsePartialJson('{"destination":"Queens').destination === 'Queens', 'partial string');
assert(parsePartialJson('{\n  "destination": "Queenstown",\n  "outboundDate":').destination === 'Queenstown', 'incomplete next key');
assert(parsePartialJson('{"passengers": 2').passengers === 2, 'partial number closed');
assert(!('cabinClass' in parsePartialJson('{"destination":"Queenstown"}')), 'missing key absent');

console.log('parsePartialJson tests passed');
