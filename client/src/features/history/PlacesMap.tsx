import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Idea } from '../../types';

const useStyles = makeStyles({
  map: { height: '62vh', width: '100%', borderRadius: '8px', overflow: 'hidden' },
  empty: { color: tokens.colorNeutralForeground3, textAlign: 'center', padding: '32px' },
});

interface Point {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visited: boolean;
  subtitle?: string;
}

function toPoints(places: Idea[]): Point[] {
  return places
    .map((p): Point | null => {
      const extra = (p.extra ?? {}) as Record<string, unknown>;
      const lat = Number(extra.lat);
      const lng = Number(extra.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { id: p._id, name: p.title, lat, lng, visited: p.done, subtitle: p.subtitle };
    })
    .filter((x): x is Point => x !== null);
}

function pinIcon(visited: boolean): L.DivIcon {
  const color = visited ? '#107C10' : '#0F6CBD';
  return L.divIcon({
    className: '',
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -30],
    html:
      `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M12 0C5.4 0 0 5.37 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.37 18.6 0 12 0z" fill="${color}"/>` +
      `<circle cx="12" cy="12" r="4.5" fill="white"/></svg>`,
  });
}

function FitBounds({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

interface Props {
  places: Idea[];
  loading?: boolean;
}

export function PlacesMap({ places, loading }: Props) {
  const styles = useStyles();
  const points = toPoints(places);

  if (loading) return <Spinner label="Cargando el mapa..." />;
  if (points.length === 0) {
    return (
      <div className={styles.empty}>
        <Text as="p">
          Aun no hay lugares con ubicacion. Anade sitios desde <b>Ideas → Lugares</b> (con
          Google Places) y apareceran aqui como pines.
        </Text>
      </div>
    );
  }

  return (
    <MapContainer
      className={styles.map}
      center={[points[0].lat, points[0].lng] as [number, number]}
      zoom={5}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng] as [number, number]} icon={pinIcon(p.visited)}>
          <Popup>
            <strong>{p.name}</strong>
            <br />
            {p.subtitle ? (
              <>
                {p.subtitle}
                <br />
              </>
            ) : null}
            {p.visited ? '✅ Visitado' : '📍 Por visitar'}
          </Popup>
        </Marker>
      ))}
      <FitBounds points={points} />
    </MapContainer>
  );
}
