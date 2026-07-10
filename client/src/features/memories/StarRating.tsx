import { useState } from 'react';
import {
  Star16Filled,
  Star16Regular,
  Star24Filled,
  Star24Regular,
} from '@fluentui/react-icons';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: 16 | 24;
}

const STAR_COLOR = '#F2C811';

export function StarRating({ value, onChange, size = 24 }: Props) {
  const [hover, setHover] = useState(0);
  const readOnly = !onChange;
  const shown = hover || value;
  const Filled = size === 16 ? Star16Filled : Star24Filled;
  const Empty = size === 16 ? Star16Regular : Star24Regular;

  return (
    <span style={{ display: 'inline-flex', gap: '2px', color: STAR_COLOR }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const Icon = i <= shown ? Filled : Empty;
        return (
          <span
            key={i}
            style={{ cursor: readOnly ? 'default' : 'pointer', lineHeight: 0 }}
            role={readOnly ? undefined : 'button'}
            aria-label={readOnly ? undefined : `${i} estrellas`}
            onMouseEnter={() => !readOnly && setHover(i)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => onChange?.(i)}
          >
            <Icon />
          </span>
        );
      })}
    </span>
  );
}
