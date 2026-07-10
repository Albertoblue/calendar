import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  TabList,
  Tab,
  Title3,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { Category } from '../../types';
import { fetchMemories } from '../../api/activities';
import { fetchStats, fetchOnThisDay } from '../../api/stats';
import { fetchIdeas } from '../../api/ideas';
import { Timeline } from './Timeline';
import { PlacesMap } from './PlacesMap';
import { StatsView } from './StatsView';
import { OnThisDay } from './OnThisDay';

type HistoryTab = 'timeline' | 'map' | 'stats' | 'onthisday';

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
  body: { flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px' },
});

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

export function HistoryHub({ open, onClose, categories }: Props) {
  const styles = useStyles();
  const [tab, setTab] = useState<HistoryTab>('timeline');

  const memoriesQ = useQuery({ queryKey: ['memories'], queryFn: fetchMemories, enabled: open });
  const onThisDayQ = useQuery({ queryKey: ['onThisDay'], queryFn: fetchOnThisDay, enabled: open });
  const statsQ = useQuery({ queryKey: ['stats'], queryFn: fetchStats, enabled: open });
  const placesQ = useQuery({
    queryKey: ['ideas', 'place'],
    queryFn: () => fetchIdeas('place'),
    enabled: open,
  });

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span style={{ fontSize: '22px' }}>📸</span>
          <Title3 className={styles.grow}>Vuestra historia</Title3>
          <Tooltip content="Cerrar" relationship="label">
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          </Tooltip>
        </div>

        <div className={styles.tabs}>
          <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as HistoryTab)}>
            <Tab value="timeline">Linea de tiempo</Tab>
            <Tab value="onthisday">En este dia</Tab>
            <Tab value="map">Mapa</Tab>
            <Tab value="stats">Estadisticas</Tab>
          </TabList>
        </div>

        <div className={styles.body}>
          {tab === 'timeline' && (
            <Timeline
              memories={memoriesQ.data ?? []}
              categories={categories}
              loading={memoriesQ.isLoading}
            />
          )}
          {tab === 'onthisday' && (
            <OnThisDay
              activities={onThisDayQ.data ?? []}
              categories={categories}
              loading={onThisDayQ.isLoading}
            />
          )}
          {tab === 'map' && <PlacesMap places={placesQ.data ?? []} loading={placesQ.isLoading} />}
          {tab === 'stats' && <StatsView stats={statsQ.data} loading={statsQ.isLoading} />}
        </div>
      </div>
    </div>
  );
}
