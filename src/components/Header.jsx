import { useAuth } from '../context/AuthContext';
import { getGreeting } from '../utils/helpers';
import { MdWavingHand } from 'react-icons/md';
import './Header.css';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header__left">
        <h2 className="header__greeting">
          {getGreeting()}, <span>{user?.name?.split(' ')[0]}</span> <MdWavingHand style={{ color: '#fbbf24' }} />
        </h2>
      </div>
      <div className="header__right">
        <div className="header__date">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </div>
      </div>
    </header>
  );
}
