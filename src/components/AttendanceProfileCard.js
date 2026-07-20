import React from 'react';
import { useIntl } from 'react-intl';
import {
  Paper, Grid, Typography, Avatar, Chip,
} from '@material-ui/core';
import Person from '@material-ui/icons/Person';
import School from '@material-ui/icons/School';
import Business from '@material-ui/icons/Business';
import Phone from '@material-ui/icons/Phone';
import LocationOn from '@material-ui/icons/LocationOn';
import Event from '@material-ui/icons/Event';
import { useModulesManager, useTranslations, formatDateFromISO } from '@openimis/fe-core';
import { useProfileCardStyles, ProfileTile } from '../utils/profileCardStyles';

function AttendanceProfileCard({ attendance }) {
  const classes = useProfileCardStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('training', modulesManager);
  const a = attendance || {};
  const typeLabel = a.participantType ? formatMessage(`training.participantType.${a.participantType}`) : null;
  const statusLabel = a.attendanceStatus ? formatMessage(`training.attendanceStatus.${a.attendanceStatus}`) : null;
  const trainingLabel = a.training ? `${a.training.code} - ${a.training.title}` : null;

  return (
    <Paper className={classes.card}>
      <div className={classes.header}>
        <Avatar className={classes.avatar}><Person fontSize="large" /></Avatar>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h5" className={classes.title}>{a.fullName}</Typography>
          {typeLabel && <Typography className={classes.sub}>{typeLabel}</Typography>}
        </div>
        {statusLabel && <Chip label={statusLabel} className={classes.chip} />}
      </div>

      <div className={classes.body}>
        <Grid container spacing={3}>
          <ProfileTile icon={<School />} label={formatMessage('training.attendance.training')} value={trainingLabel} />
          <ProfileTile icon={<Event />} label={formatMessage('training.startDatetime')} value={a.training?.startDatetime ? formatDateFromISO(modulesManager, intl, a.training.startDatetime) : null} />
          <ProfileTile icon={<Business />} label={formatMessage('training.participant.organization')} value={a.organization} />
          <ProfileTile icon={<Phone />} label={formatMessage('training.participant.phone')} value={a.phone} />
          <ProfileTile icon={<LocationOn />} label={formatMessage('training.participant.location')} value={a.location?.name} />
        </Grid>

        {a.attendanceRemarks && (
          <>
            <Typography className={classes.sectionTitle} style={{ marginTop: 16 }}>
              {formatMessage('training.participant.attendance')}
            </Typography>
            <Typography className={classes.block}>{a.attendanceRemarks}</Typography>
          </>
        )}
      </div>
    </Paper>
  );
}

export default AttendanceProfileCard;
