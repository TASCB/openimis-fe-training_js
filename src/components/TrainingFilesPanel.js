import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Grid, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import { useIntl } from 'react-intl';
import {
  useModulesManager, useTranslations, journalize, baseApiUrl, formatDateTimeFromISO, useToast,
  coreConfirm, clearConfirm,
} from '@openimis/fe-core';
import { UploadBar } from '@openimis/fe-tasaf_common';
import {
  fetchTrainingMaterials, fetchTrainingEvidence,
  deleteTrainingMaterial, deleteTrainingEvidence,
  uploadTrainingMaterial, uploadTrainingEvidence,
} from '../actions';
import { EvidenceTypePicker } from '../pickers/ConstantPickers';

const useStyles = makeStyles((theme) => ({
  item: theme.paper.item,
  empty: { color: theme.palette.text.secondary, textAlign: 'center', padding: theme.spacing(3) },
}));

function TrainingFilesPanel({
  trainingId, kind, filesReadOnly: readOnly, materials, evidence, submittingMutation, mutation, confirmed,
  fetchTrainingMaterials, fetchTrainingEvidence, deleteTrainingMaterial, deleteTrainingEvidence, journalize,
  coreConfirm, clearConfirm,
}) {
  const classes = useStyles();
  const isEvidence = kind === 'evidence';
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('training', modulesManager);
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [failed, setFailed] = useState([]);
  const [toDelete, setToDelete] = useState(null);
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState('REPORT');
  const [busy, setBusy] = useState(false);
  const items = isEvidence ? evidence : materials;
  const prev = useRef();

  const refetch = () => (isEvidence ? fetchTrainingEvidence(trainingId) : fetchTrainingMaterials(trainingId));

  useEffect(() => { if (trainingId) refetch(); }, [trainingId]);
  useEffect(() => {
    if (prev.current && !submittingMutation) { journalize(mutation); if (trainingId) refetch(); }
  }, [submittingMutation]);
  useEffect(() => { prev.current = submittingMutation; });
  useEffect(() => {
    if (toDelete) {
      coreConfirm(
        formatMessage('training.file.deleteDialog.title'),
        formatMessageWithValues('training.file.deleteDialog.message', { name: toDelete.fileName }),
      );
    }
  }, [toDelete]);

  const upload = async () => {
    if (!files.length) return;
    setBusy(true);
    const fn = isEvidence ? uploadTrainingEvidence : uploadTrainingMaterial;
    const failures = [];
    for (let i = 0; i < files.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await fn({
        trainingId, file: files[i], description, evidenceType: isEvidence ? evidenceType : undefined,
      });
      if (!res?.success) {
        const reason = res?.error || res?.message || res?.detail || '';
        failures.push({ file: files[i], reason: /413/.test(reason) ? formatMessage('training.file.tooLarge') : reason });
      }
    }
    setBusy(false);
    setFiles(failures.map((f) => f.file));
    setFailed(failures.map((f) => f.file));
    if (failures.length) {
      toast.showError(failures
        .map((f) => formatMessageWithValues('training.file.uploadFailed', { name: f.file.name, reason: f.reason }))
        .join(' · '));
    } else {
      setDescription('');
    }
    refetch();
  };

  const remove = (item) => (isEvidence
    ? deleteTrainingEvidence(item, formatMessage('training.evidence.delete.mutationLabel'))
    : deleteTrainingMaterial(item, formatMessage('training.material.delete.mutationLabel')));

  useEffect(() => {
    if (toDelete && confirmed) remove(toDelete);
    if (confirmed !== null) setToDelete(null);
    return () => confirmed !== null && clearConfirm(false);
  }, [confirmed]);
  const downloadUrl = (item) => `${baseApiUrl}/training/${isEvidence ? 'evidence' : 'materials'}/${item.id}/download/`;

  const list = items ?? [];
  return (
    <>
      {!readOnly && (
        <UploadBar
          title={formatMessage(isEvidence ? 'training.evidence.add' : 'training.material.add')}
          chooseLabel={formatMessage('training.file.choose')}
          uploadLabel={formatMessage('training.file.upload')}
          descriptionLabel={formatMessage('training.file.description')}
          files={files}
          failed={failed}
          busy={busy}
          description={description}
          onDescriptionChange={setDescription}
          onAddFiles={(picked) => setFiles((current) => [...current, ...picked])}
          onRemoveFile={(index) => setFiles((current) => current.filter((_, i) => i !== index))}
          onUpload={upload}
        >
          {isEvidence && (
            <Grid item xs={12} md={4} className={classes.item}>
              <EvidenceTypePicker withLabel value={evidenceType} onChange={(v) => setEvidenceType(v || 'REPORT')} />
            </Grid>
          )}
        </UploadBar>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('training.file.name')}</TableCell>
            {isEvidence && <TableCell>{formatMessage('training.file.evidenceType')}</TableCell>}
            <TableCell>{formatMessage('training.file.description')}</TableCell>
            <TableCell>{formatMessage('training.file.uploadedBy')}</TableCell>
            <TableCell>{formatMessage('training.file.uploadedDate')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {!list.length && (
            <TableRow>
              <TableCell colSpan={isEvidence ? 6 : 5} className={classes.empty}>
                {formatMessage(isEvidence ? 'training.evidence.empty' : 'training.material.empty')}
              </TableCell>
            </TableRow>
          )}
          {list.map((item) => (
            <TableRow key={item.id}>
              <TableCell><Link href={downloadUrl(item)} target="_blank" rel="noopener">{item.fileName}</Link></TableCell>
              {isEvidence && <TableCell>{formatMessage(`training.evidenceType.${item.evidenceType}`)}</TableCell>}
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.userCreated?.username}</TableCell>
              <TableCell>{item.dateCreated ? formatDateTimeFromISO(modulesManager, intl, item.dateCreated) : ''}</TableCell>
              <TableCell>
                {!readOnly && (
                  <Tooltip title={formatMessage('deleteButton.tooltip')}>
                    <IconButton size="small" onClick={() => setToDelete(item)}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

const mapStateToProps = (state) => ({
  materials: state.training.trainingMaterials,
  evidence: state.training.trainingEvidence,
  submittingMutation: state.training.submittingMutation,
  mutation: state.training.mutation,
  confirmed: state.core.confirmed,
});
const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTrainingMaterials, fetchTrainingEvidence, deleteTrainingMaterial, deleteTrainingEvidence, journalize,
    coreConfirm, clearConfirm,
  }, dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TrainingFilesPanel);
