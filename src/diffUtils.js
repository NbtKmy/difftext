// src/diffUtils.js
const DiffMatchPatch = require('diff-match-patch');
const dmp = new DiffMatchPatch();

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m]));
  }

function escapeXML(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    }[m]));
  }

  function getDiffTeiVariantXml(text1, text2, label1 = 'A', label2 = 'B') {
    const diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);
  
    let output = '';
    let i = 0;
    let appCount = 1;

  
    while (i < diffs.length) {
      const [op, data] = diffs[i];
  
      if (op === DiffMatchPatch.DIFF_EQUAL) {
        output += escapeXML(data);
        i++;
      } else {
        // 差分があるブロックをまとめて<app>で囲う
        let lemText = '';
        let rdgText = '';
  
        while (i < diffs.length && diffs[i][0] !== DiffMatchPatch.DIFF_EQUAL) {
          const [innerOp, innerData] = diffs[i];
          const escaped = escapeXML(innerData);
  
          if (innerOp === DiffMatchPatch.DIFF_DELETE) {
            lemText += escaped;
          } else if (innerOp === DiffMatchPatch.DIFF_INSERT) {
            rdgText += escaped;
          }
  
          i++;
        }
  
      const xmlId = `diff${appCount++}`;
      output += `<app xml:id="${xmlId}">`;
      output += `<lem wit="#${label1}">${lemText || '[∅]'}</lem>`;
      output += `<rdg wit="#${label2}">${rdgText || '[∅]'}</rdg>`;
      output += `</app>`;
      }
    }
  
    return output;
  }

function getSideBySideDiff(text1, text2) {
    const diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);
  
    let left = '';
    let right = '';
    let diffId = 1;
  
    diffs.forEach(([op, data]) => {
      const escaped = escapeHTML(data);
  
      if (op === DiffMatchPatch.DIFF_EQUAL) {
        left += escaped;
        right += escaped;
      } else {
        const idAttr = `data-diff-id="${diffId}"`;
  
        if (op === DiffMatchPatch.DIFF_DELETE) {
          left += `<span class="diff-block delete" ${idAttr}>${escaped}</span>`;
          right += `<span class="diff-block placeholder" ${idAttr}></span>`;
        } else if (op === DiffMatchPatch.DIFF_INSERT) {
          left += `<span class="diff-block placeholder" ${idAttr}></span>`;
          right += `<span class="diff-block insert" ${idAttr}>${escaped}</span>`;
        }
  
        diffId++;
      }
    });
  
    return { left, right };
  }

  export function getMultiDiffTeiData(baseText, fileList) {
    const dmp = new DiffMatchPatch();
  
    const results = [];
  
    fileList.forEach((file) => {
      const diffs = dmp.diff_main(baseText, file.content);
      dmp.diff_cleanupSemantic(diffs);
  
      diffs.forEach(([op, data], i) => {
        if (op === 1) {
          const prev = diffs[i - 1];
          const lem = (prev && prev[0] === 0) ? prev[1] : '';
          const rdg = data;
  
          const existing = results.find(d => d.lem === lem);
          if (existing) {
            existing.rdgs.push({ wit: `#${file.name}`, text: rdg });
          } else {
            results.push({
              id: `diff${results.length + 1}`,
              lem,
              rdgs: [{ wit: `#${file.name}`, text: rdg }],
            });
          }
        }
      });
    });
  
    return results;
  }
  

module.exports = { getDiffTeiVariantXml, getSideBySideDiff, getMultiDiffTeiData };