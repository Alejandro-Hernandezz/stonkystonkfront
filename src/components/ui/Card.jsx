export default function Card({ 
  title, 
  children, 
  variant = 'default',
  className = '',
  action
}) {
  const getCardClass = () => {
    const baseClass = 'card';
    const variantClass = variant !== 'default' ? `card-${variant}` : '';
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  return (
    <div className={getCardClass()}>
      {(title || action) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}