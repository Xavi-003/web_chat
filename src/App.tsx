import { useEffect } from 'react';
import { CommandCenter } from './pages/CommandCenter';
import { useVortexStore } from './store/useVortexStore';

function App() {
  const { peers } = useVortexStore();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasActiveConnections = Object.values(peers).some(
        p => p.connectionState === 'connected' || p.connectionState === 'connecting'
      );

      if (hasActiveConnections) {
        // Warning message is usually ignored by modern browsers in favor of a standard dialog,
        // but setting event.returnValue is universally required to trigger it.
        event.preventDefault();
        event.returnValue = 'You have active P2P secure connections. Refreshing will instantly sever these connections. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [peers]);

  return <CommandCenter />;
}

export default App;
