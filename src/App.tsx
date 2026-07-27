import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { BottomNav } from './components/BottomNav/BottomNav';
import { SyncStatus } from './components/SyncStatus/SyncStatus';
import { Today } from './pages/Today/Today';
import { Lineup } from './pages/Lineup/Lineup';
import { MapPage } from './pages/Map/Map';
import { Trains } from './pages/Trains/Trains';
import { ArtistDetail } from './pages/ArtistDetail/ArtistDetail';
import { flushQueue } from './lib/turso/mutationQueue';

interface NavigationState {
  backgroundLocation?: Location;
}

function App() {
  const location = useLocation();
  const backgroundLocation = (location.state as NavigationState | null)?.backgroundLocation;

  useEffect(() => {
    flushQueue();
  }, []);

  return (
    <>
      <main className="app-main">
        <Routes location={backgroundLocation ?? location}>
          <Route path="/" element={<Today />} />
          <Route path="/lineup" element={<Lineup />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/trains" element={<Trains />} />
          <Route path="/artist/:artistId" element={<ArtistDetail />} />
        </Routes>
      </main>

      {backgroundLocation && (
        <Routes>
          <Route path="/artist/:artistId" element={<ArtistDetail />} />
        </Routes>
      )}

      <SyncStatus />
      <BottomNav />
    </>
  );
}

export default App;
