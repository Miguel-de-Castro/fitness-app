import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import Home from '@/pages/Home'
import Generate from '@/pages/Generate'
import WorkoutRun from '@/pages/WorkoutRun'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/workout" element={<WorkoutRun />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
