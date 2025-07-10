
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import any global styles
import { TransactionsProvider } from "./context/TransactionContext";

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  
    <TransactionsProvider>
      <App />
    </TransactionsProvider>
  
);
