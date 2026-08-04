import React from 'react';
import { Grid } from '@material-ui/core';
import { PublishedComponent } from '@openimis/fe-core';
import { locationLevels } from '../utils/paa';

// PAA cascade: Region → District (mandatory) → Ward → Village (optional), emitting the deepest
// level chosen. Not `location.DetailedLocation`, which only fires onChange at village level.
// See docs/PAA_LOCATION.md.
function PaaLocationInput({
  value, onChange, readOnly, required = true,
}) {
  const {
    R: region, D: district, W: ward, V: village,
  } = locationLevels(value);

  return (
    <Grid container>
      <Grid item xs={6}>
        <PublishedComponent
          pubRef="location.CoarseLocation"
          readOnly={readOnly}
          required={required}
          region={region}
          district={district}
          filterLabels={false}
          onChange={(d) => onChange(d ?? null)}
        />
      </Grid>
      <Grid item xs={3}>
        <PublishedComponent
          pubRef="location.LocationPicker"
          locationLevel={2}
          parentLocation={district}
          value={ward ?? null}
          readOnly={readOnly || !district}
          required={false}
          withNull
          filterLabels={false}
          onChange={(w) => onChange(w ?? district ?? null)}
        />
      </Grid>
      <Grid item xs={3}>
        <PublishedComponent
          pubRef="location.LocationPicker"
          locationLevel={3}
          parentLocation={ward}
          value={village ?? null}
          readOnly={readOnly || !ward}
          required={false}
          withNull
          filterLabels={false}
          onChange={(v) => onChange(v ?? ward ?? district ?? null)}
        />
      </Grid>
    </Grid>
  );
}

export default PaaLocationInput;
