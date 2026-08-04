import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { JOB_TITLE_PICKER_LIMIT } from '../constants';

// The 63 RBAC-catalogue job titles, ordered by the catalogue's serial number.
// See docs/REFERENCE_DATA.md §4 and docs/07-frontend.md §6.
function JobTitlePicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [filters, setFilters] = useState({ first: JOB_TITLE_PICKER_LIMIT, isActive: true });

  const { isLoading, data, error } = useGraphqlQuery(
    `query JobTitlePicker($search: String, $first: Int, $isActive: Boolean) {
      jobTitle(name_Icontains: $search, first: $first, isActive: $isActive, orderBy: "sn") {
        edges { node { id code name userGroup { id code name } } }
      }
    }`,
    filters,
  );

  const titles = data?.jobTitle?.edges?.map((e) => e.node) ?? [];
  const pickerLabel = label || formatMessage('training.jobTitlePicker');

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={titles}
      isLoading={isLoading}
      value={value}
      label={pickerLabel}
      withLabel={withLabel}
      required={required}
      getOptionLabel={(o) => (o.userGroup?.code ? `${o.name} (${o.userGroup.code})` : o.name)}
      onChange={(v) => onChange(v, v ? v.name : null)}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: JOB_TITLE_PICKER_LIMIT, isActive: true, search })}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={pickerLabel} />
      )}
    />
  );
}

export default JobTitlePicker;
