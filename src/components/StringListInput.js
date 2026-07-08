import React, { useState } from 'react';
import {
  Chip, TextField, IconButton, Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

/**
 * Simple editor for a list of free-text strings (e.g. learning outcomes, audiences).
 * Items render as deletable chips; a text field + Add (or Enter) appends.
 * Controlled: value is a string[], onChange receives the new array.
 */
function StringListInput({
  label, value, onChange, readOnly, placeholder,
}) {
  const [draft, setDraft] = useState('');
  const items = Array.isArray(value) ? value : [];
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft('');
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0',
      }}
      >
        {items.map((it, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Chip key={`${it}-${i}`} label={it} size="small" onDelete={readOnly ? undefined : () => remove(i)} />
        ))}
        {!items.length && <Typography variant="body2" color="textSecondary">—</Typography>}
      </div>
      {!readOnly && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
          <IconButton size="small" color="primary" onClick={add} disabled={!draft.trim()}><AddIcon /></IconButton>
        </div>
      )}
    </div>
  );
}

export default StringListInput;
