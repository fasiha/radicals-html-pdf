// print in Firefox, 89% scale for 2 page.
// Source: https://en.wikipedia.org/wiki/List_of_kanji_radicals_by_stroke_count
var {readFileSync, writeFileSync} = require('fs');

/**
 *
 * @param {string} s
 * @param {boolean} skipHeader
 * @returns {string[][]|{[key:string]:string}}
 */
function tsv2json(s, skipHeader = false) {
  const records = s.trim().split('\n').map(s => s.split('\t'));
  if (skipHeader) { return records; }
  const header = records[0];
  return records.slice(1).map(v => Object.fromEntries(header.map((h, i) => [h, v[i]])));
}

/**
 *
 * @param {string} s
 */
function cleanNihongo(s) {
  if (s.startsWith('{{nihongo|') && s.endsWith('}}')) {
    var [_, english, kana, roumaji, kanji] = s.slice(0, -2).split('|');
    return {english, kana, roumaji, kanji};
  }
  return s;
}

function clean(o) { return {...o, stokeCount: +o.strokeCount, meaningReading: cleanNihongo(o.meaningReading)}; }

var k = tsv2json(readFileSync('kangxi-radicals-bushu.tsv', 'utf8')).map(clean);

function formatRadical(o, newStrokeCount = false) {
  const sup = newStrokeCount ? `<sup>${o.strokeCount}</sup>` : `<sup class="unimportant">${o.strokeCount}</sup>`;
  return `<section><h3>${o.radical.replace(/[\(\), \[\]]/g, '')}${sup}</h3>${o.meaningReading.english}, ${
      o.meaningReading.kana}</section>`;
}

function formatRadicals(v) {
  return v.reduce((prev, curr, i) => prev.concat(formatRadical(curr, curr.strokeCount !== v[i - 1]?.strokeCount)), [])
      .join('\n');
}

writeFileSync('index.html', `
<head>
  <meta charset="utf-8" />
  <style>
  #radicals {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-auto-rows: auto;
    grid-gap: 3px;
  }
  section {
    border: 2px solid rgb(192,192,192);
    border-radius: 10px;
    page-break-after: avoid;
  }
  h3 {
    margin-top: 0.1em;
    margin-bottom: 0.1em;
  }
  .unimportant {
    color: rgb(192,192,192);
  }
  </style>
</head>
<div id="radicals">
  ${formatRadicals(k)}
</div>
`);
