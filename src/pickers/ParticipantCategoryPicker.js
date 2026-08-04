import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { PICKER_LIMIT } from '../constants';

// Configurable reference data, ordered down the governance ladder by `sequence`.
// See docs/REFERENCE_DATA.md §2.
function ParticipantCategoryPicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [filters, setFilters] = useState({ first: PICKER_LIMIT, isActive: true });

  const { isLoading, data, error } = useGraphqlQuery(
    `query ParticipantCategoryPicker($search: String, $first: Int, $isActive: Boolean) {
      participantCategory(name_Icontains: $search, first: $first, isActive: $isActive, orderBy: "sequence") {
        edges { node { id code name } }
      }
    }`,
    filters,
  );

  const categories = data?.participantCategory?.edges?.map((e) => e.node) ?? [];
  const pickerLabel = label || formatMessage('training.participantCategoryPicker');

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={categories}
      isLoading={isLoading}
      value={value}
      label={pickerLabel}
      withLabel={withLabel}
      required={required}
      getOptionLabel={(o) => o.name}
      onChange={(v) => onChange(v, v ? v.name : null)}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: PICKER_LIMIT, isActive: true, search })}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={pickerLabel} />
      )}
    />
  );
}

export default ParticipantCategoryPicker;
