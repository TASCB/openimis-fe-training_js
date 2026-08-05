import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { PICKER_LIMIT } from '../constants';

// Configurable reference data, ordered down the governance ladder by `sequence`.
function ParticipantCategoryPicker({
  multiple, required, readOnly, value, onChange, label, withLabel = false, filterSelectedOptions,
  levelCode,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const [search, setSearch] = useState(undefined);
  const filters = { first: PICKER_LIMIT, isActive: true, search, levelCode };

  const { isLoading, data, error } = useGraphqlQuery(
    `query ParticipantCategoryPicker($search: String, $first: Int, $isActive: Boolean, $levelCode: String) {
      permitted: participantCategory(
        name_Icontains: $search, first: $first, isActive: $isActive,
        primaryForLevels_Code: $levelCode, orderBy: "sequence"
      ) { edges { node { id code name } } }
      all: participantCategory(
        name_Icontains: $search, first: $first, isActive: $isActive, orderBy: "sequence"
      ) { edges { node { id code name } } }
    }`,
    filters,
  );

  const permitted = data?.permitted?.edges?.map((e) => e.node) ?? [];
  const all = data?.all?.edges?.map((e) => e.node) ?? [];
  const categories = levelCode && permitted.length ? permitted : all;
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
      onInputChange={setSearch}
      renderInput={(inputProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TextField {...inputProps} required={required} label={pickerLabel} />
      )}
    />
  );
}

export default ParticipantCategoryPicker;
