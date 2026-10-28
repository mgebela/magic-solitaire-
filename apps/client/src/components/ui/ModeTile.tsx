import { Link } from 'react-router-dom';
import { ModeMark, type ModeMarkName } from './ModeMark';

interface ModeTileProps {
  to: string;
  title: string;
  description: string;
  mark: ModeMarkName;
  featured?: boolean;
}

export function ModeTile({ to, title, description, mark, featured }: ModeTileProps) {
  return (
    <Link
      to={to}
      className={`mode-tile ${featured ? 'mode-tile--featured' : ''}`}
    >
      <span className="mode-tile__icon">
        <ModeMark name={mark} />
      </span>
      <div>
        <h3 className="mode-tile__title">{title}</h3>
        <p className="mode-tile__desc">{description}</p>
      </div>
    </Link>
  );
}
