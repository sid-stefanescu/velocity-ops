import { LocationProvider, Router, Route } from 'preact-iso';
import { UnloaderCheckIn } from './pages/UnloaderCheckIn';
import { FloorOperations } from './pages/FloorOperations';
import { ManagementAnalytics } from './pages/ManagementAnalytics';

export function App() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/checkin" component={UnloaderCheckIn} />
        <Route path="/floor" component={FloorOperations} />
        <Route path="/analytics" component={ManagementAnalytics} />
        <Route default component={FloorOperations} />
      </Router>
    </LocationProvider>
  );
}
