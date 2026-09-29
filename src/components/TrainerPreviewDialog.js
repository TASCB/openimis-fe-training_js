import React from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import EmailOutlined from '@material-ui/icons/EmailOutlined';
import PhoneOutlined from '@material-ui/icons/PhoneOutlined';
import EditOutlined from '@material-ui/icons/EditOutlined';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import {
  PreviewDialog, PreviewField, PreviewSection, PreviewText, usePreviewStyles, PREVIEW_BORDER, PREVIEW_INK, PREVIEW_PANEL,
} from '@openimis/fe-tasaf_common';

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2)
  .map((p) => p[0]).join('').toUpperCase();

const useStyles = makeStyles((theme) => {
  const teal = theme.palette.primary.main;
  return {
    identity: { alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 },
    avatar: {
      width: 76, height: 76, borderRadius: '50%', background: teal, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800,
    },
    contacts: { alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
    contact: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
      background: '#fff', border: `1px solid ${PREVIEW_BORDER}`, color: PREVIEW_INK, fontSize: 13.5,
      textDecoration: 'none', minWidth: 0,
      '& svg': { fontSize: 18, color: teal, flex: '0 0 auto' },
      '& span': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      '&:hover': { borderColor: teal },
    },
    bio: {
      padding: '12px 16px', borderLeft: `3px solid ${teal}`, background: PREVIEW_PANEL, borderRadius: '0 10px 10px 0',
    },
  };
});

function TrainerPreviewDialog({ trainer, onClose, onEdit }) {
  const p = usePreviewStyles();
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const t = trainer || {};

  const aside = (
    <div className={classes.identity}>
      <div className={classes.avatar}>{initials(t.fullName)}</div>
      <h2 className={p.heading}>{t.fullName}</h2>
      {t.code && <span className={p.code}>{t.code}</span>}
      <div className={p.tags} style={{ justifyContent: 'center' }}>
        {t.trainerType && <span className={p.tag}>{formatMessage(`training.trainerType.${t.trainerType}`)}</span>}
        <span className={p.statusTag}>
          {formatMessage(t.isActive ? 'training.trainer.active' : 'training.trainer.inactive')}
        </span>
      </div>
      <div className={classes.contacts}>
        {t.email && (
          <a className={classes.contact} href={`mailto:${t.email}`}>
            <EmailOutlined />
            <span>{t.email}</span>
          </a>
        )}
        {t.phone && (
          <a className={classes.contact} href={`tel:${t.phone}`}>
            <PhoneOutlined />
            <span>{t.phone}</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <PreviewDialog
      open={!!trainer}
      onClose={onClose}
      title={formatMessage('training.trainer.previewTitle')}
      closeLabel={formatMessage('training.close')}
      aside={aside}
      meta={t.version != null && <span>{`${formatMessage('training.profile.version')} ${t.version}`}</span>}
      actions={(
        <>
          <Button onClick={onClose} color="primary">{formatMessage('training.close')}</Button>
          {onEdit && (
            <Button onClick={() => onEdit(t)} color="primary" variant="contained" disableElevation startIcon={<EditOutlined />}>
              {formatMessage('training.edit')}
            </Button>
          )}
        </>
      )}
    >
      <div className={p.grid}>
        <PreviewField label={formatMessage('training.trainer.position')} value={t.position?.name} />
        <PreviewField
          label={formatMessage('training.trainer.gender')}
          value={t.gender ? formatMessage(`training.gender.${t.gender}`) : null}
        />
        <PreviewField label={formatMessage('training.trainer.organization')} value={t.organization} />
        <PreviewField label={formatMessage('training.trainer.specialization')} value={t.specialization} />
        <PreviewField label={formatMessage('training.trainer.staffUser')} value={t.staffUser?.username} />
      </div>
      {t.bio && (
        <div style={{ marginTop: 22 }}>
          <PreviewSection label={formatMessage('training.trainer.bio')}>
            <PreviewText className={classes.bio} moreLabel={formatMessage('training.readMore')} lessLabel={formatMessage('training.readLess')}>{t.bio}</PreviewText>
          </PreviewSection>
        </div>
      )}
    </PreviewDialog>
  );
}

export default TrainerPreviewDialog;
