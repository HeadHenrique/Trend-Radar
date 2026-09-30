import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Alerts from './pages/Alerts'
import Competitors from './pages/Competitors'
import Dashboard from './pages/Dashboard'
import Opportunities from './pages/Opportunities'
import Posts from './pages/Posts'
import Profiles from './pages/Profiles'
import Settings from './pages/Settings'
import TrendDetail from './pages/TrendDetail'
import Trends from './pages/Trends'
import Usa from './pages/Usa'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/trends/:id" element={<TrendDetail />} />
        <Route path="/competitors" element={<Competitors />} />
        <Route path="/usa" element={<Usa />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
