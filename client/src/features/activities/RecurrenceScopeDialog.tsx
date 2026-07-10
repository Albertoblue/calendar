import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text,
} from '@fluentui/react-components';

export type RecurrenceScope = 'single' | 'series';

interface Props {
  open: boolean;
  action: 'edit' | 'delete';
  onClose: () => void;
  onChoose: (scope: RecurrenceScope) => void;
}

export function RecurrenceScopeDialog({ open, action, onClose, onChoose }: Props) {
  const verb = action === 'delete' ? 'Eliminar' : 'Editar';

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{verb} evento recurrente</DialogTitle>
          <DialogContent>
            <Text>Esta actividad se repite. Que quieres {verb.toLowerCase()}?</Text>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button appearance="secondary" onClick={() => onChoose('single')}>
              Solo esta
            </Button>
            <Button appearance="primary" onClick={() => onChoose('series')}>
              Toda la serie
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
