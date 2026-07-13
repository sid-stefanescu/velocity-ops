import { LocationProvider, Router, Route } from 'preact-iso';
import { TabletInput } from './pages/TabletInput';
import { TvDashboard } from './pages/TvDashboard';
import { AdminSettings } from './pages/AdminSettings';
import { FloorOperations } from './pages/FloorOperations';
import { ManagementAnalytics } from './pages/ManagementAnalytics';
import { BatchEntry } from './pages/BatchEntry';

export function App() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={FloorOperations} />
        <Route path="/floor" component={FloorOperations} />
        <Route path="/analytics" component={ManagementAnalytics} />
        <Route path="/tablet" component={TabletInput} />
        <Route path="/batch" component={BatchEntry} />
        <Route path="/admin" component={AdminSettings} />
        <Route path="/tv-simple" component={TvDashboard} />
        <Route default component={FloorOperations} />
      </Router>
    </LocationProvider>
  );
}
