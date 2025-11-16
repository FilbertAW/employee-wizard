import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Wizard } from './pages/wizard/Wizard';
import { EmployeeList } from './pages/EmployeeList';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/wizard?role=admin" replace />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/employees" element={<EmployeeList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
