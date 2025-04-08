import { Provider } from 'react-redux';
import { store } from './store/store';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col mt-16 container mx-auto max-w-6xl">
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm my-4 mx-4">
            <ChatWindow />
            <ChatInput />
          </div>
        </main>
        <Toaster position="top-center" />
      </div>
    </Provider>
  );
}

export default App;