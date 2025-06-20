import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import ContactForm from './components/ContactForm';
import DynamicFormFixed from './components/DynamicForm';
import config from './assets/formConfig.json';
import type { Form } from './utilities/types';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100 gap-6">
          <header className="bg-blue-700 text-white py-4 shadow sticky top-0 z-50">
            <h1 className="text-2xl font-bold px-4 text-left">Hyland</h1>
          </header>
          <main className="flex-1 container mx-auto px-4">
            <Routes>
              <Route path="/" element={<ContactForm />} />
              <Route path="/quote" element={<DynamicFormFixed formConfig={(config as Form)}/>} />
            </Routes>
          </main>
          <footer className="py-6 text-center text-blue-900 bg-blue-50 border-t border-blue-100">
            &copy; {new Date().getFullYear()} Hyland. All rights reserved.
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}
