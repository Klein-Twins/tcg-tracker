import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TrackerProvider } from './context/TrackerContext';
import { HomePage } from './pages/HomePage';
import { SetDetailPage } from './pages/SetDetailPage';

export default function App() {
  return (
    <TrackerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sets/:slug" element={<SetDetailPage />} />
        </Routes>
      </BrowserRouter>
    </TrackerProvider>
  );
}
