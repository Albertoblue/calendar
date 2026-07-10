import { useState } from 'react';
import {
  Button,
  TabList,
  Tab,
  Title3,
  Caption1,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Location24Regular,
  MoviesAndTv24Regular,
  Lightbulb24Filled,
} from '@fluentui/react-icons';
import { Idea, IdeaKind, SpaceMember } from '../../types';
import { IdeaSection } from './IdeaSection';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
  },
  panel: {
    width: '100%',
    maxWidth: '1000px',
    height: '90vh',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    boxShadow: tokens.shadow64,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorBrandForeground1,
  },
  grow: { flexGrow: 1 },
  tabs: { padding: '4px 20px 0' },
  content: { flexGrow: 1, minHeight: 0, padding: '12px 20px' },
  footer: {
    padding: '8px 20px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  members: SpaceMember[];
  currentUserId: string;
  onSchedule: (idea: Idea) => void;
}

export function IdeasHub({ open, onClose, members, currentUserId, onSchedule }: Props) {
  const styles = useStyles();
  const [tab, setTab] = useState<IdeaKind>('place');

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Lightbulb24Filled />
          <Title3 className={styles.grow}>Ideas</Title3>
          <Tooltip content="Cerrar" relationship="label">
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          </Tooltip>
        </div>

        <div className={styles.tabs}>
          <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as IdeaKind)}>
            <Tab value="place" icon={<Location24Regular />}>
              Lugares
            </Tab>
            <Tab value="watch" icon={<MoviesAndTv24Regular />}>
              Pelis / Series
            </Tab>
          </TabList>
        </div>

        <div className={styles.content}>
          <IdeaSection
            key={tab}
            kind={tab}
            members={members}
            currentUserId={currentUserId}
            onSchedule={onSchedule}
          />
        </div>

        {tab === 'watch' && (
          <div className={styles.footer}>
            <Caption1>
              Este producto usa la API de TMDB pero no esta avalado ni certificado por TMDB.
            </Caption1>
          </div>
        )}
      </div>
    </div>
  );
}
