import React from 'react';


function highlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function JsonViewer({ data, maxHeight = 400 }) {
  if (data === undefined || data === null) return null;

  const isString = typeof data === 'string';
  const displayText = isString ? data : JSON.stringify(data, null, 2);
  const highlighted = isString ? displayText : highlight(displayText);

  return (
    <pre
      className="json-viewer"
      style={{ maxHeight }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}