import { Link } from 'react-router-dom';

interface ModeTileProps {
  to: string;
  title: string;
  description: string;
  icon: string;
  featured?: boolean;
}

export function ModeTile({ to, title, description, icon, featured }: ModeTileProps) {
  return (
    <Link
      to={to}
      className={`mode-tile ${featured ? 'mode-tile--featured' : ''}`}
    >
      <span className="mode-tile__icon" aria-hidden>
        {icon}
      </span>
      <div>
        <h3 className="mode-tile__title">{title}</h3>
        <p className="mode-tile__desc">{description}</p>
      </div>
    </Link>
  );
}
