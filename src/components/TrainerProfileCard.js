import React from 'react';
import {
  Paper, Grid, Typography, Avatar, Chip, Divider,
} from '@material-ui/core';
import Person from '@material-ui/icons/Person';
import Email from '@material-ui/icons/Email';
import Phone from '@material-ui/icons/Phone';
import Business from '@material-ui/icons/Business';
import Star from '@material-ui/icons/Star';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useModulesManager, useTranslations } from '@openimis/fe-core';
import { useProfileCardStyles, ProfileTile } from '../utils/profileCardStyles';

/** Designed read-only presentation of a TrainerProfile — same brand-themed card as
 * the Attendance/Training cards. */
function TrainerProfileCard({ trainer }) {
  const classes = useProfileCardStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const t = trainer || {};
  const typeLabel = t.trainerType ? formatMessage(`training.trainerType.${t.trainerType}`) : null;

  return (
    <Paper className={classes.card}>
      <div className={classes.header}>
        <Avatar className={classes.avatar}><Person fontSize="large" /></Avatar>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <Typography className={classes.code}>{t.code}</Typography>
          <Typography variant="h5" className={classes.title}>{t.fullName}</Typography>
        </div>
        <div className={classes.headChips}>
          {typeLabel && <Chip size="small" label={typeLabel} className={classes.chip} />}
          <Chip
            size="small"
            label={t.isActive ? formatMessage('training.trainer.active') : formatMessage('no')}
            className={classes.chip}
          />
        </div>
      </div>

      <div className={classes.body}>
        <Grid container spacing={3}>
          <ProfileTile icon={<Email />} label={formatMessage('training.trainer.email')} value={t.email} />
          <ProfileTile icon={<Phone />} label={formatMessage('training.trainer.phone')} value={t.phone} />
          <ProfileTile icon={<Business />} label={formatMessage('training.trainer.organization')} value={t.organization} />
          <ProfileTile icon={<Star />} label={formatMessage('training.trainer.specialization')} value={t.specialization} />
          <ProfileTile icon={<AccountCircle />} label={formatMessage('training.trainer.staffUser')} value={t.staffUser?.username} />
        </Grid>

        {t.bio && (
          <>
            <Typography className={classes.sectionTitle} style={{ marginTop: 16 }}>
              {formatMessage('training.trainer.bio')}
            </Typography>
            <Typography className={classes.block}>{t.bio}</Typography>
          </>
        )}
      </div>

      {t.version != null && (
        <>
          <Divider />
          <div className={classes.meta}>
            <span>
              {formatMessage('training.profile.version')}
              {' '}
              <b>{t.version}</b>
            </span>
          </div>
        </>
      )}
    </Paper>
  );
}

export default TrainerProfileCard;
